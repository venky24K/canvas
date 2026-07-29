import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { GcpAuthService } from '../../cloud/GcpAuthService';
import { GcpFirestoreService, type FirestoreBoardDocument } from '../../cloud/GcpFirestoreService';
import {
  Plus,
  Clock,
  Star,
  Users,
  Trash2,
  Settings,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Layout,
  Download,
  LogOut,
} from 'lucide-react';

// Bloom mark — four overlapping petals, multiply-blended, matching logo.svg
const BloomMark: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <g style={{ mixBlendMode: 'multiply' as const }}>
      <circle cx="191" cy="330" r="90" fill="#FFFD99" />
      <circle cx="320" cy="181" r="90" fill="#82FFCF" />
      <circle cx="320" cy="330" r="90" fill="#8789FF" />
      <circle cx="191" cy="181" r="90" fill="#FF99E7" />
    </g>
  </svg>
);

type NavId = 'recent' | 'starred' | 'shared' | 'trash';

const NAV_ITEMS: { id: NavId; label: string; icon: React.ReactNode }[] = [
  { id: 'recent', label: 'Recent', icon: <Clock size={18} /> },
  { id: 'starred', label: 'Starred', icon: <Star size={18} /> },
  { id: 'shared', label: 'Shared', icon: <Users size={18} /> },
  { id: 'trash', label: 'Trash', icon: <Trash2 size={18} /> },
];

export const ProjectDashboard: React.FC = () => {
  const { openBoard, setActiveView, currentUserName, currentUserId, currentUserPhoto } = useCanvasStore();
  const [activeNav, setActiveNav] = useState<NavId>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [boardDocs, setBoardDocs] = useState<FirestoreBoardDocument[]>(() => GcpFirestoreService.getAllBoards());

  const boards = boardDocs.map((doc) => {
    const isNew = new Date().getTime() - new Date(doc.updatedAt).getTime() < 1000 * 60 * 60 * 24;
    return {
      id: doc.boardId,
      title: doc.title,
      edited: isNew ? 'Edited recently' : `Edited ${new Date(doc.updatedAt).toLocaleDateString()}`,
      type: doc.nodeCount > 0 ? 'flow' : 'roadmap',
      thumbnailUrl: doc.thumbnailUrl,
      isStarred: doc.isStarred,
      isTrash: doc.isTrash,
      ownerUid: doc.ownerUid,
    };
  });

  const filteredBoards = boards.filter((b) => {
    // Search query filter
    if (!b.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // Sidebar navigation filter
    if (activeNav === 'starred') return b.isStarred && !b.isTrash;
    if (activeNav === 'trash') return b.isTrash;
    if (activeNav === 'shared') return b.ownerUid !== currentUserId && !b.isTrash;

    // Recent filter (default) excludes trash and shared boards that belong to someone else
    return !b.isTrash && b.ownerUid === currentUserId;
  });

  const handleCreateNew = () => {
    openBoard(`Untitled Board ${Math.floor(Math.random() * 10000)}`);
  };

  const handleSelectBoard = async (boardId: string, title: string) => {
    // NOTE: switched to looking up by boardId rather than title — titles aren't
    // unique (two boards can share a name), so a title-based lookup could open
    // the wrong board. Verify GcpFirestoreService.getBoardSnapshot accepts an id.
    const boardDoc = await GcpFirestoreService.getBoardSnapshot(boardId);
    if (boardDoc && boardDoc.serializedState) {
      try {
        const nodes = JSON.parse(boardDoc.serializedState);
        openBoard(title, nodes);
      } catch (err) {
        openBoard(title);
      }
    } else {
      openBoard(title);
    }
  };

  const handleToggleStar = async (e: React.MouseEvent, boardId: string, currentStarred: boolean) => {
    e.stopPropagation();
    await GcpFirestoreService.updateBoardMetadata(boardId, { isStarred: !currentStarred });
    setBoardDocs(GcpFirestoreService.getAllBoards());
  };

  const handleToggleTrash = async (e: React.MouseEvent, boardId: string, currentTrash: boolean) => {
    e.stopPropagation();
    if (!currentTrash) {
      if (!window.confirm('Are you sure you want to move this bloom to the trash?')) return;
    }
    await GcpFirestoreService.updateBoardMetadata(boardId, { isTrash: !currentTrash });
    setBoardDocs(GcpFirestoreService.getAllBoards());
  };

  const handlePermanentDelete = async (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this bloom? This action cannot be undone.')) return;
    await GcpFirestoreService.deleteBoard(boardId);
    setBoardDocs(GcpFirestoreService.getAllBoards());
  };

  // Owner avatar: real user photo/initial for the signed-in user's own boards,
  // a neutral "shared" glyph for boards owned by someone else (we don't have
  // the other owner's name/photo on FirestoreBoardDocument, so we don't fake one).
  const renderOwnerAvatar = (ownerUid: string) => {
    if (ownerUid === currentUserId) {
      return (
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #8789FF 0%, #FF99E7 100%)',
            border: '2px solid #FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(20,22,26,0.1)',
          }}
          title={currentUserName || 'You'}
        >
          {currentUserPhoto ? (
            <img
              src={currentUserPhoto}
              alt={currentUserName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            <span style={{ color: '#FFF', fontWeight: 700, fontSize: '0.65rem' }}>
              {currentUserName ? currentUserName.charAt(0).toUpperCase() : 'U'}
            </span>
          )}
        </div>
      );
    }
    return (
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#F1F1F4',
          border: '2px solid #FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9AA0AC',
          boxShadow: '0 2px 4px rgba(20,22,26,0.06)',
        }}
        title="Shared with you"
      >
        <Users size={12} />
      </div>
    );
  };

  // Helper renderer to produce polished, high-fidelity card thumbnails
  const renderPreviewIllustration = (type: string) => {
    if (type === 'roadmap') {
      return (
        <div style={{ width: '100%', height: 160, background: '#FAFAFB', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(20,22,26,0.04)' }}>
          <div style={{ width: 190, height: 110, background: '#FFFFFF', borderRadius: 8, boxShadow: '0 4px 12px rgba(20,22,26,0.06)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: 90, height: 8, background: '#EEEEFF', borderRadius: 4 }} />
            <div style={{ display: 'flex', gap: 8, flex: 1 }}>
              <div style={{ flex: 1, background: '#FFEEFA', border: '1px solid #FF99E7', borderRadius: 6 }} />
              <div style={{ flex: 1.4, background: '#EEEEFF', border: '1px solid #8789FF', borderRadius: 6 }} />
              <div style={{ flex: 1, background: '#EAFFF6', border: '1px solid #82FFCF', borderRadius: 6 }} />
            </div>
          </div>
        </div>
      );
    }
    if (type === 'flow') {
      return (
        <div style={{ width: '100%', height: 160, background: '#FAFAFB', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(20,22,26,0.04)' }}>
          <div style={{ width: 210, height: 110, background: '#FFFFFF', borderRadius: 8, boxShadow: '0 4px 12px rgba(20,22,26,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 12 }}>
            <div style={{ width: 48, height: 28, borderRadius: 14, background: '#EEEEFF', border: '2px solid #8789FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 16, height: 4, background: '#4C4DBF', borderRadius: 2 }} />
            </div>
            <div style={{ width: 32, height: 2, background: '#E2E4E9' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: 40, height: 24, borderRadius: 4, background: '#FAFAFB', border: '1px solid #E2E4E9' }} />
              <div style={{ width: 40, height: 24, borderRadius: 4, background: '#FAFAFB', border: '1px solid #E2E4E9' }} />
            </div>
          </div>
        </div>
      );
    }
    // Fallback preview (defensive — current data never produces a third type)
    return (
      <div style={{ width: '100%', height: 160, background: '#FAFAFB', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(20,22,26,0.04)' }}>
        <div style={{ width: 210, height: 110, background: '#FFFFFF', borderRadius: 8, boxShadow: '0 4px 12px rgba(20,22,26,0.06)', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF99E7' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFFD99' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#82FFCF' }} />
          </div>
          <div style={{ width: '80%', height: 8, background: '#EEEEFF', borderRadius: 4, marginTop: 4 }} />
          <div style={{ width: '65%', height: 8, background: '#EEEEFF', borderRadius: 4 }} />
          <div style={{ width: '90%', height: 8, background: '#FAFAFB', borderRadius: 4 }} />
        </div>
      </div>
    );
  };

  const isDesktop = typeof window !== 'undefined' && (!!(window as any).electronAPI || navigator.userAgent.toLowerCase().includes('electron'));
  const isDefaultUser = currentUserId === 'gcp-usr-venky';

  if (isDesktop && isDefaultUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: '#FAFAFB', fontFamily: '"Inter", sans-serif' }}>
        <BloomMark size={64} />
        <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: '2rem', marginTop: 24, color: '#14161A' }}>Welcome to Bloom Desktop</h1>
        <p style={{ color: '#6B7280', marginBottom: 32, fontSize: '1.1rem' }}>Please authenticate to access your workspaces and sync your boards.</p>
        <button
          onClick={() => {
            const url = 'https://bloom-app-1022228413582.asia-southeast1.run.app/?view=login&desktop_auth=true';
            if ((window as any).electronAPI) {
              (window as any).electronAPI.openExternal(url);
            } else {
              window.open(url, '_blank');
            }
          }}
          style={{
            padding: '12px 24px',
            background: '#14161A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 12,
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(20,22,26,0.1)'
          }}
        >
          Login on Web
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: '#FFFFFF', fontFamily: '"Inter", system-ui, -apple-system, sans-serif', overflow: 'hidden', color: '#14161A' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      {/* NATIVE DESKTOP TOP BAR (Traffic Lights Clearance & Draggable Window Area) */}
      {isDesktop && (
        <div
          style={{
            height: 38,
            width: '100%',
            background: '#FAFAFB',
            borderBottom: '1px solid #EFEFF2',
            WebkitAppRegion: 'drag' as any,
            userSelect: 'none',
            flexShrink: 0,
          }}
        />
      )}

      {/* CONTENT BODY */}
      <div style={{ display: 'flex', flex: 1, width: '100%', overflow: 'hidden' }}>
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside style={{ width: 250, height: '100%', background: '#FAFAFB', borderRight: '1px solid #EFEFF2', display: 'flex', flexDirection: 'column', padding: '20px 16px' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px', marginBottom: 20 }}>
            <BloomMark size={30} />
            <span style={{ fontFamily: '"Fraunces", serif', fontSize: '1.35rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#14161A' }}>
              Bloom
            </span>
          </div>

        {/* Profile Dropdown & Notifications Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative', zIndex: 100 }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-expanded={showProfileMenu}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px 5px 6px',
              borderRadius: 10,
              background: '#FFFFFF',
              color: '#14161A',
              border: '1px solid #E2E4E9',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(20,22,26,0.04)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FAFAFB';
              e.currentTarget.style.borderColor = '#D8DAE0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E2E4E9';
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #8789FF 0%, #FF99E7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {currentUserPhoto ? (
                <img
                  src={currentUserPhoto}
                  alt={currentUserName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                <div style={{ color: '#FFF', fontWeight: 700, fontSize: '14px' }}>
                  {currentUserName ? currentUserName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#14161A', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUserName || 'User'}
            </span>
            <ChevronDown size={15} color="#6B7280" style={{ flexShrink: 0 }} />
          </button>

          <button
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6B7280',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EEEEFF';
              e.currentTarget.style.color = '#4C4DBF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#6B7280';
            }}
            title="Notifications"
          >
            <Bell size={18} />
          </button>

          {/* Backdrop to dismiss popover */}
          {showProfileMenu && (
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 999 }}
              onClick={() => setShowProfileMenu(false)}
            />
          )}

          {/* Account Popover Menu */}
          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: 46,
                left: 0,
                width: 300,
                background: '#FFFFFF',
                border: '1px solid #E2E4E9',
                borderRadius: 14,
                boxShadow: '0 16px 36px -4px rgba(20,22,26,0.12), 0 4px 12px -2px rgba(20,22,26,0.05)',
                zIndex: 1000,
                padding: '16px 0 8px 0',
                fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                color: '#14161A',
              }}
            >
              {/* Header Profile Photo & Info */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px 14px 20px' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #8789FF 0%, #FF99E7 100%)',
                    marginBottom: 10,
                    boxShadow: '0 4px 14px rgba(135,137,255,0.25)',
                    border: '2px solid #FFFFFF',
                    position: 'relative',
                  }}
                >
                  {currentUserPhoto ? (
                    <img
                      src={currentUserPhoto}
                      alt={currentUserName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 700, fontSize: '24px' }}>
                      {currentUserName ? currentUserName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#14161A', marginBottom: 2 }}>
                  {currentUserName || 'User'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>
                  {GcpAuthService.getCurrentUser()?.email || 'user@example.com'}
                </span>
              </div>

              <div style={{ height: 1, background: '#F1F1F4', width: '100%', margin: '4px 0' }} />

              {/* Group: Preferences */}
              <div style={{ padding: '4px 0' }}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '10px 18px',
                    background: 'transparent',
                    border: 'none',
                    color: '#334155',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#EEEEFF';
                    e.currentTarget.style.color = '#4C4DBF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  <Layout size={18} />
                  <span>Change theme</span>
                  <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#9AA0AC' }} />
                </button>

                <button
                  onClick={() => setActiveView('downloads')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '10px 18px',
                    background: 'transparent',
                    border: 'none',
                    color: '#334155',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#EEEEFF';
                    e.currentTarget.style.color = '#4C4DBF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  <Download size={18} />
                  <span>Get desktop app</span>
                </button>
              </div>

              {/* Group: Account Actions */}
              <div style={{ padding: '4px 0 0 0' }}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '10px 18px',
                    background: 'transparent',
                    border: 'none',
                    color: '#334155',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#EEEEFF';
                    e.currentTarget.style.color = '#4C4DBF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  <Users size={18} />
                  <span>Switch accounts</span>
                </button>

                <button
                  onClick={async () => {
                    await GcpAuthService.signOut();
                    setShowProfileMenu(false);
                    setActiveView('login');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '10px 18px',
                    background: 'transparent',
                    border: 'none',
                    color: '#334155',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FFF1F2';
                    e.currentTarget.style.color = '#E11D48';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  <LogOut size={18} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary "+ New Board" Action */}
        <button
          onClick={handleCreateNew}
          style={{
            width: '100%',
            height: 42,
            background: '#14161A',
            color: '#FFFFFF',
            borderRadius: 8,
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            marginBottom: 24,
            transition: 'background 0.2s, transform 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#34345C';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#14161A';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <Plus size={18} />
          <span>New Board</span>
        </button>

        {/* Navigation Categories */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: isActive ? '#EEEEFF' : 'transparent',
                  color: isActive ? '#4C4DBF' : '#6B7280',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#F1F1F4';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ color: isActive ? '#4C4DBF' : '#6B7280' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

      </aside>

      {/* MAIN WORKSPACE GALLERY & CONTROLS */}
      <main style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '36px 48px', background: '#FFFFFF' }}>
        {/* Top Header: Welcome Banner & Live Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.6rem', fontWeight: 600, color: '#14161A', letterSpacing: '-0.02em' }}>
            Welcome back, {currentUserName ? currentUserName.split(' ')[0] : 'User'}.
          </h1>

          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} color="#9AA0AC" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: 40,
                paddingLeft: 38,
                paddingRight: 16,
                borderRadius: 8,
                border: '1px solid #E2E4E9',
                background: '#FFFFFF',
                fontSize: '0.875rem',
                color: '#14161A',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#8789FF')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#E2E4E9')}
            />
          </div>
        </div>

        <div style={{ height: 1, background: '#F1F1F4', width: '100%', marginBottom: 32 }} />

        {/* Section Heading */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, color: '#6B7280', letterSpacing: '-0.01em' }}>
            Continue where you left off.
          </h2>
        </div>

        {/* Responsive Grid of Boards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 24 }}>
          {filteredBoards.map((board) => (
            <div
              key={board.id}
              onClick={() => handleSelectBoard(board.id, board.title)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E4E9',
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 2px 6px rgba(20,22,26,0.02)',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(20,22,26,0.08)';
                e.currentTarget.style.borderColor = '#CBCED6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(20,22,26,0.02)';
                e.currentTarget.style.borderColor = '#E2E4E9';
              }}
            >
              {/* Graphic Preview Illustration */}
              {board.thumbnailUrl ? (
                <div style={{ width: '100%', height: 160, background: '#F1F1F4', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={board.thumbnailUrl} alt={board.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                renderPreviewIllustration(board.type)
              )}

              {/* Card Metadata Footer */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: '"Fraunces", serif', fontSize: '0.95rem', fontWeight: 600, color: '#14161A' }}>
                    {board.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={(e) => handleToggleStar(e, board.id, board.isStarred || false)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: board.isStarred ? '#EAB308' : '#9AA0AC', display: 'flex' }}
                      title={board.isStarred ? 'Unstar' : 'Star'}
                    >
                      <Star size={16} fill={board.isStarred ? '#EAB308' : 'none'} />
                    </button>
                    {activeNav === 'trash' && (
                      <button
                        onClick={(e) => handlePermanentDelete(e, board.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444', fontWeight: 700, fontSize: '11px', display: 'flex', alignItems: 'center' }}
                        title="Permanently delete"
                      >
                        Delete Forever
                      </button>
                    )}
                    <button
                      onClick={(e) => handleToggleTrash(e, board.id, board.isTrash || false)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: board.isTrash ? '#EF4444' : '#9AA0AC', display: 'flex' }}
                      title={board.isTrash ? 'Restore' : 'Move to trash'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>
                    {board.edited}
                  </span>
                  {renderOwnerAvatar(board.ownerUid)}
                </div>
              </div>
            </div>
          ))}

          {/* "Create New Board" Dashed Card */}
          <div
            onClick={handleCreateNew}
            style={{
              minHeight: 250,
              background: 'transparent',
              border: '2px dashed #D8DAE0',
              borderRadius: 14,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              cursor: 'pointer',
              transition: 'all 0.2s',
              padding: 20,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#8789FF';
              e.currentTarget.style.background = '#FAFAFF';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D8DAE0';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: '#F1F1F4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
              }}
            >
              <Plus size={24} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
              Create New Board
            </span>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};