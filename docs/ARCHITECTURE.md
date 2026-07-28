# Architecture Blueprint: Studio Canvas (Figma × Excalidraw Hybrid)

This document delineates the software architecture, design patterns, data structure specifications, and rendering pipeline of **Studio Canvas**, an enterprise-grade real-time collaborative design studio engineered for Frontend R&D evaluation.

---

## 1. System Topology & Architectural Philosophy

Studio Canvas solves a long-standing UX division in modern product design software: the boundary between **unconstrained freehand ideation** (whiteboarding/sketching like Excalidraw or tldraw) and **structured vector design & developer handoff** (layout software like Figma or Penpot).

### Core Architectural Drivers:
1. **Zero-Latency Rendering Pipeline:** Leveraging GPU-accelerated HTML5 Canvas via `Konva.js` and React Fiber reconciler optimization (`react-konva`).
2. **Deterministic State Synchronization:** A decoupled data model managed by lightweight reactive observables (`Zustand`) engineered for synchronization via Conflict-Free Replicated Data Types (CRDTs / `Yjs` over WebSockets).
3. **Cloud-Native Backbone (Google Cloud Platform):** Real-time persistent state engines running on **Google Cloud Run**, scalable asset caching via **Google Cloud Storage (GCS)**, and persistent document metadata on **Google Cloud Firestore**.

---

## 2. High-Level Data Flow & Scene Graph

```
┌────────────────────────────────────────────────────────────────────────┐
│                          STUDIO CANVAS CLIENT                          │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                 Reactive Store (Zustand / Yjs)                 │   │
│   └───────────────▲──────────────────────────────▲─────────────────┘   │
│                   │                              │                     │
│        State Modifications             Read Immutable Scene            │
│                   │                              │                     │
│   ┌───────────────▼──────────────┐       ┌───────▼─────────────────┐   │
│   │    Tool Action Handlers      │       │   React-Konva Stage     │   │
│   │  (Pointer / Freehand / Pan)  │       │  (WebGL / 2D Canvas)    │   │
│   └──────────────────────────────┘       └─────────────────────────┘   │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ WebSockets (CRDT / JSON Diff)
┌───────────────────────────────────▼────────────────────────────────────┐
│                    GCP CLOUD RUN PERSISTENT SERVER                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Data Schema (The Scene Graph)

Every visual item on the infinite canvas is represented as a polymorphemic vector or stroke node (`CanvasNode`). This immutable schema guarantees serialization fidelity and easy calculation of CSS inspection strings.

```typescript
export type NodeType = 'rectangle' | 'ellipse' | 'artboard' | 'freehand' | 'text' | 'arrow' | 'sticky';

export interface BaseNode {
  id: string;
  type: NodeType;
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
  strokeWidth: number;
  strokeDash?: number[];
  cornerRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  isGlassmorphic?: boolean;
}

export interface FreehandNode extends BaseNode, StyleProperties {
  type: 'freehand';
  points: number[][]; // [[x, y, pressure], ...]
  isHighlighter?: boolean;
}

export interface ArtboardNode extends BaseNode, StyleProperties {
  type: 'artboard';
  preset: 'iphone16' | 'macbook' | 'custom';
  clipChildren: boolean;
}
```

---

## 4. Subsystem Components

### A. Rendering & Grid Engine (`/src/engine`)
* **`InfiniteStage.tsx`**: Governs global transformation matrices, handling multi-touch gestures, space-bar panning, mouse wheel zoom (ranging from `10%` to `1000%`), and viewport boundary recalculations.
* **`GridLayer.tsx`**: Dynamically generates visual coordinate references (Dot matrix or Blueprint grid lines) based on current zoom factors to prevent visual clutter at zoomed-out ratios.
* **`SnapGuideEngine.ts`**: Real-time bounding-box alignment calculator. When a node is dragged or resized, it computes distances against adjacent node centroids and borders, triggering cyan snapping lines within a `< 5px` hysteresis tolerance.

### B. Hybrid Creation Suite
* **Freehand Ink Algorithm**: Integrates `perfect-freehand` to translate raw pointer sample points into smooth SVG path geometry with simulated pen pressure and tapered ends.
* **Vector & Artboard Framing**: Enforces clipping masks when sibling nodes fall within an Artboard's bounding rect, mimicking Figma's container auto-nesting.

### C. Developer Inspect & Export Engine (`/src/components/inspector`)
When an item is highlighted, the inspector evaluates its spatial and stylistic primitives to emit:
* **Vanilla CSS**: Standard rules (e.g., `border-radius`, `box-shadow`, `backdrop-filter`).
* **Tailwind Tokens**: Compiled design utility strings (e.g., `rounded-2xl border border-white/20 bg-slate-900/50 shadow-2xl backdrop-blur-xl`).
* **SVG Strings**: Raw vector markup ready for direct integration into production web apps.

---

## 5. Security & Modular Isolation

All real-time message broadcasting goes through schema validation to prevent malformed node payloads from polluting room state. Client-side storage leverages `IndexedDB` as an offline fall-back cache, automatically purging stale deltas upon successful synchronization with Google Cloud Firestore.
