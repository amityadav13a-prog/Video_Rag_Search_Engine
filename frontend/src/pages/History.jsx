import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Upload, 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Filter, 
  Calendar,
  Layers,
  RotateCcw
} from 'lucide-react';
import Layout from '../components/Layout';
import { getHistory } from '../api';
import { useToast } from '../context/ToastContext';

export default function History() {
  const [activity, setActivity] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'upload' | 'search'
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { info } = useToast();

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await getHistory();
      setActivity(res.data?.recent_activity || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleReSearch = (queryText) => {
    if (!queryText) return;
    navigate(`/search?q=${encodeURIComponent(queryText)}`);
  };

  const filteredActivity = activity.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = !searchFilter.trim() || 
      (item.title && item.title.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <Layout 
      title="Activity & Search History" 
      subtitle="Complete chronological timeline of your video uploads and multimodal queries"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Filter Bar */}
        <div className="glass-panel rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search filter within history */}
          <div className="relative flex-1">
            <Search size={16} className="text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by query or video filename..."
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 outline-none"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 self-start sm:self-auto text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              All Events ({activity.length})
            </button>
            <button
              onClick={() => setFilterType('upload')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
                filterType === 'upload'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Upload size={13} />
              <span>Uploads</span>
            </button>
            <button
              onClick={() => setFilterType('search')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
                filterType === 'search'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Search size={13} />
              <span>Searches</span>
            </button>
          </div>
        </div>

        {/* Timeline Feed */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <p className="text-xs text-white/50">Loading activity timeline...</p>
            </div>
          ) : filteredActivity.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-2xl">
              <Clock size={36} className="text-white/20 mb-3" />
              <p className="text-sm font-semibold text-white/70">No activity items match your filter</p>
              <p className="text-xs text-white/40 mt-1 max-w-sm">
                Try clearing your search keyword or run new video searches to see them here.
              </p>
            </div>
          ) : (
            filteredActivity.map((item, idx) => {
              const isUpload = item.type === 'upload';
              const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Recent';

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isUpload
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isUpload ? <Upload size={18} /> : <Search size={18} />}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-white/40">
                        <span>{item.subtitle || (isUpload ? 'Video Uploaded' : 'Semantic Search')}</span>
                        {item.top_timestamp && (
                          <span className="font-mono text-[10px] text-indigo-300 bg-indigo-500/20 px-1.5 py-0.2 rounded">
                            Top Match @ {item.top_timestamp}
                          </span>
                        )}
                        <span>·</span>
                        <span className="text-[11px] text-white/30">{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {item.status && (
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.status}
                      </span>
                    )}

                    {item.results_count !== undefined && (
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                        {item.results_count} moments found
                      </span>
                    )}

                    {!isUpload && (
                      <button
                        onClick={() => handleReSearch(item.title)}
                        className="px-3 py-1 rounded-xl bg-white/5 hover:bg-indigo-600 text-white text-xs font-medium flex items-center gap-1.5 transition-all"
                        title="Re-run this query"
                      >
                        <RotateCcw size={12} />
                        <span>Search Again</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}