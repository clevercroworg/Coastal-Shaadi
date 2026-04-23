import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Heart, Star, Ban, MessageCircle, LogOut } from 'lucide-react';

export default function DashboardNavbar() {
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [pendingInterestCount, setPendingInterestCount] = useState(0);

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
    return () => clearInterval(interval);
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
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center w-full h-[54px]">
          <div className="flex overflow-x-auto h-full space-x-1 text-sm font-medium flex-1" style={{ scrollbarWidth: 'none' }}>
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
        </div>
      </div>
    </div>
  );
}
