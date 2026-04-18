import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Archive, CircleCheckBig, Users } from 'lucide-react';

const Counter = ({ from = 0, to, duration = 2 }) => {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!isInView) return undefined;

    let startTime;
    let animationFrame;

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - percentage, 4);
      setCount(from + (to - from) * eased);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration, isInView]);

  return <span ref={ref}>{Math.floor(count).toLocaleString()}</span>;
};

const stats = [
  { label: 'Total Listings', value: 480, icon: Archive },
  { label: 'Books Sold', value: 1260, icon: CircleCheckBig },
  { label: 'Active Users', value: 820, icon: Users },
];

const Stats = () => {
  return (
    <section id="stats" className="landing-section landing-stats-section">
      <div className="container">
        <motion.div
          className="landing-section-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <div className="landing-section-eyebrow">Live stats</div>
          <h2>Campus marketplace activity in real numbers</h2>
          <p>
            A quick snapshot of how many books are listed, how many have already moved, and how many students are active.
          </p>
        </motion.div>

        <div className="landing-stats-grid">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.article
                key={stat.label}
                className="landing-stat-card glass"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: index * 0.1 }}
              >
                <div className="landing-stat-icon">
                  <Icon size={22} />
                </div>
                <div className="landing-stat-value">
                  <Counter to={stat.value} />
                </div>
                <div className="landing-stat-label">{stat.label}</div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
