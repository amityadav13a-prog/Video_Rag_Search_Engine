import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import { 
  Bell, 
  Search, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Activity, 
  ChevronDown,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090e] text-slate-100 flex flex-col relative bg-grid-pattern">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-full">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 h-16 bg-[#08090e]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 font-medium">Video RAG</span>
                <span className="text-xs text-white/20">/</span>
                <h1 className="text-sm font-semibold text-white">{title}</h1>
              </div>
              {subtitle && <p className="text-[11px] text-white/50">{subtitle}</p>}
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Command Trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white/50 hover:text-white transition-all shadow-sm group"
            >
              <Search size={14} className="group-hover:text-indigo-400 transition-colors" />
              <span>Quick search...</span>
              <kbd className="font-mono text-[10px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded border border-white/10">
                ⌘K
              </kbd>
            </button>

            {/* Engine Status Badge */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Online</span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {avatarInitial}
                </div>
                <span className="hidden md:block text-xs font-medium text-white max-w-[100px] truncate">
                  {displayName}
                </span>
                <ChevronDown size={14} className="text-white/40" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-[#101322] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-xs font-semibold text-white">{displayName}</p>
                      <p className="text-[11px] text-white/40 truncate">{user?.email}</p>
                    </div>

                    <NavLink
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User size={14} className="text-white/40" />
                      <span>Account Profile</span>
                    </NavLink>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setCommandPaletteOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
                    >
                      <Search size={14} className="text-white/40" />
                      <span>Command Menu (⌘K)</span>
                    </button>

                    <div className="h-px bg-white/5 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}