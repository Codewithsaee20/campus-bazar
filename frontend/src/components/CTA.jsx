import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, LogIn, Search } from 'lucide-react';

const CTA = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="cta" className="landing-section landing-cta-section">
      <div className="container">
        <motion.div
          className="landing-cta-card glass"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.75 }}
        >
          <div className="landing-cta-copy">
            <div className="landing-section-eyebrow">Get started</div>
            <h2>Start trading books with a cleaner campus marketplace.</h2>
            <p>
              Log in to list your own books or explore the marketplace to find the next book you need.
            </p>
          </div>

          <div className="landing-cta-actions">
            <Link to="/login" className="btn-primary landing-hero-button">
              <LogIn size={16} />
              Login
            </Link>
            <a href="#featured-books" className="landing-secondary-button">
              <Search size={16} />
              Explore
              <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
