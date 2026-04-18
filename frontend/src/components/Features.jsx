import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BookOpen, FileText, Lightbulb, ShieldCheck, Calculator, Key } from 'lucide-react';

const TiltCard = ({ children }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass"
      style={{
        padding: '2.5rem',
        borderRadius: '24px',
        transition: 'transform 0.2s ease-out',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <style>
        {`
          .glass-shine:hover::before {
            left: 100%;
          }
        `}
      </style>
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: '-100%', 
          width: '50%', 
          height: '100%', 
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', 
          transition: 'left 0.7s ease', 
          transform: 'skewX(-20deg)',
          pointerEvents: 'none' 
        }} 
        className="shine-layer"
      />
      {children}
    </div>
  );
};

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -30 },
    visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section id="features" style={{ padding: '8rem 0', position: 'relative' }}>
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '5rem' }}
        >
           <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1px' }}>
             Built for Academic <span className="text-gradient">Ascension</span>
           </h2>
           <p style={{ color: '#a0a0c0', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
             Equip yourself with the exact materials your seniors used, backed by a secure infrastructure designed exclusively for your campus.
           </p>
        </motion.div>

        <motion.div 
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', perspective: '1000px' }}
        >
          <motion.div variants={itemVariants}>
            <TiltCard>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(0, 245, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#00f5ff' }}>
                <BookOpen size={30} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Secondhand Books</h3>
              <p style={{ color: '#a0a0c0', lineHeight: 1.7 }}>Find textbooks at a fraction of the cost or sell your old ones to juniors instantly.</p>
            </TiltCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <TiltCard>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(123, 47, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#7b2fff' }}>
                <ShieldCheck size={30} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Verified Campus Access</h3>
              <p style={{ color: '#a0a0c0', lineHeight: 1.7 }}>Registration strictly requires your official college email and OTP verification.</p>
            </TiltCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <TiltCard>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(255, 45, 120, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#ff2d78' }}>
                <Calculator size={30} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Smart Transparent Pricing</h3>
              <p style={{ color: '#a0a0c0', lineHeight: 1.7 }}>Zero guesswork. The final buyer price is generated dynamically and transparently from the MRP.</p>
            </TiltCard>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <TiltCard>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(0, 245, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#00f5ff' }}>
                <FileText size={30} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Past Papers</h3>
              <p style={{ color: '#a0a0c0', lineHeight: 1.7 }}>Access a decentralized archive of previous years' question papers for every subject.</p>
            </TiltCard>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <TiltCard>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(123, 47, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#7b2fff' }}>
                <Key size={30} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Secure OTP Handoffs</h3>
              <p style={{ color: '#a0a0c0', lineHeight: 1.7 }}>Complete your transactions safely on campus using our secure OTP-based meetup verification.</p>
            </TiltCard>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <TiltCard>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(255, 45, 120, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#ff2d78' }}>
                <Lightbulb size={30} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Premium Notes</h3>
              <p style={{ color: '#a0a0c0', lineHeight: 1.7 }}>High-yield, handwritten and digital notes curated by top-performing seniors.</p>
            </TiltCard>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Features;
