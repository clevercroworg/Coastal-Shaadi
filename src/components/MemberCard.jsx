import React from 'react';
import { User, Heart, Star, Ban, MessageCircle, Lock } from 'lucide-react';
import { useMembers } from '../context/MemberContext';
import { useToast } from '../context/ToastContext';

export default function MemberCard({ member, onUpgradePrompt, onViewProfile }) {
  const { shortlistedIds, interestedIds, ignoredIds, toggleShortlist, toggleInterest, toggleIgnore } = useMembers();
  const { showToast } = useToast();

  // Simulate current user is on Free Plan
  const isFreePlan = false;

  const isShortlisted = shortlistedIds.includes(member.id);
  const isInterested = interestedIds.includes(member.id);
  const isIgnored = ignoredIds.includes(member.id);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row gap-5 relative transition-all duration-300 hover:shadow-md ${isIgnored ? 'opacity-40' : ''}`}>
      {/* Badge */}
      <div className={`absolute top-4 right-4 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider ${
        member.type === 'Premium' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
      }`}>
        {member.type}
      </div>

      {/* Profile Image */}
      <div 
        className="w-32 h-32 md:w-36 md:h-36 shrink-0 rounded-lg bg-gray-200 overflow-hidden relative group cursor-pointer"
        onClick={() => { if(isFreePlan) onUpgradePrompt('Clear Photos'); else onViewProfile(); }}
      >
        {member.image ? (
          <img src={member.image} alt={member.name} className={`w-full h-full object-cover transition-all duration-300 ${isFreePlan ? 'blur-xl scale-110' : ''}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-white">
            <User className="w-14 h-14" />
          </div>
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
                const data = await res.json();
                if (res.ok) {
                  toggleInterest(member.id);
                  showToast('Interest sent successfully! ❤️', 'success');
                } else {
                  showToast(data.message || 'Already sent', 'error');
                }
              } catch(err) { console.error(err); }
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
        </div>
      </div>
    </div>
  );
}
