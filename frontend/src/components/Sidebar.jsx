import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  Search, 
  Clock, 
  User, 
  LogOut, 
  Play, 
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/search', label: 'Semantic Search', icon: Search },
  { to: '/upload', label: 'Video Ingestion', icon: Upload },
  { to: '/history', label: 'Activity & History', icon: Clock },
  { to: '/profile', label: 'User Profile', icon: User },
];

export default function Sidebar({ onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-64 h-screen bg-[#0c0e18]/90 backdrop-blur-2xl border-r border-white/10 flex flex-col fixed left-0 top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Play size={18} className="text-white fill-white translate-x-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Video RAG
              </span>
            </div>
            <p className="text-[11px] text-white/40">Multimodal Search Engine</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 text-[11px] font-bold text-white/30 uppercase tracking-wider mb-2">
            Main Navigation
          </div>
          <nav className="flex flex-col gap-1.5">
            {navItems.map(({ to, label, icon: Icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => onCloseMobile && onCloseMobile()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-white/60 hover:bg-white/[0.04] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={`transition-colors ${
                          isActive ? 'text-indigo-400' : 'text-white/40 group-hover:text-white/80'
                        }`}
                      />
                      <span>{label}</span>
                    </div>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full shadow-sm shadow-indigo-400" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* System Capabilities Box */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-transparent border border-indigo-500/20 mx-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Layers size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-200">Multimodal RAG</span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed mb-2.5">
            Indexed with Whisper audio speech, OCR frames, and CLIP visual search.
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Qdrant & Vector DB Online
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-white/10 bg-white/[0.01]">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md">
              {avatarInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}