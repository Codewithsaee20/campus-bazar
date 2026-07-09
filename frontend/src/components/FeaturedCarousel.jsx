import React, { useEffect, useMemo, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { BadgeIndianRupee, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { mockBooks } from '../data/mockBooks';

const FEATURED_BOOKS = mockBooks.slice(0, 6);

const useVisibleCount = () => {
  const getCount = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1280) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const [count, setCount] = useState(getCount);

  useEffect(() => {
    const handleResize = () => setCount(getCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return count;
};

const FeaturedCarousel = () => {
  const prefersReducedMotion = useReducedMotion();
  const visibleCount = useVisibleCount();
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: false, margin: '-120px' });

  const cards = useMemo(() => FEATURED_BOOKS, []);
  const maxIndex = Math.max(cards.length - visibleCount, 0);

  useEffect(() => {
    if (!isInView || cards.length <= visibleCount) return undefined;

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index >= maxIndex ? 0 : index + 1));
    }, 4200);

    return () => window.clearInterval(timer);
  }, [cards.length, isInView, maxIndex, visibleCount]);

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, maxIndex));
  }, [maxIndex]);

  const goPrev = () => setCurrentIndex((index) => (index <= 0 ? maxIndex : index - 1));
  const goNext = () => setCurrentIndex((index) => (index >= maxIndex ? 0 : index + 1));

  return (
    <section id="featured-books" className="landing-section landing-carousel-section" ref={ref}>
      <div className="container">
        <motion.div
          className="landing-section-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <div className="landing-section-eyebrow">
            <Sparkles size={16} />
            Featured books
          </div>
          <h2>Books students are picking up right now</h2>
          <p>
            Auto-sliding featured cards with smooth motion, clean previews, and clear pricing.
          </p>
        </motion.div>

        <motion.div
          className="landing-carousel-shell glass"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.7 }}
        >
          <button type="button" className="landing-carousel-nav left" onClick={goPrev} aria-label="Previous featured books">
            <ChevronLeft size={18} />
          </button>
          <button type="button" className="landing-carousel-nav right" onClick={goNext} aria-label="Next featured books">
            <ChevronRight size={18} />
          </button>

          <div className="landing-carousel-viewport">
            <motion.div
              className="landing-carousel-track"
              animate={{ x: `${-(currentIndex * (100 / visibleCount))}%` }}
              transition={{ type: 'spring', stiffness: 110, damping: 18 }}
              style={{ width: `${(cards.length * 100) / visibleCount}%` }}
            >
              {cards.map((book) => (
                <article key={book.id} className="landing-carousel-card" style={{ width: `${100 / visibleCount}%` }}>
                  <div className="landing-carousel-image-wrap">
                    <img src={book.image} alt={book.title} className="landing-carousel-image" />
                    <div className="landing-carousel-chip">{book.category}</div>
                  </div>
                  <div className="landing-carousel-copy">
                    <h3>{book.title}</h3>
                    <p>{book.description}</p>
                    <div className="landing-carousel-meta">
                      <span className="landing-carousel-price">
                        <BadgeIndianRupee size={15} />
                        {book.price}
                      </span>
                      <span>{book.condition}</span>
                    </div>
                  </div>
                </article>
              ))}
            </motion.div>
          </div>

          <div className="landing-carousel-dots" aria-label="Featured books pagination">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={`landing-carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to featured books slide ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;
