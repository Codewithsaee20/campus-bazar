import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../utils/api';
import ParticleField from '../components/ParticleField';

const SignUpPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', college: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', formData);
      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);
      navigate('/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Backend not connected. Use "Demo Mode" below to explore the app.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignUp = () => {
    setAuth(
      { id: 'demo-001', name: 'Minesh Patel', email: 'minesh.patel@gtu.edu', college: 'Gujarat Technological University', role: 'user' },
      'demo-token-123'
    );
    navigate('/marketplace');
  };

  const inputStyle = {
    width: '100%',
    padding: '0.9rem 1.25rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#c0c0d8',
    marginBottom: '0.5rem',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1rem',
      position: 'relative',
    }}>
      <div className="aurora-bg">
        <div className="aurora-blob cyan" />
        <div className="aurora-blob violet" />
        <div className="aurora-blob pink" />
      </div>
      <ParticleField />

      <div className="glass" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '3.5rem 3rem',
        borderRadius: '32px',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), var(--glass-shine)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--color-pink), var(--color-violet))',
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            boxShadow: '0 10px 20px rgba(236, 72, 153, 0.3)',
            transform: 'rotate(5deg)'
          }}>
            🎓
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-1.5px', color: '#fff' }}>Join the Squad</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.05rem', fontWeight: 500 }}>Create your profile to start trading</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(236, 72, 153, 0.08)',
            border: '1px solid rgba(236, 72, 153, 0.2)',
            color: '#f472b6',
            padding: '0.85rem 1.25rem',
            borderRadius: '16px',
            marginBottom: '2rem',
            fontSize: '0.85rem',
            textAlign: 'center',
            fontWeight: 600,
            lineHeight: 1.4
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Minesh Patel"
                className="form-input"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@gtu.edu"
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '1.2px' }}>College / University</label>
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              required
              placeholder="Ex: Gujarat Technological University"
              className="form-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Secure Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '1.1rem',
              fontSize: '1.05rem',
              fontWeight: 800,
              marginTop: '0.5rem',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Creating Profile...' : 'Begin Journey'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', margin: '2.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Demo Mode */}
        <button
          onClick={handleDemoSignUp}
          className="interactive-card"
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '0.95rem',
            fontWeight: 800,
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            color: 'var(--color-cyan)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.borderColor = 'rgba(6,182,212,0.3)'; }}
          onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          🚀 Continue in Demo Mode
        </button>

        <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-dim)', fontSize: '0.95rem', fontWeight: 500 }}>
          Already part of the campus?{' '}
          <Link to="/login" style={{ color: 'var(--color-pink)', fontWeight: 800, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
