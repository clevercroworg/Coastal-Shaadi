import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { WaveBorder, FloatingDots } from './Decorative';

const stats = [
  { value: "50,000+", label: "Verified Profiles" },
  { value: "10+", label: "Years of Trust" },
  { value: "2,500+", label: "Happy Marriages" },
  { value: "98%", label: "Satisfaction Rate" },
];

function Counter({ value, inView }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="text-4xl md:text-5xl font-serif font-bold text-white text-glow block"
    >
      {value}
    </motion.span>
  );
}

export default function TrustStats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative overflow-hidden">
      <WaveBorder color="#800000" flip />

      <div className="bg-primary relative py-10 lg:py-14">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <FloatingDots count={15} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10" ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <span className="text-accent text-sm tracking-[0.2em] uppercase font-bold mb-4 block">Our Legacy</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
              Trusted by <span className="text-accent">Thousands</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto text-lg">
              Numbers that speak to our commitment to building genuine, lasting connections.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="text-center"
              >
                <div className="inline-flex flex-col items-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-accent/30 hover:bg-white/10 transition-all duration-500 w-full">
                  <Counter value={stat.value} inView={inView} />
                  <span className="text-white/60 text-sm uppercase tracking-wider font-medium mt-3">{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <WaveBorder color="#FAF9F6" />
    </section>
  );
}
