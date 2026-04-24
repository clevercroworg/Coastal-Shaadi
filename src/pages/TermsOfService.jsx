import React from 'react';
import PageHeader from '../components/PageHeader';

export default function TermsOfService() {
  return (
    <main className="pb-20">
      <PageHeader 
        title="Terms of Service" 
        subtitle="Please read our terms carefully" 
      />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              By accessing and using Coastal Shaadi, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To use Coastal Shaadi, you must be at least 18 years of age (or the legal age of marriage in your jurisdiction) and possess the legal authority, right, and capacity to enter into this agreement. Our services are strictly for personal matchmaking and not for commercial purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Conduct and Content</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You are solely responsible for the information and content you provide on your profile. You agree to provide accurate, current, and complete information. You must not post defamatory, offensive, or fraudulent content. We reserve the right to review, suspend, or terminate accounts that violate our community standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Account Security</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Please notify us immediately if you suspect any unauthorized use of your account.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Disclaimer of Warranties</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Coastal Shaadi acts as an intermediary platform for matchmaking. While we strive to verify profiles, we do not guarantee the absolute accuracy of user-provided information or the success of any match. Users are advised to exercise independent judgment and caution before making commitments.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
