import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Stats from '../components/Stats';
import CTA from '../components/CTA';
import ParticleField from '../components/ParticleField';

function LandingPage() {
  return (
    <>
      <div className="aurora-bg">
        <div className="aurora-blob cyan" />
        <div className="aurora-blob violet" />
        <div className="aurora-blob pink" />
      </div>
      <ParticleField />
      
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Stats />
        <CTA />
      </main>
    </>
  );
}

export default LandingPage;
