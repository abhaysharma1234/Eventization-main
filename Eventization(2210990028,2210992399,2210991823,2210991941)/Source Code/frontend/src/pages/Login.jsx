import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try { const res = await axios.post('/api/auth/login', { email, password }); login(res.data); nav('/'); }
    catch (err) { setError(err.response?.data?.message || 'Invalid email or password.'); }
    finally { setBusy(false); }
  }

  const inp = 'w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Log in to your Eventization account</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-5">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inp} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inp} placeholder="Enter your password" />
          </div>
          <button type="submit" disabled={busy} className="w-full bg-teal-600 text-white text-sm font-semibold rounded-xl px-4 py-2.5 hover:bg-teal-700 transition-colors disabled:opacity-50">
            {busy ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Don't have an account? <Link to="/signup" className="text-teal-600 font-semibold hover:underline">Sign up free</Link>
        </p>

        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Demo Accounts</p>
          <div className="space-y-2 text-sm">
            {[
              { role: 'Customer', email: 'customer@example.com' },
              { role: 'Organizer', email: 'organizer@example.com' },
              { role: 'Admin', email: 'admin@example.com' },
            ].map(d => (
              <button key={d.role} type="button" onClick={() => { setEmail(d.email); setPassword('password'); }}
                className="w-full text-left flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5 hover:border-teal-300 transition-colors group">
                <div>
                  <span className="font-medium text-gray-800">{d.role}</span>
                  <span className="text-gray-400 ml-2 text-xs">{d.email}</span>
                </div>
                <span className="text-xs text-teal-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Fill</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
