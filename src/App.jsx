import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

// Context
import { MemberProvider } from './context/MemberContext';
import { ToastProvider } from './context/ToastContext';

// Auth Guard
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ToastProvider>
      <MemberProvider>
      <BrowserRouter>
        <div className="font-sans text-gray-900 overflow-x-hidden bg-canvas min-h-screen flex flex-col">
          <Heartbeat />
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/success-stories" element={<SuccessStoriesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes */}
              <Route path="/active-members" element={<ProtectedRoute><ActiveMembers /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
              <Route path="/interests" element={<ProtectedRoute><Interests /></ProtectedRoute>} />
              <Route path="/shortlist" element={<ProtectedRoute><Shortlist /></ProtectedRoute>} />
              <Route path="/messaging" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />
              <Route path="/ignored" element={<ProtectedRoute><Ignored /></ProtectedRoute>} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
      </MemberProvider>
    </ToastProvider>
  );
}

export default App;
