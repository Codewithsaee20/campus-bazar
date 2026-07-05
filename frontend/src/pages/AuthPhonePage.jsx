import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../utils/campusApi';

const AuthPhonePage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Enter your email to continue.');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await authApi.sendOtp(email.trim());
      setMessage('OTP sent successfully. Redirecting to verification...');
      navigate('/auth/verify-otp', {
        state: { identifier: email.trim() },
      });
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Could not send OTP right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '1rem' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '480px', padding: '2rem', borderRadius: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>Login with OTP</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
          Enter your email and we will send a 6-digit OTP.
        </p>

        <form onSubmit={handleSendOtp} style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ fontWeight: 600 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@gmail.com"
            className="form-input"
            required
          />

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        {message && <p style={{ marginTop: '1rem', color: '#0ea5e9' }}>{message}</p>}
        {error && <p style={{ marginTop: '1rem', color: '#ef4444' }}>{error}</p>}
      </div>
    </div>
  );
};

export default AuthPhonePage;
