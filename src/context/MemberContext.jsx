import React, { createContext, useContext, useState, useEffect } from 'react';

const MemberContext = createContext();

export const useMembers = () => useContext(MemberContext);

export const MemberProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [interestedIds, setInterestedIds] = useState([]);
  const [ignoredIds, setIgnoredIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('userProfile');
      return stored ? JSON.parse(stored) : null;
    } catch(e) { return null; }
  });

  // Listen for login/logout events to immediately re-filter
  useEffect(() => {
    const handleLogin = () => {
      try {
        const stored = localStorage.getItem('userProfile');
        setUserProfile(stored ? JSON.parse(stored) : null);
      } catch(e) { setUserProfile(null); }
    };
    window.addEventListener('userLogin', handleLogin);
    return () => window.removeEventListener('userLogin', handleLogin);
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/members');
        if (response.ok) {
          const data = await response.json();
          
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

          const boostRegions = ['udupi', 'mangalore', 'mangaluru', 'manipal', 'kundapura', 'karwar', 'kasaragod'];
          const formattedMembers = data.map(user => {
            const city = (user.profileData?.city || '').toLowerCase();
            const isElite = user.memberType === 'Elite';
            const isBoosted = isElite && boostRegions.some(r => city.includes(r));
            return {
              id: user.memberId || user._id,
              memberId: user.memberId,
              name: `${user.firstName} ${user.lastName}`,
              type: user.memberType || 'Premium',
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
              whatsappConsent: user.whatsappConsent || false,
              whatsappNumber: user.whatsappNumber || '',
              isBoosted
            };
          });
          setMembers(formattedMembers);
        }
      } catch (error) {
        console.error("Failed to fetch members", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const toggleShortlist = (id) => {
    setShortlistedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleInterest = (id) => {
    setInterestedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleIgnore = (id) => {
    setIgnoredIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        setShortlistedIds(s => s.filter(i => i !== id));
        setInterestedIds(inIds => inIds.filter(i => i !== id));
        return [...prev, id];
      }
    });
  };

  // Helper to get unique values for filter dropdowns based on filtered members
  const getUniqueValues = (field) => {
    const filtered = getFilteredMembers();
    return [...new Set(filtered.map(m => m[field]).filter(v => v && v !== '-'))];
  };

  // Dynamically filter members based on logged-in user
  const getFilteredMembers = () => {
    if (userProfile) {
      return members.filter(m => {
        // Hide self
        if (m.id === userProfile.memberId || m.id === userProfile.id) return false;
        
        // Strict Religion Filter (Only show same religion)
        if (userProfile.religion && m.religion !== userProfile.religion) return false;

        // Strict Gender Filter (Only show opposite gender)
        if (userProfile.gender && m.gender === userProfile.gender) return false;

        return true;
      });
    }
    return members;
  };

  return (
    <MemberContext.Provider value={{
      members: getFilteredMembers(),
      shortlistedIds,
      interestedIds,
      ignoredIds,
      toggleShortlist,
      toggleInterest,
      toggleIgnore,
      getUniqueValues,
      isLoading
    }}>
      {children}
    </MemberContext.Provider>
  );
};
