import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { CreditCard, XCircle, HelpCircle, AlertCircle, CalendarX, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { MandalaPattern, FlowerCorner, OrnamentDivider } from '../components/Decorative';
import { motion } from 'framer-motion';

export default function RefundPolicy() {
  const sections = [
    { id: 'billing', title: '1. Subscription & Billing', icon: CreditCard },
    { id: 'non-refundable', title: '2. Non-Refundability', icon: XCircle },
    { id: 'exceptions', title: '3. Special Exceptions', icon: HelpCircle },
    { id: 'no-refund-cases', title: '4. Non-Eligible Cases', icon: AlertCircle },
    { id: 'cancellation', title: '5. Account Cancellation', icon: CalendarX },
    { id: 'processing', title: '6. Refund Processing', icon: Clock }
  ];

  const [activeSection, setActiveSection] = useState('billing');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220; // Offset for header/navbar
      
      // Find which section is currently active
      for (let i = 0; i < sections.length; i++) {
        const currentSection = sections[i];
        const el = document.getElementById(currentSection.id);
        
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(currentSection.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -180; // Offset to account for sticky navbars
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <main className="pb-24 bg-canvas min-h-screen relative overflow-hidden">
      {/* Background Ornaments */}
      <MandalaPattern className="absolute top-48 right-0 hidden lg:block opacity-[0.03]" size={500} />
      <MandalaPattern className="absolute bottom-10 left-0 hidden lg:block opacity-[0.03]" size={450} />
      <FlowerCorner className="absolute top-28 left-0 hidden lg:block opacity-[0.15]" />
      
      <PageHeader 
        title="Refund Policy" 
        subtitle="Transparent terms regarding subscription billing and cancellations" 
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column: Sticky Sidebar Table of Contents */}
          <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-28 h-fit z-20">
            <div className="bg-white rounded-3xl p-6 shadow-premium border border-accent/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 opacity-5">
                <MandalaPattern size={120} />
              </div>
              <h3 className="text-lg font-serif font-bold text-primary mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent" />
                <span>Policy Sections</span>
              </h3>
              
              {/* Mobile View: Horizontal Scroll bar */}
              <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0 scrollbar-none">
                {sections.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left whitespace-nowrap lg:whitespace-normal text-xs sm:text-sm font-medium transition-all duration-300 ${
                        isActive 
                          ? 'bg-primary text-white shadow-md shadow-primary/10' 
                          : 'text-gray-600 hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : 'text-gray-400'}`} />
                      <span>{sec.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Column: Content Card */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-premium border border-accent/10 space-y-12 relative">
              <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-5 rotate-90">
                <FlowerCorner />
              </div>
              
              {/* Introduction */}
              <div className="border-b border-gray-100 pb-8">
                <p className="text-gray-600 leading-relaxed text-base">
                  At <strong className="text-primary">Coastal Shaadi</strong>, we strive to provide premium, secure, and authentic matchmaking services tailored to the Udupi-Mangalore coastal belt. By upgrading to any of our paid subscription plans (Basic, Premium, Elite), you agree to the terms detailed in this Refund Policy.
                </p>
                <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                    <strong>Important:</strong> Our matchmaking platform relies on immediate service provisioning, which unlocks access to private and verified profiles. Please review our refund guidelines carefully before purchasing.
                  </p>
                </div>
              </div>

              {/* Section 1: Billing */}
              <section id="billing" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">1. Subscription Plans & Billing</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We offer various tiered paid subscription plans designed to suit different matrimonial search goals. Current pricing structures include:
                </p>
                <div className="grid sm:grid-cols-3 gap-4 my-4">
                  <div className="p-4 rounded-2xl border border-gray-100 bg-canvas text-center">
                    <h4 className="font-bold text-primary text-sm">Basic Plan</h4>
                    <p className="text-2xl font-serif font-bold text-gray-900 mt-1">₹1,999</p>
                    <span className="text-xs text-gray-500 block mt-0.5">3 Months Validity</span>
                  </div>
                  <div className="p-4 rounded-2xl border-2 border-accent/20 bg-primary/5 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-accent text-[8px] font-bold text-gray-900 px-2 py-0.5 rounded-bl-lg uppercase">Best Value</div>
                    <h4 className="font-bold text-primary text-sm">Premium Plan</h4>
                    <p className="text-2xl font-serif font-bold text-primary mt-1">₹3,499</p>
                    <span className="text-xs text-primary/70 block mt-0.5">6 Months Validity</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-gray-100 bg-canvas text-center">
                    <h4 className="font-bold text-primary text-sm">Elite Plan</h4>
                    <p className="text-2xl font-serif font-bold text-gray-900 mt-1">₹5,999</p>
                    <span className="text-xs text-gray-500 block mt-0.5">12 Months Validity</span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  All subscription fees are billed in full at the time of purchase. Automatic renewals do not apply; we will request confirmation before billing for renewal once your current validity expires.
                </p>
              </section>

              <OrnamentDivider />

              {/* Section 2: Non-Refundability */}
              <section id="non-refundable" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">2. Policy of Non-Refundability</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Because paid subscriptions grant immediate, full access to premium resources—including direct contact details, chat logs, profile visibility boosts, and matchmaking filters—<strong>all fee payments are non-refundable</strong>.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  By completing payment and initiating your subscription, you acknowledge that Coastal Shaadi's services begin immediately. Consequently, you forfeit any right to withdraw or claim refunds under statutory cooling-off periods.
                </p>
              </section>

              <OrnamentDivider />

              {/* Section 3: Special Exceptions */}
              <section id="exceptions" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">3. Eligible Special Exceptions</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We review requests on a case-by-case basis and may issue a full or partial refund under the following strict conditions:
                </p>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span><strong>Double-Billing Errors:</strong> If our payment gateway accidentally processes multiple charges for the same transaction, the duplicate payments will be refunded in full.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span><strong>System Failures:</strong> In the rare event of a severe, prolonged platform outage that renders the premium service completely unusable for more than 7 consecutive business days, a prorated refund may be considered.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span><strong>Verification Refusal:</strong> If your profile fails our verification process (e.g., ID proof submission) prior to profile activation, we will cancel your account and refund any upfront subscription fee.</span>
                  </li>
                </ul>
              </section>

              <OrnamentDivider />

              {/* Section 4: Non-Eligible Cases */}
              <section id="no-refund-cases" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">4. Non-Eligible Cases</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Refunds will not be issued under the following circumstances:
                </p>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span><strong>Change of Mind:</strong> If you decide not to use the service after upgrading, or decide to pursue matchmaking offline.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span><strong>Policy Violation Suspensions:</strong> If your profile is flagged and suspended due to fraud, harassment, fake details, or other violations of our Terms of Service.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span><strong>Match Quality / Success rate:</strong> We provide matchmaking tools but cannot guarantee matches, response rates from other members, or marriage success.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span><strong>Tight Search Filters:</strong> Having few matches due to setting extremely restrictive search criteria.</span>
                  </li>
                </ul>
              </section>

              <OrnamentDivider />

              {/* Section 5: Cancellation */}
              <section id="cancellation" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <CalendarX className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">5. Account Cancellation</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  You are free to cancel your active premium subscription or delete your profile at any time. You can do this directly from your Dashboard settings or by raising a ticket with our support team.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Please note that canceling a subscription stops future access upon expiration but does not qualify you for a prorated refund of the remaining validity period.
                </p>
              </section>

              <OrnamentDivider />

              {/* Section 6: Processing */}
              <section id="processing" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">6. Refund Processing Timeline</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  If an exception is approved by our management team, the refund will be processed back to the original payment source within <strong>5 to 7 business days</strong>. Banks or payment gateways may take additional time to reflect the credited amount in your account.
                </p>
                <div className="p-4 rounded-2xl bg-canvas border border-gray-100 text-sm text-gray-500">
                  To request a billing review, email our accounts division at <a href="mailto:support@coastalshaadi.com" className="text-primary font-bold hover:underline">support@coastalshaadi.com</a> with your Profile ID and transaction details.
                </div>
              </section>

            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
