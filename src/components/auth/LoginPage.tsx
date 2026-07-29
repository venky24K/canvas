import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { GcpAuthService } from '../../cloud/GcpAuthService';
import { Sparkles, ShieldCheck, Wifi, RefreshCw } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { setActiveView, setUserIdentity } = useCanvasStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const profile = await GcpAuthService.signInWithGoogle();
      setUserIdentity(profile.uid, profile.displayName, profile.avatarColor, profile.photoURL);
      setTimeout(() => {
        setActiveView('dashboard');
      }, 400);
    } catch (err) {
      console.error('Sign in error:', err);
      setIsAuthenticating(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(circle at 20% 20%, #1E1B4B 0%, #0B0F19 60%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#FFFFFF',
      }}
    >
      {/* Ambient Neon Orbital Glow Blobs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '15%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, rgba(139, 92, 246, 0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '15%',
          width: 540,
          height: 540,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, rgba(6, 182, 212, 0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '-5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, rgba(16, 185, 129, 0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Grid Overlay Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.8,
          pointerEvents: 'none',
        }}
      />

      {/* Glassmorphic Central Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: 28,
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.15)',
          padding: '44px 44px 36px 44px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
          margin: '0 20px',
          position: 'relative',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 36, width: '100%' }}>
          <div
            style={{
              width: 68,
              height: 68,
              margin: '0 auto 20px auto',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
              borderRadius: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 28px rgba(139, 92, 246, 0.45)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Sparkles size={36} color="#FFFFFF" />
          </div>
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: 0,
              fontFamily: 'Outfit, system-ui, sans-serif',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 60%, #94A3B8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Bloom Studio
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: '#94A3B8',
              margin: '12px 0 0 0',
              lineHeight: 1.5,
            }}
          >
            Real-time Collaborative UX Sketching & Architecture.<br />
            Sign in to access your digital workspace.
          </p>
        </div>

        {/* Primary Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isAuthenticating}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            padding: '16px 24px',
            background: '#FFFFFF',
            color: '#0F172A',
            border: 'none',
            borderRadius: 16,
            fontSize: '1rem',
            fontWeight: 700,
            cursor: isAuthenticating ? 'wait' : 'pointer',
            boxShadow: '0 6px 20px rgba(255, 255, 255, 0.18)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            if (!isAuthenticating) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 26px rgba(255, 255, 255, 0.28)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.18)';
          }}
        >
          {isAuthenticating ? (
            <>
              <RefreshCw size={20} color="#4F46E5" className="animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              {/* Official Colorful Google G Logo SVG */}
              <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        {/* Security & System Footer */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#94A3B8',
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontWeight: 600 }}>
            <ShieldCheck size={15} color="#10B981" />
            <span>Secure Cloud Workspace</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Wifi size={14} color="#06B6D4" />
            <span>Real-time Sync Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
