import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Zap, Star, ArrowLeft, Shield, Lock, CreditCard, Phone, Mail, User, ChevronRight, X } from 'lucide-react';

const planData = {
  basic: {
    name: 'Basic',
    price: 1999,
    priceDisplay: '₹1,999',
    duration: '3 Months',
    icon: <Zap className="w-7 h-7" />,
    color: 'blue',
    gst: Math.round(1999 * 0.18),
    features: [
      'Unlock contact details (limited)',
      '20 chats',
      'See who viewed your profile',
      'Limited connects (20)'
    ]
  },
  premium: {
    name: 'Premium',
    price: 3499,
    priceDisplay: '₹3,499',
    duration: '6 Months',
    icon: <Sparkles className="w-7 h-7" />,
    color: 'purple',
    gst: Math.round(3499 * 0.18),
    features: [
      'Unlimited chat & calls',
      'Limited connects (50)',
      'View all contact details',
      'Profile highlighted in searches'
    ]
  },
  elite: {
    name: 'Elite',
    price: 5999,
    priceDisplay: '₹5,999',
    duration: '12 Months',
    icon: <Crown className="w-7 h-7" />,
    color: 'amber',
    gst: Math.round(5999 * 0.18),
    features: [
      'Unlimited connects',
      'Unlimited chats & calls',
      'WhatsApp connectivity',
      'Top Match boost in Udupi-Mangalore',
      'Profile badges (Elite User)'
    ]
  }
};

export default function CheckoutPage() {
  const { plan } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const selectedPlan = planData[plan?.toLowerCase()];

  const planRank = { Free: 0, Basic: 1, Premium: 2, Elite: 3 };

  useEffect(() => {
    if (!userProfile.id && !userProfile._id) {
      navigate('/login');
      return;
    }
    if (!selectedPlan) {
      navigate('/pricing');
      return;
    }
    if (userProfile.status !== 'approved') {
      navigate('/pricing');
      return;
    }
    // Prevent downgrade
    const currentRank = planRank[userProfile.memberType || 'Free'];
    const targetRank = planRank[selectedPlan.name];
    if (targetRank <= currentRank) {
      navigate('/pricing');
      return;
    }
  }, []);

  if (!selectedPlan) return null;

  const total = selectedPlan.price + selectedPlan.gst;

  const iconBg = selectedPlan.color === 'amber' ? 'bg-amber-50 text-amber-600' :
    selectedPlan.color === 'purple' ? 'bg-purple-50 text-purple-600' :
    'bg-blue-50 text-blue-600';

  const accentColor = selectedPlan.color === 'amber' ? 'text-amber-600' :
    selectedPlan.color === 'purple' ? 'text-purple-600' :
    'text-blue-600';

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const userId = userProfile.id || userProfile._id || userProfile.memberId;
      if (!userId) throw new Error('User ID not found');

      // Step 1: Create Razorpay order on the server
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan })
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errData.message || 'Failed to create order');
      }

      const orderData = await orderRes.json();

      // Step 2: Open Razorpay Checkout popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Coastal Shaadi',
        description: `${orderData.planName} Plan – ${orderData.planDuration}`,
        order_id: orderData.orderId,
        prefill: {
          name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
          email: userProfile.email || '',
          contact: userProfile.phone || userProfile.profileData?.phone || ''
        },
        theme: {
          color: selectedPlan.color === 'amber' ? '#d97706' :
                 selectedPlan.color === 'purple' ? '#9333ea' : '#2563eb'
        },
        modal: {
          ondismiss: () => {
            if (mountedRef.current) {
              setLoading(false);
              setError('Payment was cancelled. You can try again anytime.');
            }
          }
        },
        handler: async (response) => {
          // Step 3: Verify payment on server
          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId,
                plan
              })
            });

            if (!verifyRes.ok) {
              const errData = await verifyRes.json().catch(() => ({ message: 'Verification failed' }));
              throw new Error(errData.message || 'Payment verification failed');
            }

            const data = await verifyRes.json();

            // Update local storage so the UI reflects the new membership immediately
            const updatedProfile = {
              ...userProfile,
              memberType: data.user.memberType,
              planExpiry: data.user.planExpiry
            };
            localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
            // Clear pendingPlan since purchase is complete
            localStorage.removeItem('pendingPlan');
            window.dispatchEvent(new Event('profileUpdated'));

            if (mountedRef.current) setSuccess(true);
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            if (mountedRef.current) {
              setError(verifyErr.message || 'Payment was received but verification failed. Please contact support.');
            }
          } finally {
            if (mountedRef.current) setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', (response) => {
        console.error('Razorpay payment failed:', response.error);
        if (mountedRef.current) {
          setLoading(false);
          setError(response.error?.description || 'Payment failed. Please try again or use a different payment method.');
        }
      });

      razorpay.open();
    } catch (err) {
      console.error('Payment error:', err);
      if (mountedRef.current) {
        setError(err.message || 'Something went wrong. Please try again or contact support.');
        setLoading(false);
      }
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-canvas flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl max-w-md w-full p-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-2">Your <strong>{selectedPlan.name} Plan</strong> has been activated.</p>
          <p className="text-sm text-gray-500 mb-8">Enjoy all your premium features right away. Your plan is valid for {selectedPlan.duration}.</p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Order Reference</span>
              <span className="font-mono font-bold text-gray-900">CS-{Date.now().toString().slice(-8)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Plan</span>
              <span className="font-semibold text-gray-900">{selectedPlan.name} ({selectedPlan.duration})</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-bold text-primary">₹{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/active-members" className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors text-center">
              Go to Dashboard
            </Link>
            <Link to="/profile" className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors text-center">
              My Profile
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6 pt-4">
          <button onClick={() => navigate('/pricing')} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-medium">
            <ArrowLeft size={16} />
            Back to Plans
          </button>
        </motion.div>

        {/* Page Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-1">Complete your subscription to unlock premium features</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Account & Payment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={16} className="text-primary" />
                Account Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">Full Name</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-900 border border-gray-100">
                    {userProfile.firstName} {userProfile.lastName}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">Member ID</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm font-mono font-medium text-gray-900 border border-gray-100">
                    {userProfile.memberId || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">Email</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-900 border border-gray-100 flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    {userProfile.email}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">Current Plan</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-900 border border-gray-100">
                    {userProfile.memberType || 'Free'}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-primary" />
                Payment Method
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-primary accent-primary" />
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-gray-900">UPI / Net Banking / Cards</span>
                    <p className="text-xs text-gray-500 mt-0.5">Pay securely via Razorpay</p>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-8 h-5 bg-gray-100 rounded flex items-center justify-center text-[8px] font-bold text-gray-500">VISA</div>
                    <div className="w-8 h-5 bg-gray-100 rounded flex items-center justify-center text-[8px] font-bold text-gray-500">UPI</div>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                  <input type="radio" name="payment" className="w-4 h-4 text-primary accent-primary" />
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-gray-900">Bank Transfer (Manual)</span>
                    <p className="text-xs text-gray-500 mt-0.5">Transfer and share receipt via email</p>
                  </div>
                  <Phone size={18} className="text-gray-400" />
                </label>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 accent-primary rounded" />
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to the <Link to="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>. I understand that my subscription will be activated after payment confirmation.
                </span>
              </label>
            </div>
          </motion.div>

          {/* Right: Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5">Order Summary</h3>

              {/* Plan Card */}
              <div className={`rounded-xl p-5 mb-5 ${
                selectedPlan.color === 'amber' ? 'bg-amber-50 border border-amber-100' :
                selectedPlan.color === 'purple' ? 'bg-purple-50 border border-purple-100' :
                'bg-blue-50 border border-blue-100'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
                    {selectedPlan.icon}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-gray-900">{selectedPlan.name} Plan</h4>
                    <p className="text-xs text-gray-500">{selectedPlan.duration} subscription</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6">
                {selectedPlan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Check size={14} className={`shrink-0 mt-0.5 ${accentColor}`} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Price Breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900 font-medium">₹{selectedPlan.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GST (18%)</span>
                  <span className="text-gray-900 font-medium">₹{selectedPlan.gst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-dashed border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary text-lg">₹{total.toLocaleString()}</span>
                </div>
              </div>


              {/* Error Message */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <X size={12} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-800">Payment Failed</p>
                    <p className="text-xs text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePayment}
                disabled={loading}
                className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Pay ₹{total.toLocaleString()}
                    <ChevronRight size={16} />
                  </>
                )}
              </motion.button>

              {/* Trust Badges */}
              <div className="mt-5 flex items-center justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Shield size={12} />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock size={12} />
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard size={12} />
                  <span>Razorpay</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
