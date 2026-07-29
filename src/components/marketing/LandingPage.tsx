import React from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Users, Zap, ArrowRight, LayoutDashboard } from 'lucide-react';

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
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
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

        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
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
      </header>

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '180px 20px 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: '4.4rem',
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
          style={{
            fontSize: '1.2rem',
            color: '#6B7280',
            maxWidth: 560,
            lineHeight: 1.6,
            margin: '0 0 48px',
          }}
        >
          An infinite, collaborative canvas built for teams that move fast. Wireframe, map architectures, and brainstorm in real time.
        </p>

        <div style={{ display: 'flex', gap: 16 }}>
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
              gap: 12,
              transition: 'transform 0.2s, background 0.2s',
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
      <section style={{ position: 'relative', zIndex: 1, padding: '0 20px 100px', display: 'flex', justifyContent: 'center' }}>
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
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '0 20px 160px',
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32,
        }}
      >
        {FEATURES.map(({ icon: Icon, accent, accentSoft, title, body }) => (
          <div
            key={title}
            style={{
              background: '#FFFFFF',
              padding: 40,
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