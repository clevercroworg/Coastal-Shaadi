import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Heart, Quote } from 'lucide-react';
import { OrnamentDivider, SideLeaf, MandalaPattern } from './Decorative';

const stories = [
  {
    image: "/images/couple-1.png",
    names: "Sneha & Aditya",
    location: "Mangalore",
    quote: "Amma kept saying 'try this site once' and I'm so glad I listened. Aditya and I connected over our love for Tulu cinema and the rest just happened naturally!",
    married: "Dec 2025"
  },
  {
    image: "/images/couple-2.png",
    names: "Maria & Joel",
    location: "Udupi",
    quote: "We both wanted someone from our parish community. Joel's profile was the first one I saw and something just felt right. Got married at St. Mary's last March!",
    married: "Mar 2025"
  },
  {
    image: "/images/couple-3.png",
    names: "Priya & Karthik",
    location: "Kundapura",
    quote: "My dad registered my profile here. Within a month Karthik's family reached out. Two families from Kundapura who never knew each other — now we're one family!",
    married: "Oct 2024"
  },
];

export default function SuccessStories() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative py-20 lg:py-28 bg-white overflow-hidden" id="success-stories">
      <SideLeaf side="left" className="top-[25%]" />
      <SideLeaf side="right" className="top-[55%]" />

      {/* Animated floating hearts */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -20, 0], opacity: [0.15, 0.3, 0.15] }}
          transition={{ repeat: Infinity, duration: 4 + i, delay: i * 0.8 }}
          className="absolute pointer-events-none hidden md:block"
          style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
        >
          <Heart size={12 + i * 2} className="text-primary/10" fill="currentColor" />
        </motion.div>
      ))}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-accent text-xs tracking-[0.2em] uppercase font-bold mb-4 block">Real Love</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Happy Stories</h2>
          <OrnamentDivider className="mb-5" />
          <p className="text-gray-600 text-base sm:text-lg">Real couples. Real connections. Real happily-ever-afters from the coastal belt.</p>
        </motion.div>

        {/* Desktop: Creative staggered layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start">
          {/* Card 1 - Large left */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="col-span-5 group relative bg-canvas rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_20px_60px_rgba(128,0,0,0.12)] border border-gray-100 transition-all duration-500"
          >
            <div className="relative h-80 overflow-hidden">
              <img src={stories[0].image} alt={stories[0].names} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
              <div className="absolute bottom-4 left-5 right-5">
                <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  {stories[0].names} <Heart size={14} className="text-red-400" fill="currentColor"/>
                </h3>
                <p className="text-white/70 text-sm">{stories[0].location} • Married {stories[0].married}</p>
              </div>
            </div>
            <div className="p-6 relative">
              <Quote className="w-7 h-7 text-accent/15 absolute top-3 right-3"/>
              <p className="text-gray-600 text-sm leading-relaxed italic">"{stories[0].quote}"</p>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
          </motion.div>

          {/* Card 2 - Elevated center */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="col-span-4 -mt-6 group relative bg-canvas rounded-3xl overflow-hidden shadow-md hover:shadow-[0_25px_70px_rgba(128,0,0,0.15)] border-2 border-accent/20 transition-all duration-500"
          >
            <div className="relative h-72 overflow-hidden">
              <img src={stories[1].image} alt={stories[1].names} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
              {/* Featured badge */}
              <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full shadow uppercase tracking-widest">
                ✦ Featured
              </div>
              <div className="absolute bottom-4 left-5 right-5">
                <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  {stories[1].names} <Heart size={14} className="text-red-400" fill="currentColor"/>
                </h3>
                <p className="text-white/70 text-sm">{stories[1].location} • Married {stories[1].married}</p>
              </div>
            </div>
            <div className="p-6 relative">
              <Quote className="w-7 h-7 text-accent/15 absolute top-3 right-3"/>
              <p className="text-gray-600 text-sm leading-relaxed italic">"{stories[1].quote}"</p>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-accent via-yellow-400 to-accent"/>
          </motion.div>

          {/* Card 3 - Right with image frame offset */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="col-span-3 mt-8 group relative bg-canvas rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_20px_60px_rgba(128,0,0,0.12)] border border-gray-100 transition-all duration-500"
          >
            <div className="relative h-64 overflow-hidden">
              <img src={stories[2].image} alt={stories[2].names} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  {stories[2].names} <Heart size={12} className="text-red-400" fill="currentColor"/>
                </h3>
                <p className="text-white/70 text-xs">{stories[2].location} • {stories[2].married}</p>
              </div>
            </div>
            <div className="p-5 relative">
              <p className="text-gray-600 text-xs leading-relaxed italic">"{stories[2].quote}"</p>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
          </motion.div>
        </div>

        {/* Mobile: Standard stacked cards */}
        <div className="lg:hidden grid sm:grid-cols-2 gap-6">
          {stories.map((story, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="group bg-canvas rounded-2xl overflow-hidden shadow-sm border border-gray-100"
            >
              <div className="relative h-48 overflow-hidden">
                <img src={story.image} alt={story.names} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                <div className="absolute bottom-3 left-4">
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
                    {story.names} <Heart size={12} className="text-red-400" fill="currentColor"/>
                  </h3>
                  <p className="text-white/70 text-xs">{story.location}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm leading-relaxed italic">"{story.quote}"</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
