import type { Socket } from 'socket.io-client';
import type { CanvasNode } from '../types/canvas';

export let gcpSocket: Socket | null = null;

export const setGcpSocket = (socket: Socket | null) => {
  gcpSocket = socket;
};

export const transmitNodeAdded = (node: CanvasNode) => {
  if (gcpSocket && gcpSocket.connected) {
    gcpSocket.emit('node-added', node);
  }
};

export const transmitNodeUpdated = (id: string, updates: Partial<CanvasNode>) => {
  if (gcpSocket && gcpSocket.connected) {
    gcpSocket.emit('node-updated', { id, updates });
  }
};

export const transmitNodesDeleted = (ids: string[]) => {
  if (gcpSocket && gcpSocket.connected) {
    gcpSocket.emit('nodes-deleted', { ids });
  }
};

export const transmitCursorMoved = (x: number, y: number, userId: string, userName: string, color: string, tool: string) => {
  if (gcpSocket && gcpSocket.connected) {
    gcpSocket.emit('cursor-moved', { userId, userName, color, x, y, tool });
  }
};
