import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Shield, Eye, Lock, ShieldAlert, Sliders, Trash2, ArrowRight, CheckCircle } from 'lucide-react';
import { MandalaPattern, FlowerCorner, OrnamentDivider } from '../components/Decorative';

export default function PrivacyPolicy() {
  const sections = [
    { id: 'collection', title: '1. Information We Collect', icon: Eye },
    { id: 'usage', title: '2. How We Use Your Info', icon: Sliders },
    { id: 'sharing', title: '3. Data Sharing & Disclosure', icon: Shield },
    { id: 'security', title: '4. Security & Copy Protection', icon: Lock },
    { id: 'controls', title: '5. Profile Privacy Controls', icon: CheckCircle },
    { id: 'deletion', title: '6. Account & Data Deletion', icon: Trash2 }
  ];

  const [activeSection, setActiveSection] = useState('collection');

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
      <MandalaPattern className="absolute top-48 left-0 hidden lg:block opacity-[0.03]" size={500} />
      <MandalaPattern className="absolute bottom-10 right-0 hidden lg:block opacity-[0.03]" size={450} />
      <FlowerCorner className="absolute top-28 right-0 hidden lg:block opacity-[0.15] rotate-90" />
      
      <PageHeader 
        title="Privacy Policy" 
        subtitle="Your privacy is our priority. We are committed to safeguarding your personal details." 
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
                <Shield className="w-5 h-5 text-accent" />
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
                  At <strong className="text-primary">Coastal Shaadi</strong>, we are committed to protecting the privacy and security of our members from the Udupi-Mangalore coastal belt. This Privacy Policy details how we collect, handle, secure, and share your personal information.
                </p>
                <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                    <strong>Matrimonial Security Priority:</strong> Because we process highly personal information and verification proofs, we employ rigid security protocols to prevent profile scraping, unverified accesses, and screenshot captures.
                  </p>
                </div>
              </div>

              {/* Section 1: Information We Collect */}
              <section id="collection" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">1. Information We Collect</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To provide accurate matrimonial matches, we collect the following sets of data:
                </p>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span><strong>Registration Details:</strong> Personal identifiers including full name, contact number, email address, date of birth, gender, and family credentials.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span><strong>Matrimonial Preferences & Profile Data:</strong> Religion, caste, native place, ancestral location, education, job details, physical statistics, and partner expectation preferences.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span><strong>Identity Proof Documents:</strong> Government-issued ID uploads (e.g., Aadhaar Card) are requested solely for profile verification to keep the platform free of fraud. These are encrypted and never shown publicly.</span>
                  </li>
                </ul>
              </section>

              <OrnamentDivider />

              {/* Section 2: How We Use Your Info */}
              <section id="usage" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">2. How We Use Your Information</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We process the collected data for the following matchmaking operations:
                </p>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>Creating your public matchmaking profile so other verified members can browse your details.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>Using smart algorithms to recommend relevant profiles from Udupi, Mangalore, and surrounding coastal districts.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>Enabling secure communication (chat and connection requests) between interested members.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>Validating profile authenticity and preventing scam or commercial profile setups.</span>
                  </li>
                </ul>
              </section>

              <OrnamentDivider />

              {/* Section 3: Data Sharing & Disclosure */}
              <section id="sharing" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">3. Data Sharing & Disclosure Rules</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Your trust is paramount. We handle sharing strictly under these rules:
                </p>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span><strong>No Third-Party Sales:</strong> We do not sell, rent, or trade your personal details to third-party advertising networks or external businesses.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span><strong>Member-to-Member Visibility:</strong> Registered and approved members can view your profile information, except for private fields (such as government IDs) which are restricted.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span><strong>Contact Information:</strong> Contact numbers and full addresses are blurred and restricted. They are shared only when you accept a connection request, depending on your subscription tier.</span>
                  </li>
                </ul>
              </section>

              <OrnamentDivider />

              {/* Section 4: Security & Copy Protection */}
              <section id="security" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">4. Security & Photo Copy Protection</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To protect your photographs and personal information, Coastal Shaadi implements unique technical barriers:
                </p>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span><strong>Anti-Screenshot Protections:</strong> Development console utilities, F12 inspector keys, and keyboard print screen commands are monitored and blocked on active profile screens.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span><strong>Watermarked Photos:</strong> All uploaded profile pictures are processed with automatic secure watermark overlays to prevent misuse.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span><strong>Print-Disabling Styles:</strong> Web print styles are overridden to blank out profile content if a print command is initiated.</span>
                  </li>
                </ul>
              </section>

              <OrnamentDivider />

              {/* Section 5: Profile Privacy Controls */}
              <section id="controls" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">5. Profile Privacy Controls</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  You are in full control of your visibility. Through your profile settings dashboard, you can:
                </p>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span>Toggle profile photo visibility (show to all, show only to accepted matches, or keep blurred).</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span>Restrict who can send you direct chat messages or connect requests based on age, education, or community guidelines.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent shrink-0 mt-1" />
                    <span>Block or ignore specific profiles from seeing your details or contacting you.</span>
                  </li>
                </ul>
              </section>

              <OrnamentDivider />

              {/* Section 6: Account & Data Deletion */}
              <section id="deletion" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary">6. Account & Data Deletion</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  You retain the right to delete your data at any time. When you choose to delete your account:
                </p>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>Your profile is immediately taken offline and made invisible to all other members.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>Your private records, photos, and chat histories are queued for permanent deletion from our databases within 30 days, except where retention is legally mandated.</span>
                  </li>
                </ul>
                <p className="text-gray-600 leading-relaxed mb-6">
                  For any privacy questions, disputes, or to request manual account termination, please contact our designated Grievance & Compliance Officer:
                </p>
                <div className="bg-canvas border border-accent/20 rounded-2xl p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="text-gray-400 block text-xs uppercase tracking-wider font-semibold">Officer Designation</span>
                      <strong className="text-gray-900 text-base font-serif">Grievance & Compliance Desk</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs uppercase tracking-wider font-semibold">Email Address</span>
                      <a href="mailto:support@coastalshaadi.com" className="text-primary font-bold hover:underline text-base">support@coastalshaadi.com</a>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs uppercase tracking-wider font-semibold">Office Address</span>
                      <strong className="text-gray-900 text-base font-serif">Brahmavar, Udupi, Karnataka, India</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs uppercase tracking-wider font-semibold">Official Website</span>
                      <a href="https://coastalshaadi.com" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline text-base">coastalshaadi.com</a>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
