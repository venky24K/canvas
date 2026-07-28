import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { CanvasNode, StyleProperties } from '../../types/canvas';
import { Sliders, Code, Copy, Check, Layers, Sparkles, Eye } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const { nodes, selectedIds, updateSelectedNodes, defaultStyles } = useCanvasStore();
  const [activeTab, setActiveTab] = useState<'style' | 'inspect'>('style');
  const [copied, setCopied] = useState(false);

  // Take first selected node or fallback to showing design system instructions
  const selectedNode: CanvasNode | null = selectedIds.length > 0 ? nodes[selectedIds[0]] : null;

  const handleStyleChange = (key: keyof StyleProperties, value: any) => {
    updateSelectedNodes({ [key]: value });
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate ready-to-use Developer Inspect Code
  const generateInspectCode = (node: CanvasNode) => {
    const cssRules = [
      `width: ${Math.round(node.width)}px;`,
      `height: ${Math.round(node.height)}px;`,
      `background: ${node.fillColor || 'transparent'};`,
      node.cornerRadius ? `border-radius: ${node.cornerRadius}px;` : '',
      node.strokeColor ? `border: ${node.strokeWidth || 1}px solid ${node.strokeColor};` : '',
      node.shadowColor ? `box-shadow: ${node.shadowOffsetX || 0}px ${node.shadowOffsetY || 8}px ${node.shadowBlur || 20}px ${node.shadowColor};` : '',
      node.isGlassmorphic ? `backdrop-filter: blur(16px);\n-webkit-backdrop-filter: blur(16px);` : '',
    ].filter(Boolean).join('\n  ');

    const tailwindTokens = [
      `w-[${Math.round(node.width)}px] h-[${Math.round(node.height)}px]`,
      node.cornerRadius ? `rounded-[${node.cornerRadius}px]` : '',
      node.isGlassmorphic ? `bg-slate-900/50 backdrop-blur-xl border border-white/20 shadow-2xl` : `bg-[${node.fillColor || '#3B82F6'}]`,
      node.shadowColor ? `shadow-lg` : '',
    ].filter(Boolean).join(' ');

    const svgString = `<svg width="${Math.round(node.width)}" height="${Math.round(node.height)}" viewBox="0 0 ${Math.round(node.width)} ${Math.round(node.height)}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="${node.cornerRadius || 0}" fill="${node.fillColor || '#6366F1'}" fill-opacity="${node.opacity}" stroke="${node.strokeColor || 'transparent'}" stroke-width="${node.strokeWidth || 1}" />
</svg>`;

    return { cssRules, tailwindTokens, svgString };
  };

  const presetColors = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#1E293B', '#FCD34D'];

  return (
    <aside
      style={{
        position: 'fixed',
        top: 88,
        right: 20,
        width: 320,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        zIndex: 40,
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
      className="glass-panel"
    >
      {/* Inspector Header & Tab Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Outfit', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={16} style={{ color: 'var(--accent-cyan)' }} />
          {selectedNode ? `${selectedNode.type.toUpperCase()} INSPECTOR` : 'DESIGN TOKENS'}
        </span>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 2 }}>
          <button
            onClick={() => setActiveTab('style')}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: activeTab === 'style' ? 'var(--accent-primary)' : 'transparent',
              color: '#FFF',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Style
          </button>
          <button
            onClick={() => setActiveTab('inspect')}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: activeTab === 'inspect' ? 'var(--accent-primary)' : 'transparent',
              color: '#FFF',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Code size={12} /> Inspect
          </button>
        </div>
      </div>

      {!selectedNode ? (
        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-secondary)' }}>
          <Sparkles size={32} style={{ margin: '0 auto 12px', color: 'var(--accent-primary)', opacity: 0.7 }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            No Layer Selected
          </p>
          <p style={{ fontSize: '0.75rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
            Select any shape, freehand drawing stroke, artboard frame, or sticky note on the canvas to inspect real-time design attributes and export production code!
          </p>
        </div>
      ) : activeTab === 'style' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Color Presets & Picker */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
              FILL COLOR PRESETS
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleStyleChange('fillColor', color)}
                  style={{
                    height: 32,
                    borderRadius: 8,
                    background: color,
                    border: selectedNode.fillColor === color ? '2px solid #FFF' : '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }}
                  title={color}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="color"
                value={selectedNode.fillColor || '#6366F1'}
                onChange={(e) => handleStyleChange('fillColor', e.target.value)}
                style={{ width: 36, height: 32, padding: 0, border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={selectedNode.fillColor || '#6366F1'}
                onChange={(e) => handleStyleChange('fillColor', e.target.value)}
                className="input-control"
                placeholder="#HEXCODE"
              />
            </div>
          </div>

          {/* Stroke & Corner Radius Controls */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                BORDER RADIUS (PX)
              </label>
              <input
                type="number"
                value={selectedNode.cornerRadius !== undefined ? selectedNode.cornerRadius : 0}
                onChange={(e) => handleStyleChange('cornerRadius', parseInt(e.target.value) || 0)}
                className="input-control"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                STROKE WIDTH (PX)
              </label>
              <input
                type="number"
                value={selectedNode.strokeWidth !== undefined ? selectedNode.strokeWidth : 1}
                onChange={(e) => handleStyleChange('strokeWidth', parseInt(e.target.value) || 0)}
                className="input-control"
              />
            </div>
          </div>

          {/* Glassmorphism Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                Glassmorphism Blur
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Apply frosted backdrop filter</span>
            </div>
            <input
              type="checkbox"
              checked={!!selectedNode.isGlassmorphic}
              onChange={(e) => handleStyleChange('isGlassmorphic', e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Layer Opacity Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>OPACITY</label>
              <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
                {Math.round((selectedNode.opacity || 1) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={selectedNode.opacity || 1}
              onChange={(e) => handleStyleChange('opacity', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>
        </div>
      ) : (
        /* Developer Inspect Mode Tab */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(() => {
            const { cssRules, tailwindTokens, svgString } = generateInspectCode(selectedNode);
            return (
              <>
                {/* Vanilla CSS Output */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>VANILLA CSS RULES</span>
                    <button
                      onClick={() => handleCopyCode(`.${selectedNode.id} {\n  ${cssRules}\n}`)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                    >
                      {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: 8, fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: '#E2E8F0', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {`.${selectedNode.id} {\n  ${cssRules}\n}`}
                  </pre>
                </div>

                {/* Tailwind Utility Classes */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>TAILWIND TOKENS</span>
                    <button
                      onClick={() => handleCopyCode(tailwindTokens)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      Copy
                    </button>
                  </div>
                  <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: 8, fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: '#FCD34D', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {tailwindTokens}
                  </pre>
                </div>

                {/* SVG String */}
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: 6, display: 'block' }}>SVG VECTOR STRING</span>
                  <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: 8, fontSize: '0.7rem', fontFamily: 'JetBrains Mono', color: '#94A3B8', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', maxHeight: 100 }}>
                    {svgString}
                  </pre>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </aside>
  );
};
