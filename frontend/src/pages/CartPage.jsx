import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { orderApi } from '../utils/campusApi';
import Navbar from '../components/Navbar';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCartStore();
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState('');
  const [placeOrderMessage, setPlaceOrderMessage] = useState('');

  const total = getTotal();

  const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ''));

  const getListingId = (item) => {
    const candidate = item?.listingId || item?._id || item?.id;
    return typeof candidate === 'string' ? candidate : String(candidate || '');
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    setPlacingOrder(true);
    setPlaceOrderError('');
    setPlaceOrderMessage('');

    try {
      const liveItems = items.filter((item) => isMongoObjectId(getListingId(item)));
      const localItems = items.filter((item) => !isMongoObjectId(getListingId(item)));

      const results = await Promise.allSettled(
        liveItems.map((item) =>
          orderApi.create({ listingId: getListingId(item) }).then(() => getListingId(item))
        )
      );

      const successfulIds = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);

      const failedResults = results.filter((result) => result.status === 'rejected');

      successfulIds.forEach((id) => removeFromCart(id));

      if (localItems.length > 0) {
        placeOrder(
          localItems,
          localItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0)
        );

        localItems.forEach((item) => removeFromCart(item.id));
      }

      if (successfulIds.length > 0) {
        placeOrder(
          items.filter((item) => successfulIds.includes(getListingId(item))),
          items
            .filter((item) => successfulIds.includes(getListingId(item)))
            .reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0)
        );
      }

      if (failedResults.length > 0) {
        const firstErrorMessage = failedResults[0]?.reason?.response?.data?.message || 'Some items could not be ordered.';
        if (successfulIds.length > 0 || localItems.length > 0) {
          setPlaceOrderError(`${firstErrorMessage} ${successfulIds.length + localItems.length} order(s) were placed successfully.`);
        } else {
          setPlaceOrderError(firstErrorMessage);
        }
        return;
      }

      if (localItems.length > 0 && successfulIds.length === 0) {
        setPlaceOrderMessage('Order placed in demo mode. It is stored locally and visible in your profile/orders.');
      }

      clearCart();
      setOrderPlaced(true);
      setTimeout(() => {
        navigate('/orders/my');
      }, 1800);
    } catch (error) {
      setPlaceOrderError(error?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="cart-page">
        <div className="aurora-bg">
          <div className="aurora-blob cyan" />
          <div className="aurora-blob violet" />
          <div className="aurora-blob pink" />
        </div>
        <Navbar />
        <div className="container cart-shell" style={{ minHeight: '80vh', display: 'grid', placeItems: 'center' }}>
          <div className="glass" style={{ borderRadius: '26px', padding: '2.5rem 2rem', textAlign: 'center', maxWidth: '520px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.85rem' }}>🎉</div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 900, marginBottom: '0.65rem' }}>
            Order <span className="text-gradient">Confirmed!</span>
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.02rem' }}>
              Your order is placed. Redirecting to your orders...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="aurora-bg">
        <div className="aurora-blob cyan" />
        <div className="aurora-blob violet" />
        <div className="aurora-blob pink" />
      </div>
      <Navbar />

      <div className="container cart-shell">
        <div className="cart-header">
          <div>
            <h1>
              Your <span className="text-gradient">Cart</span>
            </h1>
            <p>
              You have <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{items.length} item{items.length !== 1 ? 's' : ''}</span> waiting for checkout
            </p>
          </div>
          <Link to="/marketplace" className="cart-back-link">
            Back to Marketplace
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="glass cart-empty">
            <div style={{ fontSize: '4.5rem', marginBottom: '0.8rem', opacity: 0.45 }}>🛒</div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 900, marginBottom: '0.55rem' }}>Your cart is empty</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0 auto 1.8rem', maxWidth: '420px' }}>
              Browse the marketplace to find the textbooks and college material you need.
            </p>
            <Link to="/marketplace" className="btn-primary" style={{ padding: '1rem 3rem' }}>
              Explore Marketplace
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => (
                <article key={item.id} className="glass cart-item">
                  <img src={item.image} alt={item.title} className="cart-item-image" />

                  <div>
                    <h3 className="cart-item-title">{item.title}</h3>
                    <p className="cart-item-meta">{item.author || item.sellerName || 'Campus Seller'}</p>

                    <div className="cart-item-controls">
                      <div className="cart-qty-group">
                        <button type="button" className="cart-qty-button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <strong>{item.quantity}</strong>
                      </div>

                      <button type="button" className="cart-remove-button" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </button>

                      <strong className="cart-item-price">{formatCurrency(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="glass cart-summary">
              <h2>Order Summary</h2>

              <div className="cart-summary-row">
                <span>Subtotal ({items.length} items)</span>
                <strong>{formatCurrency(total)}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Platform Fee</span>
                <strong>{formatCurrency(0)}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Delivery</span>
                <strong>Free</strong>
              </div>

              <div className="cart-summary-total">
                <span style={{ fontWeight: 800 }}>Total</span>
                <strong style={{ fontSize: '1.5rem' }}>{formatCurrency(total)}</strong>
              </div>

              <button type="button" onClick={handlePlaceOrder} disabled={placingOrder} className="btn-primary" style={{ width: '100%', marginTop: '1.15rem', padding: '0.95rem 1rem' }}>
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>

              {placeOrderError ? (
                <p style={{ marginTop: '0.7rem', color: '#ef4444', fontSize: '0.85rem', lineHeight: 1.45 }}>
                  {placeOrderError}
                </p>
              ) : null}

              {placeOrderMessage ? (
                <p style={{ marginTop: '0.7rem', color: '#16a34a', fontSize: '0.85rem', lineHeight: 1.45 }}>
                  {placeOrderMessage}
                </p>
              ) : null}

              <div className="cart-summary-actions">
                <Link to="/marketplace" className="cart-summary-link">Continue Shopping</Link>
                <button
                  type="button"
                  className="cart-summary-clear"
                  onClick={clearCart}
                >
                  Clear Cart
                </button>
              </div>

              <div style={{ marginTop: '1rem', color: 'var(--text-dim)', fontSize: '0.84rem', lineHeight: 1.6 }}>
                Pickup and handoff details will be shown in your orders after confirmation.
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
