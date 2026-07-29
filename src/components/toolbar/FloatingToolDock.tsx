import React, { useEffect } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { ToolType } from '../../types/canvas';
import {
  MousePointer2,
  Hand,
  Square,
  Circle as CircleIcon,
  Frame,
  PenTool,
  Highlighter as HighlighterIcon,
  Type,
  StickyNote as StickyIcon,
  ArrowUpRight,
  Eraser as EraserIcon,
  Trash2,
  Copy as DuplicateIcon,
  ArrowUp,
  ArrowDown,
  Undo2 as UndoIcon,
  Redo2 as RedoIcon,
} from 'lucide-react';

export const FloatingToolDock: React.FC = () => {
  const {
    activeTool,
    selectedIds,
    nodes,
    defaultStyles,
    history,
    future,
    undo,
    redo,
    setTool,
    updateSelectedNodes,
    updateDefaultStyles,
    deleteSelected,
    bringToFront,
    sendToBack,
    duplicateSelected,
  } = useCanvasStore();

  // Global keyboard shortcuts: tool switching + undo/redo/duplicate/delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside an input, textarea, or contentEditable element
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();

      // Undo / Redo (Cmd+Z / Ctrl+Z / Cmd+Shift+Z / Cmd+Y)
      if ((e.metaKey || e.ctrlKey) && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && key === 'y') {
        e.preventDefault();
        redo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && key === 'd') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          duplicateSelected();
        }
        return;
      }

      // Any other modifier combo (Cmd/Ctrl/Alt) is left alone — this is what
      // was previously missing, and it let single-letter tool shortcuts hijack
      // browser/OS shortcuts like Cmd+V (paste), Cmd+T (new tab), Cmd+S (save),
      // Cmd+A (select all), and Cmd+R (reload).
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          deleteSelected();
        }
        return;
      }

      // Plain-letter tool shortcuts (no modifier held)
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, setTool, deleteSelected, duplicateSelected, undo, redo]);

  // Tool pods, grouped for the dividers rendered between them
  const tools: { id: ToolType; label: string; icon: React.ReactNode; group: number }[] = [
    // Navigation
    { id: 'select', label: 'Select (V)', icon: <MousePointer2 size={18} />, group: 1 },
    { id: 'hand', label: 'Pan (H)', icon: <Hand size={18} />, group: 1 },
    // Shapes & containers
    { id: 'artboard', label: 'Frame (F)', icon: <Frame size={18} />, group: 2 },
    { id: 'rectangle', label: 'Rectangle (R)', icon: <Square size={18} />, group: 2 },
    { id: 'ellipse', label: 'Ellipse (O)', icon: <CircleIcon size={18} />, group: 2 },
    { id: 'arrow', label: 'Arrow (A)', icon: <ArrowUpRight size={18} />, group: 2 },
    // Ink
    { id: 'freehand', label: 'Pen (P)', icon: <PenTool size={18} />, group: 3 },
    { id: 'highlighter', label: 'Highlighter', icon: <HighlighterIcon size={18} />, group: 3 },
    { id: 'eraser', label: 'Eraser (E)', icon: <EraserIcon size={18} />, group: 3 },
    // Ideation
    { id: 'sticky', label: 'Sticky note (S)', icon: <StickyIcon size={18} />, group: 4 },
    { id: 'text', label: 'Text (T)', icon: <Type size={18} />, group: 4 },
  ];

  const quickColors = ['#8789FF', '#FF99E7', '#82FFCF', '#F59E0B', '#0EA5E9', '#EF4444', '#14161A', '#FFFFFF'];
  const strokeThicknesses = [
    { label: 'S', value: 4, title: 'Fine stroke (4px)' },
    { label: 'M', value: 10, title: 'Medium stroke (10px)' },
    { label: 'L', value: 20, title: 'Bold stroke (20px)' },
    { label: 'XL', value: 36, title: 'Extra bold (36px)' },
  ];

  const fontSizes = [
    { label: 'S', value: 16, title: 'Small text (16px)' },
    { label: 'M', value: 24, title: 'Medium text (24px)' },
    { label: 'L', value: 48, title: 'Large text (48px)' },
    { label: 'XL', value: 96, title: 'Huge text (96px)' },
  ];

  // Determine active color and thickness to highlight in the palette
  const firstSelectedNode = selectedIds.length > 0 ? nodes[selectedIds[0]] : null;
  const activeColor = firstSelectedNode?.fillColor || defaultStyles.fillColor || '#8789FF';
  const activeStrokeWidth = firstSelectedNode?.strokeWidth || defaultStyles.strokeWidth || 4;
  const activeFontSize = (firstSelectedNode as any)?.fontSize || defaultStyles.fontSize || 24;

  const handleColorPick = (color: string) => {
    const strokeColor = color === '#FFFFFF' ? '#14161A' : color;
    if (selectedIds.length > 0) {
      updateSelectedNodes({ fillColor: color, strokeColor });
    } else {
      updateDefaultStyles({ fillColor: color, strokeColor } as any);
    }
  };

  const handleWidthPick = (width: number) => {
    if (selectedIds.length > 0) {
      updateSelectedNodes({ strokeWidth: width });
    } else {
      updateDefaultStyles({ strokeWidth: width } as any);
    }
  };

  const handleFontSizePick = (size: number) => {
    if (selectedIds.length > 0) {
      updateSelectedNodes({ fontSize: size });
    } else {
      updateDefaultStyles({ fontSize: size });
    }
  };

  const selectedNodes = selectedIds.map(id => nodes[id]).filter(Boolean);
  const hasStrokeNodeSelected = selectedNodes.some(n => ['freehand', 'highlighter', 'rectangle', 'ellipse', 'arrow'].includes(n.type));
  const hasTextNodeSelected = selectedNodes.some(n => ['text', 'sticky'].includes(n.type));

  const showQuickPalette = selectedIds.length > 0 || ['freehand', 'highlighter', 'rectangle', 'ellipse', 'sticky', 'arrow', 'text'].includes(activeTool);
  const showThicknessPicker = hasStrokeNodeSelected || (selectedIds.length === 0 && ['freehand', 'highlighter', 'rectangle', 'ellipse', 'arrow'].includes(activeTool));
  const showTextSizePicker = hasTextNodeSelected || (selectedIds.length === 0 && ['text', 'sticky'].includes(activeTool));

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  const iconButtonBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, 4px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>

      {/* Inline color & stroke-size palette, shown above the dock */}
      {showQuickPalette && (
        <div
          style={{
            position: 'fixed',
            bottom: 84,
            left: '50%',
            zIndex: 49,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '6px 16px',
            background: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid rgba(20, 22, 26, 0.08)',
            boxShadow: '0 4px 20px rgba(20, 22, 26, 0.08)',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Color swatches */}
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
                  border: c === '#FFFFFF' ? '1px solid #E2E4E9' : 'none',
                  boxShadow: activeColor === c ? '0 0 0 2px #FFF, 0 0 0 4px #8789FF' : '0 1px 3px rgba(20,22,26,0.15)',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                }}
                title={`Set color: ${c}`}
              />
            ))}
          </div>

          {/* Stroke thickness */}
          {showThicknessPicker && (
            <>
              <div style={{ width: 1, height: 18, background: 'rgba(20,22,26,0.08)', margin: '0 2px' }} />
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
                      background: activeStrokeWidth === st.value ? '#8789FF' : 'transparent',
                      color: activeStrokeWidth === st.value ? '#FFF' : '#6B7280',
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

          {/* Text Size */}
          {showTextSizePicker && (
            <>
              <div style={{ width: 1, height: 18, background: 'rgba(20,22,26,0.08)', margin: '0 2px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <button
                  onClick={() => handleFontSizePick(Math.max(8, activeFontSize - 2))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    color: '#6B7280',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(20,22,26,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  title="Decrease font size"
                >
                  -
                </button>
                
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#14161A', minWidth: 32, textAlign: 'center' }}>
                  {activeFontSize}px
                </div>
                
                <button
                  onClick={() => handleFontSizePick(Math.min(144, activeFontSize + 2))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    color: '#6B7280',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(20,22,26,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  title="Increase font size"
                >
                  +
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Primary tool dock */}
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
          padding: '6px 14px',
          background: '#FFFFFF',
          borderRadius: 32,
          border: '1px solid rgba(20, 22, 26, 0.08)',
          boxShadow: '0 8px 32px rgba(20, 22, 26, 0.12)',
        }}
      >
        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          style={{
            ...iconButtonBase,
            width: 34,
            height: 34,
            borderRadius: 17,
            color: canUndo ? '#14161A' : '#CBCED6',
            cursor: canUndo ? 'pointer' : 'not-allowed',
          }}
          title="Undo (Cmd+Z)"
          onMouseEnter={(e) => canUndo && (e.currentTarget.style.background = 'rgba(20,22,26,0.04)')}
          onMouseLeave={(e) => canUndo && (e.currentTarget.style.background = 'transparent')}
        >
          <UndoIcon size={18} />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          style={{
            ...iconButtonBase,
            width: 34,
            height: 34,
            borderRadius: 17,
            color: canRedo ? '#14161A' : '#CBCED6',
            cursor: canRedo ? 'pointer' : 'not-allowed',
          }}
          title="Redo (Cmd+Shift+Z)"
          onMouseEnter={(e) => canRedo && (e.currentTarget.style.background = 'rgba(20,22,26,0.04)')}
          onMouseLeave={(e) => canRedo && (e.currentTarget.style.background = 'transparent')}
        >
          <RedoIcon size={18} />
        </button>

        <div style={{ width: 1, height: 22, background: 'rgba(20, 22, 26, 0.08)', margin: '0 2px' }} />

        {tools.map((t, index) => (
          <React.Fragment key={t.id}>
            {index > 0 && tools[index - 1].group !== t.group && (
              <div style={{ width: 1, height: 22, background: 'rgba(20, 22, 26, 0.08)', margin: '0 2px' }} />
            )}

            <button
              onClick={() => setTool(t.id)}
              title={t.label}
              style={{
                ...iconButtonBase,
                width: 36,
                height: 36,
                borderRadius: 18,
                background: activeTool === t.id ? '#EEEEFF' : 'transparent',
                color: activeTool === t.id ? '#4C4DBF' : '#6B7280',
              }}
              onMouseEnter={(e) => {
                if (activeTool !== t.id) {
                  e.currentTarget.style.background = 'rgba(20,22,26,0.04)';
                  e.currentTarget.style.color = '#14161A';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTool !== t.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6B7280';
                }
              }}
            >
              {t.icon}
            </button>
          </React.Fragment>
        ))}

        {/* Context actions for the current selection */}
        {selectedIds.length > 0 && (
          <>
            <div style={{ width: 1, height: 24, background: 'rgba(20, 22, 26, 0.12)', margin: '0 4px' }} />

            <button
              onClick={bringToFront}
              style={{ ...iconButtonBase, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', padding: '6px 10px', borderRadius: 16 }}
              title="Bring to front"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(20,22,26,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ArrowUp size={14} />
              <span>Front</span>
            </button>

            <button
              onClick={sendToBack}
              style={{ ...iconButtonBase, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', padding: '6px 10px', borderRadius: 16 }}
              title="Send to back"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(20,22,26,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ArrowDown size={14} />
              <span>Back</span>
            </button>

            <button
              onClick={duplicateSelected}
              style={{ ...iconButtonBase, width: 34, height: 34, borderRadius: 17, color: '#6B7280' }}
              title="Duplicate (Cmd+D)"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(20,22,26,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <DuplicateIcon size={16} />
            </button>

            <button
              onClick={deleteSelected}
              style={{ ...iconButtonBase, width: 34, height: 34, borderRadius: 17, color: '#EF4444', background: 'rgba(239, 68, 68, 0.08)' }}
              title="Delete selected (Del)"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)')}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </>
  );
};