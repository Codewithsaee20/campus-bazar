import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { orderApi, unwrapData } from '../utils/campusApi';

const SellerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      await orderApi.accept(orderId);
      await load();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Accept action is not available in current backend.');
    }
  };

  const handleCancel = async (orderId) => {
    try {
      await orderApi.cancel(orderId, 'Cancelled by seller.');
      await load();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to cancel order.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '8rem', paddingBottom: '2rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Seller Orders</h1>

        {loading && <p>Loading seller orders...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        <div style={{ display: 'grid', gap: '0.9rem' }}>
          {orders.map((order) => (
            <div key={order._id || order.id} className="glass" style={{ borderRadius: '12px', padding: '1rem' }}>
              <h3 style={{ marginBottom: '0.4rem' }}>{order?.listingSnapShot?.title || order?.listingId?.title || 'Listing'}</h3>
              <p>Buyer: {order?.buyerId?.name || order?.buyerId?.email || 'N/A'}</p>
              <p>Status: <strong>{order.status}</strong></p>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.7rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn-primary" onClick={() => handleAccept(order._id)}>
                  Accept Order
                </button>
                <button type="button" onClick={() => handleCancel(order._id)} style={{ border: '1px solid rgba(239,68,68,0.45)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderRadius: '12px', padding: '0.55rem 0.9rem', cursor: 'pointer' }}>
                  Cancel Order
                </button>
                <Link to={`/orders/${order._id}/handoff`} className="btn-primary" style={{ textDecoration: 'none' }}>
                  OTP Screen
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerOrdersPage;
