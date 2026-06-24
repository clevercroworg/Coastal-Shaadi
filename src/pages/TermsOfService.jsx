import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Scale, Users, ShieldAlert, AlertTriangle, CreditCard, UserX, Info, Gavel, ArrowRight } from 'lucide-react';
import { MandalaPattern, FlowerCorner, OrnamentDivider } from '../components/Decorative';

export default function TermsOfService() {
  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms', icon: Scale },
    { id: 'eligibility', title: '2. Eligibility Criteria', icon: Users },
    { id: 'verification', title: '3. Safety & Verification', icon: Info },
    { id: 'conduct', title: '4. Code of Conduct', icon: AlertTriangle },
    { id: 'billing', title: '5. Packages & Billing', icon: CreditCard },
    { id: 'termination', title: '6. Account Suspension', icon: UserX },
    { id: 'liability', title: '7. Liability Limitations', icon: ShieldAlert },
    { id: 'governing-law', title: '8. Governing Law', icon: Gavel }
  ];

  const [activeSection, setActiveSection] = useState('acceptance');

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
        title="Terms of Service" 
        subtitle="Please read our terms of service carefully before accessing our matrimonial platform." 
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
                <Scale className="w-5 h-5 text-accent" />
                <span>Agreement Terms</span>
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
                  Welcome to <strong className="text-primary">Coastal Shaadi</strong>, the premium matrimonial service designed exclusively for the coastal communities of Udupi and Mangalore. By accessing, browsing, or registering on our platform, you agree to comply with and be bound by these Terms of Service.
                </p>
                <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                    <strong>Please Note:</strong> This is a legally binding contract between you and Coastal Shaadi. If you do not agree with any part of these terms, you are prohibited from using our services.
                  </p>
                </div>
              </div>

              {/* Section 1: Acceptance of Terms */}
              <section id="acceptance" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">1. Acceptance of Terms</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  These Terms of Service govern your use of the Coastal Shaadi website, mobile applications, and matchmaking features. We reserve the right to modify these terms at any time. Changes will be posted here, and your continued usage of our platform indicates acceptance of updated guidelines.
                </p>
              </section>

              <OrnamentDivider />

              {/* Section 2: Eligibility Criteria */}
              <section id="eligibility" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">2. Eligibility & Membership Criteria</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To register as a member of Coastal Shaadi, you must meet the following eligibility conditions:
                </p>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span><strong>Legal Marriageable Age:</strong> You must be at least 18 years of age (for female members) or 21 years of age (for male members), or satisfy the legal marriage age criteria in your country of residence.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span><strong>Marital Status:</strong> You must either be single, legally divorced, widowed, or have your marriage legally annulled. Active bigamy is strictly forbidden.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span><strong>Coastal Belt Intent:</strong> The platform is customized for individuals hailing from or looking to marry into families within the Udupi, Dakshina Kannada (Mangalore), and broader Karnataka coastal region.</span>
                  </li>
                </ul>
              </section>

              <OrnamentDivider />

              {/* Section 3: Safety & Verification */}
              <section id="verification" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <Info className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">3. Safety & Verification Procedures</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To maintain the integrity of our matrimonial community:
                </p>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span><strong>Mandatory Auditing:</strong> The administrative team manually reviews and approves every newly registered profile. Accounts remain "Pending" and cannot access member details until approved.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span><strong>ID Proof Submission:</strong> Members are requested to upload valid government identity proofs. Failure to submit or fake submissions will lead to immediate profile rejection.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span><strong>User Vigilance:</strong> While we vet profiles, Coastal Shaadi does not conduct full criminal background checks. Users must exercise due diligence, safety rules, and family verification checks before entering relationships.</span>
                  </li>
                </ul>
              </section>

              <OrnamentDivider />

              {/* Section 4: Code of Conduct */}
              <section id="conduct" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">4. Code of Conduct & Profile Guidelines</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Members must act honorably and respectfully. You agree that you will not:
                </p>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span>Provide misleading, inaccurate, or forged details about your age, marital status, job, or family.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span>Harass, stalk, abuse, or send offensive messages to other members of the platform.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span>Use the platform for commercial solicitations, advertising, or financial scams (such as requesting money from matches).</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span>Attempt to scrape profiles, bypass copy-protection overlays, or distribute copyrighted images from our platform.</span>
                  </li>
                </ul>
              </section>

              <OrnamentDivider />

              {/* Section 5: Packages & Billing */}
              <section id="billing" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">5. Subscription Packages & Billing</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Access to detailed matches, direct chat portals, and unblurred contacts is restricted to premium tiers (Basic, Premium, Elite). By subscribing, you agree to pay the designated upfront fees. We do not automatically bill your payment source on renewal; renewal payments are explicitly processed upon your manual checkout.
                </p>
              </section>

              <OrnamentDivider />

              {/* Section 6: Account Suspension */}
              <section id="termination" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <UserX className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">6. Account Suspension & Termination</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Coastal Shaadi reserves the right to suspend or delete your matrimonial profile immediately, without notice, if you breach these Terms of Service. In case of suspension due to behavioral violations or fraudulent submissions, any active premium subscription fee is forfeit and non-refundable.
                </p>
              </section>

              <OrnamentDivider />

              {/* Section 7: Liability Limitations */}
              <section id="liability" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">7. Disclaimers & Limitation of Liability</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Coastal Shaadi acts strictly as a directory and matching platform. We provide profile details as submitted by users and do not guarantee:
                </p>
                <ul className="space-y-2 pl-2 text-gray-600 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-accent" />
                    <span>The absolute accuracy of user profiles, horoscopes, or details.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-accent" />
                    <span>The successful outcome of any contact or matching communication.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-accent" />
                    <span>Compatible match guarantees or response times from active users.</span>
                  </li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  Coastal Shaadi is not liable for any direct or indirect damages arising out of interactions, marriages, or disputes between platform members.
                </p>
              </section>

              <OrnamentDivider />

              {/* Section 8: Governing Law */}
              <section id="governing-law" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <Gavel className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">8. Governing Law & Jurisdiction</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising out of the use of our matrimonial network shall be subject to the exclusive jurisdiction of the competent courts in <strong>Udupi / Mangalore, Karnataka</strong>.
                </p>
                <div className="p-4 rounded-2xl bg-canvas border border-gray-100 text-sm text-gray-500">
                  For further clarification or to report profile violations, contact our support division at <a href="mailto:support@coastalshaadi.com" className="text-primary font-bold hover:underline">support@coastalshaadi.com</a>.
                </div>
              </section>

            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
