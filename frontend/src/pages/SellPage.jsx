import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const SellPage = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: '', author: '', price: '', originalPrice: '', condition: 'Like New', category: 'Books', description: '', college: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => navigate('/marketplace'), 2500);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.9rem 1.25rem',
    background: 'rgba(122, 74, 35, 0.04)',
    border: '1px solid var(--glass-border)',
    borderRadius: '14px',
    color: 'var(--text-main)',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-dim)',
    marginBottom: '0.5rem',
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
        <div className="aurora-bg"><div className="aurora-blob cyan" /><div className="aurora-blob violet" /><div className="aurora-blob pink" /></div>
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>📖</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.75rem' }}>
            Book <span className="text-gradient">Listed!</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Your book is now visible to campus buyers. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="aurora-bg"><div className="aurora-blob cyan" /><div className="aurora-blob violet" /><div className="aurora-blob pink" /></div>
      <Navbar />

      <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem', position: 'relative', zIndex: 10, maxWidth: '700px' }}>
        <Link to="/marketplace" style={{ color: 'var(--color-violet)', textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginBottom: '1.5rem' }}>
          ← Back to Marketplace
        </Link>

        <div className="glass" style={{ borderRadius: '24px', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--color-violet), var(--color-pink))',
              marginBottom: '1.25rem', fontSize: '1.75rem',
            }}>📚</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px' }}>Sell a Book</h1>
            <p style={{ color: 'var(--text-dim)' }}>List your book for other students to buy</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Book Title</label>
                <input name="title" value={form.title} onChange={handleChange} required placeholder="Ex: Engineering Mathematics" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(200,169,106,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'var(--glass-border)')} />
              </div>
              <div>
                <label style={labelStyle}>Author</label>
                <input name="author" value={form.author} onChange={handleChange} required placeholder="Ex: B.S. Grewal" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(200,169,106,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'var(--glass-border)')} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Your Price (₹)</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} required placeholder="320" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(122,74,35,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'var(--glass-border)')} />
              </div>
              <div>
                <label style={labelStyle}>Original Price (₹)</label>
                <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} required placeholder="650" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(122,74,35,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'var(--glass-border)')} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Condition</label>
                <select name="condition" value={form.condition} onChange={handleChange} style={selectStyle}>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select name="category" value={form.category} onChange={handleChange} style={selectStyle}>
                  <option value="Books">Books</option>
                  <option value="Notes">Notes</option>
                  <option value="Stationery">Stationery</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>College Campus</label>
              <input name="college" value={form.college} onChange={handleChange} required placeholder="Ex: IIT Bombay" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(200,169,106,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'var(--glass-border)')} />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} required placeholder="Describe the condition, any markings, etc."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(185,141,75,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'var(--glass-border)')} />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 700, marginTop: '0.5rem' }}>
              List My Book 🚀
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellPage;
