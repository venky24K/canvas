import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { CanvasNode, StyleProperties } from '../../types/canvas';
import { Code, Copy, Check, Layers, Palette } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const { nodes, selectedIds, updateSelectedNodes, defaultStyles, updateDefaultStyles, gridType, toggleGrid, showSnappingGuides, toggleSnapping } = useCanvasStore();
  const [activeTab, setActiveTab] = useState<'style' | 'inspect'>('style');
  const [copied, setCopied] = useState(false);

  // Take first selected node or fallback to showing global design tokens
  const selectedNode: CanvasNode | null = selectedIds.length > 0 ? nodes[selectedIds[0]] : null;

  const handleStyleChange = (key: keyof StyleProperties, value: any) => {
    updateSelectedNodes({ [key]: value });
  };

  const handleDefaultStyleChange = (key: string, value: any) => {
    updateDefaultStyles({ [key]: value } as any);
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
      node.isGlassmorphic ? `bg-white/80 backdrop-blur-xl border border-black/10 shadow-2xl` : `bg-[${node.fillColor || '#EEF2FF'}]`,
      node.shadowColor ? `shadow-lg` : '',
    ].filter(Boolean).join(' ');

    const svgString = `<svg width="${Math.round(node.width)}" height="${Math.round(node.height)}" viewBox="0 0 ${Math.round(node.width)} ${Math.round(node.height)}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="${node.cornerRadius || 0}" fill="${node.fillColor || '#6366F1'}" fill-opacity="${node.opacity}" stroke="${node.strokeColor || 'transparent'}" stroke-width="${node.strokeWidth || 1}" />
</svg>`;

    return { cssRules, tailwindTokens, svgString };
  };

  const presetColors = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#0F172A', '#EEF2FF'];

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: '0.85rem', fontFamily: 'Outfit', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={16} style={{ color: 'var(--accent-primary)' }} />
          {selectedNode ? `${selectedNode.type.toUpperCase()} INSPECTOR` : 'DESIGN TOKENS & SETUP'}
        </span>

        {selectedNode && (
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.04)', borderRadius: 8, padding: 2 }}>
            <button
              onClick={() => setActiveTab('style')}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: activeTab === 'style' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'style' ? '#FFF' : 'var(--text-secondary)',
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
                color: activeTab === 'inspect' ? '#FFF' : 'var(--text-secondary)',
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
        )}
      </div>

      {!selectedNode ? (
        /* Global Design Tokens & Canvas Settings (When no shape is selected) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '12px', borderRadius: 10, border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <Palette size={22} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                Global Design System
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Configure default styling tokens applied instantly when drawing new vector shapes and sticky notes.
              </span>
            </div>
          </div>

          {/* Default Shape Fill Color Presets */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
              DEFAULT SHAPE FILL TOKENS
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleDefaultStyleChange('fillColor', color)}
                  style={{
                    height: 32,
                    borderRadius: 8,
                    background: color,
                    border: defaultStyles.fillColor === color ? '2px solid var(--text-primary)' : '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    transition: 'all 0.15s',
                  }}
                  title={`Set Default Fill: ${color}`}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="color"
                value={defaultStyles.fillColor || '#EEF2FF'}
                onChange={(e) => handleDefaultStyleChange('fillColor', e.target.value)}
                style={{ width: 36, height: 32, padding: 0, border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer' }}
                title="Custom Hex Color"
              />
              <input
                type="text"
                value={defaultStyles.fillColor || '#EEF2FF'}
                onChange={(e) => handleDefaultStyleChange('fillColor', e.target.value)}
                className="input-control"
                placeholder="#HEXCODE"
              />
            </div>
          </div>

          {/* Default Stroke & Corner Radius */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                BORDER RADIUS (PX)
              </label>
              <input
                type="number"
                value={defaultStyles.cornerRadius !== undefined ? defaultStyles.cornerRadius : 16}
                onChange={(e) => handleDefaultStyleChange('cornerRadius', parseInt(e.target.value) || 0)}
                className="input-control"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                STROKE WIDTH (PX)
              </label>
              <input
                type="number"
                value={defaultStyles.strokeWidth !== undefined ? defaultStyles.strokeWidth : 2}
                onChange={(e) => handleDefaultStyleChange('strokeWidth', parseInt(e.target.value) || 1)}
                className="input-control"
              />
            </div>
          </div>

          {/* Spatial Guides & Grid Setup */}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              CANVAS SPATIAL SETUP
            </label>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.03)', padding: '10px 12px', borderRadius: 10 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>Background Grid Mode</span>
              <button
                onClick={toggleGrid}
                style={{ background: 'var(--accent-primary)', color: '#FFF', border: 'none', padding: '4px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}
              >
                {gridType} Grid
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.03)', padding: '10px 12px', borderRadius: 10 }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Smart Alignment Snapping</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Snap elements to axes</span>
              </div>
              <input
                type="checkbox"
                checked={showSnappingGuides}
                onChange={toggleSnapping}
                style={{ width: 18, height: 18, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
            </div>
          </div>
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
                    border: selectedNode.fillColor === color ? '2px solid var(--text-primary)' : '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.05)' }}>
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
              onChange={(e) => updateSelectedNodes({ opacity: parseFloat(e.target.value) })}
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
                  <pre style={{ background: '#0F172A', padding: '12px', borderRadius: 10, fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: '#F8FAFC', overflowX: 'auto', border: '1px solid rgba(0,0,0,0.1)' }}>
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
                  <pre style={{ background: '#0F172A', padding: '12px', borderRadius: 10, fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: '#FCD34D', overflowX: 'auto', border: '1px solid rgba(0,0,0,0.1)' }}>
                    {tailwindTokens}
                  </pre>
                </div>

                {/* SVG String */}
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: 6, display: 'block' }}>SVG VECTOR STRING</span>
                  <pre style={{ background: '#0F172A', padding: '12px', borderRadius: 10, fontSize: '0.7rem', fontFamily: 'JetBrains Mono', color: '#94A3B8', overflowX: 'auto', border: '1px solid rgba(0,0,0,0.1)', maxHeight: 100 }}>
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
