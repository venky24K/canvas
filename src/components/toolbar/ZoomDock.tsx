import React from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { ZoomIn, ZoomOut, Grid, HelpCircle } from 'lucide-react';

export const ZoomDock: React.FC = () => {
  const { zoom, setZoom, setPan, gridType, toggleGrid } = useCanvasStore();

  const resetViewport = () => {
    setZoom(1);
    setPan({ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 200 });
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 12px',
        background: '#FFFFFF',
        borderRadius: 24,
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      }}
    >
      <button
        onClick={() => setZoom((z) => Math.max(0.2, z - 0.2))}
        className="tool-btn"
        style={{ width: 32, height: 32, borderRadius: 8 }}
        title="Zoom Out (-)"
      >
        <ZoomOut size={16} />
      </button>

      <button
        onClick={resetViewport}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          padding: '4px 8px',
          borderRadius: 6,
          fontSize: '0.8rem',
          fontFamily: 'JetBrains Mono',
          fontWeight: 600,
          cursor: 'pointer',
          minWidth: 54,
          textAlign: 'center',
          transition: 'background 0.15s',
        }}
        title="Reset Zoom to 100%"
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        {Math.round(zoom * 100)}%
      </button>

      <button
        onClick={() => setZoom((z) => Math.min(5, z + 0.2))}
        className="tool-btn"
        style={{ width: 32, height: 32, borderRadius: 8 }}
        title="Zoom In (+)"
      >
        <ZoomIn size={16} />
      </button>

      <div style={{ width: 1, height: 18, background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

      <button
        onClick={toggleGrid}
        className={`tool-btn ${gridType !== 'none' ? 'active' : ''}`}
        style={{ width: 32, height: 32, borderRadius: 8 }}
        title={`Grid Mode: ${gridType.toUpperCase()}`}
      >
        <Grid size={16} />
      </button>
    </div>
  );
};
