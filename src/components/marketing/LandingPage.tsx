import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Users, Zap, ArrowRight, LayoutDashboard, Menu, X } from 'lucide-react';

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

const FEATURES = [
  {
    icon: Zap,
    accent: '#8789FF',
    accentSoft: '#EEEEFF',
    title: 'Infinite canvas',
    body: 'Zoom out to see the whole map, zoom in to work on a single detail. There is no edge to run out of.',
  },
  {
    icon: Users,
    accent: '#82FFCF',
    accentSoft: '#EAFFF6',
    title: 'Real-time collaboration',
    body: 'See where your team is working and what they are changing, as it happens.',
  },
  {
    icon: LayoutDashboard,
    accent: '#FF99E7',
    accentSoft: '#FFEEFA',
    title: 'Built for structure',
    body: 'Wireframes, architecture diagrams, and brainstorms all live on the same canvas, organized your way.',
  },
];

export const LandingPage: React.FC = () => {
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

        .landing-header {
          padding: 0 40px;
        }

        .landing-desktop-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .landing-mobile-menu-btn {
          display: none;
        }

        .landing-hero {
          padding: 180px 20px 80px;
        }

        .landing-hero-h1 {
          font-size: 4.4rem;
        }

        .landing-hero-p {
          font-size: 1.2rem;
          margin-bottom: 48px;
        }

        .landing-screenshot-section {
          padding: 0 20px 100px;
        }

        .landing-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          padding: 0 20px 160px;
        }

        .landing-feature-card {
          padding: 40px;
        }

        @media (max-width: 900px) {
          .landing-features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .landing-header {
            padding: 0 20px;
          }

          .landing-desktop-nav {
            display: none !important;
          }

          .landing-mobile-menu-btn {
            display: flex !important;
          }

          .landing-hero {
            padding: 120px 20px 48px;
          }

          .landing-hero-h1 {
            font-size: 2.6rem;
            line-height: 1.15;
            margin-bottom: 16px;
          }

          .landing-hero-p {
            font-size: 1rem;
            line-height: 1.5;
            margin-bottom: 32px;
          }

          .landing-screenshot-section {
            padding: 0 16px 60px;
          }

          .landing-features-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 0 16px 80px;
          }

          .landing-feature-card {
            padding: 24px;
            border-radius: 18px;
          }
        }

        @media (max-width: 480px) {
          .landing-hero-h1 {
            font-size: 2.15rem;
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
          opacity: 0.5,
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
        className="landing-header"
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BloomMark size={28} />
          <span style={{ fontFamily: '"Fraunces", serif', fontSize: '1.3rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#14161A' }}>
            Bloom
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="landing-desktop-nav">
          <button
            onClick={() => setActiveView('landing')}
            style={{ background: 'none', border: 'none', color: '#14161A', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Product
          </button>
          <button
            onClick={() => setActiveView('downloads')}
            style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#14161A')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#6B7280')}
          >
            Downloads
          </button>
          <button
            onClick={() => setActiveView('login')}
            style={{
              background: '#14161A',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 20,
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#34345C')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#14161A')}
          >
            Start Designing
            <ArrowRight size={16} />
          </button>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className="landing-mobile-menu-btn"
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
              color: '#14161A',
              fontSize: '1.1rem',
              fontWeight: 600,
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
              color: '#6B7280',
              fontSize: '1.1rem',
              fontWeight: 500,
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
            Start Designing
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="landing-hero" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 1000, margin: '0 auto' }}>
        <h1
          className="landing-hero-h1"
          style={{
            fontFamily: '"Fraunces", serif',
            lineHeight: 1.1,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            margin: '0 0 24px',
            color: '#14161A',
          }}
        >
          Think and create <br /> at the speed of light.
        </h1>

        <p
          className="landing-hero-p"
          style={{
            color: '#6B7280',
            maxWidth: 560,
            lineHeight: 1.6,
            margin: '0 0 48px',
          }}
        >
          An infinite, collaborative canvas built for teams that move fast. Wireframe, map architectures, and brainstorm in real time.
        </p>

        <div style={{ display: 'flex', gap: 16, width: '100%', justifyContent: 'center' }}>
          <button
            onClick={() => setActiveView('login')}
            style={{
              background: '#14161A',
              color: '#fff',
              border: 'none',
              padding: '16px 32px',
              borderRadius: 30,
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              transition: 'transform 0.2s, background 0.2s',
              maxWidth: 320,
              width: '100%',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#34345C';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#14161A';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <LayoutDashboard size={20} />
            Enter Workspace
          </button>
        </div>
      </section>

      {/* Product Screenshot Preview */}
      <section className="landing-screenshot-section" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: '100%',
            maxWidth: 1200,
            background: '#FFFFFF',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 20px 40px -20px rgba(20,22,26,0.1)',
            border: '1px solid #EFEFF2',
            display: 'flex',
          }}
        >
          <img src="/welcome.png" alt="Bloom Product Screenshot" style={{ width: '100%', display: 'block' }} />
        </div>
      </section>

      {/* Features Grid */}
      <section
        className="landing-features-grid"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {FEATURES.map(({ icon: Icon, accent, accentSoft, title, body }) => (
          <div
            key={title}
            className="landing-feature-card"
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              border: '1px solid #EFEFF2',
              boxShadow: '0 10px 40px -18px rgba(20,22,26,0.08)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                background: accentSoft,
                color: '#14161A',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Icon size={22} color={accent === '#82FFCF' ? '#1F6B4F' : accent === '#FF99E7' ? '#B03A8C' : '#4C4DBF'} />
            </div>
            <h3 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.25rem', fontWeight: 600, margin: '0 0 12px', color: '#14161A' }}>
              {title}
            </h3>
            <p style={{ color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
};