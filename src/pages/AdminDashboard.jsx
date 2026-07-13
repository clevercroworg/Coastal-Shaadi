import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Search, User as UserIcon, LogOut, ShieldCheck, Crown, Trash2, Eye } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import FullProfileModal from '../components/FullProfileModal';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const mapUserToMember = (user) => {
    if (!user) return null;
    const calculateAge = (dobString) => {
      if (!dobString) return '-';
      const birthDate = new Date(dobString);
      if (isNaN(birthDate.getTime())) return '-';
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    return {
      id: user.memberId || user._id,
      memberId: user.memberId,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
      type: user.memberType || 'Free',
      age: calculateAge(user.dob) !== '-' ? calculateAge(user.dob) : (user.profileData?.age || '-'),
      height: user.profileData?.height || '-',
      gender: user.gender || '-',
      religion: user.religion || '-',
      caste: user.caste || '-',
      subCaste: user.profileData?.subCaste || '-',
      language: user.profileData?.motherTongue || '-',
      maritalStatus: user.profileData?.maritalStatus || '-',
      profession: user.profileData?.profession || '-',
      country: user.profileData?.country || '-',
      state: user.profileData?.state || '-',
      city: user.profileData?.city || '-',
      location: [user.profileData?.city, user.profileData?.state, user.profileData?.country].filter(l => l && l !== '-').join(', ') || '-',
      image: user.image || null,
      additionalImages: user.additionalImages || [],
      whatsappConsent: user.whatsappConsent || false,
      whatsappNumber: user.whatsappNumber || '',
    };
  };

  const handlePlanChange = async (userId, newPlan) => {
    try {
      const token = localStorage.getItem('token');
      let planExpiry = null;
      if (newPlan !== 'Free') {
        const date = new Date();
        if (newPlan === 'Basic') date.setMonth(date.getMonth() + 3);
        else if (newPlan === 'Premium') date.setMonth(date.getMonth() + 6);
        else if (newPlan === 'Elite') date.setFullYear(date.getFullYear() + 1);
        planExpiry = date.toISOString();
      }

      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ memberType: newPlan, planExpiry })
      });
      if (!res.ok) throw new Error('Failed to update plan');
      
      const updatedUser = await res.json();
      setUsers(users.map(u => u._id === userId ? { ...u, memberType: updatedUser.memberType, planExpiry: updatedUser.planExpiry } : u));
      showToast(`User plan updated to ${newPlan}`, 'success');
    } catch (err) {
      showToast('Failed to update plan. Please try again.', 'error');
    }
  };

  useEffect(() => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (userProfile.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        navigate('/admin/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json().catch(() => []);
      setUsers(data);
    } catch (err) {
      showToast('Unable to load users. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
      showToast(`User status updated to ${newStatus}`, 'success');
    } catch (err) {
      showToast('Failed to update user status. Please try again.', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone and will remove all associated data (messages, connections).')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete user');
      
      setUsers(users.filter(u => u._id !== userId));
      showToast('User deleted successfully', 'success');
    } catch (err) {
      showToast('Failed to delete user. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    navigate('/admin/login');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.memberId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6 md:px-10 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-serif">Admin Portal</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">User Management</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 text-sm font-medium"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {/* Controls */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, email, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
            />
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 md:px-6 py-2 rounded-md text-sm font-medium transition-all capitalize ${statusFilter === status ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-semibold">User Details</th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Demographics</th>
                  <th className="px-6 py-4 font-semibold text-center">Plan</th>
                  <th className="px-6 py-4 font-semibold">Registration Date</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>Loading users...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No users found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <motion.tr 
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden shrink-0">
                            {user.image ? <img src={user.image} alt={user.firstName} className="w-full h-full object-cover object-top" /> : <UserIcon size={20} />}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">{user.memberId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.religion} - {user.caste}</div>
                        <div className="text-xs text-gray-500">{user.gender || 'N/A'}, {user.dob || 'N/A'} (For: {user.onBehalf || 'Self'})</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={user.memberType || 'Free'}
                          onChange={(e) => handlePlanChange(user._id, e.target.value)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border outline-none cursor-pointer transition-all bg-white ${
                            user.memberType === 'Elite' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            user.memberType === 'Premium' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            user.memberType === 'Basic' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          <option value="Free">Free</option>
                          <option value="Basic">Basic</option>
                          <option value="Premium">Premium</option>
                          <option value="Elite">Elite</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          user.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                          user.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {user.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye size={18} />
                          </button>
                          {user.status !== 'approved' && (
                            <button 
                              onClick={() => handleStatusChange(user._id, 'approved')}
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Approve User"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          {user.status !== 'rejected' && (
                            <button 
                              onClick={() => handleStatusChange(user._id, 'rejected')}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Reject User"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-1.5 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <FullProfileModal
        isOpen={!!selectedUser}
        member={selectedUser ? mapUserToMember(selectedUser) : null}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
