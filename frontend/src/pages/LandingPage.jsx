import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturedCarousel from '../components/FeaturedCarousel';
import Features from '../components/Features';
import Stats from '../components/Stats';
import CTA from '../components/CTA';

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="aurora-bg">
        <div className="aurora-blob cyan" />
        <div className="aurora-blob violet" />
        <div className="aurora-blob pink" />
      </div>

      <Navbar />
      <main>
        <Hero />
        <FeaturedCarousel />
        <Features />
        <Stats />
        <CTA />
      </main>
    </div>
  );
}

export default LandingPage;
