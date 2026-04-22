import React, { createContext, useContext, useState } from 'react';

const MemberContext = createContext();

export const useMembers = () => useContext(MemberContext);

const initialMembers = [
  {
    id: '2068045659',
    name: 'Malcolm Pinto',
    type: 'Free',
    age: 31,
    height: '5.9',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: 'Mangalorean',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Software Engineer',
    country: 'India',
    state: 'Karnataka',
    city: 'Mangalore',
    location: 'Mangalore, India',
    image: null
  },
  {
    id: '2068045660',
    name: 'Lloyd Dmello',
    type: 'Free',
    age: 31,
    height: '5.8',
    religion: 'Christian',
    caste: 'Syrian Catholic',
    subCaste: 'Mangalorean',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Banker',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    location: 'Mumbai, India',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80'
  },
  {
    id: '2068045661',
    name: 'Neil Coelho',
    type: 'Free',
    age: 29,
    height: '6.0',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: 'Goan',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Architect',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    location: 'Dubai, UAE',
    image: null
  },
  {
    id: '2068045662',
    name: 'Criston Dsouza',
    type: 'Premium',
    age: 27,
    height: '5.10',
    religion: 'Christian',
    caste: 'Protestant',
    subCaste: '-',
    language: 'English',
    maritalStatus: 'Never Married',
    profession: 'Business Owner',
    country: 'India',
    state: 'Karnataka',
    city: 'Udupi',
    location: 'Udupi, India',
    image: null
  },
  {
    id: '2068045663',
    name: 'Russel Martis',
    type: 'Free',
    age: 34,
    height: '5.7',
    religion: 'Hindu',
    caste: 'Bunt',
    subCaste: 'Nadava',
    language: 'Tulu',
    maritalStatus: 'Divorced',
    profession: 'Marketing Lead',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    location: 'Bangalore, India',
    image: null
  },
  {
    id: '2068045664',
    name: 'Allan Lloyd Fernandes',
    type: 'Premium',
    age: 31,
    height: '6.0',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: 'Mangalorean',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Doctor',
    country: 'United Kingdom',
    state: 'England',
    city: 'London',
    location: 'London, UK',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80'
  },
  {
    id: '2068045670',
    name: 'Preetham Rofuf Dsouza',
    type: 'Premium',
    age: 33,
    height: '5.9',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: 'Goan',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Chef',
    country: 'India',
    state: 'Goa',
    city: 'Panaji',
    location: 'Goa, India',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80'
  },
  {
    id: '2068045671',
    name: 'Sachin Shenoy',
    type: 'Free',
    age: 28,
    height: '5.6',
    religion: 'Hindu',
    caste: 'Brahmin (GSB)',
    subCaste: 'Shivalli',
    language: 'Tulu',
    maritalStatus: 'Never Married',
    profession: 'Civil Engineer',
    country: 'India',
    state: 'Karnataka',
    city: 'Mangalore',
    location: 'Mangalore, India',
    image: null
  },
  {
    id: '2068045672',
    name: 'Rohan Hegde',
    type: 'Premium',
    age: 30,
    height: '5.11',
    religion: 'Hindu',
    caste: 'Bunt',
    subCaste: 'Havyaka',
    language: 'Kannada',
    maritalStatus: 'Never Married',
    profession: 'Data Scientist',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    location: 'Bangalore, India',
    image: null
  },
  {
    id: '2068045673',
    name: 'Ravi Kumar',
    type: 'Free',
    age: 26,
    height: '5.8',
    religion: 'Hindu',
    caste: 'Billava',
    subCaste: '-',
    language: 'Tulu',
    maritalStatus: 'Never Married',
    profession: 'Teacher',
    country: 'India',
    state: 'Karnataka',
    city: 'Mangalore',
    location: 'Mangalore, India',
    image: null
  },
  {
    id: '2068045674',
    name: 'Vivek Kamath',
    type: 'Free',
    age: 35,
    height: '5.7',
    religion: 'Hindu',
    caste: 'Brahmin (GSB)',
    subCaste: 'Saraswat',
    language: 'Konkani',
    maritalStatus: 'Widowed',
    profession: 'Chartered Accountant',
    country: 'India',
    state: 'Maharashtra',
    city: 'Pune',
    location: 'Pune, India',
    image: null
  },
  {
    id: '2068045675',
    name: 'Derek Lobo',
    type: 'Premium',
    age: 29,
    height: '6.1',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: 'Mangalorean',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Pilot',
    country: 'UAE',
    state: 'Abu Dhabi',
    city: 'Abu Dhabi',
    location: 'Abu Dhabi, UAE',
    image: null
  }
];

export const MemberProvider = ({ children }) => {
  const [members] = useState(initialMembers);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [interestedIds, setInterestedIds] = useState([]);
  const [ignoredIds, setIgnoredIds] = useState([]);

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
      getUniqueValues
    }}>
      {children}
    </MemberContext.Provider>
  );
};
