import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section id="cta" style={{ padding: '10rem 0', position: 'relative', overflow: 'hidden' }}>
      {/* Background radial gradient pulsing */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          height: '80vw',
          background: 'radial-gradient(circle, rgba(255, 45, 120, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      
      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass"
          style={{
            padding: '5rem 2rem',
            borderRadius: '32px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 0 50px rgba(123, 47, 255, 0.1)'
          }}
        >
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            Ready to <span className="text-gradient">Dominate</span> Your Semesters?
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#a0a0c0', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
            Join thousands of trusted students. Register with your college email, verify your OTP, and start trading instantly.
          </p>
          <Link to="/login" className="btn-primary" style={{ padding: '1.25rem 4rem', fontSize: '1.25rem', textDecoration: 'none' }}>
            Login to Campus Bazar
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
