import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { orderApi, unwrapData } from '../utils/campusApi';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await orderApi.getMyBuying();
        setOrders(unwrapData(response) || []);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || 'Failed to load your orders.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const rows = useMemo(
    () =>
      orders.map((order) => {
        const expiresAt = order?.otpExpiresAt ? new Date(order.otpExpiresAt).getTime() : null;
        const countdown = expiresAt ? Math.max(0, Math.floor((expiresAt - now) / 1000)) : null;
        return {
          order,
          countdown,
        };
      }),
    [orders, now]
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '8rem', paddingBottom: '2rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>My Orders (Buyer)</h1>

        {loading && <p>Loading orders...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        <div style={{ display: 'grid', gap: '0.9rem' }}>
          {rows.map(({ order, countdown }) => (
            <div key={order._id || order.id} className="glass" style={{ borderRadius: '12px', padding: '1rem' }}>
              <h3 style={{ marginBottom: '0.4rem' }}>{order?.listingSnapShot?.title || order?.listingId?.title || 'Listing'}</h3>
              <p>Status: <strong>{order.status}</strong></p>
              <p>Seller: {order?.sellerId?.name || order?.sellerId?.email || 'N/A'}</p>
              <p>Book: {order?.bookId || order?.listingId?.bookId || 'N/A'}</p>

              {countdown !== null && (
                <p>OTP Expires In: {countdown}s</p>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                <Link to={`/orders/${order._id}/handoff`} className="btn-primary" style={{ textDecoration: 'none' }}>
                  OTP Handoff
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
