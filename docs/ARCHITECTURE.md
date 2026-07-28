# Architecture Blueprint: Bloom Collaborative Studio (Figma × Excalidraw Hybrid)

This document delineates the software architecture, design patterns, data structure specifications, and rendering pipeline of **Bloom**, an enterprise-grade real-time collaborative UX design and freehand sketching studio engineered for Frontend R&D evaluation.

---

## 1. System Topology & Architectural Philosophy

Bloom solves a long-standing UX division in modern product design software: the boundary between **unconstrained freehand ideation** (whiteboarding/sketching like Excalidraw or FigJam) and **structured vector design & developer handoff** (layout software like Figma or Penpot).

### Core Architectural Drivers:
1. **Zero-Latency Rendering Pipeline:** Leveraging GPU-accelerated HTML5 Canvas via `Konva.js` and React Fiber reconciler optimization (`react-konva`).
2. **Deterministic State & Time-Travel Synchronization:** A decoupled data model managed by lightweight reactive observables (`Zustand`) equipped with an atomic rolling history buffer and CRDT-ready WebSocket serialization.
3. **Cloud-Native Backbone (Google Cloud Platform):** Real-time persistent state engines running on **Google Cloud Run**, scalable asset caching via **Google Cloud Storage (GCS)**, and persistent document metadata on **Google Cloud Firestore**.

---

## 2. High-Level Data Flow & View Navigation

Bloom utilizes a dual-view reactive routing state (`activeView: 'dashboard' | 'canvas'`) allowing users to switch fluidly between high-level project management and immersive canvas creation.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              BLOOM CLIENT                              │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │             Zustand Reactive Store & History Stack             │   │
│   └───────────────▲──────────────────────────────▲─────────────────┘   │
│                   │                              │                     │
│        State Modifications             Read Immutable Scene            │
│                   │                              │                     │
│   ┌───────────────▼──────────────┐       ┌───────▼─────────────────┐   │
│   │    Tool & Hotkey Handlers    │       │   React-Konva Stage     │   │
│   │ (FigJam Dock / Hotkey Engine)│       │  (WebGL / 2D Canvas)    │   │
│   └──────────────────────────────┘       └─────────────────────────┘   │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ WebSockets (JSON Diff & Cursors)
┌───────────────────────────────────▼────────────────────────────────────┐
│                    GCP CLOUD RUN PERSISTENT SERVER                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Data Schema (The Scene Graph & History)

Every visual item on the infinite canvas is represented as a polymorphic vector or stroke node (`CanvasNode`). This immutable schema guarantees serialization fidelity and effortless atomic history snapshot recording.

```typescript
export type ToolType = 'select' | 'hand' | 'rectangle' | 'ellipse' | 'artboard' | 'freehand' | 'highlighter' | 'text' | 'arrow' | 'sticky' | 'eraser' | 'laser';

export interface BaseNode {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  isLocked: boolean;
  name?: string;
  parentId?: string; // For items inside an Artboard or Group
}

export interface StyleProperties {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number; // Supports S (4px), M (10px), L (20px), XL (36px)
  strokeDash?: number[];
  cornerRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  isGlassmorphic?: boolean;
}

export interface HistorySnapshot {
  nodes: Record<string, CanvasNode>;
  nodeIds: string[];
}
```

---

## 4. Subsystem Components

### A. Rendering & Grid Engine (`/src/engine`)
* **`InfiniteStage.tsx`**: Governs global transformation matrices, handling multi-touch gestures, space-bar panning, mouse wheel zoom (ranging from `20%` to `500%`), and viewport boundary recalculations. Implements infinite CSS grid backgrounds (Dot Matrix, Blueprint Lines) for 60 FPS performance without Konva DOM node overhead.
* **`NodeRenderer.tsx`**: Responsible for rendering shapes, text, connector arrows, device artboards, and smooth ink curves. Integrates `perfect-freehand` to convert raw sample arrays into simulated pressure SVG paths.

### B. Time-Travel Undo / Redo Stack
To avoid state duplication during high-frequency mouse events:
1. **Atomic Actions (Shapes, Delete, Duplicate, Reorder):** Before mutation occurs, `useCanvasStore` pushes the preceding state snapshot onto a rolling 30-item `history` buffer and clears the `future` stack.
2. **Continuous Ink Drawing:** When `handleMouseDown` initializes a stroke, the pre-stroke state is recorded. Throughout `handleMouseMove`, coordinate samples append directly without polluting the history array. When `handleMouseUp` concludes the stroke, the timeline remains clean and ready for instant single-click Undo recovery (`Cmd+Z`).

### C. FigJam Capsule Dock & Inline Styling (`/src/components/toolbar`)
* **`FloatingToolDock.tsx`**: Centers at the bottom of the studio interface, organizing tools into 4 functional pods (Navigation, UI Containers, Studio Ink, and Ideation).
* **Inline Quick Palette**: Replaces obstructive traditional sidebars by surfacing dynamic color swatches and brush thickness pills (`S=4px`, `M=10px`, `L=20px`, `XL=36px`) immediately above the dock when relevant drawing tools are active.

---

## 5. Collaboration Security & State Serialization

All real-time message broadcasting goes through JSON schema validation to prevent malformed node payloads from polluting room state. Exported JSON scene packages preserve complete layer hierarchies and design tokens for clean team handoffs.
