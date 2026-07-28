import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GcpAuthService, type GcpUserProfile } from '../../cloud/GcpAuthService';
import { UserCheck, Wifi, LogOut, Sparkles } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

interface GcpProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GcpProfileModal: React.FC<GcpProfileModalProps> = ({ isOpen, onClose }) => {
  const { setActiveView } = useCanvasStore();
  const [currentUser, setCurrentUser] = useState<GcpUserProfile>(GcpAuthService.getCurrentUser());

  const handleSignOut = async () => {
    await GcpAuthService.signOut();
    onClose();
    setActiveView('login');
  };

  useEffect(() => {
    const unsubscribe = GcpAuthService.subscribe((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: 20,
        fontFamily: 'Inter, system-ui, sans-serif',
        pointerEvents: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: 440,
          background: '#FFFFFF',
          borderRadius: 24,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          animation: 'modalScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid #E2E8F0',
          color: '#1E293B',
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #3B82F6 100%)',
            padding: '24px 28px',
            color: '#FFFFFF',
            position: 'relative',
            boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                <Sparkles size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Profile & Account Settings
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                color: '#FFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 700,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: '0.825rem', color: '#E0E7FF', fontWeight: 500 }}>
            Manage your authenticated profile session and cloud synchronization.
          </div>
        </div>

        {/* Active Profile Section */}
        <div style={{ padding: '24px 28px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Authenticated Member Profile
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 18px',
              borderRadius: 16,
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: currentUser.avatarColor || '#6366F1',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: 700,
                boxShadow: `0 4px 14px ${currentUser.avatarColor || '#6366F1'}40`,
                border: '3px solid #FFF',
                flexShrink: 0,
              }}
            >
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {currentUser.displayName || 'Anonymous Member'}
                </span>
              </div>
              <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: 4, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser.email}
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: '0.725rem', padding: '3px 10px', borderRadius: 12, background: '#EFF6FF', color: '#3B82F6', fontWeight: 600, border: '1px solid #DBEAFE' }}>
                  {currentUser.role || 'Design Evaluator'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
              <div title="Active Authenticated Session">
                <UserCheck size={22} color="#10B981" />
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: '#FEE2E2',
                  color: '#E11D48',
                  border: '1px solid #FDA4AF',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                title="Sign Out to Login Portal"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FECACA';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FEE2E2';
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry Footer */}
        <div
          style={{
            padding: '16px 28px',
            background: '#F1F5F9',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#64748B',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981' }}>
            <Wifi size={14} className="animate-pulse-glow" />
            <span>Cloud Database Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} color="#8B5CF6" />
            <span>Real-time Sync Ready</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
