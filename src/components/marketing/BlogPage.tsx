import React from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export const BlogPage: React.FC = () => {
  const { setActiveView } = useCanvasStore();

  const mockPosts = [
    {
      id: 1,
      title: 'Designing Real-Time Collaborative Architecture',
      category: 'Engineering',
      date: 'Aug 12, 2026',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      excerpt: 'How we built a lock-free multiplayer engine using Yjs CRDTs and Google Cloud Run for sub-50ms latency globally.',
    },
    {
      id: 2,
      title: 'The Future of Glassmorphic UI in 2026',
      category: 'Design',
      date: 'Sep 05, 2026',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      excerpt: 'Why heavily blurred, translucent layers are making a comeback in professional software tools and how to implement them performantly.',
    },
    {
      id: 3,
      title: 'Announcing Bloom 2.0: Infinite Creativity',
      category: 'Product',
      date: 'Sep 15, 2026',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
      excerpt: 'We are thrilled to launch the next generation of our collaborative canvas, featuring massive performance upgrades and seamless UI.',
    }
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: '#020617',
        color: '#f8fafc',
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* Dynamic Background Elements */}
      <div style={{ position: 'absolute', top: '20%', right: '15%', width: 500, height: 500, background: 'rgba(99, 102, 241, 0.08)', filter: 'blur(120px)', borderRadius: '50%' }} />

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
          background: 'rgba(2, 6, 23, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={() => setActiveView('landing')}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={20} />
          </button>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 12,
            }}
          >
            <Sparkles size={18} color="#fff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Bloom Blog</span>
        </div>

        <button
          onClick={() => setActiveView('login')}
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '8px 20px',
            borderRadius: 20,
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          Sign In
        </button>
      </header>

      {/* Blog Content */}
      <main style={{ maxWidth: 1000, margin: '120px auto 100px', padding: '0 20px' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, letterSpacing: '-0.04em', margin: '0 0 16px' }}>Inside Bloom</h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', margin: '0 0 64px', maxWidth: 600 }}>Stories, insights, and updates from the team building the world's fastest collaborative canvas.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 40 }}>
          {mockPosts.map(post => (
            <article key={post.id} style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', group: 'true' }}>
              <div style={{ width: '100%', height: 240, borderRadius: 16, overflow: 'hidden', marginBottom: 20, position: 'relative' }}>
                <img 
                  src={post.image} 
                  alt={post.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} 
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {post.category}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{post.date}</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 12px', lineHeight: 1.3 }}>{post.title}</h2>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem', margin: '0 0 24px' }}>{post.excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc', fontSize: '0.9rem', fontWeight: 600, marginTop: 'auto' }}>
                Read Article <ArrowRight size={16} />
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};
