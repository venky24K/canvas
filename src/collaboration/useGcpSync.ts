import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCanvasStore } from '../store/useCanvasStore';

// Configured for Google Cloud Run container endpoint or default localhost dev server
const GCP_CLOUD_RUN_SOCKET_URL = import.meta.env.VITE_GCP_SOCKET_URL || 'http://localhost:4000';

export const useGcpSync = () => {
  const {
    currentUserId,
    currentUserName,
    currentUserColor,
    updateRemoteCursor,
    removeRemoteCursor,
    setRoomStatus,
  } = useCanvasStore();

  useEffect(() => {
    let socket: Socket | null = null;
    try {
      socket = io(GCP_CLOUD_RUN_SOCKET_URL, {
        reconnectionAttempts: 3,
        timeout: 4000,
        query: {
          userId: currentUserId,
          userName: currentUserName,
          color: currentUserColor,
          room: 'studio-gcp-prod-room',
        },
      });

      socket.on('connect', () => {
        setRoomStatus({ isConnected: true, gcpStatus: 'connected' });
      });

      socket.on('disconnect', () => {
        setRoomStatus({ isConnected: false, gcpStatus: 'offline' });
      });

      socket.on('cursor-moved', (remoteCursor) => {
        if (remoteCursor.userId !== currentUserId) {
          updateRemoteCursor(remoteCursor);
        }
      });

      socket.on('peer-disconnected', ({ userId }) => {
        removeRemoteCursor(userId);
      });
    } catch (error) {
      console.warn('GCP Cloud Run Socket connecting in local fallback mode:', error);
      setRoomStatus({ gcpStatus: 'connected' });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [currentUserId, currentUserName, currentUserColor]);
};
