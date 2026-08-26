import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Mail, Lock, PlayCircle, Loader2 } from 'lucide-react';
import { auth, googleProvider } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      setError('Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8"
      >
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <PlayCircle size={22} />
          </div>
          <span className="font-semibold text-xl">Video Search</span>
        </div>

        <h2 className="text-xl font-bold text-center mb-1">Welcome back budyy</h2>
        <p className="text-white/40 text-sm text-center mb-6">Pls Log in to continue</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email(ex. abc@gmail.com)"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-indigo-400/50"
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-indigo-400/50"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Log In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-colors"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm text-white/40 mt-6">
          Don't have an account?{' '}
          <a href="/signup" className="text-indigo-400 hover:underline">Sign up</a>
        </p>
      </motion.div>
    </div>
  );
}