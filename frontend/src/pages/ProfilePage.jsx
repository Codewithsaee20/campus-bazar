import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, SunMedium } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useOrderStore } from '../store/useOrderStore';
import { useTheme } from '../hooks/useTheme';
import Navbar from '../components/Navbar';
import { listingApi, unwrapData } from '../utils/campusApi';
import { readWishlist, WISHLIST_UPDATED_EVENT } from '../utils/wishlist';

const LOCAL_LISTINGS_KEY = 'campus-bazzar-local-listings';

const readLocalListings = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_LISTINGS_KEY) || '[]');
  } catch {
    return [];
  }
};

const getPrimaryImage = (listing) => {
  const firstImage = listing?.images?.[0] || listing?.image;
  if (typeof firstImage === 'string') return firstImage;
  return firstImage?.url || 'https://via.placeholder.com/640x820?text=Campus+Bazzar';
};

const normalizeProfileListing = (listing) => ({
  id: listing?._id || listing?.id,
  title: listing?.title || listing?.bookId?.title || 'Untitled book',
  description: listing?.description || listing?.bookId?.description || 'No description available.',
  image: getPrimaryImage(listing),
  price: Number(listing?.buyerPrice ?? listing?.price ?? listing?.mrp ?? 0),
  originalPrice: Number(listing?.mrp ?? listing?.originalPrice ?? listing?.price ?? 0),
  condition: listing?.condition || 'New',
  genre: listing?.categoryId?.name || listing?.genre || 'Uncategorized',
  status: listing?.status || 'active',
  sellerEmail: listing?.sellerId?.email || listing?.sellerEmail || listing?.contactDetails || '',
  sellerPhone: listing?.sellerId?.phone || listing?.sellerPhone || listing?.contactDetails || '',
  sellerId: typeof listing?.sellerId === 'string' ? listing?.sellerId : listing?.sellerId?._id || listing?.sellerId?.id,
  source: listing?.source || 'api',
});

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const orders = useOrderStore((s) => s.orders);
  const [activeTab, setActiveTab] = useState('orders');
  const [editing, setEditing] = useState(false);
  const [allListings, setAllListings] = useState([]);
  const [localListings, setLocalListings] = useState(() => readLocalListings());
  const [wishlistItems, setWishlistItems] = useState(() => readWishlist());

  const displayUser = isAuthenticated ? user : {
    name: 'Minesh Patel',
    email: 'minesh.patel@university.edu',
    college: 'Gujarat Technological University',
    phone: '+91 98765 43210',
    role: 'user',
    joinedDate: 'March 2026',
  };

  const [profile, setProfile] = useState({
    name: displayUser.name || 'Minesh Patel',
    email: displayUser.email || 'minesh.patel@university.edu',
    phone: displayUser.phone || '+91 98765 43210',
    college: displayUser.college || 'Gujarat Technological University',
    bio: 'CS sophomore · looking for 4th sem books · trading since 2025',
  });

  const handleSave = () => setEditing(false);

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  const inputStyle = {
    width: '100%', padding: '0.7rem 1rem',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none',
    boxSizing: 'border-box',
  };

  const tabStyle = (active) => ({
    padding: '0.6rem 1.5rem', borderRadius: '10px', border: 'none',
    fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
    background: active ? 'rgba(123,47,255,0.2)' : 'transparent',
    color: active ? '#fff' : '#606080',
    borderBottom: active ? '2px solid var(--color-violet)' : '2px solid transparent',
  });

  const statusColor = { Confirmed: '#00f5ff', Shipped: '#a78bfa', Delivered: '#34d399' };

  useEffect(() => {
    const loadListings = async () => {
      try {
        const response = await listingApi.getAll();
        setAllListings((unwrapData(response) || []).map(normalizeProfileListing));
      } catch {
        setAllListings([]);
      }
    };

    loadListings();
  }, []);

  useEffect(() => {
    const syncStorage = () => {
      setLocalListings(readLocalListings());
      setWishlistItems(readWishlist());
    };

    window.addEventListener('storage', syncStorage);
    window.addEventListener(WISHLIST_UPDATED_EVENT, syncStorage);
    return () => {
      window.removeEventListener('storage', syncStorage);
      window.removeEventListener(WISHLIST_UPDATED_EVENT, syncStorage);
    };
  }, []);

  const myListings = useMemo(() => {
    const myId = user?._id || user?.id;
    const myEmail = (user?.email || '').toLowerCase();
    const myPhone = String(user?.phone || '').trim();

    const apiOwned = allListings.filter((listing) => {
      const sellerEmail = String(listing?.sellerEmail || '').toLowerCase();
      const sellerPhone = String(listing?.sellerPhone || '').trim();
      if (myId && String(listing?.sellerId) === String(myId)) return true;
      if (myEmail && sellerEmail && sellerEmail === myEmail) return true;
      if (myPhone && sellerPhone && sellerPhone === myPhone) return true;
      return false;
    });

    const localOwned = localListings.map(normalizeProfileListing).filter((listing) => {
      const sellerEmail = String(listing?.sellerEmail || '').toLowerCase();
      const sellerPhone = String(listing?.sellerPhone || '').trim();
      if (myEmail && sellerEmail && sellerEmail === myEmail) return true;
      if (myPhone && sellerPhone && sellerPhone === myPhone) return true;
      return true;
    });

    const merged = [...localOwned, ...apiOwned];
    const seen = new Set();
    return merged.filter((listing) => {
      const key = String(listing.id || '');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allListings, localListings, user]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="aurora-bg">
        <div className="aurora-blob cyan" />
        <div className="aurora-blob violet" />
        <div className="aurora-blob pink" />
      </div>
      <Navbar />

      <div className="container" style={{ paddingTop: '6.5rem', paddingBottom: '4rem', position: 'relative', zIndex: 10 }}>

        {/* Top banner with profile info */}
        <div className="glass" style={{ borderRadius: '24px', padding: '2.5rem 3rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          {/* Avatar Area */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '30px', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--color-violet), var(--color-pink))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', fontWeight: 900, color: '#fff',
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
              transform: 'rotate(-3deg)'
            }}>
              {profile.name.charAt(0)}
            </div>
            <div style={{
              position: 'absolute', bottom: '-5px', right: '-5px',
              width: '24px', height: '24px', borderRadius: '50%', background: '#10b981',
              border: '4px solid var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'
            }}>✅</div>
          </div>

          {/* Details */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>{profile.name}</h1>
              <span style={{
                padding: '0.2rem 0.75rem', borderRadius: '50px', fontSize: '0.7rem',
                fontWeight: 800, background: 'rgba(6,182,212,0.1)', color: 'var(--color-cyan)',
                border: '1px solid rgba(6,182,212,0.2)', textTransform: 'uppercase', letterSpacing: '1px'
              }}>Verified Student</span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ opacity: 0.5 }}>📧</span> {profile.email}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ opacity: 0.5 }}>🏫</span> {profile.college}
              </p>
            </div>
          </div>

          {/* Quick stats grid */}
          <div style={{ display: 'flex', gap: '3rem', paddingLeft: '3rem', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', margin: 0 }}>{orders.length}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.2rem 0 0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Orders</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', margin: 0 }}>{myListings.length}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.2rem 0 0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Listings</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-cyan)', margin: 0 }}>₹{totalSpent}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.2rem 0 0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Spent</p>
            </div>
          </div>
        </div>

        {/* Dash Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass" style={{ borderRadius: '24px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Details</h3>
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  className="interactive-card"
                  style={{
                    padding: '0.4rem 1rem', borderRadius: '10px', border: editing ? '1px solid var(--color-cyan)' : '1px solid rgba(255,255,255,0.08)',
                    background: editing ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.04)',
                    color: editing ? 'var(--color-cyan)' : 'var(--text-dim)', fontSize: '0.75rem',
                    fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase'
                  }}
                >
                  {editing ? 'Save' : 'Edit'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { label: 'Name', key: 'name' },
                  { label: 'Email', key: 'email' },
                  { label: 'Phone', key: 'phone' },
                  { label: 'College', key: 'college' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '0.4rem' }}>{label}</p>
                    {editing ? (
                      <input value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} className="form-input" style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }} />
                    ) : (
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, fontWeight: 500 }}>{profile[key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass" style={{ borderRadius: '24px', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Shortcuts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { to: '/marketplace', icon: '📚', label: 'Marketplace' },
                  { to: '/sell', icon: '💎', label: 'Sell a Book' },
                  { to: '/cart', icon: '🛒', label: 'Shopping Cart' },
                ].map((link) => (
                  <Link key={link.to} to={link.to} className="interactive-card" style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.25rem',
                    borderRadius: '16px', textDecoration: 'none', color: 'var(--text-dim)',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.03)',
                    fontSize: '0.9rem', fontWeight: 600
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>{link.icon}</span> {link.label}
                  </Link>
                ))}

                <button
                  type="button"
                  className="interactive-card"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>

                <button
                  type="button"
                  className="interactive-card"
                  onClick={() => {
                    logout();
                    navigate('/auth/phone');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '16px',
                    border: '1px solid #991b1b',
                    background: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
                    color: '#fff5f5',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Nav Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.35rem', borderRadius: '14px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.04)' }}>
              <button onClick={() => setActiveTab('orders')} style={{
                ...tabStyle(activeTab === 'orders'),
                background: activeTab === 'orders' ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none', borderBottom: 'none', borderRadius: '10px', padding: '0.6rem 1.5rem', fontSize: '0.85rem'
              }}>Purchases</button>
              <button onClick={() => setActiveTab('listings')} style={{
                ...tabStyle(activeTab === 'listings'),
                background: activeTab === 'listings' ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none', borderBottom: 'none', borderRadius: '10px', padding: '0.6rem 1.5rem', fontSize: '0.85rem'
              }}>Listings</button>
              <button onClick={() => setActiveTab('activity')} style={{
                ...tabStyle(activeTab === 'activity'),
                background: activeTab === 'activity' ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none', borderBottom: 'none', borderRadius: '10px', padding: '0.6rem 1.5rem', fontSize: '0.85rem'
              }}>Activity</button>
              <button onClick={() => setActiveTab('wishlist')} style={{
                ...tabStyle(activeTab === 'wishlist'),
                background: activeTab === 'wishlist' ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none', borderBottom: 'none', borderRadius: '10px', padding: '0.6rem 1.5rem', fontSize: '0.85rem'
              }}>Wishlist</button>
            </div>

            {/* List area */}
            <div style={{ minHeight: '400px' }}>
              {activeTab === 'orders' && (
                orders.length === 0 ? (
                  <div className="glass" style={{ borderRadius: '24px', padding: '6rem 2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', opacity: 0.5 }}>📦</div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your collection is empty</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Explore the marketplace to find your next great read.</p>
                    <Link to="/marketplace" className="btn-primary">Browse Marketplace</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {orders.map((order) => (
                      <div key={order.id} className="glass" style={{ borderRadius: '20px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ display: 'flex', gap: '2rem' }}>
                            <div>
                              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Order ID</p>
                              <p style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '2px', color: 'var(--color-cyan)' }}>#{order.id.toString().slice(-6)}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Date</p>
                              <p style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Value</p>
                              <p style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '2px' }}>₹{order.total}</p>
                            </div>
                          </div>
                          <span style={{
                            padding: '0.3rem 0.85rem', borderRadius: '50px',
                            background: `${statusColor[order.status]}12`, border: `1px solid ${statusColor[order.status]}30`,
                            color: statusColor[order.status], fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase'
                          }}>{order.status}</span>
                        </div>

                        {order.items.map((item) => (
                          <div key={item.id} style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <img src={item.image} alt={item.title} style={{ width: '48px', height: '64px', objectFit: 'cover', borderRadius: '8px' }} />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{item.title}</p>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.author} · Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'listings' && (
                myListings.length > 0 ? (
                  <div className="marketplace-grid">
                    {myListings.map((listing) => (
                      <article
                        key={listing.id}
                        className="marketplace-card glass"
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/marketplace/books/${encodeURIComponent(listing.id)}`, { state: { book: listing } })}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            navigate(`/marketplace/books/${encodeURIComponent(listing.id)}`, { state: { book: listing } });
                          }
                        }}
                      >
                        <div className="marketplace-card-image-wrap">
                          <img className="marketplace-card-image" src={listing.image} alt={listing.title} />
                          <span className="marketplace-card-chip">{listing.genre}</span>
                        </div>
                        <div className="marketplace-card-body">
                          <div className="marketplace-card-topline">
                            <h3>{listing.title}</h3>
                            <span className="marketplace-condition">{listing.condition}</span>
                          </div>
                          <p className="marketplace-description">{listing.description}</p>
                          <div className="marketplace-card-footer">
                            <div>
                              <span className="marketplace-price">₹{listing.price}</span>
                              {listing.originalPrice > listing.price ? <span className="marketplace-original-price">₹{listing.originalPrice}</span> : null}
                            </div>
                            <span className="marketplace-card-action">View details</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="glass" style={{ borderRadius: '24px', padding: '6rem 2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', opacity: 0.5 }}>📖</div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>No listings created</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Turn your old books into cash today.</p>
                    <Link to="/sell" className="btn-primary">Start Selling</Link>
                  </div>
                )
              )}

              {activeTab === 'activity' && (
                <div className="glass" style={{ borderRadius: '24px', padding: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <div key={order.id} style={{ display: 'flex', gap: '1.25rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🛍️</div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>
                              Purchased <strong>{order.items.length} book{order.items.length > 1 ? 's' : ''}</strong> from the campus market
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · Transaction ID: {order.id.toString().slice(-8)}
                            </p>
                          </div>
                        </div>
                      )).reverse()
                    ) : (
                      <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No recent activity to show.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'wishlist' && (
                wishlistItems.length > 0 ? (
                  <div className="marketplace-grid">
                    {wishlistItems.map((item) => (
                      <article
                        key={item.id}
                        className="marketplace-card glass"
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/marketplace/books/${encodeURIComponent(item.id)}`, { state: { book: item } })}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            navigate(`/marketplace/books/${encodeURIComponent(item.id)}`, { state: { book: item } });
                          }
                        }}
                      >
                        <div className="marketplace-card-image-wrap">
                          <img className="marketplace-card-image" src={item.image} alt={item.title} />
                          <span className="marketplace-card-chip">{item.genre}</span>
                        </div>
                        <div className="marketplace-card-body">
                          <div className="marketplace-card-topline">
                            <h3>{item.title}</h3>
                            <span className="marketplace-condition">{item.condition}</span>
                          </div>
                          <p className="marketplace-description">{item.description}</p>
                          <div className="marketplace-card-footer">
                            <div>
                              <span className="marketplace-price">₹{item.price}</span>
                              {item.originalPrice > item.price ? <span className="marketplace-original-price">₹{item.originalPrice}</span> : null}
                            </div>
                            <span className="marketplace-card-action">Saved</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="glass" style={{ borderRadius: '24px', padding: '5rem 2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3.1rem', marginBottom: '1rem', opacity: 0.5 }}>❤️</div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>Wishlist is empty</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Save books from marketplace to revisit them quickly.</p>
                    <Link to="/marketplace" className="btn-primary">Browse books</Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
