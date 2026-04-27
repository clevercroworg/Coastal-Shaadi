import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export const citiesByState = {
  'Karnataka': [
    'Mangalore', 'Mangaluru', 'Udupi', 'Manipal', 'Kundapura', 'Karwar',
    'Bantwal', 'Puttur', 'Sullia', 'Belthangady', 'Moodabidri', 'Karkala', 'Brahmavar',
    'Byndoor', 'Honnavar', 'Bhatkal', 'Kumta', 'Ankola', 'Sirsi', 'Dharmasthala',
    'Vitla', 'Uppinangady', 'Ullal', 'Mulki', 'Padubidri', 'Kaup', 'Malpe', 'Saligrama',
    'Kota', 'Mabukala', 'Siddapura', 'Gokarna', 'Murudeshwar', 'Mundkur', 'Kinnigoli',
    'Kateel', 'Bajpe', 'Surathkal', 'Kadaba', 'Subramanya', 'Sagara', 'Thirthahalli',
    'Bangalore', 'Bengaluru', 'Mysore', 'Mysuru', 'Hubli', 'Hubballi', 'Dharwad',
    'Belgaum', 'Belagavi', 'Gulbarga', 'Kalaburagi', 'Davanagere', 'Bellary', 'Ballari',
    'Shimoga', 'Shivamogga', 'Tumkur', 'Tumakuru', 'Raichur', 'Bidar', 'Hassan',
    'Chitradurga', 'Kolar', 'Mandya', 'Chikmagalur', 'Bagalkot', 'Ranebennuru',
    'Arsikere', 'Gangawati', 'Hospet', 'Gadag', 'Betageri', 'Robertsonpet', 'Bhadravati',
    'Koppal', 'Chamarajanagar', 'Haveri', 'Yadgir', 'Yellapur', 'Mundgod', 'Haliyal',
    'Dandeli', 'Joida', 'Banavasi', 'Arasikere', 'Tiptur', 'Channarayapatna', 'Belur',
    'Sakleshpur', 'Madikeri', 'Virajpet', 'Somwarpet', 'Kushal Nagar', 'Kodagu',
    'Hunsur', 'Nanjangud', 'Channapatna', 'Ramanagara', 'Kanakapura', 'Magadi',
    'Doddaballapur', 'Devanahalli', 'Hosakote', 'Anekal', 'Gundlupet', 'Kollegala'
  ],
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati',
    'Navi Mumbai', 'Kolhapur', 'Sangli', 'Ratnagiri', 'Sindhudurg', 'Chiplun'
  ],
  'Kerala': [
    'Kochi', 'Cochin', 'Thiruvananthapuram', 'Trivandrum', 'Kozhikode', 'Calicut',
    'Kannur', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kasaragod',
    'Manjeshwar', 'Kumbla', 'Hosdurg', 'Kanhangad', 'Nileshwar'
  ],
  'Goa': [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Madgaon'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
    'Erode', 'Vellore', 'Thoothukudi', 'Hosur'
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'
  ],
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati'
  ],
  'Delhi': ['New Delhi', 'Delhi'],
  'Haryana': ['Gurgaon', 'Gurugram', 'Faridabad', 'Rohtak', 'Panipat', 'Karnal', 'Ambala'],
  'Uttar Pradesh': [
    'Noida', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Meerut', 'Ghaziabad',
    'Prayagraj', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad'
  ],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
  'West Bengal': ['Kolkata', 'Howrah', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Manali', 'Kullu', 'Solan'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Rishikesh', 'Nainital', 'Roorkee'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu'],
  'Ladakh': ['Leh', 'Kargil'],
  'Meghalaya': ['Shillong'],
  'Tripura': ['Agartala'],
  'Manipur': ['Imphal'],
  'Mizoram': ['Aizawl'],
  'Nagaland': ['Kohima', 'Dimapur'],
  'Sikkim': ['Gangtok'],
  'Arunachal Pradesh': ['Itanagar'],
  'Chandigarh': ['Chandigarh'],
  'Puducherry': ['Puducherry', 'Pondicherry'],
  'Andaman and Nicobar Islands': ['Port Blair'],
  'Lakshadweep': ['Kavaratti'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Silvassa', 'Daman', 'Diu']
};

// Flat list for backward compatibility
export const masterCities = [...new Set(Object.values(citiesByState).flat())].sort();

export const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export const countries = [
  'India', 'UAE', 'United States', 'United Kingdom', 'Germany', 'Canada', 'Australia'
];

const MemberContext = createContext();

export const useMembers = () => useContext(MemberContext);

export const MemberProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shortlistedIds') || '[]'); } catch { return []; }
  });
  const [interestedIds, setInterestedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('interestedIds') || '[]'); } catch { return []; }
  });
  const [ignoredIds, setIgnoredIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ignoredIds') || '[]'); } catch { return []; }
  });
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
    setShortlistedIds(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('shortlistedIds', JSON.stringify(next));
      return next;
    });
  };

  const toggleInterest = (id) => {
    setInterestedIds(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('interestedIds', JSON.stringify(next));
      return next;
    });
  };

  const toggleIgnore = (id) => {
    setIgnoredIds(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(i => i !== id);
        localStorage.setItem('ignoredIds', JSON.stringify(next));
        return next;
      } else {
        setShortlistedIds(s => {
          const ns = s.filter(i => i !== id);
          localStorage.setItem('shortlistedIds', JSON.stringify(ns));
          return ns;
        });
        setInterestedIds(inIds => {
          const ni = inIds.filter(i => i !== id);
          localStorage.setItem('interestedIds', JSON.stringify(ni));
          return ni;
        });
        const next = [...prev, id];
        localStorage.setItem('ignoredIds', JSON.stringify(next));
        return next;
      }
    });
  };

  // Dynamically filter members based on logged-in user (memoized)
  const filteredMembers = useMemo(() => {
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
  }, [members, userProfile]);

  // Helper to get unique values for filter dropdowns based on filtered members
  const getUniqueValues = useCallback((field) => {
    return [...new Set(filteredMembers.map(m => m[field]).filter(v => v && v !== '-'))];
  }, [filteredMembers]);

  return (
    <MemberContext.Provider value={{
      members: filteredMembers,
      shortlistedIds,
      interestedIds,
      ignoredIds,
      toggleShortlist,
      toggleInterest,
      toggleIgnore,
      getUniqueValues,
      masterCities,
      citiesByState,
      indianStates,
      countries,
      isLoading
    }}>
      {children}
    </MemberContext.Provider>
  );
};
