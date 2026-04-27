import React from 'react';
import { User, Heart, Star, Ban, MessageCircle, Lock } from 'lucide-react';
import { useMembers } from '../context/MemberContext';
import { useToast } from '../context/ToastContext';

export default function MemberCard({ member, onUpgradePrompt, onViewProfile }) {
  const { shortlistedIds, interestedIds, ignoredIds, toggleShortlist, toggleInterest, toggleIgnore } = useMembers();
  const { showToast } = useToast();

  // Dynamically determine plan from user's database record
  const currentUser = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const isFreePlan = currentUser.memberType === 'Free';

  const isShortlisted = shortlistedIds.includes(member.id);
  const isInterested = interestedIds.includes(member.id);
  const isIgnored = ignoredIds.includes(member.id);

  const getDefaultImage = (religion, gender) => {
    if (gender === 'Female') {
      if (religion === 'Hindu') return '/images/hindu-female.png';
      if (religion === 'Christian') return '/images/christian-female.png';
      return '/images/hindu-female.png'; // default fallback
    } else {
      if (religion === 'Hindu') return '/images/hindu-male.png';
      if (religion === 'Christian') return '/images/christian-male.png';
      return '/images/hindu-male.png'; // default fallback
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${
      member.isBoosted ? 'border-amber-300 ring-2 ring-amber-100 shadow-amber-100/50' : 
      member.type === 'Elite' ? 'border-amber-200 ring-1 ring-amber-50' :
      member.type === 'Premium' ? 'border-purple-200 ring-1 ring-purple-50' :
      member.type === 'Basic' ? 'border-blue-200 ring-1 ring-blue-50' :
      'border-gray-100'
    } p-5 flex flex-col md:flex-row gap-5 relative transition-all duration-300 hover:shadow-md ${isIgnored ? 'opacity-40' : ''}`}>
      {/* Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {member.isBoosted && (
          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            🔥 Top Match
          </span>
        )}
        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider ${
          member.type === 'Elite' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
          member.type === 'Premium' ? 'bg-green-50 text-green-600 border border-green-200' :
          member.type === 'Basic' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
          'bg-gray-50 text-gray-500 border border-gray-200'
        }`}>
          {member.type === 'Elite' && '👑 '}{member.type}
        </span>
      </div>

      {/* Profile Image */}
      <div 
        className="w-32 h-32 md:w-36 md:h-36 shrink-0 rounded-lg bg-gray-200 overflow-hidden relative group cursor-pointer"
        onClick={() => { if(isFreePlan) onUpgradePrompt('Clear Photos'); else onViewProfile(); }}
      >
        {member.image && !member.image.includes('unsplash') ? (
          <img src={member.image} alt={member.name} className={`w-full h-full object-cover transition-all duration-300 ${isFreePlan ? 'blur-xl scale-110' : ''}`} />
        ) : (
          <img src={getDefaultImage(member.religion, member.gender)} alt={member.name} className={`w-full h-full object-cover transition-all duration-300 ${isFreePlan ? 'blur-xl scale-110' : ''}`} />
        )}
        
        {isFreePlan && (
          <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center text-white z-10 transition-colors group-hover:bg-black/30">
            <div className="bg-black/50 p-2 rounded-full mb-1 backdrop-blur-sm">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">Photo Locked</span>
          </div>
        )}
        {isInterested && (
          <div className="absolute top-2 left-2 bg-primary text-white p-1 rounded-full shadow-lg">
            <Heart className="w-3 h-3 fill-white" />
          </div>
        )}
        {isShortlisted && (
          <div className="absolute top-2 right-2 bg-accent text-white p-1 rounded-full shadow-lg">
            <Star className="w-3 h-3 fill-white" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
          <div className="text-sm text-gray-500">Member ID: <span className="text-primary font-semibold">{member.id}</span></div>
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm flex-1">
          <div className="flex"><span className="text-gray-400 min-w-[110px]">Age</span> <span className="text-gray-800 font-medium">{member.age}</span></div>
          <div className="flex"><span className="text-gray-400 min-w-[110px]">Location</span> <span className="text-gray-800 font-medium">{member.location}</span></div>
          <div className="flex"><span className="text-gray-400 min-w-[110px]">Profession</span> <span className="text-gray-800 font-medium">{member.profession}</span></div>
          
          <div className="flex"><span className="text-gray-400 min-w-[110px]">Height</span> 
            {isFreePlan ? <span className="text-gray-300 flex items-center gap-1"><Lock size={12}/> Locked</span> : <span className="text-gray-800 font-medium">{member.height}</span>}
          </div>
          <div className="flex"><span className="text-gray-400 min-w-[110px]">Religion</span> 
            {isFreePlan ? <span className="text-gray-300 flex items-center gap-1"><Lock size={12}/> Locked</span> : <span className="text-gray-800 font-medium">{member.religion}</span>}
          </div>
          <div className="flex"><span className="text-gray-400 min-w-[110px]">Caste</span> 
            {isFreePlan ? <span className="text-gray-300 flex items-center gap-1"><Lock size={12}/> Locked</span> : <span className="text-gray-800 font-medium">{member.caste}</span>}
          </div>
          <div className="flex"><span className="text-gray-400 min-w-[110px]">First Language</span> 
            {isFreePlan ? <span className="text-gray-300 flex items-center gap-1"><Lock size={12}/> Locked</span> : <span className="text-gray-800 font-medium">{member.language}</span>}
          </div>
          <div className="flex"><span className="text-gray-400 min-w-[110px]">Marital Status</span> 
            {isFreePlan ? <span className="text-gray-300 flex items-center gap-1"><Lock size={12}/> Locked</span> : <span className="text-gray-800 font-medium">{member.maritalStatus}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 mt-4 pt-3 flex items-center justify-start gap-6 text-xs font-medium text-gray-400">
          <button 
            onClick={() => { if(isFreePlan) onUpgradePrompt('Full Profile Access'); else onViewProfile(); }} 
            className="flex flex-col items-center gap-1 hover:text-primary transition-colors"
          >
            {isFreePlan ? <Lock className="w-4 h-4" /> : <User className="w-4 h-4" />} <span>Full Profile</span>
          </button>
          <button
            onClick={async () => { 
              if(isFreePlan) { onUpgradePrompt('Connection Requests'); return; }
              try {
                const userData = JSON.parse(localStorage.getItem('userProfile') || '{}');
                const res = await fetch('/api/connections/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ senderId: userData.id, receiverMemberId: member.id })
                });
                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                  toggleInterest(member.id);
                  showToast('Interest sent successfully! ❤️', 'success');
                } else {
                  showToast(data?.message || 'Could not send interest. Please try again.', 'error');
                }
              } catch(err) { showToast('Connection failed. Please try again.', 'error'); }
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${isInterested ? 'text-primary' : 'hover:text-primary'}`}
          >
            {isFreePlan ? <Lock className="w-4 h-4" /> : <Heart className={`w-4 h-4 ${isInterested ? 'fill-primary' : ''}`} />} <span>Interest</span>
          </button>
          <button
            onClick={() => { if(isFreePlan) onUpgradePrompt('Shortlisting'); else toggleShortlist(member.id); }}
            className={`flex flex-col items-center gap-1 transition-colors ${isShortlisted ? 'text-accent' : 'hover:text-accent'}`}
          >
            {isFreePlan ? <Lock className="w-4 h-4" /> : <Star className={`w-4 h-4 ${isShortlisted ? 'fill-accent' : ''}`} />} <span>Shortlist</span>
          </button>
          <button
            onClick={() => toggleIgnore(member.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${isIgnored ? 'text-gray-800' : 'hover:text-gray-700'}`}
          >
            <Ban className="w-4 h-4" /> <span>Ignore</span>
          </button>
          <button 
            onClick={() => { 
              if(isFreePlan) onUpgradePrompt('Direct Chat & Calls'); 
              else {
                sessionStorage.setItem('pendingChatMemberId', member.id);
                window.location.href='/messaging';
              }
            }}
            className={`flex flex-col items-center gap-1 transition-colors hover:text-primary`}
          >
            {isFreePlan ? <Lock className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />} <span>Chat</span>
          </button>
          {/* WhatsApp — only for Elite users, only if target member consented */}
          {currentUser.memberType === 'Elite' && member.whatsappConsent && member.whatsappNumber && (
            <a
              href={`https://wa.me/91${member.whatsappNumber}?text=${encodeURIComponent(`Hi, I found your profile (${member.memberId || member.id}) on Coastal Shaadi and would like to connect.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 transition-colors hover:text-green-600 text-green-500"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
