import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import ThreeScene from './ThreeScene';

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 400]);

  return (
    <section 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        paddingTop: '80px',
        position: 'relative',
      }}
    >
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          
          <motion.div 
            style={{ y: y1 }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.5, duration: 1 }}
              style={{ display: 'inline-block', padding: '0.25rem 1rem', background: 'rgba(0, 245, 255, 0.1)', border: '1px solid rgba(0, 245, 255, 0.3)', borderRadius: '50px', color: '#00f5ff', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.875rem' }}
            >
              🔒 Closed-Loop Campus Network
            </motion.div>
            <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-2px' }}>
              Exclusive & <br/>
              <span className="text-gradient">Verified</span> <br/>
              Trading
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#a0a0c0', marginBottom: '2.5rem', maxWidth: '500px' }}>
              The ultimate closed-loop marketplace restricted to your college. Buy and sell secondhand books, past papers, and premium notes safely with verified peers.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/login" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', textDecoration: 'none' }}>
                Unified Login
              </Link>
            </div>
          </motion.div>

          <motion.div 
            style={{ y: y2 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          >
            <ThreeScene />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
