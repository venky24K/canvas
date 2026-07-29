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
  const { activeView, openBoard, setActiveView, setUserIdentity } = useCanvasStore();

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

  // Handle Desktop Deep Links (bloom://)
  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI) {
      // Force user off marketing pages
      if (activeView === 'landing' || activeView === 'downloads') {
        setActiveView('dashboard');
      }

      electronAPI.onDeepLink((url: string) => {
        try {
          const urlObj = new URL(url);
          if (urlObj.hostname === 'auth' && urlObj.searchParams.has('data')) {
            const dataBase64 = urlObj.searchParams.get('data')!;
            const decoded = atob(dataBase64);
            const profile = JSON.parse(decoded);
            setUserIdentity(profile.uid, profile.displayName, profile.avatarColor, profile.photoURL);
            setActiveView('dashboard');
          }
        } catch (e) {
          console.error('Failed to parse deep link auth payload:', e);
        }
      });
    } else {
      // Also force off marketing pages even if not in electron
      if (activeView === 'landing' || activeView === 'downloads') {
        setActiveView('dashboard');
      }
    }
  }, [activeView, setActiveView, setUserIdentity]);

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
