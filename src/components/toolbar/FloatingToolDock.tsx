import React from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { ToolType } from '../../types/canvas';
import {
  MousePointer,
  Hand,
  Square,
  Circle as CircleIcon,
  Smartphone,
  PenTool,
  Highlighter as HighlighterIcon,
  Type,
  StickyNote as StickyIcon,
  ArrowUpRight,
  Zap as LaserIcon,
  Trash2,
} from 'lucide-react';

export const FloatingToolDock: React.FC = () => {
  const { activeTool, selectedIds, setTool, deleteSelected, bringToFront, sendToBack } = useCanvasStore();

  const tools: { id: ToolType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'select', label: 'Select (V)', icon: <MousePointer size={20} /> },
    { id: 'hand', label: 'Pan Hand (H)', icon: <Hand size={20} /> },
    { id: 'artboard', label: 'Artboard Frame (F)', icon: <Smartphone size={20} />, badge: 'UI' },
    { id: 'rectangle', label: 'Rectangle Container (R)', icon: <Square size={20} /> },
    { id: 'ellipse', label: 'Ellipse (O)', icon: <CircleIcon size={20} /> },
    { id: 'freehand', label: 'Ink Stylus Pen (P)', icon: <PenTool size={20} />, badge: 'Draw' },
    { id: 'highlighter', label: 'Highlighter', icon: <HighlighterIcon size={20} /> },
    { id: 'sticky', label: 'Sticky Post-It Note (S)', icon: <StickyIcon size={20} /> },
    { id: 'arrow', label: 'Connector Arrow (A)', icon: <ArrowUpRight size={20} /> },
    { id: 'text', label: 'Text Box (T)', icon: <Type size={20} /> },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
      }}
      className="glass-panel"
    >
      {tools.map((t, index) => (
        <React.Fragment key={t.id}>
          {/* Add a separator after structured Figma UI tools and before Excalidraw drawing tools */}
          {index === 5 && <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />}
          {index === 2 && <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />}

          <button
            onClick={() => setTool(t.id)}
            className={`tool-btn ${activeTool === t.id ? 'active' : ''}`}
            title={t.label}
            style={{ position: 'relative' }}
          >
            {t.icon}
            {t.badge && (
              <span
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: 2,
                  fontSize: '0.55rem',
                  fontWeight: 800,
                  background: t.badge === 'UI' ? 'var(--accent-primary)' : 'var(--accent-rose)',
                  color: '#FFF',
                  padding: '1px 4px',
                  borderRadius: 4,
                  lineHeight: 1,
                }}
              >
                {t.badge}
              </span>
            )}
          </button>
        </React.Fragment>
      ))}

      {/* Conditional Trash/Delete control when nodes are selected */}
      {selectedIds.length > 0 && (
        <>
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
          
          <button
            onClick={bringToFront}
            style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer' }}
            title="Bring to Front"
          >
            ↑ Front
          </button>

          <button
            onClick={sendToBack}
            style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer' }}
            title="Send to Back"
          >
            ↓ Back
          </button>

          <button
            onClick={deleteSelected}
            className="tool-btn"
            style={{ color: 'var(--accent-rose)' }}
            title="Delete Selected (Del)"
          >
            <Trash2 size={20} />
          </button>
        </>
      )}
    </div>
  );
};
