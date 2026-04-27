import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SideLeaf, OrnamentDivider, GrassBorder } from './Decorative';

export default function WelcomeSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative bg-canvas overflow-hidden" id="about">
      <GrassBorder className="relative -mt-1 z-10" flip />

      {/* Side leaf decorations */}
      <SideLeaf side="left" className="top-[30%]" />
      <SideLeaf side="right" className="top-[60%]" />

      <div className="py-8 lg:py-12 relative z-10" ref={ref}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: Overlapping Images (3D effect) */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[400px] sm:h-[500px] mx-auto lg:mx-0 w-full max-w-[500px]"
            >
              {/* Main large image */}
              <motion.div
                whileHover={{ rotate: -1, scale: 1.02 }}
                className="absolute top-0 left-0 sm:left-4 w-[70%] sm:w-[65%] h-[75%] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-4 border-white z-10"
              >
                <img src="/images/wedding-ceremony.png" alt="Wedding Ceremony" className="w-full h-full object-cover"/>
              </motion.div>

              {/* Second overlapping image */}
              <motion.div
                whileHover={{ rotate: 2, scale: 1.02 }}
                className="absolute bottom-0 right-0 sm:right-4 w-[60%] sm:w-[55%] h-[60%] rounded-2xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.12)] border-4 border-white z-20"
              >
                <img src="/images/couple-beach.png" alt="Couple on Beach" className="w-full h-full object-cover"/>
              </motion.div>

              {/* Decorative ring image */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute bottom-2 left-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-lg border-3 border-accent z-30"
              >
                <img src="/images/wedding-rings.png" alt="Wedding Rings" className="w-full h-full object-cover"/>
              </motion.div>

              {/* Decorative golden circle */}
              <div className="absolute -top-4 -right-4 w-20 h-20 border-2 border-accent/30 rounded-full hidden sm:block"/>
              <div className="absolute -bottom-2 left-[30%] w-12 h-12 border border-primary/20 rounded-full hidden sm:block"/>
            </motion.div>

            {/* Right: Content */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <span className="text-accent text-xs sm:text-sm tracking-[0.2em] uppercase font-bold mb-4 block">Welcome To</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary mb-2 leading-tight">
                Coastal<br className="hidden sm:block" />{' '}
                <span className="text-accent">Shaadi</span>
              </h2>
              <OrnamentDivider className="mb-6 lg:justify-start" />

              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                Best wedding matrimony — a trusted platform rooted in the values of our beautiful Udupi-Mangalore coastal community. We connect families and hearts with dignity, privacy, and care.
              </p>

              <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8">
                Whether you value ancient rituals or modern customs, Coastal Shaadi ensures you find matches who share your exact faith, values, and cultural background. Your privacy is absolute — photos and personal details remain locked until mutual interest.
              </p>

              {/* Contact Info */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Get Support</p>
                    <a href="mailto:support@coastalshaadi.com" className="text-sm font-bold text-gray-800 hover:text-primary transition-colors">support@coastalshaadi.com</a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
