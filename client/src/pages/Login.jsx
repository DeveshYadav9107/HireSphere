import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role === 'RECRUITER') {
        navigate('/recruiter/dashboard');
      } else if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from === '/' ? '/candidate/dashboard' : from);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Demo 1-Click Credentials Fill
  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <img src="/logo-icon.svg" alt="HireSphere" className="w-10 h-10" />
          <span className="text-2xl font-bold tracking-tight text-[#172554]">
            Hire<span className="text-[#4338CA]">Sphere</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-[#0F172A]">Welcome back</h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Log in to manage your job applications or recruiter hiring pipeline
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl border border-[#CBD5E1]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">Email ID</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4338CA]"
                />
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#0F172A]">Password</label>
                <a href="#forgot" className="text-[#4338CA] hover:underline font-medium">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4338CA]"
                />
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#4338CA] hover:bg-[#3730A3] text-white rounded-full font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Authenticating...' : 'Login'}</span>
            </button>
          </form>

          {/* Quick Demo Logins for Pair Programming Testing */}
          <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center mb-2.5">
              Instant Demo Sign-In
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('candidate@hiresphere.com')}
                className="p-2 border border-indigo-200 rounded-lg text-center hover:bg-indigo-50 transition"
              >
                <UserCheck className="w-4 h-4 text-[#4338CA] mx-auto mb-1" />
                <span className="block text-[10px] font-bold text-[#0F172A]">Candidate</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('recruiter@hiresphere.com')}
                className="p-2 border border-teal-200 rounded-lg text-center hover:bg-teal-50 transition"
              >
                <Briefcase className="w-4 h-4 text-[#0D9488] mx-auto mb-1" />
                <span className="block text-[10px] font-bold text-[#0F172A]">Recruiter</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('admin@hiresphere.com')}
                className="p-2 border border-purple-200 rounded-lg text-center hover:bg-purple-50 transition"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <span className="block text-[10px] font-bold text-[#0F172A]">Admin</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">Default Password: Password123!</p>
          </div>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#4338CA] hover:underline">
              Register for Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
