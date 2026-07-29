# Bloom | Collaborative UX & Sketching Studio
**Where Freehand Ideation Meets Structured UI/UX Design**

![Bloom Light Mode Dashboard](public/Project%20Dashboard%20-%20Light%20Mode.png)

---

## 🎨 Overview
**Bloom** solves a long-standing division in product creative tools: the gap between unconstrained freehand sketching (e.g., Excalidraw, FigJam) and structured UI vector layouts (e.g., Figma). Built with React-Konva GPU acceleration and designed for enterprise deployment on **Google Cloud Platform (GCP)**, Bloom empowers multidisciplinary teams to design, iterate, and collaborate in real time on an infinite canvas studio.

---

## ✨ Signature Features

### 1. Marketing & Landing Site
* **Conversion-Optimized Landing Page:** Engaging product introduction highlighting Bloom's core capabilities, featuring a stunning hero section and clear call-to-action.
* **Integrated Blog:** A modern marketing blog structure to showcase updates, tutorials, and design resources, seamlessly integrated into the application routing state.

### 2. Main Workspace Project Dashboard
* **Enterprise FigJam Workflow:** Upon opening Bloom, evaluators and creators are greeted by a clean, light-mode Workspace Dashboard (*Nexus / Main Workspace*).
* **Organized Folders & Filtering:** Effortlessly navigate between *Recent*, *Starred*, *Shared*, and *Trash* workspaces, equipped with real-time title search and interactive card grids.
* **Instant Creation & Switching:** Click **`+ New Board`** or select an existing project (such as *Product Roadmap Q3*, *User Persona Flow*, or *API Architecture*) to transition seamlessly into the full-screen drawing studio.
* **Dashboard Caching & Session Persistence:** Smart `localStorage` integration persists your current session state and active view, ensuring you don't lose context on page refresh. Full sign-out functionality securely manages session data.

### 3. GPU-Accelerated Hybrid Canvas Studio
* **Infinite Stage:** High-performance, 60 FPS viewport rendering built on React-Konva WebGL & 2D Context engines.
* **Smart Grid Modes:** Switch effortlessly between clean **Dot Matrix**, **Blueprint Grid Lines**, or an unobstructed **Blank Slate Studio** with responsive zooming from **20% to 500%**.
* **Zero Mock Data:** Built as a genuine production canvas—no simulated bots or hardcoded demo cards cluttering your active workspaces.

### 4. FigJam-Style Floating Capsule Dock & Inline Controls
* **4 Organized Functional Pods:**
  1. **Navigation:** Select (`V`), Pan Hand (`H`)
  2. **UI/UX Vector Container Pod:** Artboard Screen Frames (`F`), Rectangle UI Boxes (`R`), Ellipse Badges (`O`), Connector Arrows (`A`)
  3. **Studio Ink & Presentation Pod:** Stylus Ink Pen (`P`), Highlighter, Eraser Sweep (`E`), Laser Presentation Pointer (`L`)
  4. **Ideation Pod:** Colorful Sticky Post-It Notes (`S`), Typography Text Boxes (`T`)
* **Inline Quick Palette:** Whenever a drawing or shape tool is active (or items are selected on canvas), a dynamic FigJam sub-toolbar pops up above the main dock offering one-click color swatches and unmistakable brush sizes:
  * **`S` (4px)** – Fine Stylus Ink
  * **`M` (10px)** – Marker Stroke
  * **`L` (20px)** – Bold Drawing Brush
  * **`XL` (36px)** – Heavy Poster Ink

### 5. Time-Travel Undo & Redo History Engine
* **Atomic Snapshot Buffer:** Zustand state machine maintains an intelligent 30-checkpoint timeline, capturing snapshots only after completed user actions or finished stylus ink strokes.
* **Double-Click Free Recovery:** Single-click recovery via on-screen curved Undo/Redo arrows or industry-standard shortcuts (**`Cmd/Ctrl + Z`** to Undo, **`Cmd/Ctrl + Shift + Z`** or **`Ctrl + Y`** to Redo).

### 6. Cloud-Native Multiplayer Sync (GCP Ready)
* **Live WebSockets:** Powered by an Express & Socket.IO sync server ready for zero-config container scaling on **Google Cloud Run**.
* **Live Multiplayer Peer Avatars:** Watch teammates collaborate in real-time with vibrant color-coded cursor arrows and typing indicators.

---

## 🛠️ Technology Stack
* **Core Runtime:** React 18, TypeScript, Vite
* **Rendering Engine:** React-Konva, Konva.js, Perfect-Freehand (vector smoothing & simulated pen pressure)
* **State & Architecture:** Zustand reactive observables, Conflict-Free Data pattern ready for Yjs/WebSockets
* **Styling & Icons:** Vanilla CSS Tokens (`index.css`), Lucide React Vector Icons
* **Cloud & DevOps:** Google Cloud Platform (Cloud Run, Cloud Storage, Cloud Build Docker runtime)

---

## 🚀 Quickstart & Development

### Prerequisites
* Node.js (v18+ recommended)
* NPM or Yarn

### 1. Launch Frontend Design Studio
```bash
# Install root dependencies
npm install

# Start local dev server (with instant Hot Module Replacement)
npm run dev
```
Open your browser to **`http://localhost:5173/`** to enter the **Bloom** workspace!

### 2. Launch Collaboration Server (Optional Local Test)
```bash
# Navigate to backend services
cd server
npm install
npm start
```

---

## 📚 Documentation & Architecture Specs
For engineering deep-dives, explore our dedicated specifications in `/docs`:
* [System Architecture Blueprint](docs/ARCHITECTURE.md) – Scene graph schemas, time-travel history buffer mechanics, and GPU rendering pipelines.
* [GCP Cloud Deployment Guide](docs/GCP_DEPLOYMENT.md) – Docker staging, Cloud Run configuration, and Firestore state serialization.
