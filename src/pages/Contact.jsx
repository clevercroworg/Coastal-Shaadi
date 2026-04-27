import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: 'Your message has been sent successfully! We will get back to you soon.' });
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to send message.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'A network error occurred. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="pb-20">
      <PageHeader 
        title="Contact Us" 
        subtitle="We're here to help you on your journey. Reach out to our dedicated support team." 
      />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 rounded-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
            <h2 className="text-2xl font-serif font-bold text-primary mb-6">Send us a message</h2>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {status.message && (
                <div className={`p-4 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {status.message}
                </div>
              )}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all" placeholder="John" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all" placeholder="Doe" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all" placeholder="john@example.com" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea rows="4" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all resize-none" placeholder="How can we help you?" required></textarea>
              </div>
              
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-primary-hover text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? 'Sending...' : 'Send Message'}
                {!loading && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 lg:mt-8"
          >
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">Get in Touch</h2>
              <p className="text-gray-600 leading-relaxed">
                Whether you have a question about our premium matchmaking services, need assistance with your profile, or want to share your success story, our team is ready to listen.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-gray-100 transition-all">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-accent-dark" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                  <p className="text-gray-600">support@coastalshaadi.com</p>
                </div>
              </div>


            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
