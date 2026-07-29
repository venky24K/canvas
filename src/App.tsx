import React, { useEffect } from 'react';
import { InfiniteStage } from './engine/InfiniteStage';
import { TopNavbar } from './components/toolbar/TopNavbar';
import { FloatingToolDock } from './components/toolbar/FloatingToolDock';
import { ZoomDock } from './components/toolbar/ZoomDock';
import { ProjectDashboard } from './components/dashboard/ProjectDashboard';
import { LoginPage } from './components/auth/LoginPage';
import { LandingPage } from './components/marketing/LandingPage';
import { DownloadsPage } from './components/marketing/DownloadsPage';
import { useCanvasStore } from './store/useCanvasStore';
import { useGcpSync } from './collaboration/useGcpSync';
import { GcpFirestoreService } from './cloud/GcpFirestoreService';
import { firebaseAuth } from './cloud/firebaseConfig';

export const App: React.FC = () => {
  const { activeView, openBoard } = useCanvasStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room && activeView !== 'canvas') {
      const fetchBoard = () => {
        GcpFirestoreService.getBoardSnapshot(room).then((boardDoc) => {
          if (boardDoc && boardDoc.serializedState) {
            try {
              openBoard(room, JSON.parse(boardDoc.serializedState));
            } catch {
              openBoard(room);
            }
          } else {
            openBoard(room);
          }
        });
      };

      if (firebaseAuth) {
        const unsubscribe = firebaseAuth.onAuthStateChanged(() => {
          fetchBoard();
          unsubscribe();
        });
      } else {
        fetchBoard();
      }
    }
  }, []);

  // Initialize GCP Cloud Run & Real-time Multiplayer Sync
  useGcpSync();

  // Render Marketing Site Pages
  if (activeView === 'landing') {
    return <LandingPage />;
  }
  
  if (activeView === 'downloads') {
    return <DownloadsPage />;
  }

  // Render Glassmorphic GCP Identity Portal
  if (activeView === 'login') {
    return <LoginPage />;
  }

  // Toggle seamlessly between Main Workspace Project Dashboard and Live Drawing Canvas
  if (activeView === 'dashboard') {
    return <ProjectDashboard />;
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg-app)' }}>
      {/* Top Split Header Navigation Pills (Left Menu & Right Profiles/Share) */}
      <TopNavbar />

      {/* Core Infinite GPU-Accelerated Hybrid Canvas */}
      <InfiniteStage />

      {/* Bottom Center Floating Interactive Tool Dock */}
      <FloatingToolDock />

      {/* Bottom Right Corner Zoom & Grid Controls */}
      <ZoomDock />
    </div>
  );
};

export default App;
