import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import Navbar from '../components/Navbar';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCartStore();
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const total = getTotal();

  const handlePlaceOrder = () => {
    if (items.length === 0) return;
    placeOrder(items, total);
    clearCart();
    setOrderPlaced(true);
    setTimeout(() => {
      navigate('/profile');
    }, 2500);
  };

  if (orderPlaced) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
        <div className="aurora-bg">
          <div className="aurora-blob cyan" />
          <div className="aurora-blob violet" />
          <div className="aurora-blob pink" />
        </div>
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'pulse 1s ease infinite' }}>🎉</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.75rem' }}>
            Order <span className="text-gradient">Confirmed!</span>
          </h1>
          <p style={{ color: '#a0a0c0', fontSize: '1.1rem', marginBottom: '1rem' }}>Your books are on their way. Redirecting to profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="aurora-bg">
        <div className="aurora-blob cyan" />
        <div className="aurora-blob violet" />
        <div className="aurora-blob pink" />
      </div>
      <Navbar />

      <div className="container" style={{ paddingTop: '8rem', paddingBottom: '5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1 }}>
              Your <span className="text-gradient">Cart</span>
            </h1>
            <p style={{ color: 'var(--text-dim)', marginTop: '0.75rem', fontSize: '1.1rem' }}>
              You have <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{items.length} item{items.length !== 1 ? 's' : ''}</span> waiting for checkout
            </p>
          </div>
          <Link to="/marketplace" style={{ color: 'var(--color-cyan)', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ← Back to Shop
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="glass" style={{ borderRadius: '30px', padding: '8rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem', opacity: 0.3 }}>🛒</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.75rem' }}>Your cart is empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>Browse the marketplace to find the textbooks you need at affordable prices.</p>
            <Link to="/marketplace" className="btn-primary" style={{ padding: '1rem 3rem' }}>
              Explore Marketplace
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2.5rem', alignItems: 'start' }}>
            {/* Items list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {items.map((item) => (
                <div key={item.id} className="glass interactive-card" style={{ borderRadius: '24px', padding: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <div style={{ width: '100px', height: '130px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.4rem', color: '#fff' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>{item.author}</p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '4px' }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}>−</button>
                        <span style={{ fontWeight: 800, minWidth: '36px', textAlign: 'center', fontSize: '0.95rem' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}>+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'var(--color-pink)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0.7}>
                        Remove
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-cyan)' }}>₹{item.price * item.quantity}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>₹{item.price} / unit</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="glass" style={{ borderRadius: '28px', padding: '2.5rem', position: 'sticky', top: '8rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.5px' }}>Summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Subtotal ({items.length} items)</span>
                  <span style={{ fontWeight: 600 }}>₹{total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Platform Fee</span>
                  <span style={{ color: 'var(--color-cyan)', fontWeight: 800 }}>₹0.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Handling & Delivery</span>
                  <span style={{ color: 'var(--color-cyan)', fontWeight: 800 }}>Free</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>Total</span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>₹{total}</span>
              </div>

              <button onClick={handlePlaceOrder} className="btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', fontWeight: 800 }}>
                Complete Purchase ⚡
              </button>
              
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🏢</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Pickup at <strong>GTU Campus Center</strong></p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🤝</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Payment secure via <strong>CampusVault</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
