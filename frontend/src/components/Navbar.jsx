import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Menu, ShoppingCart, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { campusCategorySections } from '../data/campusCategories';
import { useCartStore } from '../store/useCartStore';

const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [brandLogoSrc, setBrandLogoSrc] = useState('/logo.png');
  const { isAuthenticated, user } = useAuthStore();
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + (Number(item.quantity) || 1), 0)
  );
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
        setIsCategoryDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsCategoryDrawerOpen(false);
  }, [location.pathname, location.search]);

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
      { label: 'Order Requests', to: '/orders/requests' },
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

  const buildCategoryTo = (item) => {
    const params = new URLSearchParams(item.query || {});
    const queryString = params.toString();
    return queryString ? `${item.to}?${queryString}` : item.to;
  };

  const isCategoryActive = (item) => {
    if (location.pathname !== item.to) return false;

    const params = new URLSearchParams(location.search);
    const expected = new URLSearchParams(item.query || {});
    return params.toString() === expected.toString();
  };

  const closeDrawer = () => setIsCategoryDrawerOpen(false);

  return (
    <motion.nav
      className="cb-navbar"
      data-scrolled={isScrolled ? 'true' : 'false'}
    >
      <div
        className="cb-navbar-shell"
        data-scrolled={isScrolled ? 'true' : 'false'}
      >
        <div className="cb-brand-group">
          <button
            type="button"
            className="cb-category-toggle"
            aria-label={isCategoryDrawerOpen ? 'Close category menu' : 'Open category menu'}
            aria-expanded={isCategoryDrawerOpen}
            onClick={() => setIsCategoryDrawerOpen((previous) => !previous)}
          >
            {isCategoryDrawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to={isAuthenticated ? '/marketplace' : '/'} className="cb-brand-link" style={{ textDecoration: 'none', color: 'inherit' }}>
            <img
              src={brandLogoSrc}
              alt="Campus Bazaar logo"
              className="cb-brand-logo"
              onError={() => {
                if (brandLogoSrc !== '/favicon.svg') {
                  setBrandLogoSrc('/favicon.svg');
                }
              }}
            />
            <div className="cb-brand">
              Campus <span className="text-gradient" style={{ filter: 'brightness(1.05)' }}>Bazaar</span>
            </div>
          </Link>
        </div>

        <div className="cb-nav-desktop" style={{ gap: '0.5rem' }}>
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`cb-nav-item ${isActiveRoute(item.to) ? 'active' : ''}`}
              onClick={closeDrawer}
            >
              {item.label}
            </Link>
          ))}

          <Link
            to="/cart"
            className={`cb-cart-link ${location.pathname === '/cart' ? 'active' : ''}`}
            onClick={closeDrawer}
            aria-label="Open cart"
            title="Open cart"
          >
            <ShoppingCart size={18} />
            <span className="cb-cart-label">Cart</span>
            {cartItemCount > 0 ? <span className="cb-cart-badge">{cartItemCount}</span> : null}
          </Link>

          {!isAuthenticated ? (
            <Link to="/signup" className="btn-primary cb-nav-cta" onClick={closeDrawer}>
              Get Started
            </Link>
          ) : (
            <Link
              to="/profile"
              className="glass interactive-card cb-nav-item cb-user-trigger"
              onClick={closeDrawer}
              aria-label="Open profile"
              style={{ minWidth: '44px', justifyContent: 'center', padding: '0.55rem' }}
            >
              <div className="cb-user-avatar">{userInitial}</div>
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isCategoryDrawerOpen ? (
          <>
            <motion.div
              className="cb-category-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
            />

            <motion.aside
              className="cb-category-drawer glass"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            >
              <div className="cb-category-drawer-header">
                <div>
                  <p className="cb-category-drawer-kicker">Browse campus inventory</p>
                  <h2>All categories</h2>
                </div>
                <button type="button" className="cb-category-close" onClick={closeDrawer} aria-label="Close category menu">
                  <X size={18} />
                </button>
              </div>

              <div className="cb-category-drawer-note">
                Tap a category to open the marketplace already filtered and sorted for books, notes, and college material.
              </div>

              {campusCategorySections.map((section) => (
                <section key={section.title} className="cb-category-section">
                  <p className="cb-category-section-title">{section.title}</p>
                  <div className="cb-category-list">
                    {section.items.map((item) => (
                      <Link
                        key={item.label}
                        to={buildCategoryTo(item)}
                        className={`cb-category-item ${isCategoryActive(item) ? 'active' : ''}`}
                        onClick={closeDrawer}
                      >
                        <span className="cb-category-item-copy">
                          <strong>{item.label}</strong>
                          <span>{item.description}</span>
                        </span>
                        <ChevronRight size={17} />
                      </Link>
                    ))}
                  </div>
                </section>
              ))}

              <div className="cb-category-drawer-footer">
                <Link
                  to="/cart"
                  className={`cb-cart-link ${location.pathname === '/cart' ? 'active' : ''}`}
                  onClick={closeDrawer}
                  aria-label="Open cart"
                >
                  <ShoppingCart size={18} />
                  <span className="cb-cart-label">Cart</span>
                  {cartItemCount > 0 ? <span className="cb-cart-badge">{cartItemCount}</span> : null}
                </Link>

                {navItems.map((item) => (
                  <Link key={item.label} to={item.to} className={`cb-nav-item ${isActiveRoute(item.to) ? 'active' : ''}`} onClick={closeDrawer}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
