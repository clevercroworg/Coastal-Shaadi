import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { DiamondFrame, OrnamentDivider, SideLeaf, LeafCorner } from './Decorative';

const testimonials = [
  {
    image: "/images/couple-1.png",
    name: "Sneha & Aditya",
    location: "Mangalore",
    text: "We both being Bunts, our families were particular about traditions. Found Aditya's profile here and everything just fell into place. Married 6 months now! 😊"
  },
  {
    image: "/images/couple-portrait.png",
    name: "Deepthi & Raghav",
    location: "Udupi",
    text: "My parents were worried about online platforms but Coastal Shaadi felt different — profiles were genuine and from our own community. So glad we tried it."
  },
  {
    image: "/images/couple-2.png",
    name: "Maria & Joel",
    location: "Kundapura",
    text: "Church wedding last March! Joel's family is from Barkur and mine from Kundapura. Coastal Shaadi made the connection that our families couldn't find on their own."
  },
];

export default function TrustedBrand() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative py-10 lg:py-14 bg-canvas overflow-hidden">
      {/* Side leaves */}
      <SideLeaf side="left" />
      <SideLeaf side="right" />

      {/* Leaf Corners */}
      <LeafCorner className="absolute top-0 right-0 opacity-40 hidden lg:block" flip />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <span className="text-accent text-xs tracking-[0.3em] uppercase font-bold mb-3 block font-serif">Trusted Brand</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary leading-tight">
            Trusted by{' '}
            <span className="text-5xl sm:text-6xl md:text-7xl text-accent inline-block">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 80, delay: 0.3 }}
              >
                1500
              </motion.span>
            </span>
            + Couples
          </h2>
          <OrnamentDivider className="mt-4" />
        </motion.div>

        {/* Testimonial Cards with Diamond Frames */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + idx * 0.15 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative bg-white rounded-2xl pt-20 pb-8 px-6 text-center shadow-sm hover:shadow-[0_15px_50px_rgba(128,0,0,0.1)] border border-gray-100 transition-all duration-500 group"
            >
              {/* Diamond Image positioned above card */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
                <DiamondFrame image={t.image} alt={t.name} size={110} />
              </div>

              {/* Card decorative corners */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-accent/40 rounded-tl-md opacity-0 group-hover:opacity-100 transition-opacity"/>
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-primary/40 rounded-tr-md opacity-0 group-hover:opacity-100 transition-opacity"/>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-primary/40 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"/>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-accent/40 rounded-br-md opacity-0 group-hover:opacity-100 transition-opacity"/>

              <h4 className="font-serif font-bold text-gray-900 text-lg mb-1">{t.name}</h4>
              <p className="text-xs text-accent font-semibold mb-4 uppercase tracking-wider">{t.location}</p>
              <p className="text-gray-500 text-sm leading-relaxed italic">"{t.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
