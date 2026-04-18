import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/useAuthStore';
import { orderApi, unwrapData } from '../utils/campusApi';

const OtpHandoffPage = () => {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);

  const [order, setOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [sellerOtp, setSellerOtp] = useState('');
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await orderApi.getById(id);
        setOrder(unwrapData(response));
      } catch (apiError) {
        setMessage(apiError?.response?.data?.message || 'Failed to load order handoff details.');
      }
    };

    load();
  }, [id]);

  const role = useMemo(() => {
    const userId = user?._id || user?.id;
    const sellerId = typeof order?.sellerId === 'string' ? order?.sellerId : order?.sellerId?._id;
    return userId && sellerId && userId === sellerId ? 'seller' : 'buyer';
  }, [order, user]);

  const secondsLeft = useMemo(() => {
    if (!order?.otpExpiresAt) return null;
    const expiresAt = new Date(order.otpExpiresAt).getTime();
    return Math.max(0, Math.floor((expiresAt - now) / 1000));
  }, [order, now]);

  const handleGenerateOtp = async () => {
    try {
      const response = await orderApi.generateOtp(id);
      const data = unwrapData(response);
      setSellerOtp(data?.otp || '');
      setMessage('OTP generated successfully. Share this with the buyer.');

      const refreshed = await orderApi.getById(id);
      setOrder(unwrapData(refreshed));
    } catch (apiError) {
      setMessage(apiError?.response?.data?.message || 'Failed to generate OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await orderApi.verifyOtp(id, otpInput);
      setMessage('OTP verified. Order marked as COMPLETED.');

      const refreshed = await orderApi.getById(id);
      setOrder(unwrapData(refreshed));
    } catch (apiError) {
      setMessage(apiError?.response?.data?.message || 'OTP verification failed.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '8rem', paddingBottom: '2rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>OTP Handoff</h1>

        <div className="glass" style={{ borderRadius: '12px', padding: '1rem' }}>
          <p>Order Status: <strong>{order?.status || 'N/A'}</strong></p>
          {secondsLeft !== null && <p>OTP Countdown: {secondsLeft}s</p>}

          {role === 'seller' ? (
            <div style={{ marginTop: '0.75rem' }}>
              <button type="button" className="btn-primary" onClick={handleGenerateOtp}>Generate OTP</button>
              {sellerOtp && <p style={{ marginTop: '0.6rem' }}>Seller OTP: <strong>{sellerOtp}</strong></p>}
            </div>
          ) : (
            <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.6rem', maxWidth: '360px' }}>
              <input className="form-input" value={otpInput} onChange={(event) => setOtpInput(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter OTP" maxLength={6} />
              <button type="button" className="btn-primary" onClick={handleVerifyOtp}>Verify OTP</button>
            </div>
          )}

          {message && <p style={{ marginTop: '0.8rem', color: 'var(--text-dim)' }}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default OtpHandoffPage;
