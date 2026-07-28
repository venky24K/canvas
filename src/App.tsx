import React from 'react';
import { InfiniteStage } from './engine/InfiniteStage';
import { TopNavbar } from './components/toolbar/TopNavbar';
import { FloatingToolDock } from './components/toolbar/FloatingToolDock';
import { ZoomDock } from './components/toolbar/ZoomDock';
import { ProjectDashboard } from './components/dashboard/ProjectDashboard';
import { useCanvasStore } from './store/useCanvasStore';
import { useGcpSync } from './collaboration/useGcpSync';

export const App: React.FC = () => {
  const { activeView } = useCanvasStore();

  // Initialize GCP Cloud Run & Real-time Multiplayer Sync
  useGcpSync();

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
