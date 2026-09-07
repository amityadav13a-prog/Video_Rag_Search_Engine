import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Loader2, 
  Youtube, 
  FileVideo, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Mic, 
  Eye, 
  Film, 
  Layers, 
  UserCheck, 
  ArrowRight,
  RefreshCw,
  X,
  Play
} from 'lucide-react';
import Layout from '../components/Layout';
import { uploadVideo, uploadYoutubeVideo, getVideoStatus } from '../api';
import { useToast } from '../context/ToastContext';

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState('local'); // 'local' | 'youtube'
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentVideoName, setCurrentVideoName] = useState(null);
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [pollErrorCount, setPollErrorCount] = useState(0);

  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const pollingRef = useRef(null);

  // Clean up object URL when file changes
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFilePreviewUrl(null);
    }
  }, [file]);

  // Polling pipeline status
  useEffect(() => {
    if (!isProcessing || !currentVideoName) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    pollingRef.current = setInterval(async () => {
      try {
        const res = await getVideoStatus(currentVideoName);
        const data = res.data;
        setPipelineStatus(data);

        if (data.status === 'completed') {
          setIsProcessing(false);
          success(`"${currentVideoName}" indexed successfully! All vectors ready.`, 'Indexing Complete');
          clearInterval(pollingRef.current);
        } else if (data.status === 'failed') {
          setIsProcessing(false);
          error(data.error || 'Video pipeline failed during processing', 'Processing Error');
          clearInterval(pollingRef.current);
        }
      } catch (err) {
        setPollErrorCount((prev) => prev + 1);
        if (pollErrorCount > 10) {
          setIsProcessing(false);
          clearInterval(pollingRef.current);
        }
      }
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isProcessing, currentVideoName, pollErrorCount]);

  const handleLocalUpload = async () => {
    if (!file) {
      info('Please select a video file first');
      return;
    }

    setIsProcessing(true);
    setCurrentVideoName(file.name);
    setPipelineStatus({ status: 'queued', step: 'uploading' });

    try {
      const res = await uploadVideo(file);
      success('File uploaded to server. Commencing AI ingestion pipeline.', 'Upload Successful');
    } catch (err) {
      console.error('Upload failed:', err);
      setIsProcessing(false);
      error(err.response?.data?.detail || 'Upload failed. Ensure file is a valid video format.');
    }
  };

  const handleYoutubeUpload = async () => {
    if (!youtubeUrl.trim()) {
      info('Please enter a YouTube video URL');
      return;
    }

    setIsProcessing(true);
    setCurrentVideoName('YouTube Video');
    setPipelineStatus({ status: 'queued', step: 'downloading from YouTube' });

    try {
      const res = await uploadYoutubeVideo(youtubeUrl.trim());
      const vidName = res.data?.video_name || 'YouTube Video';
      setCurrentVideoName(vidName);
      success('YouTube video download started. Processing pipeline activated.', 'Ingestion Started');
    } catch (err) {
      console.error('YouTube ingestion failed:', err);
      setIsProcessing(false);
      error(err.response?.data?.detail || 'Failed to download or process YouTube video.');
    }
  };

  const pipelineSteps = [
    { id: 'audio', label: 'Audio Extraction', icon: Mic, match: 'audio' },
    { id: 'whisper', label: 'Whisper Speech-to-Text', icon: Sparkles, match: 'transcrib' },
    { id: 'scene', label: 'Scene Segmentation', icon: Film, match: 'scene' },
    { id: 'ocr', label: 'On-Screen OCR Text', icon: Eye, match: 'ocr' },
    { id: 'clip', label: 'CLIP & Text Embeddings', icon: Layers, match: 'embedding' },
    { id: 'faces', label: 'Face Recognition', icon: UserCheck, match: 'face' },
  ];

  const getCurrentStepIndex = () => {
    if (!pipelineStatus) return -1;
    if (pipelineStatus.status === 'completed') return 6;
    const currentStepText = (pipelineStatus.step || '').toLowerCase();
    for (let i = pipelineSteps.length - 1; i >= 0; i--) {
      if (currentStepText.includes(pipelineSteps[i].match)) {
        return i;
      }
    }
    return 0;
  };

  const currentStepIdx = getCurrentStepIndex();

  return (
    <Layout 
      title="Video Ingestion Hub" 
      subtitle="Upload local video recordings or ingest YouTube content for multimodal search"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Ingestion Mode Tabs */}
        <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('local')}
            disabled={isProcessing}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'local'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Upload size={16} />
            <span>Local Video File</span>
          </button>
          <button
            onClick={() => setActiveTab('youtube')}
            disabled={isProcessing}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'youtube'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Youtube size={16} />
            <span>YouTube URL</span>
          </button>
        </div>

        {/* Upload Container */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden shadow-2xl">
          {activeTab === 'local' ? (
            /* Local File Dropzone */
            <div className="space-y-6">
              {!file ? (
                <label className="flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-white/15 hover:border-indigo-400/50 rounded-2xl cursor-pointer bg-white/[0.01] hover:bg-indigo-500/[0.02] transition-all text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                    <FileVideo size={28} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Drag and drop your video here
                  </h3>
                  <p className="text-xs text-white/50 max-w-sm mb-4">
                    Supports MP4, MOV, AVI, MKV, and WebM video formats up to 500MB.
                  </p>
                  <span className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition-colors">
                    Browse Local Files
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              ) : (
                /* Selected File Card with Video Player Preview */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <FileVideo size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                        <p className="text-xs text-white/40">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.type || 'Video file'}
                        </p>
                      </div>
                    </div>

                    {!isProcessing && (
                      <button
                        onClick={() => setFile(null)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  {filePreviewUrl && (
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 max-h-64 flex items-center justify-center">
                      <video
                        src={filePreviewUrl}
                        controls
                        className="max-h-64 w-full object-contain"
                      />
                    </div>
                  )}

                  {!isProcessing && (
                    <button
                      onClick={handleLocalUpload}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      <Sparkles size={18} />
                      <span>Start AI Multimodal Processing</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* YouTube URL Ingestion Form */
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 flex items-center gap-2">
                  <Youtube size={16} className="text-red-400" />
                  <span>YouTube Video URL</span>
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={isProcessing}
                  className="w-full glass-input rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30"
                />
                <p className="text-[11px] text-white/40">
                  The engine will download audio & video frames, detect key scenes, and index vector embeddings automatically.
                </p>
              </div>

              {!isProcessing && (
                <button
                  onClick={handleYoutubeUpload}
                  disabled={!youtubeUrl.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-indigo-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
                >
                  <Youtube size={18} />
                  <span>Fetch & Process YouTube Video</span>
                </button>
              )}
            </div>
          )}

          {/* Real-Time Processing Stepper & Status Banner */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 pt-6 border-t border-white/10 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Loader2 className="animate-spin text-indigo-400" size={16} />
                    <span>Processing: {currentVideoName}</span>
                  </h4>
                  <p className="text-xs text-indigo-300/80 mt-0.5">
                    Step: {pipelineStatus?.step || 'Initializing pipeline...'}
                  </p>
                </div>
                <span className="text-[11px] font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30 animate-pulse">
                  Live Indexing
                </span>
              </div>

              {/* Progress Stepper Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {pipelineSteps.map((step, idx) => {
                  const isDone = currentStepIdx > idx || pipelineStatus?.status === 'completed';
                  const isCurrent = currentStepIdx === idx && pipelineStatus?.status !== 'completed';

                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                        isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : isCurrent
                          ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200 shadow-sm shadow-indigo-500/20'
                          : 'bg-white/[0.02] border-white/5 text-white/40'
                      }`}
                    >
                      <div className="shrink-0">
                        {isDone ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 size={16} className="animate-spin text-indigo-400" />
                        ) : (
                          <step.icon size={16} />
                        )}
                      </div>
                      <span className="text-[11px] font-medium leading-tight">
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Processing Completed Banner */}
          {!isProcessing && pipelineStatus?.status === 'completed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-[#0c141d] border border-emerald-500/30 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Video Successfully Indexed!</h4>
                  <p className="text-xs text-emerald-300/80">
                    Transcripts, scene vectors, OCR frames, and face detection data are live in Qdrant.
                  </p>
                </div>
              </div>

              {/* Indexed Metrics Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="font-bold text-white">{pipelineStatus.speech_chunks ?? '-'}</p>
                  <p className="text-[10px] text-white/40">Speech Chunks</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="font-bold text-white">{pipelineStatus.scenes_detected ?? '-'}</p>
                  <p className="text-[10px] text-white/40">Scenes Detected</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="font-bold text-white">{pipelineStatus.frames_indexed ?? '-'}</p>
                  <p className="text-[10px] text-white/40">Frames Indexed</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="font-bold text-white">{pipelineStatus.faces_detected ?? '-'}</p>
                  <p className="text-[10px] text-white/40">Faces Found</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/search')}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Sparkles size={14} />
                  <span>Search This Video Now</span>
                </button>
                <button
                  onClick={() => {
                    setPipelineStatus(null);
                    setFile(null);
                    setYoutubeUrl('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
                >
                  Upload Another
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}