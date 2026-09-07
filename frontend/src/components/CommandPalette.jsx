import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Home, Upload, Clock, User, LogOut, Sparkles, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose ? (isOpen ? onClose() : null) : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNav = [
    { label: 'Go to Dashboard', icon: Home, action: () => navigate('/') },
    { label: 'Semantic Search Engine', icon: Search, action: () => navigate('/search') },
    { label: 'Upload or Process Video', icon: Upload, action: () => navigate('/upload') },
    { label: 'Activity & Search History', icon: Clock, action: () => navigate('/history') },
    { label: 'Account Profile', icon: User, action: () => navigate('/profile') },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  const filteredNav = quickNav.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl bg-[#0f111d] border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
            <Search size={20} className="text-indigo-400 shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search videos, jump to page, or enter query..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-white/40 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            )}
            <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded font-mono">ESC</span>
          </form>

          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {query.trim() && (
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-indigo-300 hover:bg-indigo-500/10 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-indigo-400" />
                  <span>Run semantic search for: <strong className="text-white font-medium">"{query}"</strong></span>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            <div className="px-3 py-1 text-[11px] font-semibold text-white/30 uppercase tracking-wider">
              Navigation
            </div>

            {filteredNav.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={16} className="text-white/40 group-hover:text-indigo-400 transition-colors" />
                  <span>{item.label}</span>
                </div>
                <ArrowRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
              </button>
            ))}
          </div>

          <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
            <span>Tip: Type any keyword and press <strong>Enter</strong> to search across all indexed video transcripts</span>
            <span className="font-mono">⌘K</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
