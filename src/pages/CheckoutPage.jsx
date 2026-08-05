import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Zap, Star, ArrowLeft, Shield, Lock, CreditCard, Phone, Mail, User, ChevronRight, X } from 'lucide-react';
import { useMembers } from '../context/MemberContext';

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

const planRedirectUrls = {
  basic: 'https://razorpay.me/@coastalshaadi/basic',
  premium: 'https://razorpay.me/@coastalshaadi/premium',
  elite: 'https://razorpay.me/@coastalshaadi/elite'
};

export default function CheckoutPage() {
  const { plan } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const mountedRef = useRef(true);

  const { userProfile: contextUserProfile, syncUserProfile } = useMembers() || {};

  useEffect(() => {
    if (syncUserProfile) {
      syncUserProfile();
    }
  }, [syncUserProfile]);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  let storedProfile = {};
  try {
    const raw = localStorage.getItem('userProfile');
    if (raw && raw !== 'undefined' && raw !== 'null') {
      storedProfile = JSON.parse(raw) || {};
    }
  } catch (e) { storedProfile = {}; }

  const userProfile = contextUserProfile || storedProfile;
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
    // Prevent downgrade or equal plan checkout
    const currentRank = planRank[userProfile.memberType || 'Free'];
    const targetRank = planRank[selectedPlan.name];
    if (targetRank <= currentRank) {
      navigate('/pricing');
      return;
    }
  }, [userProfile, selectedPlan, navigate]);

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

      if (paymentMethod === 'razorpay') {
        const token = localStorage.getItem('token');
        try {
          // Attempt Razorpay order creation & popup modal
          const res = await fetch('/api/razorpay/create-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, plan: plan?.toLowerCase() })
          });

          const data = await res.json();

          if (res.ok && data.orderId && window.Razorpay) {
            const options = {
              key: data.keyId,
              amount: data.amount,
              currency: data.currency,
              name: 'Coastal Shaadi',
              description: `${selectedPlan.name} Plan (${selectedPlan.duration})`,
              order_id: data.orderId,
              handler: async function (response) {
                setVerifying(true);
                try {
                  const verifyRes = await fetch('/api/razorpay/verify-payment', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      userId,
                      plan: plan?.toLowerCase()
                    })
                  });

                  const verifyData = await verifyRes.json();
                  if (verifyRes.ok && verifyData.user) {
                    const updatedProfile = { ...userProfile, ...verifyData.user };
                    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
                    window.dispatchEvent(new Event('profileUpdated'));
                    setSuccess(true);
                  } else {
                    setError(verifyData.message || 'Payment verification failed.');
                  }
                } catch (err) {
                  setError('Payment verification failed. Please contact support.');
                } finally {
                  setVerifying(false);
                  setLoading(false);
                }
              },
              prefill: {
                name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`,
                email: userProfile.email || '',
                contact: userProfile.phone || ''
              },
              theme: { color: '#d946ef' }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            setLoading(false);
            return;
          }
        } catch (apiErr) {
          console.warn('Razorpay order creation API unavailable, falling back to Razorpay Pay Link:', apiErr);
        }

        // Fallback to Razorpay hosted Pay Link
        const redirectUrl = planRedirectUrls[plan?.toLowerCase()];
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          throw new Error('Invalid plan selected');
        }
      } else if (paymentMethod === 'manual') {
        const whatsappUrl = `https://wa.me/918861002191?text=${encodeURIComponent(
          `Hi Coastal Shaadi, I want to purchase the ${selectedPlan.name} membership (₹${(selectedPlan.price + selectedPlan.gst).toLocaleString()}) via Bank Transfer. My Member ID is ${userProfile.memberId || 'N/A'}.`
        )}`;
        window.open(whatsappUrl, '_blank');
        setLoading(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      if (mountedRef.current) {
        setError(err.message || 'Something went wrong. Please try again.');
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
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="w-4 h-4 text-primary accent-primary" 
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">Razorpay Payment Gateway</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-primary text-white px-2 py-0.5 rounded-full">Instant</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Pay via UPI, GPay, PhonePe App, QR, Credit/Debit Cards & Netbanking</p>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-bold text-xs">Razorpay</div>
                    <div className="w-8 h-5 bg-gray-100 rounded flex items-center justify-center text-[8px] font-bold text-gray-500">UPI</div>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'manual' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="manual"
                    checked={paymentMethod === 'manual'}
                    onChange={() => setPaymentMethod('manual')}
                    className="w-4 h-4 text-primary accent-primary" 
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-gray-900">Bank Transfer (Manual)</span>
                    <p className="text-xs text-gray-500 mt-0.5">Transfer and share receipt via WhatsApp / Email</p>
                  </div>
                  <Phone size={18} className="text-gray-400" />
                </label>

                {paymentMethod === 'manual' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 leading-relaxed mt-3"
                  >
                    <p className="font-semibold mb-1">How to complete Manual Bank Transfer:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Click "Proceed to Pay" below to start a WhatsApp chat with our team.</li>
                      <li>We will provide you with the bank account details.</li>
                      <li>Make the transfer and share the screenshot/receipt of payment.</li>
                      <li>Our team will manually verify and activate your membership immediately.</li>
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 accent-primary rounded" />
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to the <Link to="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>, <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>, and <Link to="/refund-policy" className="text-primary hover:underline font-medium">Refund Policy</Link>. I understand that my subscription will be activated after payment confirmation.
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
                disabled={loading || verifying}
                className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-purple-700 via-primary to-primary-hover text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading || verifying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {verifying ? 'Verifying Razorpay Payment...' : 'Connecting to Razorpay...'}
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
                  <span>256-Bit SSL</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock size={12} />
                  <span>Razorpay Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard size={12} />
                  <span>UPI & Cards</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
