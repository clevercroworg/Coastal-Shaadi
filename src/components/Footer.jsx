import { Heart, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-dark text-white relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 20c0-5.523-4.477-10-10-10S0 14.477 0 20s4.477 10 10 10 10-4.477 10-10zm10 0c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-5">
                <img
                  src="/Coastal%20Shaadi%201.png"
                  alt="Coastal Shaadi"
                  className="h-10 lg:h-12 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Honouring our community matrimonial traditions across the beautiful Udupi-Mangalore coastal belt. Your privacy, our promise. <br/><span className="text-accent italic font-medium mt-2 block">One Step to Forever.</span>
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#25D366] hover:text-white transition-all duration-300 border border-white/5 hover:border-[#25D366]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.12.553 4.148 1.583 5.96L.015 24l6.195-1.625A11.97 11.97 0 0 0 12.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 22.015c-1.802 0-3.561-.484-5.109-1.403l-.367-.217-3.799.996.996-3.702-.238-.378A9.992 9.992 0 0 1 2.016 12.03c0-5.523 4.492-10.015 10.015-10.015 5.523 0 10.015 4.492 10.015 10.015 0 5.523-4.492 10.015-10.015 10.015zm5.508-7.53c-.302-.15-1.785-.881-2.062-.981-.277-.1-.478-.15-.678.15-.201.302-.78 1.018-.956 1.218-.176.202-.352.227-.654.076-1.558-.788-2.613-1.464-3.606-2.915-.257-.378.254-.35.845-1.536.076-.15.038-.277-.038-.427-.076-.15-.678-1.631-.93-2.234-.246-.587-.496-.507-.678-.517-.176-.01-.377-.01-.578-.01-.201 0-.528.075-.805.377-.277.302-1.057 1.031-1.057 2.515 0 1.485 1.082 2.92 1.233 3.12.15.201 2.128 3.245 5.156 4.551 2.012.87 2.628.932 3.535.783 1.037-.17 2.29-.933 2.612-1.838.322-.906.322-1.684.226-1.838-.096-.15-.353-.251-.655-.402z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#E1306C] hover:text-white transition-all duration-300 border border-white/5 hover:border-[#E1306C]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#1877F2] hover:text-white transition-all duration-300 border border-white/5 hover:border-[#1877F2]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-accent text-xs font-bold uppercase tracking-[0.15em] mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'Active Members', path: '/active-members' },
                  { name: 'About Us', path: '/about' },
                  { name: 'Happy Stories', path: '/success-stories' },
                  { name: 'Pricing', path: '/pricing' },
                  { name: 'Contact', path: '/contact' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className="text-gray-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-0 group-hover:w-2 h-px bg-accent transition-all duration-300" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-accent text-xs font-bold uppercase tracking-[0.15em] mb-6">Support & Legal</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Privacy Policy', path: '/privacy' },
                  { name: 'Terms of Service', path: '/terms' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className="text-gray-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-0 group-hover:w-2 h-px bg-accent transition-all duration-300" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-accent text-xs font-bold uppercase tracking-[0.15em] mb-6">Get in Touch</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-accent shrink-0" />
                  <span className="text-gray-400 text-sm">support@coastalshaadi.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-xs">
              &copy; {new Date().getFullYear()} Coastal Shaadi. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs flex items-center gap-1">
              Made with <Heart size={12} className="text-primary" fill="currentColor" /> in Udupi
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
