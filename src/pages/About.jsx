import React from 'react';
import PageHeader from '../components/PageHeader';
import WelcomeSection from '../components/WelcomeSection';
import WhyChooseUs from '../components/WhyChooseUs';
import TrustedBrand from '../components/TrustedBrand';
import TrustStats from '../components/TrustStats';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <main>
      <PageHeader 
        title="About Coastal Shaadi" 
        subtitle="Where coastal traditions meet modern matchmaking" 
      />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-serif font-bold text-primary">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              At Coastal Shaadi, our mission is to preserve the rich cultural heritage of coastal communities while embracing modern ways to connect hearts. We understand that finding a life partner is a monumental journey, and we are dedicated to making it a seamless, trustworthy, and joyous experience.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We cater exclusively to premium profiles from the coastal regions, ensuring that you meet individuals who share your values, traditions, and aspirations. 
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-96 rounded-2xl overflow-hidden shadow-2xl golden-border"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Coastal sunset" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-6 z-20">
              <h3 className="text-2xl font-serif text-white font-bold">Uniting Coastal Hearts</h3>
            </div>
          </motion.div>
        </div>
      </div>

      <WelcomeSection />
      <WhyChooseUs />
      <TrustedBrand />
      <TrustStats />
    </main>
  );
}
