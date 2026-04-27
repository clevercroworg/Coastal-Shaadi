import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { OrnamentDivider, MandalaPattern, FlowerCorner } from './Decorative';

const reviews = [
  { name: "Deepthi Shenoy", location: "Mangalore", rating: 5, text: "The privacy controls are outstanding. I never felt pressured. My photo was only visible after mutual interest was confirmed. That level of respect is rare." },
  { name: "Fr. George D'Souza", location: "Udupi", rating: 5, text: "As a community leader, I recommend Coastal Shaadi for its integrity. The verification process is thorough and trustworthy." },
  { name: "Raghavendra Pai", location: "Kundapura", rating: 5, text: "Found my daughter's perfect match within weeks. The curated matching meant we only saw families that shared our traditions. Excellent!" },
  { name: "Swetha Fernandes", location: "Mangalore", rating: 5, text: "The Elite plan's WhatsApp connectivity was a game-changer. Transitioning from online to real conversations felt so natural." },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const next = () => setCurrentIndex((p) => (p + 1) % reviews.length);
  const prev = () => setCurrentIndex((p) => (p - 1 + reviews.length) % reviews.length);

  const getVisible = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return [reviews[currentIndex], reviews[(currentIndex + 1) % reviews.length]];
    }
    return [reviews[currentIndex]];
  };

  return (
    <section className="relative py-10 lg:py-14 bg-canvas overflow-hidden">
      {/* Animated mandala in background */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block"
      >
        <MandalaPattern size={600} opacity={0.025} />
      </motion.div>

      <FlowerCorner className="absolute top-0 right-0 hidden lg:block" flip />
      <FlowerCorner className="absolute bottom-0 left-0 hidden lg:block" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10" ref={ref}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-accent text-xs tracking-[0.2em] uppercase font-bold mb-4 block">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary mb-4">What Our Members Say</h2>
          <OrnamentDivider />
        </motion.div>

        <div className="relative">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {getVisible().map((review, idx) => (
              <motion.div key={`${currentIndex}-${idx}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                className="relative bg-white rounded-2xl p-7 sm:p-8 border border-gray-100 shadow-sm"
              >
                <div className="absolute -top-4 left-8 text-6xl font-serif text-accent/20 leading-none">"</div>
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} className="text-accent fill-accent"/>)}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic text-sm sm:text-[15px]">{review.text}</p>
                <div>
                  <h4 className="font-serif font-bold text-gray-900">{review.name}</h4>
                  <p className="text-sm text-gray-500">{review.location}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button onClick={prev} className="w-11 h-11 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              <ChevronLeft size={18}/>
            </button>
            <div className="flex gap-2">
              {reviews.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-primary w-8' : 'bg-gray-300 w-2.5'}`}/>
              ))}
            </div>
            <button onClick={next} className="w-11 h-11 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
