import React, { useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { ShareBoardModal } from '../share/ShareBoardModal';
import {
  ChevronDown,
  ChevronRight,
  Cloud,
  Search,
} from 'lucide-react';

export const TopNavbar: React.FC = () => {
  const {
    room,
    gridType,
    cursors,
    currentUserName,
    currentUserColor,
    currentUserPhoto,
    boardTitle,
    nodeIds,
    setBoardTitle,
    setActiveView,
    toggleGrid,
    exportSceneJson,
    loadScene,
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    bringToFront,
    sendToBack,
    setSelectedIds,
    setZoom,
  } = useCanvasStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setActiveSubmenu(null);
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

  const handleNewBoard = async () => {
    // Was previously a copy-paste of "Back to files" (navigated to the dashboard
    // instead of creating anything). Now actually creates and opens a fresh board,
    // matching ProjectDashboard's handleCreateNew.
    const { captureThumbnail, openBoard } = useCanvasStore.getState();
    if (captureThumbnail) await captureThumbnail();
    openBoard(`Untitled Board ${Math.floor(Math.random() * 10000)}`);
    setShowMenu(false);
  };

  const handleBackToFiles = async () => {
    const { captureThumbnail } = useCanvasStore.getState();
    if (captureThumbnail) await captureThumbnail();
    setActiveView('dashboard');
    setShowMenu(false);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  // Shared styles for the floating menu
  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 16px',
    background: 'transparent',
    border: 'none',
    color: '#E5E5E5',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'background 0.1s',
  };

  const menuShortcutStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#888888',
    fontWeight: 500,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    marginLeft: 16,
  };

  const separatorStyle: React.CSSProperties = {
    height: 1,
    background: '#383838',
    margin: '6px 0',
  };

  const SUBMENU_TOP_OFFSET = -8;

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none', // Allow clicking canvas space between left and right pills
      }}
    >
      {/* LEFT FLOATING PILL: Logo + Dropdown Menu Button & Canvas Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 14px 6px 10px',
          background: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid rgba(20, 22, 26, 0.08)',
          boxShadow: '0 2px 10px rgba(20, 22, 26, 0.08)',
          pointerEvents: 'auto',
          position: 'relative',
        }}
      >
        {/* Logo & Chevron Down -> Main Menu Trigger */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowMenu(!showMenu);
              setActiveSubmenu(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: showMenu ? 'rgba(20,22,26,0.06)' : 'transparent',
              border: 'none',
              padding: '4px 8px',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            title="Bloom main menu"
          >
            <img
              src="/logo.svg"
              alt="Bloom logo"
              style={{ width: 26, height: 26, objectFit: 'contain', borderRadius: 6 }}
            />
            <ChevronDown size={15} color="#475569" style={{ transform: showMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Floating dark menu */}
          {showMenu && (
            <div
              style={{
                position: 'absolute',
                top: 42,
                left: 0,
                width: 236,
                background: '#242424',
                color: '#E5E5E5',
                borderRadius: 12,
                border: '1px solid #363636',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
                padding: '8px 0',
                zIndex: 110,
                display: 'flex',
                flexDirection: 'column',
                fontFamily: '"Inter", system-ui, sans-serif',
              }}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              {/* Top action: return to the dashboard */}
              <button
                onClick={handleBackToFiles}
                style={menuItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#363636';
                  setActiveSubmenu(null);
                }}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontWeight: 600 }}>Back to files</span>
              </button>

              <div style={separatorStyle} />

              {/* Quick actions search row */}
              <button
                style={{ ...menuItemStyle, color: '#A0A0A0' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#363636';
                  setActiveSubmenu(null);
                }}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                onClick={() => setShowMenu(false)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Search size={14} color="#A0A0A0" />
                  <span>Actions...</span>
                </div>
                <span style={menuShortcutStyle}>⌘K</span>
              </button>

              <div style={separatorStyle} />

              {/* FILE */}
              <div style={{ position: 'relative' }}>
                <button
                  style={{ ...menuItemStyle, background: activeSubmenu === 'file' ? '#363636' : 'transparent' }}
                  onMouseEnter={() => setActiveSubmenu('file')}
                >
                  <span>File</span>
                  <ChevronRight size={14} color="#888888" />
                </button>

                {activeSubmenu === 'file' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: SUBMENU_TOP_OFFSET,
                      left: 232,
                      width: 230,
                      background: '#242424',
                      border: '1px solid #363636',
                      borderRadius: 12,
                      boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
                      padding: '8px 0',
                      zIndex: 120,
                    }}
                  >
                    <button
                      onClick={handleNewBoard}
                      style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>New Board...</span>
                      <span style={menuShortcutStyle}>⌘N</span>
                    </button>
                    <div style={separatorStyle} />
                    <button
                      onClick={handleExport}
                      style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Export as JSON</span>
                      <span style={menuShortcutStyle}>⌘E</span>
                    </button>
                    <label
                      style={{ ...menuItemStyle, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Import Board JSON...</span>
                      <span style={menuShortcutStyle}>⌘I</span>
                      <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                    </label>
                  </div>
                )}
              </div>

              {/* EDIT */}
              <div style={{ position: 'relative' }}>
                <button
                  style={{ ...menuItemStyle, background: activeSubmenu === 'edit' ? '#363636' : 'transparent' }}
                  onMouseEnter={() => setActiveSubmenu('edit')}
                >
                  <span>Edit</span>
                  <ChevronRight size={14} color="#888888" />
                </button>

                {activeSubmenu === 'edit' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: SUBMENU_TOP_OFFSET,
                      left: 232,
                      width: 220,
                      background: '#242424',
                      border: '1px solid #363636',
                      borderRadius: 12,
                      boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
                      padding: '8px 0',
                      zIndex: 120,
                    }}
                  >
                    <button
                      onClick={() => { undo(); setShowMenu(false); }}
                      style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Undo</span>
                      <span style={menuShortcutStyle}>⌘Z</span>
                    </button>
                    <button
                      onClick={() => { redo(); setShowMenu(false); }}
                      style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Redo</span>
                      <span style={menuShortcutStyle}>⇧⌘Z</span>
                    </button>
                    <div style={separatorStyle} />
                    <button
                      onClick={() => { duplicateSelected(); setShowMenu(false); }}
                      style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Duplicate</span>
                      <span style={menuShortcutStyle}>⌘D</span>
                    </button>
                    <button
                      onClick={() => { deleteSelected(); setShowMenu(false); }}
                      style={{ ...menuItemStyle, color: '#EF4444' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Delete</span>
                      <span style={menuShortcutStyle}>⌫</span>
                    </button>
                    <div style={separatorStyle} />
                    <button
                      onClick={() => { setSelectedIds(nodeIds); setShowMenu(false); }}
                      style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Select all</span>
                      <span style={menuShortcutStyle}>⌘A</span>
                    </button>
                    <button
                      onClick={() => { setSelectedIds([]); setShowMenu(false); }}
                      style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Select none</span>
                      <span style={menuShortcutStyle}>⎋</span>
                    </button>
                  </div>
                )}
              </div>

              {/* VIEW */}
              <div style={{ position: 'relative' }}>
                <button
                  style={{ ...menuItemStyle, background: activeSubmenu === 'view' ? '#363636' : 'transparent' }}
                  onMouseEnter={() => setActiveSubmenu('view')}
                >
                  <span>View</span>
                  <ChevronRight size={14} color="#888888" />
                </button>

                {activeSubmenu === 'view' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: SUBMENU_TOP_OFFSET,
                      left: 232,
                      width: 230,
                      background: '#242424',
                      border: '1px solid #363636',
                      borderRadius: 12,
                      boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
                      padding: '8px 0',
                      zIndex: 120,
                    }}
                  >
                    <button
                      onClick={() => { toggleGrid(); setShowMenu(false); }}
                      style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Toggle grid ({gridType})</span>
                      <span style={menuShortcutStyle}>⌘G</span>
                    </button>
                    <div style={separatorStyle} />
                    <button
                      onClick={() => { setZoom((z) => Math.min(5, z + 0.2)); setShowMenu(false); }}
                      style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Zoom in</span>
                      <span style={menuShortcutStyle}>⌘+</span>
                    </button>
                    <button
                      onClick={() => { setZoom((z) => Math.max(0.2, z - 0.2)); setShowMenu(false); }}
                      style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Zoom out</span>
                      <span style={menuShortcutStyle}>⌘-</span>
                    </button>
                    <button
                      onClick={() => { setZoom(1); setShowMenu(false); }}
                      style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Zoom to 100%</span>
                      <span style={menuShortcutStyle}>⌘0</span>
                    </button>
                  </div>
                )}
              </div>

              {/* OBJECT */}
              <div style={{ position: 'relative' }}>
                <button
                  style={{ ...menuItemStyle, background: activeSubmenu === 'object' ? '#363636' : 'transparent' }}
                  onMouseEnter={() => setActiveSubmenu('object')}
                >
                  <span>Object</span>
                  <ChevronRight size={14} color="#888888" />
                </button>

                {activeSubmenu === 'object' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: SUBMENU_TOP_OFFSET,
                      left: 232,
                      width: 220,
                      background: '#242424',
                      border: '1px solid #363636',
                      borderRadius: 12,
                      boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
                      padding: '8px 0',
                      zIndex: 120,
                    }}
                  >
                    <button
                      onClick={() => { bringToFront(); setShowMenu(false); }}
                      style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Bring to front</span>
                      <span style={menuShortcutStyle}>⌘↑</span>
                    </button>
                    <button
                      onClick={() => { sendToBack(); setShowMenu(false); }}
                      style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#363636')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Send to back</span>
                      <span style={menuShortcutStyle}>⌘↓</span>
                    </button>
                  </div>
                )}
              </div>

              <div style={separatorStyle} />

              {/* Cloud sync status — reflects real connection state, not a submenu */}
              <div style={{ padding: '8px 16px', color: '#10B981', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cloud size={16} />
                <span>Cloud sync: {room.gcpStatus.toUpperCase()}</span>
              </div>

              <div style={separatorStyle} />

              <div style={{ padding: '8px 16px', color: '#6B7280', fontSize: '0.75rem' }}>
                Bloom Studio Canvas v1.0.0
              </div>
            </div>
          )}
        </div>

        {/* Separator Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(20,22,26,0.08)' }} />

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
                background: 'rgba(20,22,26,0.04)',
                border: '1px solid #8789FF',
                borderRadius: 6,
                padding: '3px 8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: '"Inter", system-ui',
                color: '#14161A',
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
                fontFamily: '"Inter", system-ui',
                color: '#14161A',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              title="Click to rename board"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(20,22,26,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {boardTitle}
            </button>
          )}
        </div>
      </div>

      {/* RIGHT FLOATING PILL: Collaborator avatars & Share button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '6px 14px',
          background: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid rgba(20,22,26,0.08)',
          boxShadow: '0 2px 10px rgba(20,22,26,0.08)',
          pointerEvents: 'auto',
        }}
      >
        {/* Collaborator avatars */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
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
                boxShadow: '0 2px 6px rgba(20,22,26,0.15)',
                marginLeft: -6,
              }}
              title={`${c.userName} (${c.tool})`}
            >
              {c.userName.charAt(0)}
            </div>
          ))}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: currentUserColor || '#8789FF',
              backgroundImage: currentUserPhoto ? `url(${currentUserPhoto})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
              boxShadow: `0 0 0 2px #FFFFFF, 0 4px 12px ${currentUserColor || '#8789FF'}60`,
              zIndex: 10,
              cursor: 'pointer',
              border: '2px solid #FFF',
              marginLeft: -6,
            }}
            title={`You (${currentUserName || 'User'})`}
          >
            {!currentUserPhoto && (currentUserName || 'U').charAt(0).toUpperCase()}
          </div>
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(20,22,26,0.08)' }} />

        {/* Share button */}
        <button
          onClick={handleShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            borderRadius: 8,
            background: '#8789FF',
            color: '#FFFFFF',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#6D6FE0')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#8789FF')}
          title="Share this board"
        >
          <span>Share</span>
        </button>
      </div>

      {/* Share Board Dialog Modal */}
      <ShareBoardModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </div>
  );
};