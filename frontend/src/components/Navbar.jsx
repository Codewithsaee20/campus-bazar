import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout, user } = useAuthStore();

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(scrollY.get() > 50);
    };
    const unsubscribe = scrollY.on('change', updateScroll);
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <motion.nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: isScrolled ? '1rem 0' : '2rem 1rem',
        transition: 'padding 0.3s ease',
      }}
    >
      <div 
        className="container" 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: isScrolled ? 'rgba(10, 10, 18, 0.7)' : 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '0.8rem 2.5rem',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isScrolled ? '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255,255,255,0.05)' : 'none'
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-1.5px', color: '#fff' }}>
            Campus<span className="text-gradient" style={{ filter: 'brightness(1.2)' }}>Bazar</span>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {isAuthenticated ? (
            /* ── Logged-in nav: Dashboard links ── */
            <>
              {['Browse', 'Sell', 'Cart'].map((label) => (
                <Link key={label} to={`/${label.toLowerCase()}`} style={{ 
                  color: 'var(--text-dim)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', 
                  textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.2s' 
                }} onMouseEnter={(e) => { e.target.style.color = '#fff'; e.target.style.transform = 'translateY(-1px)'; }} 
                   onMouseLeave={(e) => { e.target.style.color = 'var(--text-dim)'; e.target.style.transform = 'translateY(0)'; }}>
                  {label}
                </Link>
              ))}
              <Link to="/profile" className="glass interactive-card" style={{ 
                padding: '0.5rem 1.25rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.75rem', 
                textDecoration: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)'
              }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'var(--gradient-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                  {user?.name?.charAt(0)}
                </div>
                {user?.name?.split(' ')[0]}
              </Link>
              <button onClick={logout} style={{ 
                background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)', 
                color: 'var(--color-pink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px', borderRadius: '12px', transition: 'all 0.2s' 
              }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.15)'; e.currentTarget.style.transform = 'scale(1.05)'; }} 
                 onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                <LogOut size={16} />
              </button>
            </>
          ) : (
            /* ── Guest nav: Landing page links ── */
            <>
              <Link to="/marketplace" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Marketplace</Link>
              <a href="/#stats" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Impact</a>
              <Link to="/login" className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem', fontWeight: 800 }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
