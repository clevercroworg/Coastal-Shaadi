import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrnamentDivider, WaveBorder, GrassBorder, SideLeaf, LeafCorner } from './Decorative';

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      {/* Main CTA Block */}
      <div className="relative bg-canvas py-20 lg:py-24 overflow-hidden">
        <SideLeaf side="left" />
        <SideLeaf side="right" />
        <LeafCorner className="absolute top-0 left-0 opacity-40 hidden lg:block" />
        <LeafCorner className="absolute top-0 right-0 opacity-30 hidden lg:block" flip />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 text-center" ref={ref}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary mb-4 leading-tight">
              Find your perfect <span className="text-accent">Match</span> now
            </h2>
            <OrnamentDivider className="mb-6" />
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands of families across Mangalore, Udupi, and the coastal belt who found love through our verified, tradition-respectful matchmaking service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login?type=register')}
                className="bg-primary text-white px-10 py-4 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-[0_8px_30px_rgba(128,0,0,0.3)] transition-all uppercase tracking-wider">
                Register Now
              </motion.button>
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/contact')}
                className="border-2 border-primary text-primary px-10 py-4 rounded-full font-bold text-sm sm:text-base hover:bg-primary hover:text-white transition-all uppercase tracking-wider">
                Help & Support
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <GrassBorder />

      {/* Contact bar */}
      <div className="bg-gradient-to-r from-primary via-rose-600 to-primary py-5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-white font-semibold text-sm sm:text-base tracking-wide">
            Email: <a href="mailto:support@coastalshaadi.com" className="font-bold uppercase hover:underline">support@coastalshaadi.com</a>
          </p>
        </div>
      </div>
    </section>
  );
}
