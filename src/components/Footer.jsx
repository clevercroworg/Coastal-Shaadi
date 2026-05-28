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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a 
            href="mailto:support@coastalshaadi.com" 
            className="group flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 w-fit"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-accent group-hover:bg-primary group-hover:text-white transition-colors">
              <Mail size={14} />
            </div>
            <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
              support@coastalshaadi.com
            </span>
          </a>

          <a 
            href="https://wa.me/918861002191?text=Hi%20Coastal%20Shaadi%20Support%2C%20I%20need%20assistance%20with%20my%20matrimonial%20account."
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 w-fit cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <span className="text-gray-300 text-sm group-hover:text-white transition-colors font-medium">
              +91 88610 02191
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
        </div>
      </div>
    </footer>
  );
}
