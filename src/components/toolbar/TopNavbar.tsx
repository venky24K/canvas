import React, { useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { ChevronDown, Download, Upload, Grid, Cloud, Check, Wifi, ArrowLeft } from 'lucide-react';

export const TopNavbar: React.FC = () => {
  const {
    room,
    gridType,
    cursors,
    currentUserName,
    boardTitle,
    setBoardTitle,
    setActiveView,
    toggleGrid,
    exportSceneJson,
    loadScene,
  } = useCanvasStore();

  const [showMenu, setShowMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = () => {
    const jsonString = exportSceneJson();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${boardTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
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
          setShowMenu(false);
        }
      } catch (err) {
        console.error('Failed to import board JSON:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none', // Allow clicking through empty space between left and right bars
      }}
    >
      {/* LEFT FLOATING BAR: Logo Main Menu Button + Canvas Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 14px 6px 10px',
          background: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          pointerEvents: 'auto',
          position: 'relative',
        }}
      >
        {/* Logo & Down Arrow -> Main Menu Dropdown Button */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: showMenu ? 'rgba(0,0,0,0.05)' : 'transparent',
              border: 'none',
              padding: '4px 8px',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            title="Bloom Main Menu & Navigation"
          >
            <img
              src="/logo.svg"
              alt="Bloom Logo"
              style={{ width: 26, height: 26, objectFit: 'contain', borderRadius: 6 }}
            />
            <ChevronDown size={15} color="var(--text-secondary)" style={{ transform: showMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Main Menu Dropdown Window */}
          {showMenu && (
            <div
              style={{
                position: 'absolute',
                top: 42,
                left: 0,
                width: 270,
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                padding: '8px 0',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Return to Main Workspace Dashboard Action */}
              <button
                onClick={() => {
                  setActiveView('dashboard');
                  setShowMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  background: 'rgba(79, 70, 229, 0.08)',
                  border: 'none',
                  color: '#4F46E5',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(79, 70, 229, 0.14)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(79, 70, 229, 0.08)')}
              >
                <ArrowLeft size={16} />
                <span>Back to Main Workspace</span>
              </button>

              <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '6px 0' }} />

              {/* Menu Header / GCP Status */}
              <div style={{ padding: '6px 16px', marginBottom: 4 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Cloud Engine Status
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Cloud size={14} className="animate-pulse-glow" />
                  <span>GCP Cloud Run: {room.gcpStatus.toUpperCase()}</span>
                  <Wifi size={12} style={{ marginLeft: 'auto' }} />
                </div>
              </div>

              <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '6px 0' }} />

              {/* Menu Actions */}
              <button
                onClick={handleExport}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.825rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Download size={16} color="var(--accent-primary)" />
                <span>Export Board as JSON</span>
              </button>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '0.825rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Upload size={16} color="var(--accent-cyan)" />
                <span>Import Board JSON...</span>
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>

              <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '6px 0' }} />

              <button
                onClick={() => {
                  toggleGrid();
                  setShowMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.825rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Grid size={16} color="var(--text-secondary)" />
                  <span>Grid Background Mode</span>
                </div>
                <span style={{ fontSize: '0.7rem', background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 4, textTransform: 'capitalize' }}>
                  {gridType}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Separator Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.08)' }} />

        {/* Editable Canvas Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isEditingTitle ? (
            <input
              type="text"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              autoFocus
              style={{
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid var(--accent-primary)',
                borderRadius: 6,
                padding: '3px 8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: 'Outfit',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: 'Outfit',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              title="Click to rename board"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {boardTitle}
            </button>
          )}
        </div>
      </div>

      {/* RIGHT FLOATING BAR: Multiplayer Profiles + Vibrant Share Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '6px 14px',
          background: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          pointerEvents: 'auto',
        }}
      >
        {/* Collaborative Peers Avatars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: -6 }}>
          {Object.values(cursors).map((c) => (
            <div
              key={c.userId}
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: c.color,
                border: '2px solid #FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#FFF',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                marginLeft: -6,
              }}
              title={`Peer: ${c.userName} (${c.tool})`}
            >
              {c.userName.charAt(0)}
            </div>
          ))}
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              border: '2px solid #FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#FFF',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
              marginLeft: -6,
            }}
            title={`You (${currentUserName})`}
          >
            You
          </div>
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.08)' }} />

        {/* Share Button (Vivid Violet, matching FigJam style) */}
        <button
          onClick={handleShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            borderRadius: 8,
            background: shareCopied ? '#10B981' : '#8B5CF6',
            color: '#FFFFFF',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.35)',
            transition: 'all 0.2s',
          }}
          title="Copy Collaborative Workspace Link"
        >
          {shareCopied ? (
            <>
              <Check size={16} />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <span>Share</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
