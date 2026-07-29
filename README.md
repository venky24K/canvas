# 🌸 Bloom — GPU-Accelerated Collaborative Design Stage

Bloom is a high-performance, real-time collaborative design canvas built with React 19, TypeScript, HTML5 Canvas, and Electron.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation & Running Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Mode (Web & Desktop)**
   ```bash
   npm run dev
   ```
   - Web App will run at `http://localhost:5173` (starts on Landing Page)
   - Desktop App launches concurrently via Electron (bypasses marketing, starts on Dashboard)

3. **Build Desktop App (macOS / Windows / Linux)**
   ```bash
   npm run build:electron
   ```
   Built packages will be placed in `dist/`.

---

## 📚 Documentation & Guides

- 📘 **[User Manual](file:///Users/venky/Documents/Github/canvas/user_manual.md)**: Full guide covering authentication, desktop deep-linking, navigation, canvas tools, and collaboration.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Desktop**: Electron, Vite Plugin Electron
- **Backend & Auth**: Google Cloud Platform (GCP) / Firebase Auth, Firestore
- **Styling**: Vanilla CSS with modern Glassmorphic design tokens
