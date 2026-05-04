import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, MapPin, Heart, ShieldCheck, Star } from 'lucide-react';
import { MandalaPattern, FlowerCorner } from './Decorative';

export default function ShowcaseProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch('/api/showcase-profiles');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setProfiles(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch showcase profiles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  // Fallback dummy data if no approved profiles exist in DB or API fails
  const displayProfiles = profiles.length > 0 ? profiles : [
    { _id: '1', firstName: 'Priya', memberId: 'CS-482910', religion: 'Hindu', caste: 'Bunt', profileData: { age: 26, city: 'Mangalore', state: 'Karnataka' }, image: '/images/showcase_w1.png' },
    { _id: '2', firstName: 'Rahul', memberId: 'CS-839211', religion: 'Hindu', caste: 'Billava', profileData: { age: 29, city: 'Udupi', state: 'Karnataka' }, image: '/images/showcase_m1.png' },
    { _id: '3', firstName: 'Sneha', memberId: 'CS-102934', religion: 'Christian', caste: 'Catholic', profileData: { age: 25, city: 'Manipal', state: 'Karnataka' }, image: '/images/showcase_w2.png' }
  ];

  let userData = null;
  try {
    const stored = localStorage.getItem('userProfile');
    if (stored) userData = JSON.parse(stored);
  } catch (e) {}
  
  const isLoggedIn = !!userData;
  const isPremiumOrElite = userData?.memberType === 'Premium' || userData?.memberType === 'Elite';

  if (loading) return null;

  const getFallbackImage = (profile, index) => {
    if (profile.gender === 'male') return '/images/showcase_m1.png';
    return index % 2 === 0 ? '/images/showcase_w1.png' : '/images/showcase_w2.png';
  };

  return (
    <section className="relative py-20 bg-canvas overflow-hidden">
      {/* Background Decor */}
      <MandalaPattern className="absolute top-0 right-0 hidden lg:block" size={400} opacity={0.03} />
      <FlowerCorner className="absolute bottom-0 left-0" position="bottom-left" opacity={0.05} />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-4"
          >
            <Star size={16} className="fill-primary" />
            <span>Featured Matches</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4"
          >
            Real Profiles, <span className="text-primary italic">Real Stories</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto text-lg"
          >
            Join thousands of verified members already looking for their perfect match. Your soulmate could be just a click away.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProfiles.map((profile, index) => (
            <motion.div
              key={profile._id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="glass-panel rounded-3xl relative group overflow-hidden border border-white/50 hover:shadow-2xl transition-all duration-500"
            >
              {/* Premium Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col h-full">
                {/* Profile Image Header with Increased Blur & Gradient Fade */}
                <div className="relative w-full h-48 overflow-hidden bg-gray-50">
                  {profile.image ? (
                    <img 
                      src={profile.image} 
                      alt="Member Profile" 
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!isPremiumOrElite ? 'filter blur-[20px] scale-125 opacity-90' : ''}`}
                    />
                  ) : (
                    <img 
                      src={getFallbackImage(profile, index)} 
                      alt="Member Profile Placeholder" 
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!isPremiumOrElite ? 'filter blur-[20px] scale-125 opacity-90' : ''}`}
                    />
                  )}
                  
                  {/* Elegant fade to white */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/70 to-transparent z-10" />
                  
                  {/* Lock Overlay */}
                  {!isPremiumOrElite && (
                    <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center backdrop-blur-[2px] z-10">
                      <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-2xl border border-white/50 mb-2">
                        <Lock size={24} />
                      </div>
                      <span className="text-white text-sm font-semibold tracking-wide drop-shadow-md">Photos Locked</span>
                    </div>
                  )}
                  
                  {/* Verification Badge */}
                  <div className="absolute bottom-4 right-6 w-12 h-12 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg z-20">
                    <ShieldCheck size={22} className="text-white" />
                  </div>
                </div>

                {/* Profile Details */}
                <div className="text-center space-y-3 p-6 pt-5 flex-grow flex flex-col justify-between relative bg-white z-20">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {profile.firstName} <span className="text-gray-400 font-normal filter blur-[4px] font-sans text-base">Smith</span>
                    </h3>
                    <p className="text-sm text-primary font-medium mt-1 uppercase tracking-wider">
                      {profile.memberId || 'Verified Member'}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-100 shadow-sm">
                      {profile.profileData?.age || '20s'} yrs
                    </span>
                    <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-100 shadow-sm">
                      {profile.religion}
                    </span>
                    <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-100 shadow-sm">
                      {profile.caste}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm mt-4">
                    <MapPin size={16} className="text-primary" />
                    <span>{profile.profileData?.city || 'India'}, {profile.profileData?.state || 'Karnataka'}</span>
                  </div>

                  {/* Call to Action */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <Link 
                      to={isLoggedIn ? "/active-members" : "/login?type=register"}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      <span>{isLoggedIn ? "View Full Profile" : "Register to Connect"}</span>
                      <Heart size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
