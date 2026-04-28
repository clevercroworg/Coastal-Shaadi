import { Heart, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MandalaPattern, FlowerCorner, FloatingDots } from './Decorative';

export default function Footer() {
  return (
    <footer className="relative text-white overflow-hidden bg-black border-t-2 border-accent/30">
      {/* Background Image with Rich Maroon Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-wedding.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-15 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/95 via-primary/80 to-black/95" />
      </div>

      {/* Custom Wedding Theme Decorations */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <MandalaPattern className="absolute -top-40 -left-40 text-accent" size={500} opacity={0.05} />
        <MandalaPattern className="absolute -bottom-40 -right-20 text-accent" size={600} opacity={0.05} />
        
        <FlowerCorner className="absolute top-0 left-0 opacity-[0.25]" />
        <FlowerCorner className="absolute bottom-0 right-0 rotate-180 opacity-[0.25]" />
        
        <FloatingDots count={20} />
      </div>

      {/* Elegant background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent rounded-full blur-[150px] opacity-10 pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-accent rounded-full blur-[150px] opacity-10 pointer-events-none z-0" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 lg:py-16 text-center">
        {/* Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative inline-block mb-8">
            <img
              src="/Coastal%20Shaadi%201.png"
              alt="Coastal Shaadi"
              className="h-12 lg:h-16 w-auto drop-shadow-xl"
            />
            <span className="absolute -bottom-1.5 left-[32%] text-accent italic font-medium text-xs tracking-widest whitespace-nowrap drop-shadow-md">
              One Step to Forever.
            </span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg mx-auto">
            Honouring our community matrimonial traditions across the beautiful Udupi-Mangalore coastal belt. Your privacy, our promise.
          </p>
        </div>

        {/* Contact/Action Button */}
        <div className="flex justify-center mb-12">
          <a 
            href="mailto:support@coastalshaadi.com" 
            className="group flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-accent group-hover:bg-primary group-hover:text-white transition-colors">
              <Mail size={14} />
            </div>
            <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
              support@coastalshaadi.com
            </span>
          </a>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 mb-16">
          <Link to="/pricing" className="text-gray-400 hover:text-accent text-sm font-semibold tracking-widest uppercase transition-colors">
            Pricing
          </Link>
          <div className="w-1.5 h-1.5 rounded-full bg-white/20 hidden sm:block" />
          <Link to="/privacy" className="text-gray-400 hover:text-accent text-sm font-semibold tracking-widest uppercase transition-colors">
            Privacy Policy
          </Link>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} Coastal Shaadi. All rights reserved.</p>
          <span className="hidden sm:block text-gray-600">|</span>
          <p className="flex items-center gap-1.5">
            Made with <Heart size={12} className="text-primary" fill="currentColor" /> in Udupi
          </p>
        </div>
      </div>
    </footer>
  );
}
