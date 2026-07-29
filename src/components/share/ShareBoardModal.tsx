import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, X, Globe, ChevronRight, Check, Trash2 } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

interface ShareBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccessMember {
  email: string;
  name: string;
  role: 'viewer' | 'editor';
  avatarColor: string;
  status?: 'pending' | 'accepted';
}

export const ShareBoardModal: React.FC<ShareBoardModalProps> = ({ isOpen, onClose }) => {
  const { currentUserName, boardTitle } = useCanvasStore();
  const [inviteEmail, setInviteEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [anyoneRole, setAnyoneRole] = useState<'can view' | 'can edit' | 'no access'>('can view');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState<AccessMember[]>([]);

  // Fetch real members from backend on open
  useEffect(() => {
    if (!isOpen) return;
    if (isOpen) {
      const roomId = boardTitle ? boardTitle.toLowerCase().replace(/\s+/g, '-') : 'bloom-gcp-prod-room';
      fetch(`http://localhost:4000/api/rooms/${roomId}/members`)
        .then(r => r.json())
        .then(data => {
          if (data.members) {
            setInvitedMembers(data.members.map((m: { email: string; role: 'editor' | 'viewer' | 'owner'; status: 'joined' | 'pending' }, i: number) => ({
              email: m.email,
              name: m.email.split('@')[0],
              role: m.role,
              status: m.status,
              avatarColor: ['#EC4899', '#3B82F6', '#10B981', '#F59E0B'][i % 4],
            })));
          }
        })
        .catch(console.error);
    }
  }, [isOpen, boardTitle]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    const roomId = boardTitle ? boardTitle.toLowerCase().replace(/\s+/g, '-') : 'bloom-gcp-prod-room';
    url.searchParams.set('room', roomId);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const emails = inviteEmail
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const roomId = boardTitle ? boardTitle.toLowerCase().replace(/\s+/g, '-') : 'bloom-gcp-prod-room';
    
    try {
      const res = await fetch(`http://localhost:4000/api/rooms/${roomId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails, role: 'editor', inviterName: currentUserName }),
      });
      const data = await res.json();
      
      if (data.success) {
        const newMembers: AccessMember[] = emails.map((email, i) => ({
          email,
          name: email.split('@')[0],
          role: 'editor',
          status: 'pending',
          avatarColor: ['#EC4899', '#3B82F6', '#10B981', '#F59E0B'][i % 4],
        }));
        setInvitedMembers((prev) => [...prev, ...newMembers]);
        setInviteEmail('');
      }
    } catch (err) {
      console.error('Failed to invite members:', err);
    }
  };


  const toggleMemberRole = (index: number) => {
    setInvitedMembers((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, role: m.role === 'editor' ? 'viewer' : 'editor' } : m
      )
    );
  };

  const handleRemoveMember = (index: number) => {
    setInvitedMembers((prev) => prev.filter((_, i) => i !== index));
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.35)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: 20,
        fontFamily: 'Inter, -apple-system, sans-serif',
        pointerEvents: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          color: '#0F172A',
          animation: 'modalFadeIn 0.15s ease-out',
        }}
      >
        {/* Top Header Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
          }}
        >
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
            Share this bloom
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 8,
                background: copied ? '#F0FDF4' : 'transparent',
                border: 'none',
                color: copied ? '#16A34A' : '#9333EA',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!copied) e.currentTarget.style.background = '#F3E8FF';
              }}
              onMouseLeave={(e) => {
                if (!copied) e.currentTarget.style.background = 'transparent';
              }}
            >
              {copied ? <Check size={16} color="#16A34A" /> : <Link size={16} color="#9333EA" />}
              <span>{copied ? 'Copied link' : 'Copy link'}</span>
            </button>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 4,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F1F5F9';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#475569';
              }}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Header Divider Line */}
        <div style={{ height: 1, background: '#F1F5F9', width: '100%' }} />

        {/* Modal Body */}
        <div style={{ padding: '24px 24px 28px 24px' }}>
          {/* Invite Row Form */}
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: 12, marginBottom: 26 }}>
            <input
              type="text"
              placeholder="Add comma separated emails to invite"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={{
                flex: 1,
                height: 44,
                padding: '0 16px',
                borderRadius: 10,
                border: '2px solid #A855F7',
                fontSize: '0.9rem',
                color: '#0F172A',
                outline: 'none',
                boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.1)',
              }}
            />
            <button
              type="submit"
              disabled={!inviteEmail.trim()}
              style={{
                height: 44,
                padding: '0 22px',
                borderRadius: 10,
                border: 'none',
                background: inviteEmail.trim() ? '#9333EA' : '#D4D4D8',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: inviteEmail.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (inviteEmail.trim()) e.currentTarget.style.background = '#7E22CE';
              }}
              onMouseLeave={(e) => {
                if (inviteEmail.trim()) e.currentTarget.style.background = '#9333EA';
              }}
            >
              Invite
            </button>
          </form>

          {/* "Who has access" Section Header */}
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#64748B',
              marginBottom: 16,
            }}
          >
            Who has access
          </div>

          {/* Access List Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Anyone with link row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Globe size={22} color="#0F172A" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>
                    Anyone
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                    anyone with this link
                  </span>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'transparent',
                    border: '1.5px solid #2563EB',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#0F172A',
                    cursor: 'pointer',
                    padding: '4px 8px 4px 12px',
                    borderRadius: 8,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F0F9FF')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>{anyoneRole}</span>
                  <ChevronRight 
                    size={14} 
                    color="#0F172A" 
                    style={{ 
                      transform: showRoleDropdown ? 'rotate(90deg)' : 'rotate(0deg)', 
                      transition: 'transform 0.15s' 
                    }} 
                  />
                </button>

                {showRoleDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 4,
                      width: 140,
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                      zIndex: 10,
                      padding: 4,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {['can view', 'can edit', 'no access'].map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setAnyoneRole(role as 'can view' | 'can edit' | 'no access');
                          setShowRoleDropdown(false);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '8px 12px',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#0F172A',
                          borderRadius: 4,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Owner / You row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {(currentUserName || 'venky').charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>
                    {currentUserName || 'venky'}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#94A3B8', fontWeight: 400 }}>
                    (you)
                  </span>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#0F172A',
                  paddingRight: 8,
                }}
              >
                owner
              </span>
            </div>

            {/* Dynamically Invited Members */}
            {invitedMembers.map((member, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: member.avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>
                      {member.name}
                    </span>
                    {member.status === 'pending' && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', background: '#FEF3C7', color: '#D97706', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => toggleMemberRole(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'transparent',
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#0F172A',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>{member.role === 'editor' ? 'can edit' : 'can view'}</span>
                    <ChevronRight size={14} color="#0F172A" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#E11D48')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                    title="Remove access"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
