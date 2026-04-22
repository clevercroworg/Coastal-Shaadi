import React, { useState, useEffect } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { Heart, Send, Inbox, Users, Check, X, MessageCircle, User, Loader2, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Interests() {
  const [activeTab, setActiveTab] = useState('received');
  const [sentInterests, setSentInterests] = useState([]);
  const [receivedInterests, setReceivedInterests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const getUserData = () => {
    try {
      const stored = localStorage.getItem('userProfile');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  };
  const userData = getUserData();
  const currentUserId = userData?.id;

  const fetchData = async () => {
    if (!currentUserId) return;
    setIsLoading(true);
    try {
      const [sentRes, receivedRes, matchesRes] = await Promise.all([
        fetch(`/api/connections/sent/${currentUserId}`),
        fetch(`/api/connections/received/${currentUserId}`),
        fetch(`/api/connections/matches/${currentUserId}`)
      ]);
      if (sentRes.ok) setSentInterests(await sentRes.json());
      if (receivedRes.ok) setReceivedInterests(await receivedRes.json());
      if (matchesRes.ok) setMatches(await matchesRes.json());
    } catch (err) {
      console.error('Failed to fetch interests', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentUserId]);

  const handleAccept = async (connectionId) => {
    try {
      const res = await fetch(`/api/connections/${connectionId}/accept`, { method: 'PUT' });
      if (res.ok) {
        fetchData();
        showToast('Interest accepted! You can now chat.', 'success');
      }
    } catch (err) {
      console.error('Failed to accept', err);
      showToast('Failed to accept interest', 'error');
    }
  };

  const handleDecline = async (connectionId) => {
    try {
      const res = await fetch(`/api/connections/${connectionId}/decline`, { method: 'PUT' });
      if (res.ok) {
        fetchData();
        showToast('Interest declined', 'success');
      }
    } catch (err) {
      console.error('Failed to decline', err);
      showToast('Failed to decline interest', 'error');
    }
  };

  const startChat = (memberId) => {
    sessionStorage.setItem('pendingChatMemberId', memberId);
    window.location.href = '/messaging';
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const avatarColors = ['bg-[#800000]', 'bg-[#b8860b]', 'bg-[#2563eb]', 'bg-[#059669]', 'bg-[#7c3aed]'];

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hrs ago`;
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  const tabs = [
    { id: 'received', label: 'Received', icon: <Inbox size={16} />, count: receivedInterests.filter(c => c.status === 'pending').length },
    { id: 'sent', label: 'Sent', icon: <Send size={16} />, count: sentInterests.filter(c => c.status === 'pending').length },
    { id: 'matches', label: 'Matches', icon: <Users size={16} />, count: matches.length },
  ];

  const statusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      accepted: 'bg-green-50 text-green-700 border-green-200',
      declined: 'bg-red-50 text-red-600 border-red-200'
    };
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const InterestCard = ({ user, status, date, connectionId, showActions, isMatch }) => {
    const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    const profession = user?.profileData?.profession || '-';
    const location = user?.profileData?.location || `${user?.profileData?.city || '-'}, ${user?.profileData?.country || '-'}`;

    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-5 hover:shadow-md transition-shadow">
        {/* Avatar */}
        <div className="shrink-0">
          {user?.image ? (
            <img src={user.image} alt={name} className="w-16 h-16 rounded-xl object-cover" />
          ) : (
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-lg ${avatarColors[Math.floor(Math.random() * avatarColors.length)]}`}>
              {getInitials(name)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-sm truncate">{name}</h3>
            {statusBadge(status)}
          </div>
          <p className="text-xs text-gray-500 mb-1">
            <span className="text-primary font-medium">{user?.memberId}</span> · {user?.religion} · {user?.caste}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            {profession} · {location}
          </p>
          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <Clock size={10} /> {formatDate(date)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {showActions && status === 'pending' && (
            <>
              <button
                onClick={() => handleAccept(connectionId)}
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                <Check size={14} /> Accept
              </button>
              <button
                onClick={() => handleDecline(connectionId)}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
              >
                <X size={14} /> Decline
              </button>
            </>
          )}
          {isMatch && (
            <button
              onClick={() => startChat(user?.memberId)}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <MessageCircle size={14} /> Chat Now
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="pb-20 bg-[#f5f6f8] min-h-screen">
      <div className="h-20"></div>
      <DashboardNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-7 h-7 text-primary" /> My Interests
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your connection requests and matches</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Received Interests */}
            {activeTab === 'received' && (
              receivedInterests.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                  <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-800 mb-1">No Received Interests Yet</h3>
                  <p className="text-sm text-gray-500">When someone expresses interest in your profile, it will appear here.</p>
                </div>
              ) : (
                receivedInterests.map(conn => (
                  <InterestCard
                    key={conn._id}
                    user={conn.senderId}
                    status={conn.status}
                    date={conn.createdAt}
                    connectionId={conn._id}
                    showActions={true}
                    isMatch={conn.status === 'accepted'}
                  />
                ))
              )
            )}

            {/* Sent Interests */}
            {activeTab === 'sent' && (
              sentInterests.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                  <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-800 mb-1">No Sent Interests Yet</h3>
                  <p className="text-sm text-gray-500">Express interest in profiles from the Active Members page.</p>
                </div>
              ) : (
                sentInterests.map(conn => (
                  <InterestCard
                    key={conn._id}
                    user={conn.receiverId}
                    status={conn.status}
                    date={conn.createdAt}
                    connectionId={conn._id}
                    showActions={false}
                    isMatch={conn.status === 'accepted'}
                  />
                ))
              )
            )}

            {/* Matches */}
            {activeTab === 'matches' && (
              matches.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-800 mb-1">No Matches Yet</h3>
                  <p className="text-sm text-gray-500">When you and another member mutually accept, they'll appear here and you can start chatting!</p>
                </div>
              ) : (
                matches.map(conn => {
                  const otherUser = conn.senderId?._id === currentUserId ? conn.receiverId : conn.senderId;
                  return (
                    <InterestCard
                      key={conn._id}
                      user={otherUser}
                      status="accepted"
                      date={conn.updatedAt}
                      connectionId={conn._id}
                      showActions={false}
                      isMatch={true}
                    />
                  );
                })
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}
