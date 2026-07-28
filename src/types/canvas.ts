export type ToolType = 
  | 'select' 
  | 'hand' 
  | 'rectangle' 
  | 'ellipse' 
  | 'artboard' 
  | 'freehand' 
  | 'highlighter' 
  | 'text' 
  | 'arrow' 
  | 'sticky' 
  | 'eraser' 
  | 'laser';

export type GridType = 'dot' | 'line' | 'none';

export type ArtboardPreset = 'iphone16' | 'macbook' | 'dribbble' | 'custom';

export interface StyleProperties {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  strokeDash?: number[];
  cornerRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  isGlassmorphic?: boolean;
}

export interface BaseNode extends StyleProperties {
  id: string;
  type: 'rectangle' | 'ellipse' | 'artboard' | 'freehand' | 'text' | 'arrow' | 'sticky';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  isLocked: boolean;
  name?: string;
  parentId?: string;
}

export interface ShapeNode extends BaseNode {
  type: 'rectangle' | 'ellipse';
}

export interface ArtboardNode extends BaseNode {
  type: 'artboard';
  preset: ArtboardPreset;
  clipChildren: boolean;
  deviceLabel: string;
}

export interface FreehandNode extends BaseNode {
  type: 'freehand';
  points: number[][]; // Array of [x, y, pressure]
  isHighlighter?: boolean;
  smoothing: number;
}

export interface TextNode extends BaseNode {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
}

export interface StickyNode extends BaseNode {
  type: 'sticky';
  text: string;
  colorPreset: 'yellow' | 'pink' | 'cyan' | 'purple' | 'emerald';
  author: string;
}

export interface ArrowNode extends BaseNode {
  type: 'arrow';
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  startNodeId?: string;
  endNodeId?: string;
  arrowType: 'straight' | 'curved' | 'orthogonal';
  label?: string;
}

export type CanvasNode = 
  | ShapeNode 
  | ArtboardNode 
  | FreehandNode 
  | TextNode 
  | StickyNode 
  | ArrowNode;

export interface CollaborativeCursor {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
  tool: ToolType;
  typingMessage?: string;
  lastUpdated: number;
}

export interface RoomState {
  roomId: string;
  roomName: string;
  isConnected: boolean;
  gcpStatus: 'connected' | 'syncing' | 'offline';
  onlineCount: number;
  presenterId: string | null;
}
