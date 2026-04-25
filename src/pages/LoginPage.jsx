import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { X } from 'lucide-react';

const maxDate = new Date();
maxDate.setFullYear(maxDate.getFullYear() - 18);
const maxDateString = maxDate.toISOString().split('T')[0];

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'login';
  const [religion, setReligion] = useState('');
  const [caste, setCaste] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
    gender: 'Male', dob: '', onBehalf: 'Self'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberMeEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const castesList = {
    Hindu: [
      'Bunt', 'Billava', 'Mogaveera', 'Brahmin (GSB)', 'Vishwakarma (Achari)',
      'Devadiga', 'Kulala (Kumbara)', 'Ganiga', 'Naika / Nayak', 'SC / ST'
    ],
    Christian: [
      'Roman Catholic', 'Syrian Catholic', 'CSI (Church of South India)',
      'Protestant', 'Pentecostal', 'Born Again Christian'
    ]
  };

  const isRegister = type === 'register';
  const isMembers = type === 'members';

  let title = 'Account Login';
  let subtitle = 'Sign in to access your profile';
  let btnText = 'Sign In';

  if (isRegister) {
    title = 'Create an Account';
    subtitle = 'Start your forever journey';
    btnText = 'Register';
  } else if (isMembers) {
    title = 'Member Access';
    subtitle = 'Sign in to view active members';
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        if (!religion || !caste) {
          setError('Please select religion and caste');
          setIsLoading(false);
          return;
        }

        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, religion, caste })
        });
        
        let data;
        try {
          data = await res.json();
        } catch (err) {
          throw new Error('Registration server unavailable. Please try again later.');
        }
        if (!res.ok) throw new Error(data?.message || 'Registration failed. Please check your inputs.');
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('userFilter', JSON.stringify({ religion, caste }));
        localStorage.setItem('userProfile', JSON.stringify(data.user));
        
        if (data.user.status === 'pending' || data.user.status === 'rejected') {
          navigate('/pending');
        } else {
          navigate('/active-members');
        }
      } else {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        
        let data;
        try {
          data = await res.json();
        } catch (err) {
          throw new Error('Login server unavailable. Please check your connection and try again.');
        }
        if (!res.ok) throw new Error(data?.message || 'Login failed. Invalid email or password.');
        
        if (data.user.role === 'admin') {
          throw new Error('Admins must use the dedicated admin login portal.');
        }

        if (rememberMe) {
          localStorage.setItem('rememberMeEmail', formData.email);
        } else {
          localStorage.removeItem('rememberMeEmail');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('userFilter', JSON.stringify({ religion: data.user.religion, caste: data.user.caste }));
        localStorage.setItem('userProfile', JSON.stringify(data.user));

        if (data.user.status === 'pending' || data.user.status === 'rejected') {
          window.location.href = '/pending';
        } else {
          window.location.href = '/active-members';
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-20 bg-canvas flex items-center justify-center">
      <div className={`${isRegister ? 'max-w-lg' : 'max-w-md'} w-full px-6 transition-all duration-300`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">{title}</h1>
            <p className="text-gray-500">{subtitle}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {isRegister && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">On Behalf</label>
                  <select name="onBehalf" value={formData.onBehalf} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-sm bg-white">
                    <option>Self</option>
                    <option>Son</option>
                    <option>Daughter</option>
                    <option>Brother</option>
                    <option>Sister</option>
                    <option>Friend</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="First Name" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Last Name" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-sm bg-white">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">Date Of Birth</label>
                    <input type="date" name="dob" max={maxDateString} value={formData.dob} onChange={handleInputChange} required className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-sm" />
                  </div>
                </div>
              </>
            )}

            <div className={isRegister ? "grid grid-cols-2 gap-3" : "space-y-4"}>
              <div>
                <label className={`block font-semibold text-gray-700 ${isRegister ? 'text-[11px] uppercase tracking-wider mb-1' : 'text-sm mb-1'}`}>Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full ${isRegister ? 'px-3 py-2.5 text-sm' : 'px-4 py-3'} rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all bg-white`} 
                  placeholder={isRegister ? "Email address" : "Enter your email"} 
                />
              </div>
              
              {isRegister ? (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all bg-white" 
                      placeholder="Phone number" 
                    />
                  </div>
                  <div className="col-span-2 text-[10px] text-gray-400 -mt-1 italic">
                    Note: Email and Phone number will require verification before final access.
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1 mt-1">Religion</label>
                    <select 
                      value={religion}
                      onChange={(e) => { setReligion(e.target.value); setCaste(''); }}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-sm bg-white"
                      required
                    >
                      <option value="">Select Religion</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Christian">Christian</option>
                    </select>
                  </div>
                  {religion && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1 mt-3">Caste</label>
                      <select 
                        value={caste}
                        onChange={(e) => setCaste(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-sm bg-white"
                        required
                      >
                        <option value="">Select Caste</option>
                        {castesList[religion]?.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all bg-white" 
                    placeholder="Enter your password" 
                  />
                </div>
              )}
            </div>

            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1 mt-1">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all bg-white" 
                    placeholder="••••••••" 
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Minimum 8 characters</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1 mt-1">Confirm password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all bg-white" 
                    placeholder="••••••••" 
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Minimum 8 characters</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm pt-2">
              <label className={`flex items-center gap-2 ${isRegister ? 'text-gray-500 text-xs' : 'text-gray-600'}`}>
                <input 
                  type="checkbox" 
                  className="rounded text-primary focus:ring-primary" 
                  required={isRegister} 
                  checked={isRegister ? undefined : rememberMe}
                  onChange={(e) => !isRegister && setRememberMe(e.target.checked)}
                />
                {isRegister ? (
                  <span>By signing up you agree to our <Link to="/terms" className="text-accent hover:underline">terms and conditions.</Link></span>
                ) : (
                  "Remember me"
                )}
              </label>
              {!isRegister && <Link to="/forgot-password" className="text-primary hover:text-primary-hover font-medium">Forgot Password?</Link>}
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-primary-hover text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all mt-4 disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : btnText}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            {isRegister ? (
              <>Already have an account? <Link to="/login?type=login" className="text-accent font-semibold hover:text-accent-dark">Sign In</Link></>
            ) : (
              <>Don't have an account? <Link to="/login?type=register" className="text-accent font-semibold hover:text-accent-dark">Register Free</Link></>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
