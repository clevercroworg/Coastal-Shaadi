import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useMembers } from '../context/MemberContext';
import DashboardNavbar from '../components/DashboardNavbar';
import MemberCard from '../components/MemberCard';
import UpgradeModal from '../components/UpgradeModal';
import FullProfileModal from '../components/FullProfileModal';

export default function ActiveMembers() {
  const { members, getUniqueValues, masterCities } = useMembers();

  const getInitialFilters = () => {
    let religion = '';
    try {
      const stored = localStorage.getItem('userFilter');
      if (stored) {
        const parsed = JSON.parse(stored);
        religion = parsed.religion || '';
      }
    } catch (e) {}
    
    return {
      minAge: '', maxAge: '', id: '', maritalStatus: '', 
      religion, caste: '', 
      subCaste: '', language: '', profession: '',
      country: '', state: '', city: '', minHeight: '', maxHeight: '', memberType: 'all'
    };
  };

  const [filters, setFilters] = useState(getInitialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [showFilters, setShowFilters] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  const triggerUpgrade = (feature) => {
    setUpgradeFeature(feature);
    setUpgradeModalOpen(true);
  };

  const viewProfile = (member) => {
    setSelectedMember(member);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset page on filter change
  };

  const resetFilters = () => {
    setFilters(getInitialFilters());
    setCurrentPage(1);
  };

  // Parse height string like "5.10" into a float for comparison
  const parseHeight = (h) => {
    if (!h || h === '-') return 0;
    return parseFloat(h);
  };

  const filteredMembers = members.filter(member => {
    if (filters.id && !member.id.includes(filters.id)) return false;
    if (filters.minAge && member.age < parseInt(filters.minAge)) return false;
    if (filters.maxAge && member.age > parseInt(filters.maxAge)) return false;
    if (filters.maritalStatus && member.maritalStatus?.toLowerCase() !== filters.maritalStatus.toLowerCase()) return false;
    if (filters.religion && member.religion?.toLowerCase() !== filters.religion.toLowerCase()) return false;
    if (filters.caste && member.caste?.toLowerCase() !== filters.caste.toLowerCase()) return false;
    if (filters.language && member.language?.toLowerCase() !== filters.language.toLowerCase()) return false;
    if (filters.profession && !member.profession.toLowerCase().includes(filters.profession.toLowerCase())) return false;
    if (filters.country && member.country?.toLowerCase() !== filters.country?.toLowerCase()) return false;
    if (filters.state && member.state?.toLowerCase() !== filters.state?.toLowerCase()) return false;
    if (filters.city && member.city?.toLowerCase() !== filters.city?.toLowerCase()) return false;
    if (filters.minHeight && parseHeight(member.height) < parseFloat(filters.minHeight)) return false;
    if (filters.maxHeight && parseHeight(member.height) > parseFloat(filters.maxHeight)) return false;
    if (filters.memberType !== 'all') {
      if (filters.memberType === 'premium' && member.type !== 'Premium') return false;
      if (filters.memberType === 'free' && member.type !== 'Free') return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  // Define the full list of castes to always show them in the dropdown
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

  const loggedInReligion = filters.religion || (function() {
    try {
      const stored = localStorage.getItem('userProfile');
      if (stored) return JSON.parse(stored).religion;
    } catch(e) {}
    return '';
  })();

  // Get cascaded unique values based on current filters for dynamic dropdowns
  const religions = getUniqueValues('religion');
  // Always show the full list of castes for the selected/logged-in religion, otherwise fallback to dynamic
  const castes = castesList[loggedInReligion] || getUniqueValues('caste');
  
  const motherTongues = loggedInReligion === 'Hindu' 
    ? ['Kannada', 'Tulu', 'English'] 
    : loggedInReligion === 'Christian' 
      ? ['Konkani', 'English'] 
      : ['Kannada', 'Tulu', 'Konkani', 'English'];

  const countries = getUniqueValues('country');
  const states = getUniqueValues('state');
  
  const southKarnatakaCities = [
    'Mangalore', 'Udupi', 'Kundapura', 'Manipal', 'Puttur', 'Belthangady', 'Karkala', 
    'Surathkal', 'Bantwal', 'Dharmasthala', 'Mulki', 'Moodabidri', 'Baindur', 'Brahmavar', 
    'Saligrama', 'Kaup', 'Sullia', 'Subramanya', 'Ullal', 'Padubidri', 'Malpe'
  ].sort();

  const maritalStatuses = ['Never Married', 'Divorced', 'Awaiting Divorce', 'Annulled', 'Widowed'];

  const SelectFilter = ({ label, name, options, value, defaultLabel = 'All' }) => (
    <div>
      <label className="text-xs text-gray-500 mb-1 block font-medium">{label}</label>
      <select
        name={name}
        value={value}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
      >
        <option value="">{defaultLabel}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <main className="pb-20 bg-[#f5f6f8] min-h-screen">
      <div className="h-20"></div>
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Advanced Search Sidebar */}
          <div className={`w-full lg:w-[280px] shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-gray-900 font-bold uppercase text-xs tracking-wider">Advanced Search</h3>
                <button onClick={resetFilters} className="text-[11px] text-primary hover:underline font-medium">Reset All</button>
              </div>

              <div className="space-y-4">

                {/* Age Range */}
                <div className="flex gap-3">
                  <div className="w-1/2">
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Age From</label>
                    <input name="minAge" value={filters.minAge} onChange={handleChange} type="number" placeholder="18" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div className="w-1/2">
                    <label className="text-xs text-gray-500 mb-1 block font-medium">To</label>
                    <input name="maxAge" value={filters.maxAge} onChange={handleChange} type="number" placeholder="60" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                </div>

                {/* Member ID */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">Member Id</label>
                  <input name="id" value={filters.id} onChange={handleChange} type="text" placeholder="e.g. 2068045659" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>

                {/* Marital Status */}
                <SelectFilter label="Marital Status" name="maritalStatus" options={maritalStatuses} value={filters.maritalStatus} defaultLabel="Open to All" />

                {/* Caste */}
                <SelectFilter label="Caste" name="caste" options={castes} value={filters.caste} />

                {/* Mother Tongue */}
                <SelectFilter label="Mother Tongue" name="language" options={motherTongues} value={filters.language} />

                {/* Profession */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">Profession</label>
                  <input name="profession" value={filters.profession} onChange={handleChange} type="text" placeholder="e.g. Engineer" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>

                {/* Country */}
                <SelectFilter label="Country" name="country" options={countries} value={filters.country} />

                {/* State */}
                <SelectFilter label="State" name="state" options={states} value={filters.state} />

                {/* City */}
                <SelectFilter label="City" name="city" options={southKarnatakaCities} value={filters.city} />

                {/* Height Range */}
                <div className="flex gap-3">
                  <div className="w-1/2">
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Min Height</label>
                    <input name="minHeight" value={filters.minHeight} onChange={handleChange} type="text" placeholder="4.0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div className="w-1/2">
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Max Height</label>
                    <input name="maxHeight" value={filters.maxHeight} onChange={handleChange} type="text" placeholder="7.0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                </div>

                {/* Member Type */}
                <div className="pt-2 space-y-2">
                  <label className="text-xs font-bold text-primary uppercase block tracking-wider">Member Type</label>
                  {[
                    { value: 'premium', label: 'Premium Member' },
                    { value: 'free', label: 'Free Member' },
                    { value: 'all', label: 'All Member' }
                  ].map(opt => (
                    <div key={opt.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="memberType"
                        value={opt.value}
                        checked={filters.memberType === opt.value}
                        onChange={handleChange}
                        id={`type-${opt.value}`}
                        className="accent-primary"
                      />
                      <label htmlFor={`type-${opt.value}`} className="text-sm text-gray-700">{opt.label}</label>
                    </div>
                  ))}
                </div>

                {/* Search button */}
                <button
                  className="w-full mt-2 bg-gradient-to-r from-primary to-[#6b0000] hover:shadow-lg text-white py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Search className="w-4 h-4" /> Search
                </button>

                {/* Result count */}
                <div className="text-xs text-gray-400 italic text-center pt-1">
                  Showing {filteredMembers.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)} of {filteredMembers.length} members
                </div>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">All Active Members</h2>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm text-gray-700"
              >
                <Search className="w-4 h-4 text-primary" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            <div className="space-y-4">
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member) => (
                  <MemberCard key={member.id} member={member} onUpgradePrompt={triggerUpgrade} onViewProfile={() => viewProfile(member)} />
                ))
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Found</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">No members match your current search criteria. Try adjusting your filters.</p>
                  <button onClick={resetFilters} className="text-sm text-primary hover:underline font-medium">Reset All Filters</button>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {getPageNumbers().map((pageNum, idx) => (
                  pageNum === '...' ? (
                    <span key={`dots-${idx}`} className="text-gray-400 px-1">...</span>
                  ) : (
                    <button 
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                        currentPage === pageNum 
                          ? 'bg-primary text-white shadow-md' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                ))}

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <UpgradeModal 
        isOpen={upgradeModalOpen} 
        onClose={() => setUpgradeModalOpen(false)} 
        featureName={upgradeFeature} 
      />

      <FullProfileModal
        isOpen={!!selectedMember}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </main>
  );
}
