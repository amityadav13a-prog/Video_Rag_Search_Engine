import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { 
  Mail, 
  Lock, 
  Play, 
  Loader2, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { success } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      success('Logged in successfully! Welcome back.', 'Welcome');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password. Please double check and try again.');
      } else {
        setError(err.message.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      success('Google Sign-In successful!', 'Welcome');
      navigate('/');
    } catch (err) {
      console.error('Google Sign-In error:', err);
      setError('Google sign-in was cancelled or failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090e] flex items-center justify-center text-slate-100 p-4 relative bg-grid-pattern overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl relative z-10"
      >
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-4 ring-2 ring-white/10">
            <Play size={20} className="text-white fill-white translate-x-0.5" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-white/50 mt-1">
            Sign in to access your intelligent video search workspace
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl"
          >
            {error}
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-white/30"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-white/70">Password</label>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full glass-input rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-white/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-[11px] font-medium uppercase tracking-wider">
            Or continue with
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.4 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Signup Link */}
        <p className="text-center text-xs text-white/50 mt-6">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}