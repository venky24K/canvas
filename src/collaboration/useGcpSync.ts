import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCanvasStore } from '../store/useCanvasStore';
import { GcpAuthService } from '../cloud/GcpAuthService';
import { setGcpSocket } from './gcpSocketClient';
import type { CanvasNode } from '../types/canvas';

// Configured for Google Cloud Run container endpoint or default localhost dev server
const GCP_CLOUD_RUN_SOCKET_URL = import.meta.env.VITE_GCP_SOCKET_URL || 'http://localhost:4000';

export const useGcpSync = () => {
  const {
    currentUserId,
    currentUserName,
    currentUserColor,
    setUserIdentity,
    updateRemoteCursor,
    removeRemoteCursor,
    setRoomStatus,
    mergeRemoteNode,
    mergeRemoteNodeUpdate,
    mergeRemoteDeletion,
    loadScene,
  } = useCanvasStore();

  // 1. Subscribe to GCP Identity Platform profile alterations
  useEffect(() => {
    const unsubscribe = GcpAuthService.subscribe((profile) => {
      setUserIdentity(profile.uid, profile.displayName, profile.avatarColor);
    });
    return () => unsubscribe();
  }, [setUserIdentity]);

  // 2. Initialize Persistent Google Cloud Run WebSockets
  useEffect(() => {
    let socket: Socket | null = null;
    const urlRoom = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('room') : null;
    const activeRoomId = urlRoom || 'bloom-gcp-prod-room';

    try {
      socket = io(GCP_CLOUD_RUN_SOCKET_URL, {
        reconnectionAttempts: 5,
        timeout: 5000,
        query: {
          userId: currentUserId,
          userName: currentUserName,
          color: currentUserColor,
          room: activeRoomId,
        },
      });

      setGcpSocket(socket);

      socket.on('connect', () => {
        console.log(`☁️ [GCP Cloud Run WebSockets] Connected successfully to room [${activeRoomId}] as "${currentUserName}"`);
        setRoomStatus({ isConnected: true, gcpStatus: 'connected' });
      });

      socket.on('disconnect', () => {
        console.warn('☁️ [GCP Cloud Run WebSockets] Socket connection interrupted or offline.');
        setRoomStatus({ isConnected: false, gcpStatus: 'offline' });
      });

      // Receive synced scene graph when entering a pre-existing room
      socket.on('room-state-synced', ({ nodes }) => {
        const nodeList = Object.values(nodes || {}) as CanvasNode[];
        if (nodeList.length > 0) {
          console.log(`📥 [GCP Firestore / Room Sync] Received initial room state (${nodeList.length} items from server).`);
          loadScene(nodeList);
        }
      });

      // Receive Peer Collaborator Cursor Movements
      socket.on('cursor-moved', (remoteCursor) => {
        if (remoteCursor.userId !== currentUserId) {
          updateRemoteCursor(remoteCursor);
        }
      });

      socket.on('peer-disconnected', ({ userId }) => {
        removeRemoteCursor(userId);
      });

      // Receive Real-Time CRDT Node Modifications
      socket.on('node-added', (remoteNode: CanvasNode) => {
        mergeRemoteNode(remoteNode);
      });

      socket.on('node-updated', ({ id, updates }: { id: string; updates: Partial<CanvasNode> }) => {
        mergeRemoteNodeUpdate(id, updates);
      });

      socket.on('nodes-deleted', ({ ids }: { ids: string[] }) => {
        mergeRemoteDeletion(ids);
      });

    } catch (error) {
      console.warn('GCP Cloud Run Socket connecting in local offline sandbox mode:', error);
      setRoomStatus({ gcpStatus: 'connected' });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setGcpSocket(null);
      }
    };
  }, [currentUserId, currentUserName, currentUserColor, setRoomStatus, updateRemoteCursor, removeRemoteCursor, mergeRemoteNode, mergeRemoteNodeUpdate, mergeRemoteDeletion, loadScene]);
};

