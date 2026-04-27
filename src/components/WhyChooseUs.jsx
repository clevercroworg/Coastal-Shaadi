import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ShieldCheck, Lock, Fingerprint, Eye } from 'lucide-react';
import { WaveBorder, SideLeaf, OrnamentDivider } from './Decorative';

const features = [
  { icon: <ShieldCheck className="w-7 h-7" />, title: "Genuine Profiles", desc: "Every profile is phone and email verified. We screen manually." },
  { icon: <Lock className="w-7 h-7" />, title: "Most Trusted", desc: "Photos locked until both parties express mutual interest." },
  { icon: <Fingerprint className="w-7 h-7" />, title: "2000+ Weddings", desc: "Hindu and Christian matches. No cross-faith confusion." },
  { icon: <Eye className="w-7 h-7" />, title: "Full Privacy", desc: "Complete control over who sees your profile and details." }
];

export default function WhyChooseUs() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative overflow-hidden">
      {/* Top part - Image + Title */}
      <div className="relative bg-gray-100">
        <SideLeaf side="left" className="top-[20%]" />
        <SideLeaf side="right" className="top-[40%]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-10 pb-20 relative z-10" ref={ref}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image with person */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center"
            >
              <div className="relative w-full max-w-md">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-3xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.15)] border-4 border-white"
                >
                  <img src="/images/couple-portrait.png" alt="Happy Couple" className="w-full h-[350px] sm:h-[450px] object-cover"/>
                </motion.div>
                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -bottom-6 -right-4 sm:right-4 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3 border border-gray-100"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <span className="text-accent text-xl">💍</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">2500+ Weddings</p>
                    <p className="text-xs text-gray-400">And counting...</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <span className="text-accent text-xs tracking-[0.2em] uppercase font-bold mb-3 block">#1 Wedding Website</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary mb-4 leading-tight">
                Why Choose <span className="text-accent">Us</span>
              </h2>
              <OrnamentDivider className="mb-6 lg:justify-start" />
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8">
                Most trusted and premium matrimony service for the Udupi-Mangalore coastal community. We blend tradition with modern security.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom: Feature Cards overlapping */}
      <div className="relative -mt-16 z-20 max-w-7xl mx-auto px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + idx * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="bg-white rounded-2xl p-5 sm:p-6 text-center shadow-premium border border-gray-50 hover:border-accent/20 transition-all duration-500 group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                {f.icon}
              </div>
              <h3 className="font-serif text-sm sm:text-base font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
