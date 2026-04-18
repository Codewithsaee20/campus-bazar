import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const Counter = ({ from = 0, to, duration = 2, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime;
    let animationFrame;

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      
      // Easing out function
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const current = from + (to - from) * easeOutQuart;
      
      setCount(current);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration, isInView]);

  return (
    <span ref={ref}>
      {prefix}{Math.floor(count).toLocaleString()}{suffix}
    </span>
  );
};

const Stats = () => {
  const stats = [
    { label: "Verified Students", value: 10, suffix: "K+", color: "var(--color-cyan)", prefix: "" },
    { label: "Active Listings", value: 45, suffix: "K+", color: "var(--color-violet)", prefix: "" },
    { label: "Successful Orders", value: 120, suffix: "K+", color: "var(--color-pink)", prefix: "" }
  ];

  return (
    <section id="stats" style={{ padding: '6rem 0', position: 'relative' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              style={{ textAlign: 'center' }}
            >
              <div 
                style={{ 
                  fontSize: '4.5rem', 
                  fontWeight: 900, 
                  color: stat.color,
                  lineHeight: 1.1,
                  marginBottom: '0.5rem',
                  textShadow: `0 0 20px ${stat.color}40`
                }}
              >
                <Counter to={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize: '1.25rem', color: '#a0a0c0', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
