import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { orderApi, unwrapData } from '../utils/campusApi';

// Seller-only OTP entry screen. The buyer receives the OTP via email/phone
// and reads it out to the seller; the buyer never enters it in the app.
const OtpHandoffPage = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
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

  const secondsLeft = useMemo(() => {
    if (!order?.otpExpiresAt) return null;
    const expiresAt = new Date(order.otpExpiresAt).getTime();
    return Math.max(0, Math.floor((expiresAt - now) / 1000));
  }, [order, now]);

  const status = String(order?.status || '').toUpperCase();
  const canVerify = status === 'DELIVERY_CONFIRMED';

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
        <h1 style={{ marginBottom: '1rem' }}>OTP Verification</h1>

        <div className="glass" style={{ borderRadius: '12px', padding: '1rem' }}>
          <p>Order Status: <strong>{order?.status || 'N/A'}</strong></p>
          {secondsLeft !== null && canVerify && <p>OTP Expires In: {secondsLeft}s</p>}

          {canVerify ? (
            <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.6rem', maxWidth: '360px' }}>
              <input
                className="form-input"
                value={otpInput}
                onChange={(event) => setOtpInput(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter OTP from buyer"
                maxLength={6}
              />
              <button type="button" className="btn-primary" onClick={handleVerifyOtp}>Verify OTP</button>
            </div>
          ) : (
            <p style={{ marginTop: '0.75rem', color: 'var(--text-dim)' }}>
              OTP verification is only available after the buyer confirms delivery.
            </p>
          )}

          {message && <p style={{ marginTop: '0.8rem', color: 'var(--text-dim)' }}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default OtpHandoffPage;
