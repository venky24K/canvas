import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { GcpAuthService } from '../../cloud/GcpAuthService';
import { RefreshCw } from 'lucide-react';

// Bloom mark — four overlapping petals, multiply-blended, matching logo.svg
const BloomMark: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <g style={{ mixBlendMode: 'multiply' as const }}>
      <circle cx="191" cy="330" r="90" fill="#FFFD99" />
      <circle cx="320" cy="181" r="90" fill="#82FFCF" />
      <circle cx="320" cy="330" r="90" fill="#8789FF" />
      <circle cx="191" cy="181" r="90" fill="#FF99E7" />
    </g>
  </svg>
);

export const LoginPage: React.FC = () => {
  const { setActiveView, setUserIdentity } = useCanvasStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const profile = await GcpAuthService.signInWithGoogle();
      setUserIdentity(profile.uid, profile.displayName, profile.avatarColor, profile.photoURL);
      setTimeout(() => {
        setActiveView('dashboard');
      }, 400);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setIsAuthenticating(false);
      
      // Provide a friendly error message for unauthorized domains
      if (err.code === 'auth/unauthorized-domain') {
        setAuthError('This domain is not authorized for OAuth. Please add it in the Firebase Console.');
      } else {
        setAuthError(err.message || 'Authentication failed. Please try again.');
      }
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: '"Inter", sans-serif',
        color: '#14161A',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes bloom-spin { to { transform: rotate(360deg); } }
        .bloom-spinner { animation: bloom-spin 0.8s linear infinite; }
      `}</style>

      {/* Signature element: soft blurred bloom, echoing the logo mark */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900,
          height: 700,
          filter: 'blur(90px)',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%', mixBlendMode: 'multiply' as const }}>
          <div style={{ position: 'absolute', left: '30%', top: '46%', width: 260, height: 260, borderRadius: '50%', background: '#FFFD99' }} />
          <div style={{ position: 'absolute', left: '52%', top: '20%', width: 260, height: 260, borderRadius: '50%', background: '#82FFCF' }} />
          <div style={{ position: 'absolute', left: '52%', top: '46%', width: 260, height: 260, borderRadius: '50%', background: '#8789FF' }} />
          <div style={{ position: 'absolute', left: '30%', top: '20%', width: 260, height: 260, borderRadius: '50%', background: '#FF99E7' }} />
        </div>
      </div>

      {/* Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#FFFFFF',
          border: '1px solid #EFEFF2',
          borderRadius: 24,
          boxShadow: '0 20px 60px -20px rgba(20,22,26,0.15)',
          padding: '44px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
          margin: '0 20px',
        }}
      >
        <BloomMark size={44} />

        <h1
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: '1.7rem',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '20px 0 8px',
            color: '#14161A',
          }}
        >
          Sign in to Bloom
        </h1>
        <p
          style={{
            fontSize: '0.92rem',
            color: '#6B7280',
            margin: '0 0 32px',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Your canvas is waiting.
        </p>

        {authError && (
          <div style={{
            width: '100%',
            padding: '12px',
            marginBottom: '24px',
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            color: '#DC2626',
            fontSize: '0.85rem',
            lineHeight: 1.4,
            textAlign: 'center'
          }}>
            {authError}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isAuthenticating}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '13px 20px',
            background: '#FFFFFF',
            color: '#14161A',
            border: '1px solid #E2E4E9',
            borderRadius: 12,
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: isAuthenticating ? 'wait' : 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!isAuthenticating) {
              e.currentTarget.style.background = '#FAFAFB';
              e.currentTarget.style.borderColor = '#D8DAE0';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.borderColor = '#E2E4E9';
          }}
        >
          {isAuthenticating ? (
            <>
              <RefreshCw size={18} color="#6B7280" className="bloom-spinner" />
              <span>Connecting…</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <button
          onClick={() => setActiveView('landing')}
          style={{
            marginTop: 20,
            background: 'none',
            border: 'none',
            color: '#9AA0AC',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#6B7280')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#9AA0AC')}
        >
          Back to home
        </button>
      </div>
    </div>
  );
};