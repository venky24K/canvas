import React from 'react';
import { InfiniteStage } from './engine/InfiniteStage';
import { TopNavbar } from './components/toolbar/TopNavbar';
import { FloatingToolDock } from './components/toolbar/FloatingToolDock';
import { PropertiesPanel } from './components/inspector/PropertiesPanel';
import { useGcpSync } from './collaboration/useGcpSync';

export const App: React.FC = () => {
  // Initialize GCP Cloud Run & Real-time Multiplayer Sync
  useGcpSync();

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg-app)' }}>
      {/* Top Header Navigation & Status */}
      <TopNavbar />

      {/* Core Infinite GPU-Accelerated Hybrid Canvas */}
      <InfiniteStage />

      {/* Bottom Floating Interactive Tool Dock */}
      <FloatingToolDock />

      {/* Right Sidebar Inspector & Developer Code Export Panel */}
      <PropertiesPanel />
    </div>
  );
};

export default App;
