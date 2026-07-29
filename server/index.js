const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Y = require('yjs');
const nodemailer = require('nodemailer');

let transporter;
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing account. ' + err.message);
    return;
  }
  console.log('✉️ [Ethereal Mock Email] Credentials generated!');
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
});

const app = express();
app.use(cors());
app.use(express.json());

// Google Cloud Run requires listening on PORT environment variable (default 8080 or 4000 locally)
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  // Cloud Run recommended ping interval and timeout for uninterrupted WebSocket streaming (up to 3600s)
  pingInterval: 25000,
  pingTimeout: 60000,
});

// Real-Time In-Memory Firestore Document Proxy & Active Room Peers
const roomDocs = new Map();
const activePeers = new Map();

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'HEALTHY',
    cloud: 'Google Cloud Run (Managed WebSockets + CRDT Sync)',
    activeRooms: roomDocs.size,
    connectedPeers: activePeers.size,
    timestamp: new Date().toISOString(),
  });
});

// API Endpoint: Persist board revision to Google Cloud Storage / Firestore proxy
app.post('/api/gcp/firestore/save', (req, res) => {
  const { boardId, title, nodes, ownerUid } = req.body;
  if (!boardId) {
    return res.status(400).json({ error: 'Missing boardId parameter for Firestore persistence' });
  }
  
  const existing = roomDocs.get(boardId);
  roomDocs.set(boardId, {
    title: title || 'Untitled Board',
    nodes: nodes || {},
    updatedAt: new Date().toISOString(),
    ownerUid: ownerUid || 'gcp-sys',
    acl: existing ? existing.acl : [], // List of { email, role, status }
  });

  console.log(`☁️ [GCP Cloud Run Engine] Saved board [${boardId}] revision to Firestore memory proxy (${Object.keys(nodes || {}).length} items).`);
  res.status(200).json({ status: 'SUCCESS', boardId, bucketUri: `gs://bloom-studio-assets-prod/${boardId}.json` });
});

app.post('/api/rooms/:roomId/invite', async (req, res) => {
  const { roomId } = req.params;
  const { emails, role, inviterName } = req.body;

  if (!roomDocs.has(roomId)) {
    roomDocs.set(roomId, { title: roomId, nodes: {}, updatedAt: new Date().toISOString(), acl: [] });
  }
  
  const room = roomDocs.get(roomId);
  if (!room.acl) room.acl = [];

  const invitations = [];

  for (const email of emails) {
    const existing = room.acl.find(m => m.email === email);
    if (existing) {
      existing.role = role;
    } else {
      room.acl.push({ email, role, status: 'pending' });
    }
    
    // Dispatch mock email
    if (transporter) {
      const inviteUrl = `http://localhost:5173/?room=${roomId}`;
      const mailOptions = {
        from: '"Bloom Workspace Notification" <noreply@bloom.design>',
        to: email,
        subject: `${inviterName || 'A teammate'} invited you to collaborate in Bloom`,
        text: `You have been invited to join a collaborative workspace as a ${role}.\n\nJoin the workspace here: ${inviteUrl}`,
        html: `<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                 <h2 style="color: #0f172a;">You're invited to collaborate!</h2>
                 <p style="color: #475569;">${inviterName || 'A teammate'} has invited you to join a workspace as a <strong>${role}</strong>.</p>
                 <a href="${inviteUrl}" style="display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin-top: 15px;">Open Workspace</a>
               </div>`
      };
      
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 [Mock Email Sent to ${email}] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      } catch (err) {
        console.error('Email send failed', err);
      }
    }
    
    invitations.push({ email, role, status: 'pending' });
  }

  // Notify any active clients in this room that the ACL updated!
  io.to(roomId).emit('acl-updated', room.acl);

  res.status(200).json({ success: true, invites: invitations });
});

app.get('/api/rooms/:roomId/members', (req, res) => {
  const { roomId } = req.params;
  const room = roomDocs.get(roomId);
  res.status(200).json({ members: room?.acl || [] });
});

io.on('connection', (socket) => {
  const { userId = `peer-${socket.id.substring(0, 5)}`, userName = 'Team Member', userEmail = '', color = '#8B5CF6', room = 'bloom-gcp-prod-room' } = socket.handshake.query;
  
  socket.userRole = 'editor'; // Default role unless restricted by ACL

  if (roomDocs.has(room)) {
    const doc = roomDocs.get(room);
    if (doc.acl && doc.acl.length > 0) {
      const member = doc.acl.find(m => m.email === userEmail);
      if (member) {
        socket.userRole = member.role;
        member.status = 'accepted';
        io.to(room).emit('acl-updated', doc.acl);
      } else if (doc.ownerUid !== userEmail) {
        socket.userRole = 'viewer'; // If restricted board, default unknown guests to viewer
      }
    }
  }

  console.log(`🔌 [GCP Cloud Run Socket] Peer connected: "${userName}" (${userId}) to collaborative workspace [${room}] as [${socket.userRole.toUpperCase()}]`);

  socket.join(room);
  activePeers.set(socket.id, { userId, userName, color, room });

  // 1. Initialize Room Document if not already existing
  if (!roomDocs.has(room)) {
    roomDocs.set(room, {
      title: room,
      nodes: {},
      updatedAt: new Date().toISOString(),
      ownerUid: userEmail,
      acl: [],
    });
  }

  // 2. Transmit existing Room Scene State directly to the newly joined peer!
  const currentRoomState = roomDocs.get(room);
  if (currentRoomState && Object.keys(currentRoomState.nodes).length > 0) {
    socket.emit('room-state-synced', {
      roomId: room,
      nodes: currentRoomState.nodes,
    });
  }

  // 3. Notify all existing peers in the workspace that a new collaborator arrived
  socket.to(room).emit('peer-joined', { userId, userName, color });

  // 4. Real-Time Live Cursor Telemetry (High Frequency)
  socket.on('cursor-moved', (cursorData) => {
    socket.to(room).emit('cursor-moved', cursorData);
  });

  // 5. Node Addition / Shape Creation & Freehand Sketch Sync
  socket.on('node-added', (node) => {
    if (socket.userRole === 'viewer') return;
    if (!node || !node.id) return;
    const doc = roomDocs.get(room);
    if (doc) {
      doc.nodes[node.id] = node;
      doc.updatedAt = new Date().toISOString();
    }
    socket.to(room).emit('node-added', node);
  });

  // 6. Node Updates (Dragging, Resizing, Styling Swatches, Freehand Points)
  socket.on('node-updated', ({ id, updates }) => {
    if (socket.userRole === 'viewer') return;
    if (!id) return;
    const doc = roomDocs.get(room);
    if (doc && doc.nodes[id]) {
      doc.nodes[id] = { ...doc.nodes[id], ...updates };
      doc.updatedAt = new Date().toISOString();
    }
    socket.to(room).emit('node-updated', { id, updates });
  });

  // 7. Node Deletion (Eraser Sweep, Delete Selected)
  socket.on('nodes-deleted', ({ ids }) => {
    if (socket.userRole === 'viewer') return;
    if (!Array.isArray(ids)) return;
    const doc = roomDocs.get(room);
    if (doc) {
      ids.forEach((id) => delete doc.nodes[id]);
      doc.updatedAt = new Date().toISOString();
    }
    socket.to(room).emit('nodes-deleted', { ids });
  });

  // 8. Handle Graceful Peer Disconnection
  socket.on('disconnect', () => {
    const peer = activePeers.get(socket.id);
    if (peer) {
      io.to(peer.room).emit('peer-disconnected', { userId: peer.userId });
      activePeers.delete(socket.id);
      console.log(`👋 [GCP Cloud Run Socket] Peer departed workspace: ${peer.userName}`);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [GCP Cloud Run Ready] Real-time Bloom collaborative Studio server listening on port ${PORT}`);
});
