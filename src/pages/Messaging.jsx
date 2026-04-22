import React, { useState, useRef, useEffect } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { Send, MoreVertical, Search, User, Smile, Check, CheckCheck } from 'lucide-react';

const allChats = {
  1: {
    contact: { id: 1, name: 'Priya Shetty', online: true, lastSeen: 'Online', image: null },
    messages: [
      { id: 1, sender: 'them', text: 'Hi! I really liked your profile. 😊', time: '10:15 AM', read: true },
      { id: 2, sender: 'me', text: 'Thanks Priya! Great to connect with you too.', time: '10:18 AM', read: true },
      { id: 3, sender: 'them', text: 'I noticed we share similar interests. Do you enjoy traveling?', time: '10:22 AM', read: true },
      { id: 4, sender: 'me', text: 'Absolutely! I love exploring new places, especially the coastal regions of Karnataka.', time: '10:25 AM', read: true },
      { id: 5, sender: 'them', text: 'That sounds wonderful! Are you available this weekend to chat more?', time: '10:42 AM', read: false },
    ]
  },
  2: {
    contact: { id: 2, name: 'Neha Dsouza', online: false, lastSeen: 'Last seen today at 9:30 AM', image: null },
    messages: [
      { id: 1, sender: 'me', text: 'Hi Neha, I found your profile really interesting!', time: '9:00 AM', read: true },
      { id: 2, sender: 'them', text: 'Thank you! That means a lot. Tell me more about yourself.', time: '9:15 AM', read: true },
      { id: 3, sender: 'me', text: 'I am a software engineer based in Bangalore. Originally from Mangalore.', time: '9:20 AM', read: true },
      { id: 4, sender: 'them', text: 'Oh nice! I am from Udupi. Thanks for the interest. Let me go through your profile in detail and get back.', time: '9:32 AM', read: true },
    ]
  },
  3: {
    contact: { id: 3, name: 'Ankita Rao', online: true, lastSeen: 'Online', image: null },
    messages: [
      { id: 1, sender: 'them', text: 'Hey! I see you expressed interest in my profile.', time: 'Mon 2:00 PM', read: true },
      { id: 2, sender: 'me', text: 'Yes, your profile caught my eye. We seem to share similar family values.', time: 'Mon 2:10 PM', read: true },
      { id: 3, sender: 'them', text: 'Yes, that is really important to me too. What does your typical day look like?', time: 'Mon 2:15 PM', read: true },
      { id: 4, sender: 'me', text: 'Work during the day, and I usually spend evenings either cooking or playing badminton!', time: 'Mon 2:20 PM', read: true },
      { id: 5, sender: 'them', text: 'That sounds great! I enjoy cooking too.', time: 'Mon 2:25 PM', read: true },
      { id: 6, sender: 'me', text: 'We should exchange recipes sometime!', time: 'Mon 2:30 PM', read: true },
      { id: 7, sender: 'them', text: 'Yes, that makes sense. 😄', time: 'Mon 2:35 PM', read: true },
    ]
  },
  4: {
    contact: { id: 4, name: 'Deepa Nayak', online: false, lastSeen: 'Last seen yesterday', image: null },
    messages: [
      { id: 1, sender: 'them', text: 'Hello! Thanks for visiting my profile.', time: 'Sun 11:00 AM', read: true },
      { id: 2, sender: 'me', text: 'Hi Deepa! Your profile is very well written. I loved your bio.', time: 'Sun 11:05 AM', read: true },
    ]
  }
};

export default function Messaging() {
  const [activeChat, setActiveChat] = useState(1);
  const [messageText, setMessageText] = useState('');
  const [chatData, setChatData] = useState(allChats);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat, chatData]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    setChatData(prev => ({
      ...prev,
      [activeChat]: {
        ...prev[activeChat],
        messages: [...prev[activeChat].messages, newMsg]
      }
    }));
    setMessageText('');
  };

  const currentChat = chatData[activeChat];

  const contactList = Object.values(chatData).map(c => {
    const lastMsg = c.messages[c.messages.length - 1];
    const unread = c.messages.filter(m => m.sender === 'them' && !m.read).length;
    return {
      ...c.contact,
      latestText: lastMsg.text,
      latestTime: lastMsg.time,
      unread
    };
  });

  const filteredContacts = contactList.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const avatarColors = ['bg-[#800000]', 'bg-[#b8860b]', 'bg-[#2563eb]', 'bg-[#059669]'];

  return (
    <main className="pb-0 bg-[#f5f6f8] min-h-screen flex flex-col">
      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>
      <DashboardNavbar />

      <div className="flex-1 flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-1" style={{ minHeight: '520px', maxHeight: 'calc(100vh - 200px)' }}>

          {/* Sidebar */}
          <div className="w-[340px] border-r border-gray-100 flex flex-col bg-white shrink-0">
            {/* Sidebar Header */}
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

            {/* Contacts */}
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map((contact, i) => (
                <div
                  key={contact.id}
                  onClick={() => setActiveChat(contact.id)}
                  className={`px-5 py-4 cursor-pointer transition-all duration-150 flex items-center gap-3.5 border-l-3 ${
                    activeChat === contact.id
                      ? 'bg-[#fdf8f4] border-l-[3px] border-l-primary'
                      : 'hover:bg-gray-50 border-l-[3px] border-l-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${avatarColors[i % avatarColors.length]}`}>
                      {getInitials(contact.name)}
                    </div>
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{contact.name}</h4>
                      <span className="text-[11px] text-gray-400 shrink-0 ml-2">{contact.latestTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 truncate pr-2">{contact.latestText}</p>
                      {contact.unread > 0 && (
                        <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">{contact.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-[#faf9f7]">
            {/* Chat Header */}
            <div className="h-[68px] px-6 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${avatarColors[(activeChat - 1) % avatarColors.length]}`}>
                  {getInitials(currentChat.contact.name)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{currentChat.contact.name}</h3>
                  <p className={`text-xs font-medium ${currentChat.contact.online ? 'text-green-500' : 'text-gray-400'}`}>
                    {currentChat.contact.online ? 'Online' : currentChat.contact.lastSeen}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"><MoreVertical size={17} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex justify-center mb-6">
                <span className="text-[11px] bg-white text-gray-500 px-4 py-1.5 rounded-full shadow-sm border border-gray-100 font-medium">
                  Messages are end-to-end secured
                </span>
              </div>

              <div className="space-y-3">
                {currentChat.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      msg.sender === 'me'
                        ? 'bg-gradient-to-br from-[#800000] to-[#6b0000] text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                    }`}>
                      <p className="text-[13px] leading-relaxed">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sender === 'me' ? 'text-white/60' : 'text-gray-400'}`}>
                        <span className="text-[10px]">{msg.time}</span>
                        {msg.sender === 'me' && (
                          msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
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
          </div>
        </div>
      </div>
    </main>
  );
}
