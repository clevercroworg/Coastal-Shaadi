import React from 'react';
import PageHeader from '../components/PageHeader';

export default function PrivacyPolicy() {
  return (
    <main className="pb-20">
      <PageHeader 
        title="Privacy Policy" 
        subtitle="Your privacy is our priority" 
      />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              At Coastal Shaadi, we collect information to provide you with the best matchmaking experience. This includes personal information provided during registration (like name, age, gender, contact details), profile information (like religion, caste, occupation, preferences), and usage data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Create and manage your matchmaking profile.</li>
              <li>Provide accurate match recommendations.</li>
              <li>Facilitate communication between interested members.</li>
              <li>Improve our platform and user experience.</li>
              <li>Ensure the security and integrity of our service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Sharing and Security</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We do not sell your personal data to third parties. Your profile details are shared with other registered members solely for matchmaking purposes. We implement robust security measures to protect your data from unauthorized access, alteration, or disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You have the right to access, correct, or delete your personal information at any time. You can manage your privacy settings and profile visibility directly from your dashboard. If you wish to permanently delete your account, you may contact our support team.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
