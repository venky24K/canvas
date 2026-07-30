import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { ArrowLeft, Download, Menu, X } from 'lucide-react';

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

const PLATFORMS = {
  mac: {
    accent: '#8789FF',
    accentSoft: '#EEEEFF',
  },
  windows: {
    accent: '#82FFCF',
    accentSoft: '#EAFFF6',
  },
};

export const DownloadsPage: React.FC = () => {
  const { setActiveView } = useCanvasStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: '#FFFFFF',
        color: '#14161A',
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');

        .downloads-header {
          padding: 0 40px;
        }

        .downloads-desktop-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .downloads-mobile-menu-btn {
          display: none;
        }

        .downloads-main {
          margin: 150px auto 100px;
          padding: 0 20px;
        }

        .downloads-h1 {
          font-size: 3.6rem;
          margin-bottom: 16px;
        }

        .downloads-subtitle {
          font-size: 1.15rem;
          margin-bottom: 64px;
        }

        .downloads-card {
          width: 100%;
          max-width: 360px;
          box-sizing: border-box;
          padding: 44px 32px 40px;
        }

        @media (max-width: 768px) {
          .downloads-header {
            padding: 0 20px;
          }

          .downloads-desktop-nav {
            display: none !important;
          }

          .downloads-mobile-menu-btn {
            display: flex !important;
          }

          .downloads-main {
            margin: 110px auto 60px;
            padding: 0 16px;
          }

          .downloads-h1 {
            font-size: 2.2rem;
            line-height: 1.2;
            margin-bottom: 12px;
          }

          .downloads-subtitle {
            font-size: 0.98rem;
            line-height: 1.5;
            margin-bottom: 40px;
          }
        }

        @media (max-width: 480px) {
          .downloads-h1 {
            font-size: 1.85rem;
          }

          .downloads-card {
            padding: 32px 20px 28px;
            border-radius: 20px;
          }
        }
      `}</style>

      {/* Signature element: soft blurred bloom, echoing the logo mark */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -220,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 700,
          filter: 'blur(70px)',
          opacity: 0.55,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%', mixBlendMode: 'multiply' as const }}>
          <div style={{ position: 'absolute', left: '30%', top: '46%', width: 260, height: 260, borderRadius: '50%', background: '#FFFD99' }} />
          <div style={{ position: 'absolute', left: '52%', top: '20%', width: 260, height: 260, borderRadius: '50%', background: '#82FFCF' }} />
          <div style={{ position: 'absolute', left: '52%', top: '46%', width: 260, height: 260, borderRadius: '50%', background: '#8789FF' }} />
          <div style={{ position: 'absolute', left: '30%', top: '20%', width: 260, height: 260, borderRadius: '50%', background: '#FF99E7' }} />
        </div>
      </div>

      {/* Navigation Header */}
      <header
        className="downloads-header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid #EFEFF2',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setActiveView('landing')}
            aria-label="Back to home"
            style={{ background: 'transparent', border: 'none', color: '#6B7280', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 4, borderRadius: 6 }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 4 }}>
            <BloomMark size={28} />
            <span style={{ fontFamily: '"Fraunces", serif', fontSize: '1.3rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#14161A' }}>
              Bloom
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="downloads-desktop-nav">
          <button
            onClick={() => setActiveView('landing')}
            style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#14161A')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#6B7280')}
          >
            Product
          </button>
          <button style={{ background: 'none', border: 'none', color: '#14161A', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
            Downloads
          </button>
          <button
            onClick={() => setActiveView('login')}
            style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#14161A')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#6B7280')}
          >
            Sign In
          </button>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className="downloads-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#14161A',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Slide-down Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 70,
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid #EFEFF2',
            padding: '24px 20px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            zIndex: 99,
            boxShadow: '0 12px 32px rgba(20,22,26,0.1)',
          }}
        >
          <button
            onClick={() => {
              setActiveView('landing');
              setMobileMenuOpen(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#6B7280',
              fontSize: '1.1rem',
              fontWeight: 500,
              textAlign: 'left',
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            Product
          </button>
          <button
            onClick={() => {
              setActiveView('downloads');
              setMobileMenuOpen(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#14161A',
              fontSize: '1.1rem',
              fontWeight: 600,
              textAlign: 'left',
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            Downloads
          </button>
          <button
            onClick={() => {
              setActiveView('login');
              setMobileMenuOpen(false);
            }}
            style={{
              background: '#14161A',
              color: '#fff',
              border: 'none',
              padding: '14px 24px',
              borderRadius: 14,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 8,
            }}
          >
            Sign In
          </button>
        </div>
      )}

      {/* Main Content */}
      <main
        className="downloads-main"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <h1
          className="downloads-h1"
          style={{
            fontFamily: '"Fraunces", serif',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: '#14161A',
          }}
        >
          Get Bloom for Desktop
        </h1>
        <p className="downloads-subtitle" style={{ color: '#6B7280', maxWidth: 500, lineHeight: 1.5 }}>
          Experience the fastest collaborative canvas with native performance and offline support.
        </p>

        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
          {/* Mac Card */}
          <div
            className="downloads-card"
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              borderTop: `4px solid ${PLATFORMS.mac.accent}`,
              boxShadow: '0 10px 40px -14px rgba(20,22,26,0.10), 0 1px 3px rgba(20,22,26,0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: PLATFORMS.mac.accentSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 16 16" fill="currentColor" color="#14161A">
                <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282"/>
                <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.6rem', fontWeight: 600, margin: '0 0 12px', color: '#14161A' }}>
              macOS
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#6B7280', textAlign: 'center', margin: '0 0 36px', lineHeight: 1.5 }}>
              Optimized for Apple Silicon and Intel Macs. Requires macOS 11.0 or later.
            </p>

            <button
              style={{
                width: '100%',
                background: '#14161A',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 0',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                marginBottom: 12,
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#34345C')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#14161A')}
            >
              <Download size={18} /> Apple Silicon
            </button>

            <button
              style={{
                width: '100%',
                background: '#fff',
                color: '#14161A',
                border: '1px solid #E2E4E9',
                borderRadius: 12,
                padding: '14px 0',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = PLATFORMS.mac.accentSoft;
                e.currentTarget.style.borderColor = PLATFORMS.mac.accent;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#E2E4E9';
              }}
            >
              Intel Chip
            </button>
          </div>

          {/* Windows Card */}
          <div
            className="downloads-card"
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              borderTop: `4px solid ${PLATFORMS.windows.accent}`,
              boxShadow: '0 10px 40px -14px rgba(20,22,26,0.10), 0 1px 3px rgba(20,22,26,0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: PLATFORMS.windows.accentSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <svg width="26" height="26" viewBox="0 0 88 88">
                <path d="M0,12.4L35.7,7.5V41.5H0V12.4z M39.9,6.9L87.8,0V41.5H39.9V6.9z M0,45.8H35.7V80.5L0,75.6V45.8z M39.9,45.8H87.8V88 L39.9,81.1V45.8z" fill="#14161A" />
              </svg>
            </div>
            <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.6rem', fontWeight: 600, margin: '0 0 12px', color: '#14161A' }}>
              Windows
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#6B7280', textAlign: 'center', margin: '0 0 36px', lineHeight: 1.5 }}>
              Native performance for Windows 10 and 11. Includes WSL2 integration.
            </p>

            <button
              style={{
                width: '100%',
                background: '#14161A',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 0',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                marginBottom: 12,
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#1F6B4F')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#14161A')}
            >
              <Download size={18} /> Download for Windows (x64)
            </button>

            <button
              style={{
                width: '100%',
                background: '#fff',
                color: '#14161A',
                border: '1px solid #E2E4E9',
                borderRadius: 12,
                padding: '14px 0',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = PLATFORMS.windows.accentSoft;
                e.currentTarget.style.borderColor = PLATFORMS.windows.accent;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#E2E4E9';
              }}
            >
              ARM64 Installer
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};