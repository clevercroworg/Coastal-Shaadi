import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Heart, Star, Ban, MessageCircle, LogOut } from 'lucide-react';

export default function DashboardNavbar() {
  const links = [
    { name: 'Dashboard', path: '/active-members', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'My Profile', path: '/profile', icon: <User className="w-4 h-4" /> },
    { name: 'My Interest', path: '/interests', icon: <Heart className="w-4 h-4" /> },
    { name: 'Shortlist', path: '/shortlist', icon: <Star className="w-4 h-4" /> },
    { name: 'Messaging', path: '/messaging', icon: <MessageCircle className="w-4 h-4" /> },
    { name: 'Ignored User List', path: '/ignored', icon: <Ban className="w-4 h-4" /> },
  ];


  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center w-full">
          <div className="flex overflow-x-auto py-0 space-x-1 text-sm font-medium flex-1" style={{ scrollbarWidth: 'none' }}>
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap transition-all duration-200 px-4 py-3.5 border-b-2 ${
                    isActive
                      ? 'text-primary border-primary font-semibold'
                      : 'text-gray-500 border-transparent hover:text-primary hover:border-gray-300'
                  }`
                }
              >
                {link.icon} {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
