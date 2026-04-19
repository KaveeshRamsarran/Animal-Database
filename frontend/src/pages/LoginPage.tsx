import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken, loadUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      setToken(data.access_token);
      await loadUser();
      navigate('/');
    } catch {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="bg-forest-950 min-h-screen"><div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-white text-center mb-8">Sign In</h1>
      <form onSubmit={handleSubmit} className="bg-forest-800/40 rounded-xl border border-forest-700/40 p-6 space-y-4">
        {error && <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-forest-300 mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-forest-900/50 border border-forest-700/40 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-forest-300 mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-forest-900/50 border border-forest-700/40 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 py-2 rounded-lg font-medium hover:bg-emerald-500/30 disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
        <p className="text-sm text-center text-forest-400">Don't have an account? <Link to="/register" className="text-emerald-400 hover:underline">Register</Link></p>
      </form>
    </div></div>
  );
}
