import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockBooks } from '../data/mockBooks';

const Hero = () => {
  const spotlightBooks = mockBooks.slice(0, 3);

  return (
    <section className="landing-section landing-hero-section">
      <div className="container">
        <div className="landing-hero-grid">
          <motion.div
            className="landing-hero-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="landing-section-eyebrow">
              <Sparkles size={16} />
              Campus marketplace for verified students
            </div>

            <h1>Campus Bazaar</h1>
            <p className="landing-hero-tagline">
              Buy and sell books with a clean student marketplace built for fast listings, fair prices, and simple discovery.
            </p>
            <p className="landing-hero-subcopy">
              Browse featured books, compare conditions instantly, and move from login to listing in a few smooth steps.
            </p>

            <div className="landing-hero-actions">
              <Link to="/login" className="btn-primary landing-hero-button">
                <Users size={16} />
                Login
              </Link>
              <a href="#featured-books" className="landing-secondary-button">
                <BookOpen size={16} />
                Explore
                <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="landing-hero-showcase glass"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut', delay: 0.1 }}
          >
            <div className="landing-hero-showcase-header">
              <span>Live campus picks</span>
              <strong>Featured now</strong>
            </div>
            <div className="landing-hero-book-stack">
              {spotlightBooks.map((book, index) => (
                <div key={book.id} className="landing-hero-book-card" style={{ '--offset': index }}>
                  <img src={book.image} alt={book.title} />
                  <div>
                    <strong>{book.title}</strong>
                    <span>{book.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
