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
  const { activeView, openBoard, setActiveView } = useCanvasStore();

  // On web: check real Firebase auth state. If no authenticated user, force landing page.
  useEffect(() => {
    const isDesktop = !!(window as any).electronAPI || navigator.userAgent.toLowerCase().includes('electron');
    if (isDesktop || !firebaseAuth) return;

    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      if (!user && activeView !== 'landing' && activeView !== 'downloads' && activeView !== 'login') {
        // No real Firebase user on web — clear stale localStorage and show landing
        localStorage.removeItem('bloom_active_view');
        setActiveView('landing');
      }
    });
    return () => unsubscribe();
  }, []);

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
      electronAPI.onDeepLink((url: string) => {
        console.log('[Deep Link] Received:', url);
        try {
          let dataBase64 = '';
          if (url.includes('data=')) {
            dataBase64 = url.split('data=')[1].split('&')[0];
          }
          if (dataBase64) {
            const decoded = decodeURIComponent(atob(dataBase64));
            const profile = JSON.parse(decoded);
            console.log('[Deep Link] Profile:', profile);
            // Use getState() to avoid stale closure
            const { setUserIdentity, setActiveView } = useCanvasStore.getState();
            setUserIdentity(profile.uid, profile.displayName, profile.avatarColor, profile.photoURL);
            setActiveView('dashboard');
          }
        } catch (e) {
          console.error('[Deep Link] Failed to parse auth payload:', e);
        }
      });
    }
  }, []); // Only register once

  // Force off marketing pages on Desktop only
  useEffect(() => {
    const isElectron = !!(window as any).electronAPI || navigator.userAgent.toLowerCase().includes('electron');
    if (isElectron && (activeView === 'landing' || activeView === 'downloads')) {
      setActiveView('dashboard');
    }
  }, [activeView, setActiveView]);

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
