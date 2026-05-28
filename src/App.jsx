import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import PricingPage from './pages/PricingPage';
import Contact from './pages/Contact';
import ActiveMembers from './pages/ActiveMembers';
import LoginPage from './pages/LoginPage';
import MyProfile from './pages/MyProfile';
import Interests from './pages/Interests';
import Shortlist from './pages/Shortlist';
import Messaging from './pages/Messaging';
import Ignored from './pages/Ignored';
import ForgotPassword from './pages/ForgotPassword';
import Heartbeat from './components/Heartbeat';
import AdminDashboard from './pages/AdminDashboard';
import PendingPage from './pages/PendingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CheckoutPage from './pages/CheckoutPage';

// Context
import { MemberProvider } from './context/MemberContext';
import { ToastProvider } from './context/ToastContext';

// Auth Guard
import ProtectedRoute from './components/ProtectedRoute';

import AdminLogin from './pages/AdminLogin';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="font-sans text-gray-900 overflow-x-hidden bg-canvas min-h-screen flex flex-col">
      <Heartbeat />
      {!isAdminRoute && <Navbar />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/success-stories" element={<SuccessStoriesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/pending" element={<PendingPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Protected Routes */}
          <Route path="/active-members" element={<ProtectedRoute><ActiveMembers /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path="/interests" element={<ProtectedRoute><Interests /></ProtectedRoute>} />
          <Route path="/shortlist" element={<ProtectedRoute><Shortlist /></ProtectedRoute>} />
          <Route path="/messaging" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />
          <Route path="/ignored" element={<ProtectedRoute><Ignored /></ProtectedRoute>} />
          <Route path="/checkout/:plan" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        </Routes>
      </div>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <MemberProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppContent />
        </BrowserRouter>
      </MemberProvider>
    </ToastProvider>
  );
}

export default App;
