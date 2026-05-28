import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Briefcase, GraduationCap, Phone, Ruler, Heart, Lock, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FullProfileModal({ member, isOpen, onClose }) {
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (member) {
      setActiveImage(member.image);
      setIsLightboxOpen(false);
    }
  }, [member]);

  // Handle keyboard navigation for the lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev(e);
      if (e.key === 'ArrowRight') handleNext(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, activeImage]);

  if (!isOpen || !member) return null;

  const currentUser = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const isFreePlan = !currentUser.memberType || currentUser.memberType === 'Free';

  const allImages = [member.image, ...(member.additionalImages || [])].filter(Boolean);
  const currentIndex = allImages.indexOf(activeImage);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (allImages.length <= 1) return;
    const newIdx = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
    setActiveImage(allImages[newIdx]);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (allImages.length <= 1) return;
    const newIdx = currentIndex === allImages.length - 1 ? 0 : currentIndex + 1;
    setActiveImage(allImages[newIdx]);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl relative w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 scrollbar-hide"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors z-20 backdrop-blur-md"
          >
            <X size={18} />
          </button>

          {/* Cover Photo & Avatar */}
          <div className="relative h-48 bg-gradient-to-r from-gray-800 to-gray-900 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
          </div>

          <div className="px-8 pb-8">
            <div className="relative flex flex-col gap-3 -mt-16 mb-6">
              <div className="flex justify-between items-end">
                <div 
                  onClick={() => { if (!isFreePlan && activeImage) setIsLightboxOpen(true); }}
                  className={`w-32 h-32 rounded-2xl border-4 border-white shadow-xl bg-gray-100 overflow-hidden relative ${!isFreePlan && activeImage ? 'cursor-zoom-in hover:scale-102 hover:shadow-2xl transition-all duration-300' : ''}`}
                >
                  {activeImage ? (
                    <img src={activeImage} alt={member.name} className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      if (isFreePlan) {
                        onClose();
                        navigate('/pricing');
                      } else {
                        sessionStorage.setItem('pendingChatMemberId', member.id); 
                        navigate('/messaging');
                      }
                    }} 
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                  >
                    {isFreePlan ? <Lock className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                    {isFreePlan ? 'Upgrade to Chat' : 'Message'}
                  </button>
                  
                  {currentUser.memberType === 'Elite' && member.whatsappConsent && member.whatsappNumber && (
                    <a
                      href={`https://wa.me/91${member.whatsappNumber}?text=${encodeURIComponent(`Hi, I found your profile (${member.memberId || member.id}) on Coastal Shaadi and would like to connect.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Additional Photos Thumbnails (Only visible to paid members) */}
              {!isFreePlan && member.additionalImages && member.additionalImages.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {member.image && (
                    <button
                      onClick={() => setActiveImage(member.image)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImage === member.image ? 'border-primary scale-105 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={member.image} alt="Main thumbnail" className="w-full h-full object-cover object-top" />
                    </button>
                  )}
                  {member.additionalImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImage === img ? 'border-primary scale-105 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover object-top" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-1">{member.name}</h2>
              <div className="text-sm text-primary font-medium tracking-wide mb-4">Member ID: {member.id}</div>
              
              {/* Member type badge */}
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1.5"><MapPin size={14}/> {member.city || 'India'}</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1.5"><Briefcase size={14}/> {member.profession}</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1.5"><Ruler size={14}/> {member.height}</span>
              </div>

              {/* Grid Details */}
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">About Member</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-8">
                <div><span className="text-gray-400 block text-xs uppercase tracking-wider mb-0.5">Age</span> <span className="font-semibold text-gray-800">{member.age} Years</span></div>
                <div><span className="text-gray-400 block text-xs uppercase tracking-wider mb-0.5">Religion</span> <span className="font-semibold text-gray-800">{member.religion}</span></div>
                <div><span className="text-gray-400 block text-xs uppercase tracking-wider mb-0.5">Caste</span> <span className="font-semibold text-gray-800">{member.caste}</span></div>
                <div><span className="text-gray-400 block text-xs uppercase tracking-wider mb-0.5">Sub Caste</span> <span className="font-semibold text-gray-800">{member.subCaste || '-'}</span></div>
                <div><span className="text-gray-400 block text-xs uppercase tracking-wider mb-0.5">Mother Tongue</span> <span className="font-semibold text-gray-800">{member.language}</span></div>
                <div><span className="text-gray-400 block text-xs uppercase tracking-wider mb-0.5">Marital Status</span> <span className="font-semibold text-gray-800">{member.maritalStatus}</span></div>
                <div><span className="text-gray-400 block text-xs uppercase tracking-wider mb-0.5">Location</span> <span className="font-semibold text-gray-800">{member.location}</span></div>
              </div>

              {/* Upgrade CTA for Free users */}
              {isFreePlan && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 text-center">
                  <Lock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800 mb-1">Want to connect with this member?</p>
                  <p className="text-xs text-gray-500 mb-3">Upgrade your plan to unlock messaging, contact details & more.</p>
                  <button onClick={() => { onClose(); navigate('/pricing'); }} className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full text-sm font-bold transition-all shadow-md">
                    View Upgrade Plans
                  </button>
                </div>
              )}

             </div>
          </div>
        </motion.div>
      </div>

      {/* Lightbox / Fullscreen Popup */}
      <AnimatePresence>
        {isLightboxOpen && activeImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLightboxOpen(false)}
              className="absolute inset-0 cursor-zoom-out"
            />

            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-50 hover:scale-105"
            >
              <X size={24} />
            </button>

            {/* Previous Arrow (Only if multiple photos exist) */}
            {allImages.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-50 hover:scale-110 active:scale-95"
              >
                <ChevronLeft size={30} />
              </button>
            )}

            {/* Main Full-Size Image Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative max-w-[85vw] max-h-[80vh] flex items-center justify-center select-none"
            >
              <img
                src={activeImage}
                alt="Fullscreen member profile"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
              />
            </motion.div>

            {/* Next Arrow (Only if multiple photos exist) */}
            {allImages.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-50 hover:scale-110 active:scale-95"
              >
                <ChevronRight size={30} />
              </button>
            )}

            {/* Photo Counter Indicator */}
            {allImages.length > 1 && (
              <div className="absolute bottom-6 bg-white/10 text-white/95 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider backdrop-blur-md border border-white/15">
                {currentIndex + 1} / {allImages.length}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
