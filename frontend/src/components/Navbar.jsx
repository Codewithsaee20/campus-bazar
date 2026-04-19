import React, { useEffect, useMemo, useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(scrollY.get() > 50);
    };
    const unsubscribe = scrollY.on('change', updateScroll);
    return () => unsubscribe();
  }, [scrollY]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const navItems = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { label: 'Marketplace', to: '/marketplace' },
        { label: 'Login', to: '/auth/phone' },
        { label: 'Sign Up', to: '/signup' },
      ];
    }

    return [
      { label: 'Marketplace', to: '/marketplace' },
      { label: 'Sell Book', to: '/listings/new' },
      { label: 'My Listings', to: '/my-listings' },
    ];
  }, [isAuthenticated]);

  const isActiveRoute = (to) => {
    if (to === '/marketplace') {
      return location.pathname === '/marketplace' || location.pathname === '/browse' || location.pathname === '/feed';
    }
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  const userInitial = (user?.name || 'Profile').trim().charAt(0).toUpperCase() || 'U';

  return (
    <motion.nav
      className="cb-navbar"
      style={{
        padding: isScrolled ? '0.9rem 0' : '1.15rem 0',
        transition: 'padding 0.3s ease',
      }}
    >
      <div
        className="container cb-navbar-shell"
        data-scrolled={isScrolled ? 'true' : 'false'}
        style={{
          background: isScrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg)',
          backdropFilter: 'blur(20px)',
          border: 'var(--nav-border)',
          boxShadow: isScrolled ? '0 20px 40px rgba(15, 23, 42, 0.14)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Link to={isAuthenticated ? '/marketplace' : '/'} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="cb-brand">
            Campus <span className="text-gradient" style={{ filter: 'brightness(1.05)' }}>Bazaar</span>
          </div>
        </Link>

        <div className="cb-nav-desktop" style={{ gap: '0.5rem' }}>
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`cb-nav-item ${isActiveRoute(item.to) ? 'active' : ''}`}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}

          {!isAuthenticated ? (
            <Link to="/signup" className="btn-primary cb-nav-cta" onClick={closeMenu}>
              Get Started
            </Link>
          ) : null}

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="glass interactive-card cb-nav-item cb-user-trigger"
              onClick={closeMenu}
              aria-label="Open profile"
              style={{ minWidth: '44px', justifyContent: 'center', padding: '0.55rem' }}
            >
              <div className="cb-user-avatar">{userInitial}</div>
            </Link>
          ) : null}

        </div>

        <button
          type="button"
          className="cb-nav-toggle"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((previous) => !previous)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMenuOpen && (
        <div
          className="container cb-nav-mobile glass"
          style={{
            background: 'var(--nav-bg)',
            border: 'var(--nav-border)',
          }}
        >
          <div className="cb-nav-mobile-list">
            {navItems.map((item) => (
              <Link key={item.label} to={item.to} className={`cb-nav-item ${isActiveRoute(item.to) ? 'active' : ''}`} onClick={closeMenu}>
                {item.label}
              </Link>
            ))}

            {!isAuthenticated ? (
              <Link to="/signup" className="btn-primary cb-nav-mobile-cta" onClick={closeMenu}>
                Get Started
              </Link>
            ) : null}

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="glass interactive-card cb-nav-user-chip"
                style={{
                  padding: '0.7rem',
                  borderRadius: '14px',
                  width: 'fit-content',
                  alignSelf: 'flex-start',
                  minWidth: '44px',
                  justifyContent: 'center',
                  display: 'inline-flex',
                }}
                onClick={closeMenu}
                aria-label="Open profile"
              >
                <div className="cb-user-avatar">{userInitial}</div>
              </Link>
            ) : null}

          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
