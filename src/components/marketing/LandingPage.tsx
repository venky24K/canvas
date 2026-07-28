import React from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Sparkles, Users, Zap, ArrowRight, LayoutDashboard } from 'lucide-react';

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
        background: 'radial-gradient(ellipse at 50% -20%, #1e1b4b 0%, #0f172a 45%, #020617 100%)',
        color: '#f8fafc',
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* Dynamic Background Elements */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: 400, height: 400, background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(100px)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 500, height: 500, background: 'rgba(236, 72, 153, 0.1)', filter: 'blur(120px)', borderRadius: '50%' }} />

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
          background: 'rgba(2, 6, 23, 0.6)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Sparkles size={18} color="#fff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Bloom
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <button
            onClick={() => setActiveView('landing')}
            style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', opacity: 1 }}
          >
            Product
          </button>
          <button
            onClick={() => setActiveView('blog')}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#f8fafc')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            Blog
          </button>
          <button
            onClick={() => setActiveView('login')}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#f8fafc')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveView('login')}
            style={{
              background: '#f8fafc',
              color: '#0f172a',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 20,
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Start Designing
            <ArrowRight size={16} />
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '180px 20px 100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            padding: '8px 16px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 100,
            color: '#818cf8',
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: 32,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 10px #818cf8' }} />
          Bloom 2.0 is now live
        </div>

        <h1
          style={{
            fontSize: '5.5rem',
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            margin: '0 0 24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Think and create <br /> at the speed of light.
        </h1>

        <p
          style={{
            fontSize: '1.25rem',
            color: '#94a3b8',
            maxWidth: 600,
            lineHeight: 1.6,
            margin: '0 0 48px',
          }}
        >
          An infinite, collaborative canvas built for teams that move fast. Wireframe, map architectures, and brainstorm in real-time.
        </p>

        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={() => setActiveView('login')}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
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
              boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.5)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(99, 102, 241, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(99, 102, 241, 0.5)';
            }}
          >
            <LayoutDashboard size={20} />
            Enter Workspace
          </button>
        </div>
      </section>

      {/* Interactive Mockup Preview */}
      <section style={{ padding: '0 20px 100px', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: '100%',
            maxWidth: 1200,
            height: 600,
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Mockup Top Bar */}
          <div style={{ height: 50, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
          </div>
          {/* Mockup Canvas Area */}
          <div style={{ padding: 40, display: 'flex', gap: 20 }}>
             <div style={{ width: 250, height: 180, background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: 12 }} />
             <div style={{ width: 300, height: 220, background: 'rgba(236, 72, 153, 0.2)', border: '1px solid rgba(236, 72, 153, 0.4)', borderRadius: 12, marginTop: 40 }} />
             <div style={{ position: 'absolute', top: 120, left: 240, color: '#fff', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
                <div style={{ background: '#ec4899', padding: '2px 8px', borderRadius: 4 }}>Sarah (Editing)</div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 20px 160px', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: 40, borderRadius: 24, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ width: 48, height: 48, background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Zap size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 12px' }}>Infinite Canvas</h3>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>GPU-accelerated rendering allows you to build massive mindmaps without dropping a single frame.</p>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: 40, borderRadius: 24, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ width: 48, height: 48, background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Users size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 12px' }}>Multiplayer Real-time</h3>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>Powered by WebSockets and CRDTs, see cursor movements and edits instantly, anywhere in the world.</p>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: 40, borderRadius: 24, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ width: 48, height: 48, background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Sparkles size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 12px' }}>Glassmorphic UI</h3>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>A beautiful, distraction-free interface that puts your designs front and center, feeling completely immersive.</p>
        </div>
      </section>
    </div>
  );
};
