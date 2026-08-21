import React from 'react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, BarChart2, Calendar, Upload as UploadIcon, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { getStats, getHistory, uploadVideo, searchVideo } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ videos_uploaded: 0, searches_made: 0, results_found: 0 });
  const [activity, setActivity] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [quickQuery, setQuickQuery] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([getStats(), getHistory()]);
      setStats(statsRes.data);
      setActivity(historyRes.data.recent_activity.slice(0, 5));
      setRecentSearches(historyRes.data.recent_searches.slice(0, 3));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickSearch = async () => {
    if (!quickQuery.trim()) return;
    await searchVideo(quickQuery);
    setQuickQuery('');
    loadData();
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadVideo(file);
      setFile(null);
      loadData();
    } finally {
      setUploading(false);
    }
  };

  const statCards = [
    { icon: FileText, value: stats.videos_uploaded, label: 'Videos Uploaded', color: 'bg-purple-500/20 text-purple-400' },
    { icon: Search, value: stats.searches_made, label: 'Searches Made', color: 'bg-green-500/20 text-green-400' },
    { icon: BarChart2, value: stats.results_found, label: 'Results Found', color: 'bg-orange-500/20 text-orange-400' },
  ];

  return (
    <Layout title="Dashboard">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold mb-1">Welcome back 👋</h2>
        <p className="text-white/50 mb-8">Here's what's happening with your videos today.</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          </motion.div>
        ))}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-lg font-bold">{new Date().toLocaleDateString()}</p>
            <p className="text-white/40 text-xs">Today</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-1">
            {activity.length === 0 && <p className="text-white/40 text-sm">No activity yet.</p>}
            {activity.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.type === 'upload' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-green-500/20 text-green-400'}`}>
                    {a.type === 'upload' ? <UploadIcon size={16} /> : <Search size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-white/40">{a.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  {a.status && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Processed</span>}
                  {a.results_count !== undefined && <span className="text-xs text-white/50">{a.results_count} results found</span>}
                  <p className="text-xs text-white/30 mt-1">{new Date(a.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Search size={16} /> Quick Search</h3>
            <div className="flex gap-2">
              <input
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                placeholder="e.g. where is gradient descent?"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400/50"
              />
              <button onClick={handleQuickSearch} className="px-4 py-2 bg-indigo-500 rounded-lg text-sm font-medium">Search</button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold mb-3">Upload Video</h3>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/20 rounded-xl p-6 cursor-pointer hover:border-indigo-400/50">
              <UploadIcon size={24} className="text-white/40" />
              <span className="text-xs text-white/50 text-center">{file ? file.name : 'Drag & drop your video here'}</span>
              <input type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </label>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full mt-3 py-2.5 bg-indigo-500 rounded-lg text-sm font-medium disabled:opacity-40"
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock size={16} /> Recent Searches</h3>
        <div className="space-y-1">
          {recentSearches.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                  {s.top_timestamp || '--:--'}
                </span>
                <span className="text-sm">{s.query}</span>
              </div>
              <span className="text-xs text-white/40">{s.results_count} results found</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}