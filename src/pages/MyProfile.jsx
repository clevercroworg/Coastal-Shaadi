import React, { useState, useRef } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Map, Camera, Pencil, X, Check, Heart, Calendar, Ruler, Utensils, Shield, Globe, BookOpen, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Field = ({ label, field, icon, profile, editSection, editData, handleChange, type = "text" }) => {
  const isEditing = editSection && editData[field] !== undefined;
  return (
    <div className="p-4 bg-white">
      <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
        {icon && icon}
        {label}
      </p>
      {editSection && isEditing ? (
        <input
          type={type}
          value={editData[field] || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      ) : (
        <p className="text-sm font-medium text-gray-900">{profile[field] || '-'}</p>
      )}
    </div>
  );
};

const SectionHeader = ({ icon, title, section, editSection, startEdit, cancelEdit, saveEdit }) => (
  <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
      {icon} {title}
    </h2>
    {editSection === section ? (
      <div className="flex items-center gap-2">
        <button onClick={cancelEdit} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <X className="w-3 h-3" /> Cancel
        </button>
        <button onClick={saveEdit} className="text-xs text-white bg-primary hover:bg-primary-hover flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
          <Check className="w-3 h-3" /> Save
        </button>
      </div>
    ) : (
      <button onClick={() => startEdit(section)} className="text-xs text-primary hover:text-primary-hover flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5 transition-all font-medium">
        <Pencil className="w-3 h-3" /> Edit
      </button>
    )}
  </div>
);

export default function MyProfile() {
  const getUserData = () => {
    try {
      const stored = localStorage.getItem('userProfile');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  };

  const userData = getUserData();
  const [profileImage, setProfileImage] = useState(userData?.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const calculateAge = (dob) => {
    if (!dob || dob === '-') return '-';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return '-';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const fetchLatestProfile = async () => {
    const actualUserId = userData?.id || userData?._id || userData?.memberId;
    if (!actualUserId) return;
    try {
      const res = await fetch(`/api/profile/${actualUserId}`);
      if (res.ok) {
        const latestUser = await res.json();
        const newUserData = { ...userData, ...latestUser };
        localStorage.setItem('userProfile', JSON.stringify(newUserData));
        window.dispatchEvent(new Event('profileUpdated'));
        
        setProfileImage(latestUser.image);
        setProfile(prev => ({
          ...prev,
          name: `${latestUser.firstName} ${latestUser.lastName}`,
          email: latestUser.email,
          phone: latestUser.phone,
          religion: latestUser.religion || prev.religion,
          caste: latestUser.caste || prev.caste,
          dob: latestUser.dob || prev.dob,
          ...latestUser.profileData,
          age: calculateAge(latestUser.dob) !== '-' ? calculateAge(latestUser.dob) : (latestUser.profileData?.age || prev.age)
        }));
      }
    } catch (e) {
      console.error('Failed to fetch latest profile', e);
    }
  };

  React.useEffect(() => {
    fetchLatestProfile();
  }, []);

  const [profile, setProfile] = useState({
    name: userData ? `${userData.firstName} ${userData.lastName}` : '',
    memberId: userData?.memberId || '',
    memberType: 'Free',
    email: userData?.email || '',
    phone: userData?.phone || '',
    city: userData?.profileData?.city || '-',
    state: userData?.profileData?.state || '-',
    country: userData?.profileData?.country || '-',
    age: calculateAge(userData?.dob) !== '-' ? calculateAge(userData?.dob) : (userData?.profileData?.age || '-'),
    dob: userData?.dob || '-',
    height: userData?.profileData?.height || '-',
    maritalStatus: userData?.profileData?.maritalStatus || '-',
    createdBy: userData?.onBehalf || '-',
    diet: userData?.profileData?.diet || '-',
    disability: userData?.profileData?.disability || '-',
    religion: userData?.religion || '-',
    motherTongue: userData?.profileData?.motherTongue || '-',
    caste: userData?.caste || '-',
    subCaste: userData?.profileData?.subCaste || '-',
    gothra: userData?.profileData?.gothra || '-',
    education: userData?.profileData?.education || '-',
    profession: userData?.profileData?.profession || '-',
    company: userData?.profileData?.company || '-',
    employedIn: userData?.profileData?.employedIn || '-',
    income: userData?.profileData?.income || '-',
    workLocation: userData?.profileData?.workLocation || '-',
    aboutMe: userData?.profileData?.aboutMe || 'Please edit to add some details about yourself.',
    partnerAge: userData?.profileData?.partnerAge || '-',
    partnerHeight: userData?.profileData?.partnerHeight || '-',
    partnerEducation: userData?.profileData?.partnerEducation || '-',
    partnerProfession: userData?.profileData?.partnerProfession || '-',
    partnerLocation: userData?.profileData?.partnerLocation || '-',
  });

  const [editSection, setEditSection] = useState(null);
  const [editData, setEditData] = useState({});

  const startEdit = (section) => {
    setEditSection(section);
    setEditData({ ...profile });
  };

  const cancelEdit = () => {
    setEditSection(null);
    setEditData({});
  };

  const saveEdit = async () => {
    const updatedProfile = { ...profile, ...editData };
    setProfile(updatedProfile);
    setEditSection(null);
    setEditData({});

    const actualUserId = userData?.id || userData?._id || userData?.memberId;
    if (actualUserId) {
      try {
        const updateRes = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: actualUserId, profileData: editData })
        });
        
        if (!updateRes.ok) {
          const errData = await updateRes.json();
          throw new Error(errData.message || 'Failed to save to database');
        }
        
        const newUserData = { ...userData, profileData: { ...userData.profileData, ...editData } };
        localStorage.setItem('userProfile', JSON.stringify(newUserData));
        showToast('Profile saved successfully!', 'success');
        fetchLatestProfile();
      } catch (err) {
        console.error('Failed to save to database', err);
        showToast('Failed to save profile. Please try again.', 'error');
      }
    }
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local preview for immediate feedback
    const objectUrl = URL.createObjectURL(file);
    setProfileImage(objectUrl);
    setIsUploading(true);

    try {
      let existingPublicId = '';
      if (profileImage && profileImage.includes('cloudinary.com')) {
        const parts = profileImage.split('/');
        const filename = parts[parts.length - 1];
        existingPublicId = filename.split('.')[0];
      }

      const sigRes = await fetch(`/api/cloudinary-signature${existingPublicId ? `?public_id=${existingPublicId}` : ''}`);
      const { timestamp, signature, apiKey, cloudName } = await sigRes.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      if (existingPublicId) {
        formData.append('public_id', existingPublicId);
        formData.append('invalidate', 'true');
      }

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.secure_url) {
        setProfileImage(data.secure_url);
        const actualUserId = userData?.id || userData?._id || userData?.memberId;
        if (actualUserId) {
          const updateRes = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: actualUserId, image: data.secure_url })
          });
          
          if (!updateRes.ok) throw new Error('Failed to update profile in database');

          const newUserData = { ...JSON.parse(localStorage.getItem('userProfile') || '{}'), image: data.secure_url };
          localStorage.setItem('userProfile', JSON.stringify(newUserData));
          window.dispatchEvent(new Event('profileUpdated'));
          showToast('Profile image updated successfully!', 'success');
        }
      }
    } catch (error) {
      console.error("Error uploading to Cloudinary", error);
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setIsUploading(true);
    try {
      setProfileImage(null);
      const actualUserId = userData?.id || userData?._id || userData?.memberId;
      if (actualUserId) {
        const updateRes = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: actualUserId, image: null })
        });
        
        if (!updateRes.ok) throw new Error('Failed to remove profile image in database');

        const newUserData = { ...JSON.parse(localStorage.getItem('userProfile') || '{}'), image: null };
        localStorage.setItem('userProfile', JSON.stringify(newUserData));
        window.dispatchEvent(new Event('profileUpdated'));
        showToast('Profile image removed successfully!', 'success');
      }
    } catch (error) {
      console.error("Error removing image", error);
      showToast('Remove failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="pb-20 bg-[#f5f6f8] min-h-screen">
      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>
      <DashboardNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-44 bg-gradient-to-br from-[#800000] via-[#6b0000] to-[#4a0000] relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            <div className="absolute top-5 right-6 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-semibold tracking-widest border border-white/20">
              {profile.memberType.toUpperCase()} MEMBER
            </div>
            {/* Decorative gold line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
          </div>

          <div className="px-6 sm:px-10 pb-8 relative">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-end -mt-16 mb-6 relative z-10">
              <div className="relative group">
                <div className={`w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden ring-2 ring-primary/10 relative transition-all duration-300 ${isUploading ? 'ring-4 ring-primary/50 animate-pulse' : ''}`}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className={`w-full h-full object-cover ${isUploading ? 'opacity-70 blur-[1px]' : ''}`} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-300">
                      <User size={56} />
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/20 flex flex-col gap-2 items-center justify-center backdrop-blur-[2px] transition-all z-20">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                      <span className="text-white text-[10px] font-bold tracking-wider uppercase">Uploading</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={`absolute bottom-1 right-1 w-9 h-9 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-lg transition-all border-2 border-white ${isUploading ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-110'}`}
                >
                  {isUploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Camera size={14} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="flex-1 text-center sm:text-left pb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-500 text-sm mt-0.5">Member ID: <span className="text-primary font-semibold">{profile.memberId}</span></p>
              </div>

              <div className="pb-1 flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />} 
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                </button>
                {profileImage && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={isUploading}
                    className="bg-white border border-gray-200 text-red-600 hover:border-red-600 hover:bg-red-50 px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm disabled:opacity-50"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {[
                { label: 'Age', value: `${profile.age} Yrs`, icon: <Calendar className="w-4 h-4 text-primary" /> },
                { label: 'Height', value: profile.height, icon: <Ruler className="w-4 h-4 text-primary" /> },
                { label: 'Religion', value: profile.religion, icon: <BookOpen className="w-4 h-4 text-primary" /> },
                { label: 'Location', value: [profile.city, profile.state, profile.country].filter(l => l && l !== '-').join(', ') || '-', icon: <MapPin className="w-4 h-4 text-primary" /> },
              ].map(stat => (
                <div key={stat.label} className="bg-[#f8f5f2] rounded-xl px-4 py-3 text-center border border-[#f0ebe4]">
                  <div className="flex items-center justify-center gap-1.5 mb-1">{stat.icon}<span className="text-[10px] text-gray-400 uppercase tracking-wider">{stat.label}</span></div>
                  <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* About Me */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <SectionHeader icon={<Heart className="w-4 h-4 text-accent" />} title="About Me" section="about" editSection={editSection} startEdit={startEdit} cancelEdit={cancelEdit} saveEdit={saveEdit} />
              {editSection === 'about' ? (
                <textarea
                  value={editData.aboutMe}
                  onChange={(e) => handleChange('aboutMe', e.target.value)}
                  rows={4}
                  className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">{profile.aboutMe}</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <SectionHeader icon={<Phone className="w-4 h-4 text-accent" />} title="Contact Info" section="contact" editSection={editSection} startEdit={startEdit} cancelEdit={cancelEdit} saveEdit={saveEdit} />
              <div className="space-y-4">
                {editSection === 'contact' ? (
                  <>
                    <div>
                      <label className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">Email</label>
                      <input value={editData.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">Phone</label>
                      <input value={editData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">City</label>
                      <input value={editData.city} onChange={(e) => handleChange('city', e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Mail className="w-4 h-4 text-primary" /></div>
                      <span className="text-gray-700">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Phone className="w-4 h-4 text-primary" /></div>
                      <span className="text-gray-700">{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><MapPin className="w-4 h-4 text-primary" /></div>
                      <span className="text-gray-700">{[profile.city, profile.state, profile.country].filter(l => l && l !== '-').join(', ') || '-'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Profile Verification */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
                <Shield className="w-4 h-4 text-accent" /> Verification Status
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Mobile Number', status: 'Verified', color: 'green' },
                  { label: 'Email Address', status: 'Verified', color: 'green' },
                  { label: 'Photo', status: profileImage ? 'Uploaded' : 'Pending', color: profileImage ? 'green' : 'yellow' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center text-sm py-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className={`font-semibold text-xs px-2.5 py-1 rounded-full ${item.color === 'green' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <SectionHeader icon={<User className="w-4 h-4 text-accent" />} title="Personal Information" section="personal" editSection={editSection} startEdit={startEdit} cancelEdit={cancelEdit} saveEdit={saveEdit} />
              <div className="grid grid-cols-1 sm:grid-cols-2 border border-gray-100 rounded-lg overflow-hidden divide-y sm:divide-y-0 sm:[&>*:nth-child(odd)]:border-r sm:[&>*:nth-child(-n+2)~*]:border-t divide-gray-100">
                <Field label="Age / DOB" field="dob" icon={<Calendar className="w-3 h-3" />} profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} type="date" />
                <Field label="Height" field="height" icon={<Ruler className="w-3 h-3" />} profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Marital Status" field="maritalStatus" icon={<Heart className="w-3 h-3" />} profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Profile Created By" field="createdBy" icon={<User className="w-3 h-3" />} profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Diet" field="diet" icon={<Utensils className="w-3 h-3" />} profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Any Disability" field="disability" profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
              </div>
            </div>

            {/* Religion & Background */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <SectionHeader icon={<Map className="w-4 h-4 text-accent" />} title="Religion & Background" section="religion" editSection={editSection} startEdit={startEdit} cancelEdit={cancelEdit} saveEdit={saveEdit} />
              <div className="grid grid-cols-1 sm:grid-cols-2 border border-gray-100 rounded-lg overflow-hidden divide-y sm:divide-y-0 sm:[&>*:nth-child(odd)]:border-r sm:[&>*:nth-child(-n+2)~*]:border-t divide-gray-100">
                <Field label="Religion" field="religion" icon={<BookOpen className="w-3 h-3" />} profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Mother Tongue" field="motherTongue" icon={<Globe className="w-3 h-3" />} profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Caste" field="caste" profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Sub-Caste" field="subCaste" profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Gothra / Nakshatra" field="gothra" profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
              </div>
            </div>

            {/* Education & Career */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <SectionHeader icon={<Briefcase className="w-4 h-4 text-accent" />} title="Education & Career" section="career" editSection={editSection} startEdit={startEdit} cancelEdit={cancelEdit} saveEdit={saveEdit} />
              <div className="grid grid-cols-1 sm:grid-cols-2 border border-gray-100 rounded-lg overflow-hidden divide-y sm:divide-y-0 sm:[&>*:nth-child(odd)]:border-r sm:[&>*:nth-child(-n+2)~*]:border-t divide-gray-100">
                <Field label="Highest Education" field="education" icon={<GraduationCap className="w-3 h-3" />} profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Profession" field="profession" icon={<Briefcase className="w-3 h-3" />} profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Company" field="company" profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Employed In" field="employedIn" profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Annual Income" field="income" profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Work Location" field="workLocation" icon={<MapPin className="w-3 h-3" />} profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
              </div>
            </div>

            {/* Partner Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <SectionHeader icon={<Heart className="w-4 h-4 text-primary" />} title="Partner Preferences" section="partner" editSection={editSection} startEdit={startEdit} cancelEdit={cancelEdit} saveEdit={saveEdit} />
              <div className="grid grid-cols-1 sm:grid-cols-2 border border-gray-100 rounded-lg overflow-hidden divide-y sm:divide-y-0 sm:[&>*:nth-child(odd)]:border-r sm:[&>*:nth-child(-n+2)~*]:border-t divide-gray-100">
                <Field label="Preferred Age" field="partnerAge" profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Preferred Height" field="partnerHeight" profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Education" field="partnerEducation" icon={<GraduationCap className="w-3 h-3" />} profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Profession" field="partnerProfession" icon={<Briefcase className="w-3 h-3" />} profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
                <Field label="Location" field="partnerLocation" icon={<MapPin className="w-3 h-3" />} profile={profile} editSection={editSection} editData={editData} handleChange={handleChange} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
