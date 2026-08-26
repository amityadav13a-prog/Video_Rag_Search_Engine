import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

export default function Profile() {
  const { user, setUser } = useAuth();

  const initialName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const avatarInitial = initialName.charAt(0).toUpperCase();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (auth.currentUser) {
        //Firebase Backend update
        await updateProfile(auth.currentUser, { displayName: name });
        
        //Auth Context State refresh
        if (setUser) {
          setUser({ ...auth.currentUser });
        }
        
        setMessage('Profile updated successfully!');
      }
    } catch (err) {
      setMessage('Error updating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Profile">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md">
        {/* Dynamic Avatar */}
        <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-2xl font-bold mb-4 text-white">
          {avatarInitial}
        </div>

        {/* Dynamic Name & Email */}
        <p className="font-semibold text-lg text-white">{initialName}</p>
        <p className="text-white/40 text-sm mb-6">{user?.email || 'user@example.com'}</p>

        {/* Update Form for existing accounts */}
        <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-white/10">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500"
              required
            />
          </div>

          {message && (
            <p className="text-xs text-indigo-400 font-medium">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Name'}
          </button>
        </form>
      </div>
    </Layout>
  );
}