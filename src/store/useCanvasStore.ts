import { create } from 'zustand';
import type { CanvasNode, ToolType, GridType, CollaborativeCursor, RoomState, StyleProperties } from '../types/canvas';

interface HistorySnapshot {
  nodes: Record<string, CanvasNode>;
  nodeIds: string[];
}

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
  
  // Time-Travel History Stack (Undo / Redo)
  history: HistorySnapshot[];
  future: HistorySnapshot[];
  undo: () => void;
  redo: () => void;
  recordSnapshot: () => void;
  
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
  updateNode: (id: string, updates: Partial<CanvasNode>, record?: boolean) => void;
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
  openBoard: (title, nodesList = []) => set(() => {
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
      history: [],
      future: [],
      zoom: 1,
      pan: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 200 },
    };
  }),

  // Initialize clean, empty canvas studio
  nodes: {},
  nodeIds: [],
  selectedIds: [],
  activeTool: 'select',
  
  history: [],
  future: [],
  
  zoom: 1,
  pan: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 200 },
  gridType: 'dot',
  showSnappingGuides: true,
  
  defaultStyles: {
    fillColor: '#EEF2FF',
    fillOpacity: 0.85,
    strokeColor: '#6366F1',
    strokeWidth: 4,
    cornerRadius: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowBlur: 20,
    shadowOffsetX: 0,
    shadowOffsetY: 8,
    isGlassmorphic: false,
    fontSize: 20,
    fontFamily: 'Inter',
  },

  cursors: {},
  currentUserId: `usr-${Math.random().toString(36).substring(2, 8)}`,
  currentUserName: 'venky24K',
  currentUserColor: '#6366F1',
  room: {
    roomId: 'studio-gcp-prod-room',
    roomName: 'Bloom Studio Workspace',
    isConnected: true,
    gcpStatus: 'connected',
    onlineCount: 1,
    presenterId: null,
  },

  // HISTORY RECORDING & TIME TRAVEL ACTIONS
  recordSnapshot: () => set((state) => {
    const currentSnapshot = {
      nodes: { ...state.nodes },
      nodeIds: [...state.nodeIds],
    };
    return {
      history: [...state.history, currentSnapshot].slice(-30), // Retain up to 30 history checkpoints
      future: [],
    };
  }),

  undo: () => set((state) => {
    if (state.history.length === 0) return state;
    const previous = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);
    const currentSnapshot = { nodes: { ...state.nodes }, nodeIds: [...state.nodeIds] };
    
    return {
      nodes: previous.nodes,
      nodeIds: previous.nodeIds,
      selectedIds: [],
      history: newHistory,
      future: [currentSnapshot, ...state.future].slice(0, 30),
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    const currentSnapshot = { nodes: { ...state.nodes }, nodeIds: [...state.nodeIds] };
    
    return {
      nodes: next.nodes,
      nodeIds: next.nodeIds,
      selectedIds: [],
      history: [...state.history, currentSnapshot].slice(-30),
      future: newFuture,
    };
  }),

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

  addNode: (node) => set((state) => {
    const prevSnapshot = { nodes: { ...state.nodes }, nodeIds: [...state.nodeIds] };
    return {
      nodes: { ...state.nodes, [node.id]: node },
      nodeIds: [...state.nodeIds, node.id],
      selectedIds: state.activeTool === 'select' ? [node.id] : state.selectedIds,
      history: [...state.history, prevSnapshot].slice(-30),
      future: [],
    };
  }),
  
  updateNode: (id, updates, record = false) => set((state) => {
    const existing = state.nodes[id];
    if (!existing) return state;
    const nextNodes = {
      ...state.nodes,
      [id]: { ...existing, ...updates },
    };
    if (record) {
      const prevSnapshot = { nodes: { ...state.nodes }, nodeIds: [...state.nodeIds] };
      return {
        nodes: nextNodes,
        history: [...state.history, prevSnapshot].slice(-30),
        future: [],
      };
    }
    return { nodes: nextNodes };
  }),

  updateSelectedNodes: (updates) => set((state) => {
    if (state.selectedIds.length === 0) return state;
    const prevSnapshot = { nodes: { ...state.nodes }, nodeIds: [...state.nodeIds] };
    const nextNodes = { ...state.nodes };
    state.selectedIds.forEach((id) => {
      if (nextNodes[id]) {
        nextNodes[id] = { ...nextNodes[id], ...updates } as CanvasNode;
      }
    });
    return {
      nodes: nextNodes,
      history: [...state.history, prevSnapshot].slice(-30),
      future: [],
    };
  }),
  
  deleteSelected: () => set((state) => {
    if (state.selectedIds.length === 0) return state;
    const prevSnapshot = { nodes: { ...state.nodes }, nodeIds: [...state.nodeIds] };
    const nextNodes = { ...state.nodes };
    const toDelete = new Set(state.selectedIds);
    toDelete.forEach((id) => delete nextNodes[id]);
    const nextIds = state.nodeIds.filter((id) => !toDelete.has(id));
    return {
      nodes: nextNodes,
      nodeIds: nextIds,
      selectedIds: [],
      history: [...state.history, prevSnapshot].slice(-30),
      future: [],
    };
  }),
  
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  
  bringToFront: () => set((state) => {
    const unselected = state.nodeIds.filter((id) => !state.selectedIds.includes(id));
    const selected = state.nodeIds.filter((id) => state.selectedIds.includes(id));
    const prevSnapshot = { nodes: { ...state.nodes }, nodeIds: [...state.nodeIds] };
    return {
      nodeIds: [...unselected, ...selected],
      history: [...state.history, prevSnapshot].slice(-30),
      future: [],
    };
  }),
  
  sendToBack: () => set((state) => {
    const unselected = state.nodeIds.filter((id) => !state.selectedIds.includes(id));
    const selected = state.nodeIds.filter((id) => state.selectedIds.includes(id));
    const prevSnapshot = { nodes: { ...state.nodes }, nodeIds: [...state.nodeIds] };
    return {
      nodeIds: [...selected, ...unselected],
      history: [...state.history, prevSnapshot].slice(-30),
      future: [],
    };
  }),
  
  duplicateSelected: () => set((state) => {
    if (state.selectedIds.length === 0) return state;
    const prevSnapshot = { nodes: { ...state.nodes }, nodeIds: [...state.nodeIds] };
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
      history: [...state.history, prevSnapshot].slice(-30),
      future: [],
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
    return { nodes: nodesMap, nodeIds: ids, selectedIds: [], history: [], future: [] };
  }),

  exportSceneJson: () => {
    const state = get();
    const data = state.nodeIds.map((id) => state.nodes[id]).filter(Boolean);
    return JSON.stringify(data, null, 2);
  }
}));
