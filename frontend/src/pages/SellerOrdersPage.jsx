import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { orderApi, unwrapData } from '../utils/campusApi';

const PENDING_STATUSES = new Set(['pending', 'requested', 'created', 'initiated']);

const SellerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState({ id: null, type: null });

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderApi.getMySelling();
      setOrders(unwrapData(response) || []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load selling orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAccept = async (orderId) => {
    try {
      setActionState({ id: orderId, type: 'accept' });
      await orderApi.accept(orderId);
      await load();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Accept action is not available in current backend.');
    } finally {
      setActionState({ id: null, type: null });
    }
  };

  const handleDeny = async (orderId) => {
    try {
      setActionState({ id: orderId, type: 'deny' });
      await orderApi.cancel(orderId, 'Denied by seller.');
      await load();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to deny order.');
    } finally {
      setActionState({ id: null, type: null });
    }
  };

  const pendingOrders = orders.filter((order) => PENDING_STATUSES.has(String(order?.status || '').toLowerCase()));
  const confirmedOrders = orders.filter((order) => String(order?.status || '').toLowerCase() === 'accepted');
  const deniedOrders = orders.filter((order) => String(order?.status || '').toLowerCase() === 'cancelled');

  return (
    <div className="order-requests-page" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />
      <div className="container order-requests-shell" style={{ paddingTop: '8rem', paddingBottom: '2.2rem' }}>
        <div className="order-requests-head">
          <div>
            <p className="marketplace-drawer-kicker">Notification Panel</p>
            <h1 style={{ marginBottom: '0.4rem' }}>Order Requests</h1>
            <p style={{ color: 'var(--text-dim)' }}>Review incoming order requests and confirm or deny them instantly.</p>
          </div>
        </div>

        <section className="order-requests-stats">
          <div className="glass order-stat-card">
            <span>Pending Confirmation</span>
            <strong>{pendingOrders.length}</strong>
          </div>
          <div className="glass order-stat-card">
            <span>Confirmed</span>
            <strong>{confirmedOrders.length}</strong>
          </div>
          <div className="glass order-stat-card">
            <span>Denied</span>
            <strong>{deniedOrders.length}</strong>
          </div>
        </section>

        {loading && <p>Loading seller orders...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        <div className="order-requests-list" style={{ display: 'grid', gap: '0.9rem' }}>
          {orders.map((order) => {
            const status = String(order?.status || '').toLowerCase();
            const canRespond = PENDING_STATUSES.has(status);

            return (
              <article key={order._id || order.id} className="glass order-request-card" style={{ borderRadius: '14px', padding: '1rem' }}>
                <div className="order-request-topline">
                  <h3 style={{ marginBottom: '0.45rem' }}>{order?.listingSnapShot?.title || order?.listingId?.title || 'Listing'}</h3>
                  <span className={`order-status-chip ${status}`}>{order.status}</span>
                </div>

                <p>Buyer: {order?.buyerId?.name || order?.buyerId?.email || 'N/A'}</p>
                <p>Price: ₹{order?.totalPrice || order?.listingSnapShot?.price || order?.listingId?.buyerPrice || 0}</p>

                <div style={{ display: 'flex', gap: '0.55rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                  {canRespond ? (
                    <>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => handleAccept(order._id)}
                        disabled={actionState.id === order._id}
                      >
                        {actionState.id === order._id && actionState.type === 'accept' ? 'Confirming...' : 'Confirm Order'}
                      </button>

                      <button
                        type="button"
                        className="order-deny-btn"
                        onClick={() => handleDeny(order._id)}
                        disabled={actionState.id === order._id}
                      >
                        {actionState.id === order._id && actionState.type === 'deny' ? 'Denying...' : 'Deny Order'}
                      </button>
                    </>
                  ) : null}

                  <Link to={`/orders/${order._id}/handoff`} className="btn-primary" style={{ textDecoration: 'none' }}>
                    OTP Screen
                  </Link>
                </div>
              </article>
            );
          })}

          {!loading && orders.length === 0 ? (
            <div className="glass" style={{ borderRadius: '14px', padding: '1.2rem' }}>
              <h3 style={{ marginBottom: '0.4rem' }}>No order requests yet</h3>
              <p style={{ color: 'var(--text-dim)' }}>New buyer order confirmations will appear here.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SellerOrdersPage;
