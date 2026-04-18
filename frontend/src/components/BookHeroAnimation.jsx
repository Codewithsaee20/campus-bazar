import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BookOpen, MapPin, Search, Star, Zap, Library, GraduationCap } from 'lucide-react';

const CosmicBookGrid = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Dynamic parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const floatTransition = {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
    repeatType: "reverse"
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '550px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Central Glowing Mesh */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: '350px', height: '350px',
          background: 'conic-gradient(from 0deg, var(--color-cyan), var(--color-violet), var(--color-pink), var(--color-cyan))',
          filter: 'blur(70px)',
          opacity: 0.25,
          zIndex: 0,
          borderRadius: '50%'
        }}
      />

      {/* Item 1 - Left Floating Book */}
      <motion.div
        style={{ y: y1 }}
        animate={{ y: [-10, 15, -10], rotateZ: [-6, -2, -6] }}
        transition={floatTransition}
        className="glass"
        whileHover={{ scale: 1.05, rotateZ: 0, zIndex: 20 }}
        style={{
          position: 'absolute', left: '-5%', top: '20%', zIndex: 2,
          width: '180px', height: '260px', padding: '1.25rem', borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(138,43,226,0.15) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(138,43,226,0.3)', borderLeft: '5px solid var(--color-violet)',
          boxShadow: '0 20px 40px rgba(138,43,226,0.2)', display: 'flex', flexDirection: 'column',
          backdropFilter: 'blur(16px)', cursor: 'grab'
        }}
      >
        <div style={{ background: 'rgba(138,43,226,0.2)', width: 'fit-content', padding: '0.75rem', borderRadius: '16px', color: 'var(--color-violet)' }}>
          <BookOpen strokeWidth={2.5} size={28} />
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ width: '100%', height: '8px', background: 'var(--color-violet)', opacity: 0.8, borderRadius: '4px', marginBottom: '8px' }} />
          <div style={{ width: '70%', height: '6px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px' }} />
        </div>
      </motion.div>

      {/* Item 2 - Top Right Floating Card (Price) */}
      <motion.div
        style={{ y: y3 }}
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ ...floatTransition, duration: 4, delay: 1 }}
        className="glass"
        whileHover={{ scale: 1.1, zIndex: 20 }}
        style={{
          position: 'absolute', right: '5%', top: '10%', zIndex: 3,
          padding: '1rem 1.5rem', borderRadius: '20px',
          background: 'rgba(0, 229, 255, 0.1)', border: '1px solid var(--color-cyan)',
          boxShadow: '0 10px 30px rgba(0, 229, 255, 0.25)',
          display: 'flex', alignItems: 'center', gap: '12px', backdropFilter: 'blur(12px)',
          color: 'var(--color-cyan)'
        }}
      >
        <div style={{ background: 'var(--color-cyan)', color: 'var(--color-bg)', padding: '6px', borderRadius: '50%' }}>
          <Zap size={16} fill="currentColor" />
        </div>
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, margin: 0 }}>Starting at</p>
          <p style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, lineHeight: 1 }}>₹150</p>
        </div>
      </motion.div>

      {/* Item 3 - Huge Center Piece */}
      <motion.div
        animate={{ y: [15, -15, 15] }}
        transition={{ ...floatTransition, duration: 8 }}
        className="glass"
        whileHover={{ scale: 1.02, zIndex: 20 }}
        style={{
          position: 'absolute', zIndex: 10, left: '50%', top: '50%', x: '-50%', y: '-50%',
          width: '240px', height: '320px', padding: '1.5rem', borderRadius: '30px',
          background: 'linear-gradient(135deg, rgba(255,20,147,0.1) 0%, rgba(255,255,255,0.01) 100%)',
          border: '1px solid rgba(255, 20, 147, 0.3)', borderTop: '4px solid var(--color-pink)',
          boxShadow: '10px 30px 60px rgba(255,20,147,0.25)', display: 'flex', flexDirection: 'column',
          backdropFilter: 'blur(20px)', cursor: 'grab'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--color-pink)', padding: '1rem', borderRadius: '20px', color: '#fff', boxShadow: '0 10px 20px rgba(255,20,147,0.4)' }}>
            <Library size={36} />
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="var(--color-cyan)" color="var(--color-cyan)" />)}
          </div>
        </div>
        
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.2, marginBottom: '0.5rem' }}>
          Engineering Physics
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>B.S. Rajput · 10th Ed.</p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '12px' }}>
          <MapPin size={14} color="var(--color-cyan)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)' }}>GTU Campus</span>
        </div>
      </motion.div>

      {/* Item 4 - Bottom Right floating icon */}
      <motion.div
        style={{ y: y2 }}
        animate={{ y: [-15, 20, -15], rotateZ: [10, -5, 10] }}
        transition={{ ...floatTransition, duration: 5, delay: 0.5 }}
        className="glass"
        whileHover={{ scale: 1.15, zIndex: 20 }}
        style={{
          position: 'absolute', right: '10%', bottom: '5%', zIndex: 4,
          width: '80px', height: '80px', borderRadius: '24px',
          background: 'rgba(0, 229, 255, 0.15)', border: '1px solid rgba(0, 229, 255, 0.4)',
          boxShadow: '0 15px 35px rgba(0, 229, 255, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-cyan)', backdropFilter: 'blur(10px)'
        }}
      >
        <Search strokeWidth={3} size={32} />
      </motion.div>
      
      {/* Item 5 - Bottom Left decorative badge */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotateZ: [-10, -10, -10] }}
        transition={{ ...floatTransition, duration: 3 }}
        style={{
          position: 'absolute', left: '15%', bottom: '15%', zIndex: 5,
          padding: '0.75rem 1.5rem', borderRadius: '50px',
          background: 'var(--color-violet)', color: '#fff',
          fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px',
          boxShadow: '0 10px 20px rgba(138,43,226,0.4)', display: 'flex', gap: '8px', alignItems: 'center'
        }}
      >
        <GraduationCap size={18} /> Verified
      </motion.div>

    </div>
  );
};

export default CosmicBookGrid;
