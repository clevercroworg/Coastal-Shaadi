import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Heart, Star, Ban, MessageCircle, LogOut, ChevronRight } from 'lucide-react';

export default function DashboardNavbar() {
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [pendingInterestCount, setPendingInterestCount] = useState(0);
  const scrollContainerRef = useRef(null);
  const [showRightShadow, setShowRightShadow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowRightShadow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userProfileStr = localStorage.getItem('userProfile');
        if (!userProfileStr) return;
        const userProfile = JSON.parse(userProfileStr);
        const userId = userProfile.id || userProfile._id;
        
        // Fetch Conversations for unread counts
        const resConvs = await fetch(`/api/conversations/${userId}`);
        if (resConvs.ok) {
          const convs = await resConvs.json();
          const totalUnread = convs.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
          setUnreadMsgCount(totalUnread);
        }

        // Fetch received interests for pending counts
        const resInt = await fetch(`/api/connections/received/${userId}`);
        if (resInt.ok) {
          const interests = await resInt.json();
          const pending = interests.filter(int => int.status === 'pending').length;
          setPendingInterestCount(pending);
        }
      } catch (err) {
        console.error('Error fetching notifications', err);
      }
    };

    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    // Check initial scroll state and listen to resize
    setTimeout(handleScroll, 100);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const links = [
    { name: 'Dashboard', path: '/active-members', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'My Profile', path: '/profile', icon: <User className="w-4 h-4" /> },
    { name: 'My Interest', path: '/interests', icon: <Heart className="w-4 h-4" />, badgeCount: pendingInterestCount },
    { name: 'Shortlist', path: '/shortlist', icon: <Star className="w-4 h-4" /> },
    { name: 'Messaging', path: '/messaging', icon: <MessageCircle className="w-4 h-4" />, badgeCount: unreadMsgCount },
    { name: 'Ignored User List', path: '/ignored', icon: <Ban className="w-4 h-4" /> },
  ];


  return (
    <div className="bg-white border-b border-gray-200 shadow-sm relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center w-full h-[54px] relative">
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto h-full space-x-1 text-sm font-medium flex-1 hide-scrollbar" 
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap transition-all duration-200 px-4 h-full border-b-2 ${
                    isActive
                      ? 'text-primary border-primary'
                      : 'text-gray-500 border-transparent hover:text-primary hover:border-gray-300'
                  }`
                }
              >
                {link.icon} {link.name}
                {link.badgeCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 min-w-[18px] text-center">
                    {link.badgeCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
          
          {/* Mobile Scroll Indicator (Right) */}
          <div className={`absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none transition-opacity duration-300 sm:hidden ${showRightShadow ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className={`absolute top-1/2 right-1 -translate-y-1/2 bg-gray-50 border border-gray-200 rounded-full p-0.5 shadow-sm pointer-events-none transition-opacity duration-300 sm:hidden animate-pulse ${showRightShadow ? 'opacity-100' : 'opacity-0'}`}>
            <ChevronRight className="w-3 h-3 text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
