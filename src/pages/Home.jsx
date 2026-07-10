import React from 'react';
import Hero from '../components/Hero';
import WelcomeSection from '../components/WelcomeSection';
import ShowcaseProfiles from '../components/ShowcaseProfiles';
import WhyChooseUs from '../components/WhyChooseUs';
import HowItWorks from '../components/HowItWorks';
import TrustedBrand from '../components/TrustedBrand';
import TrustStats from '../components/TrustStats';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';

export default function Home() {
  return (
    <main>
      <Hero />
      <WelcomeSection />
      <WhyChooseUs />
      <HowItWorks />
      <ShowcaseProfiles />
      <TrustedBrand />
      <TrustStats />
      <Testimonials />
      <CTA />
    </main>
  );
}
