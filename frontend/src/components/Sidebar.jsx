import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Upload, Search, Clock, User, LogOut, PlayCircle } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#12121c] border-r border-white/10 flex flex-col fixed left-0 top-0">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <PlayCircle size={20} />
        </div>
        <span className="font-semibold text-lg">Video Search</span>
      </div>

      <div className="px-6 text-xs text-white/30 font-medium mb-2 mt-2">MAIN</div>
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 text-xs text-white/30 font-medium mb-2 mt-8">ACCOUNT</div>
      <button className="flex items-center gap-3 px-6 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors mx-3 rounded-xl">
        <LogOut size={18} /> Logout
      </button>

      <div className="mt-auto p-4 border-t border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold">
          U
        </div>
        <div className="text-sm">
          <p className="font-medium">User</p>
          <p className="text-white/40 text-xs">user@example.com</p>
        </div>
      </div>
    </aside>
  );
}