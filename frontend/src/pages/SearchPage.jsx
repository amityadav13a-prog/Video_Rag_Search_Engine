import React from 'react';
import { useState } from 'react';
import Layout from '../components/Layout';
import { searchVideo } from '../api';
import { Search, Clock, Sparkles, Loader2 } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await searchVideo(query);
      setResults(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Search">
      <div className="flex gap-3 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Find where the professor explains Rag.."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-400/50"
        />
        <button onClick={handleSearch} disabled={loading} className="px-6 py-3 bg-indigo-500 rounded-xl font-medium flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          Search
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2 text-indigo-300 text-sm font-medium">
              <Sparkles size={16} /> Summary
            </div>
            <p className="text-white/90">{results.answer}</p>
          </div>

          {results.text_results?.map((r, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
              <span className="flex items-center gap-1 text-indigo-400 text-sm font-mono shrink-0">
                <Clock size={14} /> {r.timestamp}
              </span>
              <div>
                <p className="text-sm text-white/80">{r.text}</p>
                <span className="text-xs text-white/40">{r.source} {r.scene && `· Scene ${r.scene}`} · Score {r.score.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}