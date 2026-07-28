const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Y = require('yjs');

const app = express();
app.use(cors());

// Google Cloud Run requires listening on PORT environment variable (default 8080 or 4000 locally)
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  // Cloud Run recommended ping interval and timeout for uninterrupted WebSocket streaming
  pingInterval: 25000,
  pingTimeout: 60000,
});

// Room collaborative document mapping
const roomDocs = new Map();
const activePeers = new Map();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'HEALTHY', cloud: 'Google Cloud Run', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  const { userId, userName, color, room = 'default-room' } = socket.handshake.query;
  console.log(`[GCP Cloud Sync] Peer connected: ${userName} (${userId}) directly to room [${room}]`);

  socket.join(room);
  activePeers.set(socket.id, { userId, userName, color, room });

  // Broadcast peer arrival to room
  socket.to(room).emit('peer-joined', { userId, userName, color });

  // Handle Real-Time Collaborative Live Cursor Telemetry
  socket.on('cursor-moved', (cursorData) => {
    socket.to(room).emit('cursor-moved', cursorData);
  });

  // Handle Scene Graph Delta & CRDT Shape Synchronization
  socket.on('node-updated', (nodeData) => {
    socket.to(room).emit('node-updated', nodeData);
  });

  socket.on('disconnect', () => {
    const peer = activePeers.get(socket.id);
    if (peer) {
      io.to(peer.room).emit('peer-disconnected', { userId: peer.userId });
      activePeers.delete(socket.id);
      console.log(`[GCP Cloud Sync] Peer departed: ${peer.userName}`);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [GCP Cloud Run Ready] Real-time collaborative Studio Canvas server listening on port ${PORT}`);
});
