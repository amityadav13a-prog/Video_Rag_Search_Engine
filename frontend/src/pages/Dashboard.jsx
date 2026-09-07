import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  BarChart2, 
  Calendar, 
  Upload as UploadIcon, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  PlayCircle,
  Cpu,
  RefreshCw,
  Video,
  Layers,
  ChevronRight
} from 'lucide-react';
import Layout from '../components/Layout';
import { getStats, getHistory, uploadVideo, searchVideo } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ videos_uploaded: 0, searches_made: 0, results_found: 0 });
  const [activity, setActivity] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [quickQuery, setQuickQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState('all');

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Explorer';

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes] = await Promise.allSettled([getStats(), getHistory()]);
      
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data || { videos_uploaded: 0, searches_made: 0, results_found: 0 });
      }
      if (historyRes.status === 'fulfilled') {
        const histData = historyRes.value.data || {};
        setActivity(histData.recent_activity || []);
        setRecentSearches((histData.recent_searches || []).slice(0, 5));
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickSearch = (queryToRun) => {
    const q = (queryToRun || quickQuery).trim();
    if (!q) {
      info('Please type a search query first');
      return;
    }
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleUpload = async () => {
    if (!file) {
      info('Please select a video file to upload');
      return;
    }
    setUploading(true);
    try {
      await uploadVideo(file);
      success(`"${file.name}" uploaded! Processing started in the background.`, 'Upload Queued');
      setFile(null);
      loadData();
    } catch (err) {
      console.error('Upload failed:', err);
      error(err.response?.data?.detail || 'Upload failed. Please try a valid video file.');
    } finally {
      setUploading(false);
    }
  };

  const statCards = [
    {
      icon: Video,
      value: stats.videos_uploaded ?? 0,
      label: 'Videos Indexed',
      sub: 'Audio, OCR & scenes ready',
      color: 'from-blue-500/20 to-indigo-500/10 text-indigo-400 border-indigo-500/20',
      action: () => navigate('/upload'),
    },
    {
      icon: Search,
      value: stats.searches_made ?? 0,
      label: 'Searches Run',
      sub: 'Multimodal queries executed',
      color: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/20',
      action: () => navigate('/search'),
    },
    {
      icon: Sparkles,
      value: stats.results_found ?? 0,
      label: 'Key Moments Found',
      sub: 'High-confidence AI matches',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20',
      action: () => navigate('/history'),
    },
    {
      icon: Cpu,
      value: 'Online',
      label: 'AI Vector Store',
      sub: 'Qdrant & Whisper Active',
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/20',
      isStatus: true,
    },
  ];

  const samplePrompts = [
    'Where is gradient descent explained?',
    'Show whiteboard diagram about vectors',
    'When does the speaker talk about fine-tuning?',
  ];

  const filteredActivity = activity.filter((item) => {
    if (activityFilter === 'all') return true;
    return item.type === activityFilter;
  });

  return (
    <Layout title="Dashboard" subtitle="Overview of your multimodal video knowledge base">
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-8 bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-[#0f111d] border border-indigo-500/20 backdrop-blur-xl shadow-xl"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles size={13} className="text-indigo-400" />
            <span>Next-Gen Video RAG Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            {getTimeOfDayGreeting()}, {displayName}! 👋
          </h2>
          <p className="text-sm sm:text-base text-slate-300/80 leading-relaxed mb-6">
            Search across spoken audio, on-screen text (OCR), and visual scenes with AI precision.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/search')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search size={16} />
              <span>Search Video Archive</span>
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <UploadIcon size={16} />
              <span>Upload New Video</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      </motion.div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={s.action}
            className={`p-5 rounded-2xl bg-gradient-to-br ${s.color} border backdrop-blur-md transition-all duration-200 ${
              s.action ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/60">{s.label}</span>
              <div className="p-2 rounded-xl bg-white/10 shrink-0">
                <s.icon size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {s.value}
              </p>
              {s.isStatus && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <p className="text-[11px] text-white/40 mt-1 truncate">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Two Column Section: Quick Actions & Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Activity Feed */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-base text-white">Recent Activity</h3>
              <p className="text-xs text-white/40">Latest indexing & queries across your account</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-xs">
              <button
                onClick={() => setActivityFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  activityFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActivityFilter('upload')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  activityFilter === 'upload'
                    ? 'bg-indigo-600 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Uploads
              </button>
              <button
                onClick={() => setActivityFilter('search')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  activityFilter === 'search'
                    ? 'bg-indigo-600 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Searches
              </button>
            </div>
          </div>

          <div className="space-y-2.5 flex-1">
            {filteredActivity.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl">
                <Clock size={32} className="text-white/20 mb-2" />
                <p className="text-sm font-medium text-white/60">No activity logged yet</p>
                <p className="text-xs text-white/40 mt-1 max-w-xs">
                  Upload a video or try a semantic search to populate your activity feed.
                </p>
              </div>
            ) : (
              filteredActivity.slice(0, 6).map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        a.type === 'upload'
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {a.type === 'upload' ? <UploadIcon size={16} /> : <Search size={16} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors">
                        {a.title}
                      </p>
                      <p className="text-[11px] text-white/40 flex items-center gap-2">
                        <span>{a.subtitle || (a.type === 'upload' ? 'Video ingestion' : 'Semantic query')}</span>
                        {a.top_timestamp && (
                          <span className="font-mono text-[10px] text-indigo-300 bg-indigo-500/20 px-1.5 py-0.2 rounded">
                            @{a.top_timestamp}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    {a.status && (
                      <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {a.status}
                      </span>
                    )}
                    {a.results_count !== undefined && (
                      <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                        {a.results_count} results
                      </span>
                    )}
                    <p className="text-[10px] text-white/30 mt-1">
                      {a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredActivity.length > 0 && (
            <button
              onClick={() => navigate('/history')}
              className="mt-4 pt-3 border-t border-white/5 w-full flex items-center justify-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              <span>View Full History & Logs</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Right 1 Col: Quick Actions */}
        <div className="space-y-6">
          {/* Quick Search Card */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Search size={18} className="text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Instant Search</h3>
            </div>
            <p className="text-xs text-white/50 mb-3">
              Ask anything about your processed video catalog.
            </p>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                  placeholder="e.g. Find section explaining RAG..."
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40"
                />
              </div>

              <button
                onClick={() => handleQuickSearch()}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
              >
                <Sparkles size={14} />
                <span>Search Knowledge Base</span>
              </button>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <p className="text-[11px] font-semibold text-white/40 mb-2">Try sample queries:</p>
              <div className="flex flex-col gap-1.5">
                {samplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickSearch(prompt)}
                    className="text-left text-[11px] text-white/60 hover:text-indigo-300 bg-white/[0.02] hover:bg-white/[0.05] p-2 rounded-lg transition-colors truncate border border-transparent hover:border-indigo-500/20"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Upload Tile */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UploadIcon size={18} className="text-purple-400" />
                <h3 className="font-bold text-sm text-white">Quick Ingestion</h3>
              </div>
              <span className="text-[10px] text-white/40">MP4, MOV, MKV</span>
            </div>

            <label className="flex flex-col items-center justify-center p-4 border border-dashed border-white/15 hover:border-indigo-400/50 rounded-2xl cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all text-center">
              <Video size={24} className="text-white/30 mb-2" />
              <p className="text-xs text-white/70 font-medium truncate max-w-[200px]">
                {file ? file.name : 'Select or drop video'}
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">Whisper + OCR will index it</p>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            {file && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Processing In Background...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Upload & Process "{file.name.slice(0, 15)}..."</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}