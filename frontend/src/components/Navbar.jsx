import React, { useEffect, useMemo, useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, Menu, Moon, SunMedium, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuthStore();
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
      { label: 'Profile', to: '/profile' },
    ];
  }, [isAuthenticated]);

  const isActiveRoute = (to) => {
    if (to === '/marketplace') {
      return location.pathname === '/marketplace' || location.pathname === '/browse' || location.pathname === '/feed';
    }
    if (to === '/profile') {
      return location.pathname === '/profile';
    }
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

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
            <>
              <Link
                to="/profile"
                className="glass interactive-card cb-nav-item cb-nav-item--profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textDecoration: 'none',
                  color: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--color-cyan), var(--color-violet))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    color: '#fff',
                  }}
                >
                  {user?.name?.charAt(0)}
                </div>
                {user?.name?.split(' ')[0] || 'Profile'}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="cb-nav-item cb-nav-item--button"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : null}

          <button
            type="button"
            className="cb-nav-item cb-nav-item--toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
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
              <>
                <Link
                  to="/profile"
                  className="glass interactive-card cb-nav-user-chip"
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textDecoration: 'none',
                    color: 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                  onClick={closeMenu}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--color-cyan), var(--color-violet))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      color: '#fff',
                    }}
                  >
                    {user?.name?.charAt(0)}
                  </div>
                  {user?.name?.split(' ')[0] || 'Profile'}
                </Link>
                <button
                  className="cb-nav-logout"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  style={{
                    background: 'rgba(236, 72, 153, 0.1)',
                    border: '1px solid rgba(236, 72, 153, 0.2)',
                    color: 'var(--color-pink)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                  }}
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : null}

            <button
              type="button"
              className="theme-toggle-button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
