import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userFilter');
    localStorage.removeItem('userProfile');
    window.location.href = '/login?type=login';
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const location = useLocation();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Active Members', path: '/active-members' },
    { name: 'About', path: '/about' },
    { name: 'Happy Stories', path: '/success-stories' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' }
  ];

  if (isLoggedIn) {
    links.splice(2, 0, { name: 'My Profile', path: '/profile' });
  }

  // Pages with dark hero backgrounds where transparent navbar works
  const darkHeroPages = ['/'];
  const hasDarkHero = darkHeroPages.includes(location.pathname);
  const isScrolledOrSolid = scrolled || !hasDarkHero || mobileMenuOpen;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      mobileMenuOpen
        ? 'bg-white shadow-[0_2px_20px_rgba(128,0,0,0.08)] py-3'
        : isScrolledOrSolid
          ? 'bg-white/95 backdrop-blur-lg shadow-[0_2px_20px_rgba(128,0,0,0.08)] py-3'
          : 'bg-gradient-to-b from-black/50 to-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="relative flex items-center group">
            <img
              src="/Coastal%20Shaadi%201.png"
              alt="Coastal Shaadi"
              className="h-12 lg:h-16 max-w-[200px] lg:max-w-[240px] w-auto transition-all duration-300"
            />
            <span className={`absolute bottom-0 left-[32%] text-[9px] tracking-[0.15em] uppercase font-medium whitespace-nowrap hidden sm:block transition-colors duration-300 ${isScrolledOrSolid ? 'text-gray-600' : 'text-white/90'}`}>One Step To Forever</span>
            <span className={`absolute -bottom-0.5 left-[32%] text-[8px] tracking-[0.15em] uppercase font-medium whitespace-nowrap sm:hidden transition-colors duration-300 ${isScrolledOrSolid ? 'text-gray-600' : 'text-white/90'}`}>One Step To Forever</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-4">
            {links.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-semibold px-4 py-2 rounded-full relative group transition-all duration-300 ${
                  location.pathname === item.path
                    ? (isScrolledOrSolid ? 'text-primary bg-primary/5' : 'text-accent bg-white/10 backdrop-blur-md')
                    : (isScrolledOrSolid ? 'text-gray-700 hover:text-primary hover:bg-gray-50' : 'text-white/90 hover:text-white hover:bg-white/5')
                }`}
              >
                {item.name}
                <span className={`absolute bottom-1 left-4 h-0.5 bg-accent transition-all duration-300 ${location.pathname === item.path ? 'w-[calc(100%-32px)]' : 'w-0 group-hover:w-[calc(100%-32px)]'}`} />
              </Link>
            ))}
            
            {isLoggedIn ? (
              <button onClick={handleLogout} className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-7 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border border-gray-700 flex items-center justify-center">
                Logout
              </button>
            ) : (
              <Link to="/login" className="bg-gradient-to-r from-primary to-primary-hover text-white px-7 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:shadow-[0_4px_20px_rgba(128,0,0,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 border border-primary/20 flex items-center justify-center">
                Login
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex items-center gap-3">
            {!isLoggedIn && (
              <Link to="/login" className={`px-5 py-2 rounded-full text-xs font-semibold shadow transition-all duration-300 ${isScrolledOrSolid ? 'bg-primary text-white' : 'bg-white/20 text-white backdrop-blur-sm border border-white/30 hover:bg-white/30'}`}>
                Login
              </Link>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen
                ? <X size={26} className={isScrolledOrSolid ? 'text-gray-900' : 'text-white'} />
                : <Menu size={26} className={isScrolledOrSolid ? 'text-gray-900' : 'text-white'} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white shadow-xl border-t border-gray-100 overflow-hidden"
          >
            <div className="px-6 pt-2 pb-6 space-y-1">
              {links.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 font-medium rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'text-primary bg-primary/10'
                        : 'text-gray-800 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-4">
                {isLoggedIn ? (
                  <button onClick={handleLogout} className="block w-full text-center bg-gray-900 text-white py-3 rounded-lg font-semibold shadow-md">
                    Logout
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center bg-primary text-white py-3 rounded-lg font-semibold shadow-md">
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
