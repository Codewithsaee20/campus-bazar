import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { orderApi, unwrapData } from '../utils/campusApi';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const [actionState, setActionState] = useState({ id: null, type: null });

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  useEffect(() => {
    load();
  }, []);

  const handleConfirmDelivery = async (orderId) => {
    try {
      setActionState({ id: orderId, type: 'confirm-delivery' });
      await orderApi.confirmDelivery(orderId);
      await load();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to confirm delivery.');
    } finally {
      setActionState({ id: null, type: null });
    }
  };

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
          {rows.map(({ order, countdown }) => {
            const status = String(order?.status || '').toLowerCase();
            const isPending = status === 'pending';
            const isAccepted = status === 'accepted';
            const isDeliveryMarked = status === 'delivery_marked';
            const isDeliveryConfirmed = status === 'delivery_confirmed';
            const isCompleted = status === 'completed';

            return (
              <div key={order._id || order.id} className="glass" style={{ borderRadius: '12px', padding: '1rem' }}>
                <h3 style={{ marginBottom: '0.4rem' }}>{order?.listingSnapShot?.title || order?.listingId?.title || 'Listing'}</h3>
                <p>Status: <strong>{order.status}</strong></p>
                <p>Seller: {order?.sellerId?.name || order?.sellerId?.email || 'N/A'}</p>
                <p>Book: {order?.bookId || order?.listingId?.bookId || 'N/A'}</p>
                <p>Price: ₹{order?.listingSnapShot?.price || 0}</p>

                {countdown !== null && isDeliveryConfirmed && (
                  <p style={{ color: '#f59e0b' }}>OTP Expires In: <strong>{countdown}s</strong></p>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                  {isPending && (
                    <span style={{ padding: '0.5rem 1rem', color: 'var(--text-dim)' }}>Waiting for seller to accept...</span>
                  )}
                  {isAccepted && (
                    <span style={{ padding: '0.5rem 1rem', color: 'var(--text-dim)' }}>Seller accepted. Waiting for delivery...</span>
                  )}
                  {isDeliveryMarked && (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleConfirmDelivery(order._id)}
                      disabled={actionState.id === order._id}
                    >
                      {actionState.id === order._id && actionState.type === 'confirm-delivery' ? 'Confirming...' : 'Confirm Delivery'}
                    </button>
                  )}
                  {isDeliveryConfirmed && (
                    <span style={{ padding: '0.5rem 1rem', color: '#f59e0b' }}>OTP sent to your phone. Tell it to the seller.</span>
                  )}
                  {isCompleted && (
                    <span style={{ padding: '0.5rem 1rem', color: '#10b981', fontWeight: 'bold' }}>✓ Order Completed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
