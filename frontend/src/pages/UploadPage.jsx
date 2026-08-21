import React, { useState } from 'react';
import Layout from '../components/Layout';
import { uploadVideo, uploadYoutubeVideo } from '../api';
import { Upload, Loader2, Youtube } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus(null);
    try {
      const res = await uploadVideo(file);
      setStatus({ ok: true, msg: res.data.message });
      setFile(null);
    } catch {
      setStatus({ ok: false, msg: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleYoutubeUpload = async () => {
    if (!youtubeUrl.trim()) return;
    setUploading(true);
    setStatus(null);
    try {
      const res = await uploadYoutubeVideo(youtubeUrl);
      setStatus({ ok: true, msg: res.data.message });
      setYoutubeUrl('');
    } catch {
      setStatus({ ok: false, msg: 'Failed to process YouTube video' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout title="Upload">
      <div className="max-w-xl bg-white/5 border border-white/10 rounded-2xl p-8">
        {/* Local File Upload Section */}
        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/20 rounded-xl p-10 cursor-pointer hover:border-indigo-400/50">
          <Upload size={28} className="text-white/40" />
          <span className="text-sm text-white/50">
            {file ? file.name : 'Click or drag a video file'}
          </span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full mt-4 py-3 bg-indigo-500 rounded-xl font-medium disabled:opacity-40 flex items-center justify-center gap-2 text-white"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Processing...
            </>
          ) : (
            'Upload & Process'
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* YouTube Link Section */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/50 flex items-center gap-2">
            <Youtube size={16} /> Paste a YouTube video URL
          </label>
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-400/50 placeholder-white/30 text-white"
          />
        </div>

        <button
          onClick={handleYoutubeUpload}
          disabled={!youtubeUrl.trim() || uploading}
          className="w-full mt-4 py-3 bg-indigo-500 rounded-xl font-medium disabled:opacity-40 flex items-center justify-center gap-2 text-white"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Downloading & Processing...
            </>
          ) : (
            'Process YouTube Video'
          )}
        </button>

        {/* Status Message */}
        {status && (
          <p className={`mt-4 text-sm ${status.ok ? 'text-green-400' : 'text-red-400'}`}>
            {status.msg}
          </p>
        )}
      </div>
    </Layout>
  );
}