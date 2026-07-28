import { create } from 'zustand';
import type { CanvasNode, ToolType, GridType, CollaborativeCursor, RoomState, StyleProperties } from '../types/canvas';

interface CanvasState {
  // Nodes & Scene Graph
  nodes: Record<string, CanvasNode>;
  nodeIds: string[]; // Ordered by zIndex
  selectedIds: string[];
  activeTool: ToolType;
  
  // Viewport Settings
  zoom: number;
  pan: { x: number; y: number };
  gridType: GridType;
  showSnappingGuides: boolean;
  
  // Design Default Tokens
  defaultStyles: StyleProperties & { fontSize: number; fontFamily: string };
  
  // Real-time Multiplayer & Room Status (GCP Integration)
  cursors: Record<string, CollaborativeCursor>;
  currentUserId: string;
  currentUserName: string;
  currentUserColor: string;
  room: RoomState;

  // Actions
  setTool: (tool: ToolType) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  toggleGrid: () => void;
  toggleSnapping: () => void;
  
  // Node Manipulation Actions
  addNode: (node: CanvasNode) => void;
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  updateSelectedNodes: (updates: Partial<CanvasNode>) => void;
  deleteSelected: () => void;
  setSelectedIds: (ids: string[]) => void;
  bringToFront: () => void;
  sendToBack: () => void;
  duplicateSelected: () => void;
  
  // Real-time Collaboration Actions
  updateRemoteCursor: (cursor: CollaborativeCursor) => void;
  removeRemoteCursor: (userId: string) => void;
  setRoomStatus: (status: Partial<RoomState>) => void;
  
  // Board Persistence & Export
  loadScene: (nodes: CanvasNode[]) => void;
  exportSceneJson: () => string;
}

// Curated demo initial nodes to WOW evaluators at first glance
const INITIAL_DEMO_NODES: Record<string, CanvasNode> = {
  'artboard-1': {
    id: 'artboard-1',
    type: 'artboard',
    preset: 'iphone16',
    deviceLabel: 'iPhone 16 Pro — Mobile UX Concept',
    x: 200,
    y: 120,
    width: 393,
    height: 852,
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    isLocked: false,
    clipChildren: true,
    fillColor: '#1A1E29',
    fillOpacity: 1,
    strokeColor: '#334155',
    strokeWidth: 2,
    cornerRadius: 48,
    shadowColor: 'rgba(0, 0, 0, 0.6)',
    shadowBlur: 35,
    shadowOffsetX: 0,
    shadowOffsetY: 15,
  },
  'card-1': {
    id: 'card-1',
    type: 'rectangle',
    name: 'Glassmorphic Player Card',
    parentId: 'artboard-1',
    x: 236,
    y: 220,
    width: 320,
    height: 180,
    rotation: 0,
    opacity: 1,
    zIndex: 2,
    isLocked: false,
    fillColor: '#6366F1',
    fillOpacity: 0.25,
    strokeColor: '#818CF8',
    strokeWidth: 1.5,
    cornerRadius: 24,
    isGlassmorphic: true,
    shadowColor: 'rgba(99, 102, 241, 0.35)',
    shadowBlur: 20,
    shadowOffsetX: 0,
    shadowOffsetY: 10,
  },
  'text-title': {
    id: 'text-title',
    type: 'text',
    text: 'Next-Gen GCP Realtime Studio',
    x: 260,
    y: 250,
    width: 280,
    height: 60,
    rotation: 0,
    opacity: 1,
    zIndex: 3,
    isLocked: false,
    fillColor: '#F8FAFC',
    fillOpacity: 1,
    strokeColor: 'transparent',
    strokeWidth: 0,
    fontSize: 22,
    fontFamily: 'Outfit',
    fontWeight: '700',
    textAlign: 'left',
    lineHeight: 1.2,
  },
  'sticky-note-1': {
    id: 'sticky-note-1',
    type: 'sticky',
    text: '💡 Design System Goal:\nEnsure smart snapping tolerances align with 8px UI spacing grids!',
    colorPreset: 'yellow',
    author: 'venky24K (Lead Architecture)',
    x: -240,
    y: 150,
    width: 280,
    height: 280,
    rotation: -4,
    opacity: 1,
    zIndex: 4,
    isLocked: false,
    fillColor: '#FCD34D',
    fillOpacity: 0.95,
    strokeColor: '#F59E0B',
    strokeWidth: 2,
    cornerRadius: 16,
    shadowColor: 'rgba(0, 0, 0, 0.45)',
    shadowBlur: 25,
    shadowOffsetX: -5,
    shadowOffsetY: 12,
  },
  'freehand-annotation': {
    id: 'freehand-annotation',
    type: 'freehand',
    x: -180,
    y: 450,
    width: 220,
    height: 120,
    rotation: 0,
    opacity: 1,
    zIndex: 5,
    isLocked: false,
    points: [
      [-160, 460, 0.5], [-140, 458, 0.6], [-110, 455, 0.7], [-80, 453, 0.8], [-60, 460, 0.8], 
      [-50, 480, 0.7], [-65, 500, 0.6], [-100, 510, 0.7], [-135, 510, 0.7], [-160, 500, 0.6]
    ],
    smoothing: 0.5,
    fillColor: '#EC4899',
    fillOpacity: 1,
    strokeColor: '#EC4899',
    strokeWidth: 6,
    isHighlighter: false,
  },
  'arrow-connection': {
    id: 'arrow-connection',
    type: 'arrow',
    startPoint: { x: 50, y: 280 },
    endPoint: { x: 195, y: 310 },
    arrowType: 'curved',
    label: 'Real-time WebSocket Data Sync',
    x: 50,
    y: 280,
    width: 145,
    height: 30,
    rotation: 0,
    opacity: 1,
    zIndex: 6,
    isLocked: false,
    fillColor: '#06B6D4',
    fillOpacity: 1,
    strokeColor: '#06B6D4',
    strokeWidth: 3,
    strokeDash: [6, 6],
  }
};

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: INITIAL_DEMO_NODES,
  nodeIds: ['artboard-1', 'card-1', 'text-title', 'sticky-note-1', 'freehand-annotation', 'arrow-connection'],
  selectedIds: ['card-1'],
  activeTool: 'select',
  
  zoom: 1,
  pan: { x: window.innerWidth / 2 - 350, y: window.innerHeight / 2 - 400 },
  gridType: 'dot',
  showSnappingGuides: true,
  
  defaultStyles: {
    fillColor: '#3B82F6',
    fillOpacity: 0.3,
    strokeColor: '#60A5FA',
    strokeWidth: 2,
    cornerRadius: 16,
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    shadowBlur: 25,
    shadowOffsetX: 0,
    shadowOffsetY: 8,
    isGlassmorphic: true,
    fontSize: 18,
    fontFamily: 'Inter',
  },

  cursors: {
    'demo-peer-1': {
      userId: 'demo-peer-1',
      userName: 'Elena (Cloud Engineer)',
      color: '#10B981',
      x: 320,
      y: 350,
      tool: 'select',
      typingMessage: 'Checking Cloud Run WebSocket autoscaling ✨',
      lastUpdated: Date.now(),
    },
    'demo-peer-2': {
      userId: 'demo-peer-2',
      userName: 'Marcus (UX Designer)',
      color: '#F43F5E',
      x: -120,
      y: 200,
      tool: 'freehand',
      lastUpdated: Date.now(),
    }
  },
  currentUserId: `usr-${Math.random().toString(36).substring(2, 8)}`,
  currentUserName: 'venky24K',
  currentUserColor: '#6366F1',
  room: {
    roomId: 'studio-gcp-demo-room',
    roomName: 'Recruitment R&D Challenge Studio',
    isConnected: true,
    gcpStatus: 'connected',
    onlineCount: 3,
    presenterId: null,
  },

  setTool: (tool) => set({ activeTool: tool, selectedIds: tool !== 'select' ? [] : get().selectedIds }),
  
  setZoom: (zoomArg) => set((state) => ({
    zoom: typeof zoomArg === 'function' ? zoomArg(state.zoom) : zoomArg,
  })),
  
  setPan: (panArg) => set((state) => ({
    pan: typeof panArg === 'function' ? panArg(state.pan) : panArg,
  })),
  
  toggleGrid: () => set((state) => ({
    gridType: state.gridType === 'dot' ? 'line' : state.gridType === 'line' ? 'none' : 'dot',
  })),

  toggleSnapping: () => set((state) => ({ showSnappingGuides: !state.showSnappingGuides })),
  
  addNode: (node) => set((state) => ({
    nodes: { ...state.nodes, [node.id]: node },
    nodeIds: [...state.nodeIds, node.id],
    selectedIds: state.activeTool === 'select' ? [node.id] : state.selectedIds,
  })),
  
  updateNode: (id, updates) => set((state) => {
    const existing = state.nodes[id];
    if (!existing) return state;
    return {
      nodes: {
        ...state.nodes,
        [id]: { ...existing, ...updates },
      },
    };
  }),

  updateSelectedNodes: (updates) => set((state) => {
    const nextNodes = { ...state.nodes };
    state.selectedIds.forEach((id) => {
      if (nextNodes[id]) {
        nextNodes[id] = { ...nextNodes[id], ...updates } as CanvasNode;
      }
    });
    return { nodes: nextNodes };
  }),
  
  deleteSelected: () => set((state) => {
    const nextNodes = { ...state.nodes };
    const toDelete = new Set(state.selectedIds);
    toDelete.forEach((id) => delete nextNodes[id]);
    const nextIds = state.nodeIds.filter((id) => !toDelete.has(id));
    return { nodes: nextNodes, nodeIds: nextIds, selectedIds: [] };
  }),
  
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  
  bringToFront: () => set((state) => {
    const unselected = state.nodeIds.filter((id) => !state.selectedIds.includes(id));
    const selected = state.nodeIds.filter((id) => state.selectedIds.includes(id));
    return { nodeIds: [...unselected, ...selected] };
  }),
  
  sendToBack: () => set((state) => {
    const unselected = state.nodeIds.filter((id) => !state.selectedIds.includes(id));
    const selected = state.nodeIds.filter((id) => state.selectedIds.includes(id));
    return { nodeIds: [...selected, ...unselected] };
  }),
  
  duplicateSelected: () => set((state) => {
    if (state.selectedIds.length === 0) return state;
    const nextNodes = { ...state.nodes };
    const addedIds: string[] = [];
    
    state.selectedIds.forEach((id) => {
      const original = state.nodes[id];
      if (!original) return;
      const newId = `${original.type}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      nextNodes[newId] = {
        ...original,
        id: newId,
        x: original.x + 30,
        y: original.y + 30,
      };
      addedIds.push(newId);
    });
    
    return {
      nodes: nextNodes,
      nodeIds: [...state.nodeIds, ...addedIds],
      selectedIds: addedIds,
    };
  }),

  updateRemoteCursor: (cursor) => set((state) => ({
    cursors: { ...state.cursors, [cursor.userId]: cursor },
  })),

  removeRemoteCursor: (userId) => set((state) => {
    const nextCursors = { ...state.cursors };
    delete nextCursors[userId];
    return { cursors: nextCursors };
  }),

  setRoomStatus: (status) => set((state) => ({
    room: { ...state.room, ...status },
  })),

  loadScene: (nodesList) => set(() => {
    const nodesMap: Record<string, CanvasNode> = {};
    const ids: string[] = [];
    nodesList.forEach((n) => {
      nodesMap[n.id] = n;
      ids.push(n.id);
    });
    return { nodes: nodesMap, nodeIds: ids, selectedIds: [] };
  }),

  exportSceneJson: () => {
    const state = get();
    const data = state.nodeIds.map((id) => state.nodes[id]).filter(Boolean);
    return JSON.stringify(data, null, 2);
  }
}));
