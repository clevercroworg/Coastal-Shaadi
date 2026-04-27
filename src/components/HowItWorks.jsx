import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { UserPlus, HeartHandshake, MessagesSquare } from 'lucide-react';
import { OrnamentDivider, CrossPattern, FlowerBouquet, FlowerCorner } from './Decorative';

const steps = [
  {
    icon: <UserPlus className="w-8 h-8" />,
    number: "01",
    title: "Create Profile",
    desc: "Register securely with phone verification. Tell us about yourself, your values, and what you're looking for."
  },
  {
    icon: <HeartHandshake className="w-8 h-8" />,
    title: "Get Matched",
    number: "02",
    desc: "Our system curates matches from your community and traditions. Browse and express interest."
  },
  {
    icon: <MessagesSquare className="w-8 h-8" />,
    title: "Connect & Chat",
    number: "03",
    desc: "When both sides express interest, unlock profiles, start chatting, and build a real connection."
  }
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-10 lg:py-14 bg-canvas overflow-hidden">
      {/* Background decorative */}
      <CrossPattern className="absolute top-20 right-20 hidden lg:block" size={200} opacity={0.04} />
      <FlowerCorner className="absolute bottom-0 left-0 hidden lg:block" />
      <FlowerBouquet className="absolute top-16 left-10 hidden lg:block" size={100} opacity={0.12} />
      <FlowerCorner className="absolute top-0 right-0 hidden lg:block" flip />

      <div className="max-w-7xl mx-auto px-6 lg:px-8" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="text-accent text-sm tracking-[0.2em] uppercase font-bold mb-4 block">The Process</span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-4">How It Works</h2>
          <OrnamentDivider />
        </motion.div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-[60px] left-[20%] right-[20%] h-px">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full bg-gradient-to-r from-accent/20 via-accent to-accent/20 origin-left"
              style={{ borderTop: '2px dashed #D4AF37' }}
            />
          </div>

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 + idx * 0.2 }}
              className="text-center relative"
            >
              {/* Number badge */}
              <div className="relative mx-auto mb-8">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-24 h-24 mx-auto rounded-2xl bg-white border-2 border-gray-100 shadow-premium flex items-center justify-center text-primary group hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 cursor-default"
                >
                  {step.icon}
                </motion.div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-accent to-yellow-500 text-white font-serif font-bold rounded-xl flex items-center justify-center shadow-lg text-sm">
                  {step.number}
                </div>
              </div>

              <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
