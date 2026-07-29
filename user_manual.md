# 🌸 Bloom - User Manual

Welcome to **Bloom**, the collaborative GPU-accelerated design canvas and project workspace. This manual provides a complete guide on getting started, navigating the app, authenticating across web and desktop platforms, and using core features.

---

## 📖 Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Platform Differences: Web vs. Desktop](#platform-differences-web-vs-desktop)
3. [Authentication & Deep Linking](#authentication--deep-linking)
4. [Navigating the Workspace](#navigating-the-workspace)
5. [Canvas & Drawing Tools](#canvas--drawing-tools)
6. [Real-time Collaboration & Storage](#real-time-collaboration--storage)
7. [Building & Deployment](#building--deployment)

---

## 1. Overview & Architecture
Bloom is built as a hybrid cross-platform application using:
- **Frontend Core**: React 19 + TypeScript + Vite.
- **GPU Canvas**: HTML5 Canvas with custom pan/zoom matrix transformations.
- **Desktop Application**: Electron integration with native macOS/Windows frameless titlebars.
- **Backend & Authentication**: Google Cloud Platform (GCP) Identity Platform / Firebase Auth + Firestore.

---

## 2. Platform Differences: Web vs. Desktop

| Feature | Web App (`http://localhost:5173`) | Desktop App (`Bloom.app`) |
| :--- | :--- | :--- |
| **Initial View** | Interactive Marketing Landing Page | Direct Project Dashboard |
| **Window Frame** | Browser window standard | Native frameless window with custom drag titlebar |
| **Authentication** | Direct Google OAuth via Web | Web-to-Desktop Deep Linking (`bloom://auth`) |
| **Protocol Handler** | N/A | Intercepts `bloom://` system protocols |

---

## 3. Authentication & Deep Linking

### Logging In on Web
1. Open the web app URL.
2. Click **Get Started** or **Sign In**.
3. Authenticate using your Google account via GCP Identity / Firebase Auth.

### Logging In on Desktop App
The desktop app bypasses marketing pages to keep your workflow distraction-free:
1. Open **Bloom Desktop**.
2. If unauthenticated, you will see the **Welcome to Bloom Desktop** prompt.
3. Click **Login on Web**. This will open your system default browser to the web login page.
4. Complete Google Authentication in your web browser.
5. The web page will automatically trigger the custom deep link (`bloom://auth?data=...`).
6. Your OS will prompt you to return to **Bloom**, which automatically signs you in and opens your Project Dashboard!

---

## 4. Navigating the Workspace

### Project Dashboard
- **Sidebar**: Access Recent, Starred, Shared, and Trash workspaces.
- **Title Bar**: Native dragging region at the top of the app allows effortless window movement.
- **User Profile**: Click your avatar in the sidebar to view identity details or sign out.
- **New Board**: Click the `+ New Board` button to instantiate a clean GPU-accelerated drawing canvas.

---

## 5. Canvas & Drawing Tools

- **Infinite Stage**: Pan freely by holding Spacebar or middle-click and dragging. Zoom using mouse scroll or the bottom-right Zoom Dock.
- **Floating Tool Dock**:
  - **Select Tool**: Click & drag elements across the stage.
  - **Shapes**: Rectangles, circles, and glassmorphic cards.
  - **Text & Notes**: Rich text editing on sticky notes.
  - **Styling**: Customize fill colors, stroke widths, corner radii, and drop shadows via the top properties bar.

---

## 6. Real-time Collaboration & Storage

- **Multiplayer Sync**: Room codes allow multiple concurrent users to collaborate on the same canvas in real time via GCP Firestore listeners.
- **Presence Cursors**: See real-time cursor positions, names, and custom colors of collaborators on the stage.

---

## 7. Building & Deployment

### Run Locally (Development)
```bash
npm run dev
```

### Build Desktop App (Electron)
```bash
npm run build:electron
```
Outputs installer DMG, ZIP, and `.app` bundles inside `dist/`.
