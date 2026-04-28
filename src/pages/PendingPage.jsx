import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';

export default function PendingPage() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('userProfile') || '{}'); } catch { return {}; }
  });
  const [checking, setChecking] = useState(false);
  const [approved, setApproved] = useState(false);
  const pollRef = useRef(null);
  const mountedRef = useRef(true);

  const isRejected = userProfile.status === 'rejected';
  const isPending = userProfile.status === 'pending';

  // Poll /api/me every 15 seconds to check if admin approved the user
  useEffect(() => {
    mountedRef.current = true;

    const checkStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setChecking(true);
        const res = await fetch('/api/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();

        if (!mountedRef.current) return;

        // Update localStorage with fresh profile data
        localStorage.setItem('userProfile', JSON.stringify(data));
        setUserProfile(data);

        if (data.status === 'approved') {
          setApproved(true);
          // Stop polling
          if (pollRef.current) clearInterval(pollRef.current);

          // Determine redirect based on pendingPlan
          const pendingPlan = localStorage.getItem('pendingPlan');

          // Short delay to show the success animation
          setTimeout(() => {
            if (!mountedRef.current) return;
            if (pendingPlan && pendingPlan !== 'free') {
              // Paid plan selected before registration → go to checkout
              navigate(`/checkout/${pendingPlan}`);
            } else if (pendingPlan === 'free') {
              // Free plan selected → go to profile
              localStorage.removeItem('pendingPlan');
              navigate('/profile');
            } else {
              // No plan selected → go to pricing to choose
              navigate('/pricing');
            }
          }, 2500);
        }
      } catch (err) {
        console.error('Status poll error:', err);
      } finally {
        if (mountedRef.current) setChecking(false);
      }
    };

    // Check immediately on mount
    if (isPending) {
      checkStatus();
      // Then poll every 15 seconds
      pollRef.current = setInterval(checkStatus, 15000);
    }

    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Approved success state
  if (approved) {
    const pendingPlan = localStorage.getItem('pendingPlan');
    let redirectMsg = 'Redirecting you to choose a membership plan...';
    if (pendingPlan && pendingPlan !== 'free') {
      redirectMsg = `Redirecting you to checkout for the ${pendingPlan.charAt(0).toUpperCase() + pendingPlan.slice(1)} plan...`;
    } else if (pendingPlan === 'free') {
      redirectMsg = 'Redirecting you to your profile...';
    }

    return (
      <main className="min-h-screen pt-32 pb-20 bg-canvas flex items-center justify-center">
        <div className="max-w-md w-full px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 rounded-2xl text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner bg-green-50 text-green-500"
            >
              <CheckCircle size={40} />
            </motion.div>

            <h1 className="text-2xl font-serif font-bold text-primary mb-3">
              Profile Approved! 🎉
            </h1>
            
            <p className="text-gray-600 mb-4 leading-relaxed">
              Great news! Your profile has been verified and approved by our team.
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
              <Loader2 size={16} className="animate-spin" />
              <span>{redirectMsg}</span>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

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

          {/* Live status check indicator */}
          {isPending && (
            <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 size={14} className="text-yellow-500" />
              </motion.div>
              <span>Checking approval status{checking ? '...' : ''}</span>
            </div>
          )}

          <Link to="/" className="inline-block px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Return to Home
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
