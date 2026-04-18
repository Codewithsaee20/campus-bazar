import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockBooks, categories, conditions } from '../data/mockBooks';
import { useCartStore } from '../store/useCartStore';
import Navbar from '../components/Navbar';

const MarketplacePage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [condition, setCondition] = useState('All');
  const [toast, setToast] = useState('');
  const addToCart = useCartStore((s) => s.addToCart);
  const cartItems = useCartStore((s) => s.items);

  const filtered = mockBooks.filter((b) => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || b.category === category;
    const matchCond = condition === 'All' || b.condition === condition;
    return matchSearch && matchCat && matchCond;
  });

  const handleAdd = (book) => {
    addToCart(book);
    setToast(`"${book.title}" added to cart!`);
    setTimeout(() => setToast(''), 2500);
  };

  const isInCart = (id) => cartItems.some((item) => item.id === id);

  const conditionColor = (c) => {
    if (c === 'Like New') return '#00f5ff';
    if (c === 'Good') return '#7b2fff';
    return '#ff2d78';
  };

  const pillStyle = (active) => ({
    padding: '0.5rem 1.25rem',
    borderRadius: '50px',
    border: active ? '1px solid var(--color-cyan)' : '1px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.03)',
    color: active ? '#00f5ff' : '#a0a0c0',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="aurora-bg">
        <div className="aurora-blob cyan" />
        <div className="aurora-blob violet" />
        <div className="aurora-blob pink" />
      </div>
      <Navbar />

      <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>
            Campus <span className="text-gradient">Marketplace</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', maxWidth: '600px' }}>
            The exclusive hub for student-to-student trading. Find your next textbook at half the price.
          </p>
        </div>

        {/* Search & Actions Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', marginBottom: '2.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by title, author, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '3rem' }}
            />
          </div>
          <Link to="/sell" className="btn-primary" style={{ height: '48px', display: 'flex', alignItems: 'center' }}>
            + List a Book
          </Link>
          <Link to="/cart" style={{ 
            position: 'relative', 
            height: '48px',
            display: 'flex', 
            alignItems: 'center',
            padding: '0 1.5rem', 
            borderRadius: '12px', 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid var(--glass-border)', 
            color: '#fff', 
            fontWeight: 700, 
            textDecoration: 'none',
            transition: 'all 0.2s'
          }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}>
            🛒 Cart
            {cartItems.length > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--color-pink)', color: '#fff', borderRadius: '50%', minWidth: '20px', height: '20px', padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, boxShadow: '0 0 10px rgba(236,72,153,0.4)' }}>
                {cartItems.length}
              </span>
            )}
          </Link>
        </div>

        {/* Filter Section */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '18px', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', width: '90px' }}>Category</span>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {categories.map((c) => (
                <button key={c} onClick={() => setCategory(c)} style={pillStyle(category === c)}>{c}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', width: '90px' }}>Condition</span>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {conditions.map((c) => (
                <button key={c} onClick={() => setCondition(c)} style={pillStyle(condition === c)}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            Showing <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{filtered.length}</span> results found in your campus
          </p>
        </div>

        {/* Book Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem',
        }}>
          {filtered.map((book) => (
            <div
              key={book.id}
              className="glass interactive-card"
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Image Container */}
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <img
                  src={book.image}
                  alt={book.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                />
                <div style={{
                  position: 'absolute', top: '12px', left: '12px',
                  background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
                  padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase'
                }}>
                  {book.category}
                </div>
                <div style={{
                  position: 'absolute', bottom: '12px', right: '12px',
                  background: 'rgba(3, 3, 11, 0.8)', backdropFilter: 'blur(8px)',
                  padding: '4px 12px', borderRadius: '50px',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: conditionColor(book.condition) }} />
                  <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>{book.condition}</span>
                </div>
              </div>

              {/* Info Content */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem', color: '#fff' }}>{book.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>by {book.author}</p>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5, flex: 1 }}>
                  {book.description.length > 90 ? book.description.substring(0, 90) + '...' : book.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-cyan)' }}>₹{book.price}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '0.6rem' }}>₹{book.originalPrice}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAdd(book); }}
                    disabled={isInCart(book.id)}
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '12px',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: isInCart(book.id) ? 'default' : 'pointer',
                      background: isInCart(book.id) ? 'rgba(6,182,212,0.1)' : 'var(--color-bg)',
                      boxShadow: isInCart(book.id) ? 'none' : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                      color: isInCart(book.id) ? 'var(--color-cyan)' : '#fff',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { if(!isInCart(book.id)) e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { if(!isInCart(book.id)) e.target.style.background = 'var(--color-bg)'; }}
                  >
                    {isInCart(book.id) ? '✓ In Cart' : 'Add to Cart'}
                  </button>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', filter: 'grayscale(1)' }}>📍</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{book.college}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{book.seller.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '8rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.5 }}>📚</div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>No results match your search</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>Try clearing your filters or searching for something more general.</p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100,
          background: 'rgba(0,245,255,0.15)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0,245,255,0.3)', borderRadius: '14px',
          padding: '1rem 1.5rem', color: '#00f5ff', fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.3s ease',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
