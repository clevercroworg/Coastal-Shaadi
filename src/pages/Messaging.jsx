import React, { useState, useRef, useEffect } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { Send, Search, User, Smile, Check, CheckCheck, MessageSquarePlus, Loader2, ChevronLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Messaging() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const { showToast } = useToast();
  const pollRef = useRef(null);
  const [contactOnline, setContactOnline] = useState(false);

  // Get logged-in user from localStorage
  const getUserData = () => {
    try {
      const stored = localStorage.getItem('userProfile');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  };
  const userData = getUserData();
  const currentUserId = userData?.id;

  // Scroll to bottom of messages without moving the entire page
  const scrollToBottom = (force = false) => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    
    if (force || isAtBottom) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom(true);
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`/api/conversations/${currentUserId}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);

        // Check if we should auto-open a conversation from URL or pending chat
        const pendingChatId = sessionStorage.getItem('pendingChatMemberId');
        if (pendingChatId) {
          sessionStorage.removeItem('pendingChatMemberId');
          startChatWithMember(pendingChatId);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // Poll for new conversations every 5 seconds
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  // Fetch messages for active conversation
  const fetchMessages = async (convId, isPolling = false) => {
    if (!convId) return;
    if (!isPolling) setIsLoadingMsgs(true);
    try {
      const res = await fetch(`/api/messages/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
      // Mark messages as read
      await fetch('/api/messages/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId, userId: currentUserId })
      });
      // Refresh conversations to update unread counts
      if (!isPolling) fetchConversations();
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      if (!isPolling) setIsLoadingMsgs(false);
    }
  };

  const conversationsRef = useRef(conversations);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const checkOnlineStatus = async (convId) => {
    try {
      const conv = conversationsRef.current.find(c => c._id === convId);
      const otherUser = getOtherParticipant(conv);
      if (otherUser?._id) {
        const res = await fetch(`/api/online/${otherUser._id}`);
        if (res.ok) {
          const data = await res.json();
          setContactOnline(data.online);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      checkOnlineStatus(activeConvId);
      // Poll messages and online status every 3 seconds
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        fetchMessages(activeConvId, true);
        checkOnlineStatus(activeConvId);
      }, 3000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeConvId]);

  // Start chat with a member (used from MemberCard)
  const startChatWithMember = async (memberId) => {
    try {
      // First check if connection is accepted
      const statusRes = await fetch(`/api/connections/status/${currentUserId}/${memberId}`);
      if (statusRes.ok) {
        const data = await statusRes.json();
        if (data.status !== 'accepted') {
          showToast('You can only chat with members who have accepted your interest request. 💖', 'error');
          return;
        }
      }

      // Get the user by memberId
      const userRes = await fetch(`/api/user-by-member/${memberId}`);
      if (!userRes.ok) return;
      const targetUser = await userRes.json();

      // Create or get conversation
      const convRes = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUserId, receiverId: targetUser._id })
      });
      if (convRes.ok) {
        const conv = await convRes.json();
        setActiveConvId(conv._id);
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to start chat', err);
    }
  };

  // Send a message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConvId) return;

    const text = messageText;
    setMessageText('');

    // Optimistic update
    const optimisticMsg = {
      _id: Date.now(),
      conversationId: activeConvId,
      senderId: currentUserId,
      text,
      read: false,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConvId, senderId: currentUserId, text })
      });
      fetchMessages(activeConvId);
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  // Helpers
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const avatarColors = ['bg-[#800000]', 'bg-[#b8860b]', 'bg-[#2563eb]', 'bg-[#059669]', 'bg-[#7c3aed]', 'bg-[#dc2626]'];

  const getOtherParticipant = (conv) => {
    return conv.participants?.find(p => p._id !== currentUserId) || {};
  };

  const getContactName = (participant) => {
    return `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || 'Unknown';
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherParticipant(conv);
    return getContactName(other).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const activeConv = conversations.find(c => c._id === activeConvId);
  const activeContact = activeConv ? getOtherParticipant(activeConv) : null;

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <main className="pb-0 bg-[#f5f6f8] min-h-screen flex flex-col">
      <div className="h-20"></div>
      <DashboardNavbar />

      <div className="flex-1 flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-1" style={{ minHeight: '520px', maxHeight: 'calc(100vh - 200px)' }}>

          {/* Sidebar */}
          <div className={`border-r border-gray-100 flex flex-col bg-white shrink-0 ${activeConvId ? 'hidden lg:flex w-[340px]' : 'flex w-full lg:w-[340px]'}`}>
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Messages</h2>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#f5f6f8] border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingConvs ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <MessageSquarePlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start chatting from the Active Members page</p>
                </div>
              ) : (
                filteredConversations.map((conv, i) => {
                  const other = getOtherParticipant(conv);
                  const name = getContactName(other);
                  return (
                    <div
                      key={conv._id}
                      onClick={() => setActiveConvId(conv._id)}
                      className={`px-5 py-4 cursor-pointer transition-all duration-150 flex items-center gap-3.5 ${
                        activeConvId === conv._id
                          ? 'bg-[#fdf8f4] border-l-[3px] border-l-primary'
                          : 'hover:bg-gray-50 border-l-[3px] border-l-transparent'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {other.image ? (
                          <img src={other.image} alt={name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${avatarColors[i % avatarColors.length]}`}>
                            {getInitials(name)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{name}</h4>
                          <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                            {conv.lastMessageTime ? formatTime(conv.lastMessageTime) : ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500 truncate pr-2">{conv.lastMessage || 'No messages yet'}</p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex-col bg-[#faf9f7] ${!activeConvId ? 'hidden lg:flex' : 'flex'}`}>
            {!activeConvId ? (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                  <MessageSquarePlus className="w-9 h-9 text-gray-300" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">Start a Conversation</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Select a conversation from the left panel, or click the "Chat" button on any member's profile to begin messaging.
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="h-[68px] px-4 sm:px-6 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button 
                      onClick={() => setActiveConvId(null)} 
                      className="lg:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-full mr-1"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {activeContact?.image ? (
                      <img src={activeContact.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${avatarColors[0]}`}>
                        {activeContact ? getInitials(getContactName(activeContact)) : '?'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {activeContact ? getContactName(activeContact) : ''}
                      </h3>
                      <p className={`text-xs font-medium ${contactOnline ? 'text-green-500' : 'text-gray-400'}`}>
                        {contactOnline ? '● Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-5" ref={messagesContainerRef}>
                  <div className="flex justify-center mb-6">
                    <span className="text-[11px] bg-white text-gray-500 px-4 py-1.5 rounded-full shadow-sm border border-gray-100 font-medium">
                      Messages are end-to-end secured
                    </span>
                  </div>

                  {isLoadingMsgs && messages.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-gray-400">No messages yet. Say hello! 👋</p>
                    </div>
                  ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                      <div key={date}>
                        <div className="flex justify-center my-4">
                          <span className="text-[10px] bg-white text-gray-400 px-3 py-1 rounded-full shadow-sm border border-gray-100 font-medium">
                            {date}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {msgs.map((msg) => (
                            <div key={msg._id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                msg.senderId === currentUserId
                                  ? 'bg-gradient-to-br from-[#800000] to-[#6b0000] text-white rounded-br-md'
                                  : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                              }`}>
                                <p className="text-[13px] leading-relaxed">{msg.text}</p>
                                <div className={`flex items-center justify-end gap-1 mt-1 ${msg.senderId === currentUserId ? 'text-white/60' : 'text-gray-400'}`}>
                                  <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                                  {msg.senderId === currentUserId && (
                                    msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="px-5 py-4 bg-white border-t border-gray-100 shrink-0">
                  <form onSubmit={handleSend} className="flex gap-3 items-center">
                    <button type="button" className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                      <Smile size={20} />
                    </button>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-[#f5f6f8] px-5 py-3 rounded-full text-sm outline-none placeholder:text-gray-400 text-gray-800 focus:ring-2 focus:ring-primary/20 border-0"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-[#6b0000] hover:shadow-lg flex items-center justify-center text-white disabled:opacity-40 transition-all shrink-0 shadow-md"
                    >
                      <Send size={16} className="-ml-0.5" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
