import React, { createContext, useContext, useState, useEffect } from 'react';

const MemberContext = createContext();

export const useMembers = () => useContext(MemberContext);

export const MemberProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [interestedIds, setInterestedIds] = useState([]);
  const [ignoredIds, setIgnoredIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/members');
        if (response.ok) {
          const data = await response.json();
          const formattedMembers = data.map(user => ({
            id: user.memberId || user._id,
            name: `${user.firstName} ${user.lastName}`,
            type: 'Premium', // Defaulting for dev UI
            age: user.profileData?.age || '-',
            height: user.profileData?.height || '-',
            religion: user.religion || '-',
            caste: user.caste || '-',
            subCaste: user.profileData?.subCaste || '-',
            language: user.profileData?.motherTongue || '-',
            maritalStatus: user.profileData?.maritalStatus || '-',
            profession: user.profileData?.profession || '-',
            country: user.profileData?.country || '-',
            state: user.profileData?.state || '-',
            city: user.profileData?.city || '-',
            location: user.profileData?.location || `${user.profileData?.city || '-'}, ${user.profileData?.country || '-'}`,
            image: user.image || null
          }));
          
          // Filter out the logged-in user so they don't see themselves
          try {
            const stored = localStorage.getItem('userProfile');
            if (stored) {
              const loggedInUser = JSON.parse(stored);
              const filtered = formattedMembers.filter(m => m.id !== loggedInUser.memberId && m.id !== loggedInUser.id);
              setMembers(filtered);
              setIsLoading(false);
              return;
            }
          } catch(e) {}

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

  // Helper to get unique values for filter dropdowns
  const getUniqueValues = (field) => {
    return [...new Set(members.map(m => m[field]).filter(v => v && v !== '-'))];
  };

  return (
    <MemberContext.Provider value={{
      members,
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
