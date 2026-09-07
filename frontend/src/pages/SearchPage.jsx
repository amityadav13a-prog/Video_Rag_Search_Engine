import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Clock, 
  Loader2, 
  SlidersHorizontal, 
  Copy, 
  Check, 
  Volume2, 
  Eye, 
  Film, 
  FileText,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  BarChart2
} from 'lucide-react';
import Layout from '../components/Layout';
import { searchVideo } from '../api';
import { useToast } from '../context/ToastContext';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [topK, setTopK] = useState(5);
  const [minScore, setMinScore] = useState(0.2);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'audio' | 'ocr' | 'visual'
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [copiedTimestamp, setCopiedTimestamp] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const { error, info, success } = useToast();

  const handleSearch = async (queryToRun) => {
    const q = (queryToRun !== undefined ? queryToRun : query).trim();
    if (!q) {
      info('Please enter a query to search');
      return;
    }

    setLoading(true);
    // Update URL query parameter without reloading
    setSearchParams({ q });

    try {
      const res = await searchVideo(q, topK, minScore);
      setResults(res.data);
    } catch (err) {
      console.error('Search error:', err);
      error(err.response?.data?.detail || 'Search failed. Make sure videos are uploaded and processed.');
    } finally {
      setLoading(false);
    }
  };

  // Run automatically if query is present in URL on mount
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []);

  const handleCopyAnswer = () => {
    if (!results?.answer) return;
    navigator.clipboard.writeText(results.answer);
    setCopiedAnswer(true);
    success('AI Answer copied to clipboard');
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const handleCopyTimestamp = (ts) => {
    navigator.clipboard.writeText(ts);
    setCopiedTimestamp(ts);
    success(`Timestamp ${ts} copied to clipboard`);
    setTimeout(() => setCopiedTimestamp(null), 1500);
  };

  const sampleQueries = [
    'Where is the loss function explained?',
    'Find slides discussing backpropagation',
    'When does the speaker introduce transformers?',
    'Show visual demonstration of neural network weights',
  ];

  // Filter text results based on selected source type
  const filteredTextResults = (results?.text_results || []).filter((r) => {
    if (filterType === 'all') return true;
    if (filterType === 'audio') return r.source?.toLowerCase().includes('audio') || r.source?.toLowerCase().includes('whisper');
    if (filterType === 'ocr') return r.source?.toLowerCase().includes('ocr') || r.source?.toLowerCase().includes('frame');
    return true;
  });

  const visualResults = results?.visual_results || [];

  return (
    <Layout 
      title="Semantic Video Search" 
      subtitle="Find exact moments across spoken audio, on-screen text, and visual scenes"
    >
      {/* Search Input Section */}
      <div className="max-w-4xl mx-auto space-y-4 mb-8">
        <div className="relative glass-panel rounded-3xl p-2 sm:p-3 shadow-2xl border border-indigo-500/20 glow-primary">
          <div className="flex items-center gap-3 px-3 py-1">
            <Search size={22} className="text-indigo-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ask anything (e.g. 'Where does the instructor explain gradient descent?')..."
              className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-white/40 outline-none py-2"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-white/40 hover:text-white text-xs px-2 py-1 rounded-md hover:bg-white/10"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-colors ${
                showFilters ? 'bg-indigo-600 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
              title="Search Filters & Precision"
            >
              <SlidersHorizontal size={18} />
            </button>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 shrink-0"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {/* Collapsible Filter Bar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 mt-2 border-t border-white/10 px-3 flex flex-wrap items-center justify-between gap-4 text-xs text-white/70"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 font-medium">Top Matches:</span>
                    <select
                      value={topK}
                      onChange={(e) => setTopK(Number(e.target.value))}
                      className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-white outline-none"
                    >
                      <option value={3} className="bg-[#121422]">Top 3</option>
                      <option value={5} className="bg-[#121422]">Top 5</option>
                      <option value={10} className="bg-[#121422]">Top 10</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-white/40 font-medium">Min Confidence:</span>
                    <select
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                      className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-white outline-none"
                    >
                      <option value={0.1} className="bg-[#121422]">10% (Broad)</option>
                      <option value={0.2} className="bg-[#121422]">20% (Default)</option>
                      <option value={0.35} className="bg-[#121422]">35% (Strict)</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-indigo-300 flex items-center gap-1">
                  <span>Using Hybrid Qdrant Vector + CLIP Multimodal</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Query Suggestion Pills */}
        {!results && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-white/40">Try searching:</span>
            {sampleQueries.map((sQuery, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(sQuery);
                  handleSearch(sQuery);
                }}
                className="text-xs text-white/70 hover:text-indigo-300 bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/30 px-3 py-1 rounded-full transition-all"
              >
                {sQuery}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton Indicator */}
      {loading && (
        <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <Film size={20} className="text-indigo-400 absolute inset-0 m-auto" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Searching Video Knowledge Base...</p>
            <p className="text-xs text-white/40 mt-1">Scanning speech embeddings, OCR frames & scene moments</p>
          </div>
        </div>
      )}

      {/* Search Results Display */}
      {!loading && results && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Synthesized Answer Card */}
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-indigo-950/60 via-[#121528] to-[#0c0e18] border border-indigo-500/30 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <FileText size={16} className="text-indigo-400" />
                <span>Synthesized Answer & Summary</span>
              </div>
              <button
                onClick={handleCopyAnswer}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-all"
                title="Copy Answer"
              >
                {copiedAnswer ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal whitespace-pre-wrap">
              {results.answer || 'No direct summary generated for this query.'}
            </p>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
              <span>Grounded in indexed video segments</span>
              <span className="font-mono">
                {results.text_results?.length || 0} spoken/OCR cues matched
              </span>
            </div>
          </div>

          {/* Results Filter Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Matched Video Moments</h3>
              <span className="text-xs text-white/40 font-mono">
                ({filteredTextResults.length + visualResults.length} total)
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                All Moments
              </button>
              <button
                onClick={() => setFilterType('audio')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
                  filterType === 'audio' ? 'bg-indigo-600 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                <Volume2 size={12} /> Audio Speech
              </button>
              <button
                onClick={() => setFilterType('ocr')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
                  filterType === 'ocr' ? 'bg-indigo-600 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                <Eye size={12} /> Screen OCR
              </button>
            </div>
          </div>

          {/* Result Cards Grid */}
          <div className="space-y-3">
            {filteredTextResults.length === 0 && visualResults.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center text-white/50">
                <p className="text-sm">No video segments found matching "{query}" at the current confidence threshold.</p>
                <p className="text-xs text-white/40 mt-1">Try lowering the minimum score or rephrasing your search keywords.</p>
              </div>
            ) : (
              filteredTextResults.map((r, i) => {
                const isAudio = r.source?.toLowerCase().includes('audio') || r.source?.toLowerCase().includes('whisper');
                const scorePercent = Math.min(100, Math.round((r.score || 0) * 100));

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Timestamp Pill Button */}
                      <button
                        onClick={() => handleCopyTimestamp(r.timestamp)}
                        title="Click to copy timestamp"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-mono text-xs font-semibold shrink-0 transition-all hover:scale-105 active:scale-95"
                      >
                        <Clock size={13} />
                        <span>{r.timestamp || '00:00'}</span>
                        {copiedTimestamp === r.timestamp ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <Copy size={12} className="opacity-50" />
                        )}
                      </button>

                      {/* Snippet Content */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                          "{r.text}"
                        </p>
                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-white/40">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${
                            isAudio ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {isAudio ? <Volume2 size={11} /> : <Eye size={11} />}
                            {r.source || 'Speech'}
                          </span>

                          {r.scene && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-white/60">
                              <Film size={11} /> Scene #{r.scene}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="sm:text-right shrink-0 w-full sm:w-28 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-white/5 pt-2 sm:pt-0">
                      <div className="flex items-center sm:justify-end gap-1.5 mb-1">
                        <span className="text-xs font-semibold text-white">{scorePercent}%</span>
                        <span className="text-[10px] text-white/40">Match</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            scorePercent > 70
                              ? 'bg-emerald-400'
                              : scorePercent > 40
                              ? 'bg-indigo-400'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${scorePercent}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* Visual Results (CLIP Embeddings) */}
            {visualResults.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">
                  Visual Frame Matches (CLIP)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {visualResults.map((vr, vIdx) => (
                    <div
                      key={vIdx}
                      className="glass-panel p-3 rounded-xl flex items-center justify-between"
                    >
                      <span className="font-mono text-xs text-indigo-300 font-semibold">
                        @{vr.timestamp}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/60">
                        {Math.round(vr.score * 100)}% visual
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Empty State / Initial Guide */}
      {!loading && !results && (
        <div className="max-w-2xl mx-auto mt-12 text-center p-8 rounded-3xl border border-dashed border-white/10 glass-panel">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Search with Natural Language</h3>
          <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto leading-relaxed mb-6">
            Type any question, concept, or phrase. The system searches audio transcripts, scene OCR, and visual cues simultaneously to find exact timestamps.
          </p>
        </div>
      )}
    </Layout>
  );
}