import { create } from 'zustand';
import type { CanvasNode, ToolType, GridType, CollaborativeCursor, RoomState, StyleProperties } from '../types/canvas';

interface CanvasState {
  // Application View Mode (Dashboard Workspace vs Interactive Drawing Studio)
  activeView: 'dashboard' | 'canvas';
  boardTitle: string;
  setActiveView: (view: 'dashboard' | 'canvas') => void;
  setBoardTitle: (title: string) => void;
  openBoard: (title: string, nodes?: CanvasNode[]) => void;

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
  
  // Design Default Tokens (Optimized for White Canvas)
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
  updateDefaultStyles: (updates: Partial<StyleProperties & { fontSize: number; fontFamily: string }>) => void;
  
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

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // Default to Main Workspace Project Dashboard when application loads
  activeView: 'dashboard',
  boardTitle: 'Product Roadmap Q3',
  setActiveView: (view) => set({ activeView: view }),
  setBoardTitle: (title) => set({ boardTitle: title }),
  openBoard: (title, nodesList = []) => set((state) => {
    const nodesMap: Record<string, CanvasNode> = {};
    const ids: string[] = [];
    nodesList.forEach((n) => {
      nodesMap[n.id] = n;
      ids.push(n.id);
    });
    return {
      activeView: 'canvas',
      boardTitle: title,
      nodes: nodesMap,
      nodeIds: ids,
      selectedIds: [],
      zoom: 1,
      pan: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 200 },
    };
  }),

  // Initialize with completely clean, empty canvas (No mock data!)
  nodes: {},
  nodeIds: [],
  selectedIds: [],
  activeTool: 'select',
  
  zoom: 1,
  pan: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 200 },
  gridType: 'dot',
  showSnappingGuides: true,
  
  defaultStyles: {
    fillColor: '#EEF2FF',
    fillOpacity: 0.85,
    strokeColor: '#6366F1',
    strokeWidth: 2,
    cornerRadius: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowBlur: 20,
    shadowOffsetX: 0,
    shadowOffsetY: 8,
    isGlassmorphic: false,
    fontSize: 20,
    fontFamily: 'Inter',
  },

  // No simulated mock cursors; only real WebSocket peers from GCP Cloud Run appear
  cursors: {},
  currentUserId: `usr-${Math.random().toString(36).substring(2, 8)}`,
  currentUserName: 'venky24K',
  currentUserColor: '#6366F1',
  room: {
    roomId: 'studio-gcp-prod-room',
    roomName: 'Studio Canvas Studio',
    isConnected: true,
    gcpStatus: 'connected',
    onlineCount: 1,
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
  
  updateDefaultStyles: (updates) => set((state) => ({
    defaultStyles: { ...state.defaultStyles, ...updates }
  })),

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
