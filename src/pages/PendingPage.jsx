import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, ShieldAlert } from 'lucide-react';

export default function PendingPage() {
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const isRejected = userProfile.status === 'rejected';

  return (
    <main className="min-h-screen pt-32 pb-20 bg-canvas flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-2xl text-center relative overflow-hidden"
        >
          <div className={`absolute top-0 left-0 w-1 h-full ${isRejected ? 'bg-red-500' : 'bg-yellow-500'}`} />
          
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner ${isRejected ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-500'}`}>
            {isRejected ? <ShieldAlert size={40} /> : <Clock size={40} />}
          </div>

          <h1 className="text-2xl font-serif font-bold text-primary mb-3">
            {isRejected ? 'Account Rejected' : 'Verification Pending'}
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {isRejected 
              ? 'We are sorry, but your account registration has been declined by the administrator. Please contact support for more details.' 
              : 'Thank you for registering! Your account is currently under review by our team. We verify all profiles manually to ensure a safe and authentic community. You will be able to access the members area once approved.'}
          </p>

          <Link to="/" className="inline-block px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Return to Home
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
