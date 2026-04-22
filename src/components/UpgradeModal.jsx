import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UpgradeModal({ isOpen, onClose, featureName }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

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
          className="bg-white rounded-3xl shadow-2xl relative w-full max-w-md overflow-hidden z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-gray-500 transition-colors z-20"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-br from-[#fdfbf6] to-[#f8edeb] px-8 pt-10 pb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-yellow-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-accent/30 mb-5 relative z-10 text-white">
              <Crown size={32} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2 relative z-10">Premium Feature</h3>
            <p className="text-gray-600 text-sm relative z-10">
              Upgrade your plan to unlock <span className="font-semibold text-primary">{featureName}</span> and find your perfect match faster!
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-6 bg-white">
            <ul className="space-y-3 mb-8">
              {[
                "Unlimited direct chats & calls",
                "View full unblurred photos",
                "See all hidden contact details",
                "Send more connection requests"
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-green-600" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <button 
                onClick={() => {
                  onClose();
                  navigate('/pricing');
                }}
                className="w-full bg-gradient-to-r from-primary to-primary-hover text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5"
              >
                View Premium Plans
              </button>
              <button 
                onClick={onClose}
                className="w-full bg-gray-50 text-gray-600 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
