import React, { useEffect } from 'react';
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
  Eraser as EraserIcon,
  Zap as LaserIcon,
  Trash2,
  Copy as DuplicateIcon,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export const FloatingToolDock: React.FC = () => {
  const {
    activeTool,
    selectedIds,
    nodes,
    defaultStyles,
    setTool,
    updateSelectedNodes,
    updateDefaultStyles,
    deleteSelected,
    bringToFront,
    sendToBack,
    duplicateSelected,
  } = useCanvasStore();

  // 1. GLOBAL KEYBOARD SHORTCUT LISTENER (Desktop FigJam UX)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside an input, textarea, or contentEditable element
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'v') setTool('select');
      else if (key === 'h') setTool('hand');
      else if (key === 'f') setTool('artboard');
      else if (key === 'r') setTool('rectangle');
      else if (key === 'o') setTool('ellipse');
      else if (key === 'p') setTool('freehand');
      else if (key === 's') setTool('sticky');
      else if (key === 't') setTool('text');
      else if (key === 'a') setTool('arrow');
      else if (key === 'e') setTool('eraser');
      else if (key === 'l') setTool('laser');
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          deleteSelected();
        }
      } else if ((e.metaKey || e.ctrlKey) && key === 'd') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          duplicateSelected();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, setTool, deleteSelected, duplicateSelected]);

  // Structured Tool Pods matching FigJam aesthetic
  const tools: { id: ToolType; label: string; icon: React.ReactNode; badge?: string; group: number }[] = [
    // Pod 1: Navigation
    { id: 'select', label: 'Select (V)', icon: <MousePointer size={18} />, group: 1 },
    { id: 'hand', label: 'Pan Hand (H)', icon: <Hand size={18} />, group: 1 },
    // Pod 2: UI & Containers
    { id: 'artboard', label: 'Artboard Frame (F)', icon: <Smartphone size={18} />, badge: 'UI', group: 2 },
    { id: 'rectangle', label: 'Rectangle (R)', icon: <Square size={18} />, group: 2 },
    { id: 'ellipse', label: 'Ellipse (O)', icon: <CircleIcon size={18} />, group: 2 },
    { id: 'arrow', label: 'Connector Arrow (A)', icon: <ArrowUpRight size={18} />, group: 2 },
    // Pod 3: Studio Ink & Eraser
    { id: 'freehand', label: 'Ink Pen (P)', icon: <PenTool size={18} />, badge: 'Draw', group: 3 },
    { id: 'highlighter', label: 'Highlighter', icon: <HighlighterIcon size={18} />, group: 3 },
    { id: 'eraser', label: 'Eraser (E)', icon: <EraserIcon size={18} />, group: 3 },
    { id: 'laser', label: 'Laser Pointer (L)', icon: <LaserIcon size={18} />, group: 3 },
    // Pod 4: Ideation
    { id: 'sticky', label: 'Sticky Post-It Note (S)', icon: <StickyIcon size={18} />, group: 4 },
    { id: 'text', label: 'Text Box (T)', icon: <Type size={18} />, group: 4 },
  ];

  // Colors suitable for FigJam-style quick selection
  const quickColors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#0EA5E9', '#8B5CF6', '#0F172A', '#F8FAFC'];
  const strokeThicknesses = [
    { label: 'S', value: 4, title: 'Fine Stroke (4px)' },
    { label: 'M', value: 10, title: 'Medium Stroke (10px)' },
    { label: 'L', value: 20, title: 'Bold Stroke (20px)' },
    { label: 'XL', value: 36, title: 'Extra Bold (36px)' },
  ];

  // Determine active color and thickness to highlight in the palette
  const firstSelectedNode = selectedIds.length > 0 ? nodes[selectedIds[0]] : null;
  const activeColor = firstSelectedNode?.fillColor || defaultStyles.fillColor || '#6366F1';
  const activeStrokeWidth = firstSelectedNode?.strokeWidth || defaultStyles.strokeWidth || 4;

  const handleColorPick = (color: string) => {
    if (selectedIds.length > 0) {
      updateSelectedNodes({ fillColor: color, strokeColor: color === '#F8FAFC' ? '#0F172A' : color });
    } else {
      updateDefaultStyles({ fillColor: color, strokeColor: color === '#F8FAFC' ? '#0F172A' : color } as any);
    }
  };

  const handleWidthPick = (width: number) => {
    if (selectedIds.length > 0) {
      updateSelectedNodes({ strokeWidth: width });
    } else {
      updateDefaultStyles({ strokeWidth: width } as any);
    }
  };

  const showQuickPalette = selectedIds.length > 0 || ['freehand', 'highlighter', 'rectangle', 'ellipse', 'sticky', 'arrow', 'text'].includes(activeTool);
  const showThicknessPicker = selectedIds.length > 0 || ['freehand', 'highlighter', 'rectangle', 'ellipse', 'arrow'].includes(activeTool);

  return (
    <>
      {/* FIGJAM SUB-TOOLBAR: Inline Color Swatches & Stroke Size Palette (Above Dock) */}
      {showQuickPalette && (
        <div
          style={{
            position: 'fixed',
            bottom: 84,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 49,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '6px 16px',
            background: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Color Swatches */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {quickColors.map((c) => (
              <button
                key={c}
                onClick={() => handleColorPick(c)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: c,
                  border: activeColor === c ? '2px solid #0F172A' : '1px solid rgba(0,0,0,0.15)',
                  boxShadow: activeColor === c ? '0 0 0 2px #FFF, 0 0 0 4px #4F46E5' : '0 2px 4px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                title={`Set Color: ${c}`}
              />
            ))}
          </div>

          {/* Stroke Thickness Selector */}
          {showThicknessPicker && (
            <>
              <div style={{ width: 1, height: 18, background: 'rgba(0,0,0,0.08)', margin: '0 2px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {strokeThicknesses.map((st) => (
                  <button
                    key={st.value}
                    onClick={() => handleWidthPick(st.value)}
                    style={{
                      padding: '2px 8px',
                      height: 24,
                      borderRadius: 6,
                      border: 'none',
                      background: activeStrokeWidth === st.value ? '#4F46E5' : 'transparent',
                      color: activeStrokeWidth === st.value ? '#FFF' : '#475569',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    title={st.title}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* PRIMARY FIGJAM STYLE CAPSULE TOOL DOCK */}
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
          padding: '6px 12px',
          background: '#FFFFFF',
          borderRadius: 32,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }}
      >
        {tools.map((t, index) => (
          <React.Fragment key={t.id}>
            {/* Insert sleek vertical dividers between functional pods */}
            {index > 0 && tools[index - 1].group !== t.group && (
              <div style={{ width: 1, height: 22, background: 'rgba(0, 0, 0, 0.08)', margin: '0 2px' }} />
            )}

            <button
              onClick={() => setTool(t.id)}
              className={`tool-btn ${activeTool === t.id ? 'active' : ''}`}
              title={t.label}
              style={{
                position: 'relative',
                width: 36,
                height: 36,
                borderRadius: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: activeTool === t.id ? '#EEF2FF' : 'transparent',
                color: activeTool === t.id ? '#4F46E5' : '#475569',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (activeTool !== t.id) {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                  e.currentTarget.style.color = '#0F172A';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTool !== t.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#475569';
                }
              }}
            >
              {t.icon}
              {t.badge && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: -3,
                    right: 0,
                    fontSize: '0.52rem',
                    fontWeight: 800,
                    background: t.badge === 'UI' ? '#4F46E5' : '#E11D48',
                    color: '#FFF',
                    padding: '1px 4px',
                    borderRadius: 6,
                    lineHeight: 1,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                  }}
                >
                  {t.badge}
                </span>
              )}
            </button>
          </React.Fragment>
        ))}

        {/* CONTEXT ACTIONS: Appears smoothly when canvas nodes are selected */}
        {selectedIds.length > 0 && (
          <>
            <div style={{ width: 1, height: 24, background: 'rgba(0, 0, 0, 0.12)', margin: '0 4px' }} />
            
            <button
              onClick={bringToFront}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: '#475569', padding: '6px 10px', borderRadius: 16, background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
              title="Bring to Front"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ArrowUp size={14} />
              <span>Front</span>
            </button>

            <button
              onClick={sendToBack}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: '#475569', padding: '6px 10px', borderRadius: 16, background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
              title="Send to Back"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ArrowDown size={14} />
              <span>Back</span>
            </button>

            <button
              onClick={duplicateSelected}
              style={{ width: 34, height: 34, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
              title="Duplicate (Cmd+D)"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <DuplicateIcon size={16} />
            </button>

            <button
              onClick={deleteSelected}
              style={{ width: 34, height: 34, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E11D48', background: 'rgba(225, 29, 72, 0.06)', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
              title="Delete Selected (Del)"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(225, 29, 72, 0.14)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(225, 29, 72, 0.06)')}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </>
  );
};
