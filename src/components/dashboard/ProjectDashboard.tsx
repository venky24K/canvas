import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { GcpAuthService } from '../../cloud/GcpAuthService';
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

export const ProjectDashboard: React.FC = () => {
  const { openBoard, setActiveView } = useCanvasStore();
  const [activeNav, setActiveNav] = useState<'recent' | 'starred' | 'shared' | 'trash'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const boards: Array<{
    id: string;
    title: string;
    edited: string;
    avatars: string[];
    extraAvatars?: string | null;
    type: string;
  }> = [];

  const filteredBoards = boards.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreateNew = () => {
    openBoard('Untitled Board');
  };

  const handleSelectBoard = (title: string) => {
    openBoard(title);
  };

  // Helper renderer to produce polished, high-fidelity FigJam style vector card thumbnails
  const renderPreviewIllustration = (type: string) => {
    if (type === 'roadmap') {
      return (
        <div style={{ width: '100%', height: 160, background: '#F8FAFC', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ width: 190, height: 110, background: '#FFFFFF', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: 90, height: 8, background: '#E0E7FF', borderRadius: 4 }} />
            <div style={{ display: 'flex', gap: 8, flex: 1 }}>
              <div style={{ flex: 1, background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 6 }} />
              <div style={{ flex: 1.4, background: '#E0E7FF', border: '1px solid #A5B4FC', borderRadius: 6 }} />
              <div style={{ flex: 1, background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 6 }} />
            </div>
          </div>
        </div>
      );
    }
    if (type === 'flow') {
      return (
        <div style={{ width: '100%', height: 160, background: '#F8FAFC', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ width: 210, height: 110, background: '#FFFFFF', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 12 }}>
            <div style={{ width: 48, height: 28, borderRadius: 14, background: '#C7D2FE', border: '2px solid #6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 16, height: 4, background: '#4338CA', borderRadius: 2 }} />
            </div>
            <div style={{ width: 32, height: 2, background: '#CBD5E1' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: 40, height: 24, borderRadius: 4, background: '#F1F5F9', border: '1px solid #CBD5E1' }} />
              <div style={{ width: 40, height: 24, borderRadius: 4, background: '#F1F5F9', border: '1px solid #CBD5E1' }} />
            </div>
          </div>
        </div>
      );
    }
    // API preview
    return (
      <div style={{ width: '100%', height: 160, background: '#F8FAFC', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div style={{ width: 210, height: 110, background: '#FFFFFF', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F43F5E' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
          </div>
          <div style={{ width: '80%', height: 8, background: '#E2E8F0', borderRadius: 4, marginTop: 4 }} />
          <div style={{ width: '65%', height: 8, background: '#E2E8F0', borderRadius: 4 }} />
          <div style={{ width: '90%', height: 8, background: '#F1F5F9', borderRadius: 4 }} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#FFFFFF', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', overflow: 'hidden', color: '#0F172A' }}>
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside style={{ width: 250, height: '100%', background: '#F8FAFC', borderRight: '1px solid rgba(0, 0, 0, 0.06)', display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
        {/* Profile Dropdown & Notifications Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative', zIndex: 100 }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px 5px 6px',
              borderRadius: 10,
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F8FAFC';
              e.currentTarget.style.borderColor = '#CBD5E1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
                alt="venky"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>venky</span>
            <ChevronDown size={15} color="#64748B" />
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
              color: '#64748B',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EEF2FF';
              e.currentTarget.style.color = '#4F46E5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#64748B';
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

          {/* Bloom Themed Account Popover Menu */}
          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: 46,
                left: 0,
                width: 300,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                boxShadow: '0 16px 36px -4px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
                zIndex: 1000,
                padding: '16px 0 8px 0',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                color: '#0F172A',
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
                    background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                    marginBottom: 10,
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.18)',
                    border: '2px solid #FFFFFF',
                    position: 'relative',
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                    alt="venky"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>
                  venky
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
                  venkatesh_konnipati@srmap.edu.in
                </span>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#F1F5F9', width: '100%', margin: '4px 0' }} />

              {/* Group 1: Preferences */}
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
                    e.currentTarget.style.background = '#EEF2FF';
                    e.currentTarget.style.color = '#4F46E5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  <Layout size={18} />
                  <span>Change theme</span>
                  <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#94A3B8' }} />
                </button>

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
                    e.currentTarget.style.background = '#EEF2FF';
                    e.currentTarget.style.color = '#4F46E5';
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

              {/* Divider */}
              <div style={{ height: 1, background: '#F1F5F9', width: '100%', margin: '4px 0' }} />

              {/* Group 2: Community Profile */}
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
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: '#3B82F6',
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
                      alt="venky"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                    <span style={{ color: '#0F172A', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Create a community profile
                    </span>
                    <span style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      venkatesh_konnipati@srmap.edu.in
                    </span>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#F1F5F9', width: '100%', margin: '4px 0' }} />

              {/* Group 3: Account Actions */}
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
                    e.currentTarget.style.background = '#EEF2FF';
                    e.currentTarget.style.color = '#4F46E5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  <Plus size={18} />
                  <span>Add account</span>
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
            background: '#4F46E5',
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
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            marginBottom: 24,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <Plus size={18} />
          <span>New Board</span>
        </button>

        {/* Navigation Categories */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {[
            { id: 'recent', label: 'Recent', icon: <Clock size={18} /> },
            { id: 'starred', label: 'Starred', icon: <Star size={18} /> },
            { id: 'shared', label: 'Shared', icon: <Users size={18} /> },
            { id: 'trash', label: 'Trash', icon: <Trash2 size={18} /> },
          ].map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: isActive ? '#EEF2FF' : 'transparent',
                  color: isActive ? '#4F46E5' : '#475569',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => (!isActive && (e.currentTarget.style.background = 'rgba(0,0,0,0.04)'))}
                onMouseLeave={(e) => (!isActive && (e.currentTarget.style.background = 'transparent'))}
              >
                <span style={{ color: isActive ? '#4F46E5' : '#64748B' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Area: Settings */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'transparent',
              border: 'none',
              color: '#475569',
              fontSize: '0.875rem',
              fontWeight: 500,
              padding: '6px 8px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0F172A')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
          >
            <Settings size={18} color="#64748B" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE GALLERY & CONTROLS */}
      <main style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '36px 48px', background: '#FFFFFF' }}>
        {/* Top Header: Welcome Banner & Live Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em' }}>
            Welcome back, venky.
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 280 }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
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
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  fontSize: '0.875rem',
                  color: '#0F172A',
                  outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4F46E5')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
              />
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: '#F1F5F9', width: '100%', marginBottom: 32 }} />

        {/* Section Heading */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, color: '#475569', letterSpacing: '-0.01em' }}>
            Continue where you left off.
          </h2>
        </div>

        {/* Responsive Grid of Collaborative Workspace Boards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 24 }}>
          {filteredBoards.map((board) => (
            <div
              key={board.id}
              onClick={() => handleSelectBoard(board.title)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              {/* Graphic Preview Illustration */}
              {renderPreviewIllustration(board.type)}

              {/* Card Metadata Footer */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', fontFamily: 'Outfit' }}>
                  {board.title}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                    {board.edited}
                  </span>

                  {/* Collaborative Peers Bubbles */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {board.avatars.map((color, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: color,
                          border: '2px solid #FFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6rem',
                          color: '#FFF',
                          fontWeight: 700,
                          marginLeft: idx > 0 ? -6 : 0,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      />
                    ))}
                    {board.extraAvatars && (
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#F1F5F9',
                          border: '2px solid #FFF',
                          color: '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          marginLeft: -6,
                        }}
                      >
                        {board.extraAvatars}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Special "Create New Board" Dashed Card */}
          <div
            onClick={handleCreateNew}
            style={{
              minHeight: 250,
              background: 'transparent',
              border: '2px dashed rgba(0, 0, 0, 0.15)',
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
              e.currentTarget.style.borderColor = '#4F46E5';
              e.currentTarget.style.background = 'rgba(79, 70, 229, 0.02)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
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
  );
};
