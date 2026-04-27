import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { Check, Crown, Sparkles, Zap, Star, X, ArrowRight } from 'lucide-react';
import { OrnamentDivider, MandalaPattern, FlowerBouquet, FlowerCorner } from './Decorative';

const plans = [
  {
    name: "Free",
    price: "₹0",
    duration: "Forever",
    icon: <Star className="w-6 h-6" />,
    color: "gray",
    features: [
      "Create profile",
      "Browse matches",
      "View blurred contact details"
    ],
    highlight: false,
    cta: "Current Plan"
  },
  {
    name: "Basic",
    price: "₹1,999",
    duration: "3 Months",
    icon: <Zap className="w-6 h-6" />,
    color: "blue",
    features: [
      "Unlock contact details (limited)",
      "20 chats",
      "See who viewed your profile",
      "Limited connects (20)"
    ],
    highlight: false,
    cta: "Choose Basic"
  },
  {
    name: "Premium",
    price: "₹3,499",
    duration: "6 Months",
    icon: <Sparkles className="w-6 h-6" />,
    color: "purple",
    features: [
      "Unlimited chat & calls",
      "Limited connects (50)",
      "View all contact details",
      "Profile highlighted in searches"
    ],
    highlight: true,
    cta: "Go Premium"
  },
  {
    name: "Elite",
    price: "₹5,999",
    duration: "12 Months",
    icon: <Crown className="w-6 h-6" />,
    color: "amber",
    features: [
      "Unlimited connects",
      "Unlimited chats & calls",
      "WhatsApp connectivity",
      "Top Match boost in Udupi-Mangalore",
      "Profile badges (Elite User)"
    ],
    highlight: false,
    cta: "Go Elite"
  }
];

export default function Packages() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Get current user plan
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const currentPlan = userProfile.memberType || 'Free';

  const handleSelectPlan = (plan) => {
    if (plan.name === currentPlan) return; // Already on this plan
    if (plan.name === 'Free') return; // Can't downgrade to free from UI
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const getButtonText = (plan) => {
    if (plan.name === currentPlan) return '✓ Current Plan';
    if (plan.name === 'Free') return 'Free Forever';
    return plan.cta;
  };

  const getButtonStyle = (plan) => {
    if (plan.name === currentPlan) {
      return 'bg-green-100 text-green-700 cursor-default border border-green-200';
    }
    if (plan.highlight) {
      return 'bg-gradient-to-r from-accent to-yellow-500 text-gray-900 shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.5)]';
    }
    return 'bg-gray-100 text-gray-800 hover:bg-primary hover:text-white';
  };

  return (
    <>
      <section className="relative py-10 lg:py-14 bg-canvas overflow-hidden" id="pricing">
        {/* Background */}
        <MandalaPattern className="absolute top-0 right-0 hidden lg:block" size={400} opacity={0.05} />
        <MandalaPattern className="absolute bottom-0 left-0 hidden lg:block" size={350} opacity={0.05} />
        <FlowerCorner className="absolute top-0 left-0 hidden lg:block" opacity={0.3} />
        <FlowerBouquet className="absolute bottom-20 right-10 hidden lg:block" size={150} opacity={0.25} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8" ref={ref}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="text-accent text-sm tracking-[0.2em] uppercase font-bold mb-4 block">Membership</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-4">
              Curated <span className="text-accent">Packages</span>
            </h2>
            <OrnamentDivider className="mb-5" />
            <p className="text-gray-600 text-lg">
              Transparent pricing. No hidden fees. Begin free and upgrade when you're ready.
            </p>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`relative rounded-3xl p-7 border-2 transition-all duration-500 ${
                  plan.highlight
                    ? 'bg-primary text-white border-primary shadow-[0_20px_60px_rgba(128,0,0,0.25)] lg:-translate-y-4 z-10'
                    : plan.name === currentPlan
                    ? 'bg-white text-gray-900 border-green-300 shadow-md ring-2 ring-green-200'
                    : 'bg-white text-gray-900 border-gray-100 shadow-sm hover:border-accent/30 hover:shadow-premium'
                }`}
              >
                {/* Popular badge */}
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-yellow-400 text-gray-900 text-xs font-bold uppercase tracking-wider py-1.5 px-5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                {/* Current plan badge */}
                {plan.name === currentPlan && !plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow">
                    Your Plan
                  </div>
                )}

                {/* Icon & Name */}
                <div className="text-center mb-6">
                  <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                    plan.highlight ? 'bg-white/15 text-accent' : 'bg-primary/5 text-primary'
                  }`}>
                    {plan.icon}
                  </div>
                  <h3 className={`text-lg font-serif font-bold ${plan.highlight ? 'text-accent' : 'text-primary'}`}>
                    {plan.name} Plan
                  </h3>
                </div>

                {/* Price */}
                <div className={`text-center pb-6 mb-6 border-b ${plan.highlight ? 'border-white/15' : 'border-gray-100'}`}>
                  <span className="text-4xl font-bold font-serif">{plan.price}</span>
                  <p className={`text-sm mt-1 ${plan.highlight ? 'text-white/60' : 'text-gray-500'}`}>
                    for {plan.duration}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check size={16} className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-accent' : 'text-primary'}`} />
                      <span className={plan.highlight ? 'text-white/85' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <motion.button
                  whileHover={plan.name !== currentPlan ? { scale: 1.03 } : {}}
                  whileTap={plan.name !== currentPlan ? { scale: 0.97 } : {}}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={plan.name === currentPlan || plan.name === 'Free'}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${getButtonStyle(plan)}`}
                >
                  {getButtonText(plan)}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showModal && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  selectedPlan.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                  selectedPlan.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                  selectedPlan.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {selectedPlan.icon}
                </div>
                <h3 className="text-2xl font-serif font-bold text-primary">{selectedPlan.name} Plan</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{selectedPlan.price} <span className="text-sm font-normal text-gray-500">/ {selectedPlan.duration}</span></p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <p className="text-sm text-gray-600 mb-3 font-medium">What you'll get:</p>
                <ul className="space-y-2">
                  {selectedPlan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={14} className="text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700 text-center">
                  <strong>To activate your {selectedPlan.name} plan,</strong> please contact our support team. We'll set up your subscription within 24 hours.
                </p>
              </div>

              <a
                href={`mailto:support@coastalshaadi.com?subject=Upgrade%20to%20${selectedPlan.name}%20Plan&body=Hi%20Coastal%20Shaadi%20Team,%0A%0AI%20would%20like%20to%20upgrade%20to%20the%20${selectedPlan.name}%20Plan%20(${selectedPlan.price}%20for%20${selectedPlan.duration}).%0A%0AMy%20Member%20ID:%20${userProfile.memberId || 'N/A'}%0AName:%20${userProfile.firstName || ''}%20${userProfile.lastName || ''}%0AEmail:%20${userProfile.email || ''}%0A%0APlease%20guide%20me%20on%20the%20payment%20process.%0A%0AThank%20you!`}
                className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                Contact Support to Upgrade <ArrowRight size={16} />
              </a>
              <p className="text-xs text-gray-400 text-center mt-3">
                You can also reach us at <a href="mailto:support@coastalshaadi.com" className="text-primary hover:underline">support@coastalshaadi.com</a>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
