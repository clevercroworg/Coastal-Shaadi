import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Briefcase, GraduationCap, Phone, Ruler, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FullProfileModal({ member, isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen || !member) return null;

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
            <div className="relative flex justify-between items-end -mt-16 mb-6">
              <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl bg-gray-100 overflow-hidden relative">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    <User size={48} />
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate('/messaging')} className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5">
                  Message
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-1">{member.name}</h2>
              <div className="text-sm text-primary font-medium tracking-wide mb-4">Member ID: {member.id}</div>
              
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

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
