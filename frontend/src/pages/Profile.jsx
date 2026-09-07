import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { updateProfile } from 'firebase/auth';
import { 
  User, 
  Mail, 
  Shield, 
  Check, 
  Save, 
  Loader2, 
  Video, 
  Search, 
  Sparkles, 
  Key, 
  LogOut,
  Calendar,
  Activity
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { getStats } from '../api';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const { success, error, info } = useToast();

  const initialName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ videos_uploaded: 0, searches_made: 0, results_found: 0 });

  const avatarInitial = (name || initialName).charAt(0).toUpperCase();

  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data || {}))
      .catch((err) => console.error('Error fetching stats:', err));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      info('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
        if (setUser) {
          setUser({ ...auth.currentUser, displayName: name.trim() });
        }
        success('Display name updated successfully!', 'Profile Updated');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      error(err.message || 'Failed to update profile name');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout 
      title="User Profile & Preferences" 
      subtitle="Manage your personal account settings and review your video search usage"
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-extrabold text-white mb-4 shadow-xl shadow-indigo-600/30 ring-4 ring-white/10">
            {avatarInitial}
          </div>

          <h3 className="text-lg font-bold text-white mb-0.5">{name || 'User'}</h3>
          <p className="text-xs text-white/50 mb-4 truncate max-w-[200px]">{user?.email}</p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
            <Shield size={12} />
            <span>Authenticated User</span>
          </div>

          {/* Account Usage Metrics */}
          <div className="w-full space-y-2 pt-4 border-t border-white/10 text-left text-xs">
            <div className="flex items-center justify-between py-1 text-white/60">
              <span className="flex items-center gap-2">
                <Video size={14} className="text-indigo-400" /> Videos Indexed
              </span>
              <span className="font-bold text-white font-mono">{stats.videos_uploaded ?? 0}</span>
            </div>

            <div className="flex items-center justify-between py-1 text-white/60">
              <span className="flex items-center gap-2">
                <Search size={14} className="text-purple-400" /> Searches Run
              </span>
              <span className="font-bold text-white font-mono">{stats.searches_made ?? 0}</span>
            </div>

            <div className="flex items-center justify-between py-1 text-white/60">
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-400" /> Matches Found
              </span>
              <span className="font-bold text-white font-mono">{stats.results_found ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Edit Form & System Settings */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-1">
              <User size={18} className="text-indigo-400" />
              <h3 className="text-base font-bold text-white">Account Details</h3>
            </div>
            <p className="text-xs text-white/40 mb-6">
              Update how your name appears across the workspace and activity logs.
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm text-white/50 bg-white/[0.02] cursor-not-allowed border-white/5"
                />
                <p className="text-[11px] text-white/30 mt-1">
                  Email authentication managed securely via Firebase.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>

          {/* Connected Services Box */}
          <div className="glass-panel rounded-3xl p-6">
            <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={14} className="text-indigo-400" />
              <span>Engine Status & Architecture</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="font-semibold text-white mb-0.5">Vector Database</p>
                <p className="text-[11px] text-white/40">Qdrant Cloud (Text & CLIP Collections)</p>
                <span className="inline-block mt-2 text-[10px] text-emerald-400 font-medium">● Connected</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="font-semibold text-white mb-0.5">Speech & OCR Engine</p>
                <p className="text-[11px] text-white/40">OpenAI Whisper + EasyOCR Frame Indexer</p>
                <span className="inline-block mt-2 text-[10px] text-emerald-400 font-medium">● Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}