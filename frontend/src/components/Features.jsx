import React from 'react';
import { motion } from 'framer-motion';
import { BadgeIndianRupee, CheckCircle2, PackagePlus, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: PackagePlus,
    title: 'Buy',
    description: 'Find the right textbook quickly with featured listings and clear book details.',
  },
  {
    icon: CheckCircle2,
    title: 'Sell',
    description: 'Create a clean listing with image preview, pricing, and contact details in one flow.',
  },
  {
    icon: BadgeIndianRupee,
    title: 'Affordable',
    description: 'Students can discover lower-cost books without sorting through clutter.',
  },
  {
    icon: ShieldCheck,
    title: 'Easy Listing',
    description: 'A lightweight, mobile-friendly form keeps the process fast and straightforward.',
  },
];

const Features = () => {
  return (
    <section id="features" className="landing-section">
      <div className="container">
        <motion.div
          className="landing-section-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <div className="landing-section-eyebrow">Features</div>
          <h2>Everything you need to trade books on campus</h2>
          <p>
            A focused toolkit for buying, selling, and listing books with less friction and more clarity.
          </p>
        </motion.div>

        <div className="landing-feature-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                className="landing-feature-card glass"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <div className="landing-feature-icon">
                  <Icon size={24} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
