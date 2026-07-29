# Architecture Blueprint: Bloom Collaborative Studio (Figma × Excalidraw Hybrid)

This document delineates the software architecture, design patterns, data structure specifications, multi-platform execution models, and rendering pipeline of **Bloom**, an enterprise-grade real-time collaborative UX design and freehand sketching studio.

---

## 1. System Topology & Architectural Philosophy

Bloom solves a long-standing UX division in modern product design software: the boundary between **unconstrained freehand ideation** (whiteboarding/sketching like Excalidraw or FigJam) and **structured vector design & developer handoff** (layout software like Figma or Penpot).

### Core Architectural Drivers:
1. **Zero-Latency Rendering Pipeline:** Leveraging GPU-accelerated HTML5 Canvas via `Konva.js` and React Fiber reconciler optimization (`react-konva`).
2. **Hybrid Cross-Platform Runtime:** Unified React codebase executing seamlessly across both standard web browsers and a native desktop environment via **Electron**.
3. **Web-to-Desktop Deep Link Authentication:** Intercepts custom `bloom://` system protocols to seamlessly pass secure GCP OAuth tokens from browser auth handlers directly into the Electron main process.
4. **Deterministic State & Time-Travel Synchronization:** Decoupled data model managed by Zustand with atomic rolling history buffers and CRDT-ready real-time synchronization.
5. **Cloud-Native Backbone (Google Cloud Platform):** Firebase / GCP Identity Platform for authentication, **Google Cloud Firestore** for real-time document persistence, and **Google Cloud Storage (GCS)** for asset hosting.

---

## 2. High-Level Data Flow & Cross-Platform Routing

Bloom utilizes a multi-view reactive routing state (`activeView: 'landing' | 'downloads' | 'login' | 'dashboard' | 'canvas'`) with platform-aware initialization guards:

```
┌────────────────────────────────────────────────────────────────────────┐
│                               WEB BROWSER                              │
│   ┌──────────────────┐    ┌──────────────────┐    ┌────────────────┐   │
│   │   Landing Page   │ ──>│ Google Auth Flow │ ──>│ Web Dashboard  │   │
│   └──────────────────┘    └────────┬─────────┘    └────────────────┘   │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ OAuth Token Payload (bloom://auth?data=...)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          ELECTRON DESKTOP APP                          │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                 Main Process (electron/main.ts)                │   │
│   │   - Protocol Handler (`bloom://`)                              │   │
│   │   - Custom Native Frameless Drag Titlebar Region               │   │
│   └──────────────────────────────┬─────────────────────────────────┘   │
│                                  │ IPC `deep-link` Event               │
│   ┌──────────────────────────────▼─────────────────────────────────┐   │
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
                                    │ WebSockets / Firestore Realtime Sync
┌───────────────────────────────────▼────────────────────────────────────┐
│                  GOOGLE CLOUD PLATFORM / FIRESTORE                     │
└────────────────────────────────────────────────────────────────────────┘
```

### Platform Routing Behavior Matrix:
- **Web Runtime**: Defaults to the interactive `landing` page for unauthenticated sessions. Validates real Firebase authentication before permitting access to `dashboard` or `canvas`.
- **Desktop Runtime (Electron)**: Automatically bypasses marketing pages (`landing`, `downloads`) to present the `dashboard` or a minimal Web-Login prompt that launches external browser authentication.

---

## 3. Desktop Subsystem Architecture (`/electron`)

### Main Process (`electron/main.ts`)
- **Custom Protocol Handling**: Registers `bloom://` as a single-instance system protocol scheme. Intercepts incoming deep links (on macOS `open-url` and Windows `second-instance`) and buffers payload events until the renderer window completes loading (`did-finish-load`).
- **Frameless Window Integration**: Configured with `titleBarStyle: 'hiddenInset'` to present macOS native window traffic lights cleanly alongside a custom top drag region (`WebkitAppRegion: 'drag'`).
- **Preload Isolation**: `electron/preload.ts` exposes a sandboxed `window.electronAPI` bridge using `contextBridge` compiled specifically as CommonJS (`cjs`) to adhere to Electron execution constraints.

---

## 4. Core Data Schema (The Scene Graph & History)

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

## 5. Subsystem Components

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

## 6. Collaboration & State Synchronization

All real-time message broadcasting goes through JSON schema validation to prevent malformed node payloads from polluting room state. Exported JSON scene packages preserve complete layer hierarchies and design tokens for clean team handoffs. Collaborative sharing workflows (via `ShareBoardModal` integrated into the `TopNavbar`) streamline secure GCP Firestore link distribution.
