import React from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Cloud, Wifi, Download, Upload, Grid, ZoomIn, ZoomOut, Maximize2, Sparkles, ShieldCheck } from 'lucide-react';

export const TopNavbar: React.FC = () => {
  const {
    room,
    zoom,
    gridType,
    cursors,
    currentUserName,
    setZoom,
    setPan,
    toggleGrid,
    exportSceneJson,
    loadScene,
  } = useCanvasStore();

  const handleExport = () => {
    const jsonString = exportSceneJson();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studio-canvas-board-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          loadScene(parsed);
        }
      } catch (err) {
        console.error('Failed to import board JSON:', err);
      }
    };
    reader.readAsText(file);
  };

  const resetViewport = () => {
    setZoom(1);
    setPan({ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 200 });
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 16,
        left: 20,
        right: 20,
        height: 56,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
      }}
      className="glass-panel"
    >
      {/* Left Section: Brand & GCP Cloud Run Live Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
            }}
          >
            S
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
            Studio <span style={{ color: 'var(--accent-primary)' }}>Canvas</span>
          </span>
        </div>

        <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.1)' }} />

        {/* Google Cloud Run Live Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.12)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <Cloud size={14} className="animate-pulse-glow" />
          <span style={{ fontWeight: 600 }}>GCP Cloud Run: {room.gcpStatus.toUpperCase()}</span>
          <Wifi size={12} style={{ marginLeft: 2 }} />
        </div>
      </div>

      {/* Center Section: Zoom Control & Grid Togglers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => setZoom((z) => Math.max(0.1, z - 0.15))}
          className="tool-btn"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        
        <button
          onClick={resetViewport}
          style={{
            background: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.08)',
            color: 'var(--text-primary)',
            padding: '4px 12px',
            borderRadius: 8,
            fontSize: '0.8125rem',
            fontFamily: 'JetBrains Mono',
            cursor: 'pointer',
            minWidth: 64,
            textAlign: 'center',
            fontWeight: 600
          }}
          title="Reset Zoom to 100%"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={() => setZoom((z) => Math.min(10, z + 0.15))}
          className="tool-btn"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>

        <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.1)', margin: '0 4px' }} />

        <button
          onClick={toggleGrid}
          className={`tool-btn ${gridType !== 'none' ? 'active' : ''}`}
          title={`Grid Mode: ${gridType.toUpperCase()}`}
        >
          <Grid size={18} />
        </button>
      </div>

      {/* Right Section: Multiplayer Peers & Board Export/Import */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Collaborative Peers Roster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: -6 }}>
          {Object.values(cursors).map((c) => (
            <div
              key={c.userId}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: c.color,
                border: '2px solid var(--bg-app)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#FFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                marginLeft: -6,
              }}
              title={`Peer: ${c.userName} (${c.tool})`}
            >
              {c.userName.charAt(0)}
            </div>
          ))}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              border: '2px solid var(--bg-app)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#FFF',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              marginLeft: -6,
            }}
            title={`You (${currentUserName})`}
          >
            You
          </div>
        </div>

        <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.1)' }} />

        {/* Import JSON Action */}
        <label
          className="tool-btn"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Import Board JSON"
        >
          <Upload size={18} />
          <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        </label>

        {/* Export Board Action */}
        <button onClick={handleExport} className="btn-primary" title="Export Board to JSON">
          <Download size={16} />
          <span>Export Board</span>
        </button>
      </div>
    </header>
  );
};
