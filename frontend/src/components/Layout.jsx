import React from 'react';
import Sidebar from './Sidebar';
import { Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, title }) {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <Sidebar />
      <div className="ml-64">
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
          <h1 className="text-xl font-semibold">{title}</h1>
          <div className="flex items-center gap-5">
            <Bell size={20} className="text-white/50 cursor-pointer hover:text-white transition-colors" />
            
            {/* Dynamic User Profile Header */}
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold text-white">
                {avatarInitial}
              </div>
              <span className="text-sm font-medium max-w-[120px] truncate">{displayName}</span>
              <ChevronDown size={16} className="text-white/40" />
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}