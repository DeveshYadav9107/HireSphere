import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Building2,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'recruiter' ? 'RECRUITER' : 'CANDIDATE';

  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await register({
        name,
        email,
        password,
        phone,
        role,
        companyName: role === 'RECRUITER' ? companyName : undefined,
        designation: role === 'RECRUITER' ? designation : undefined,
      });

      if (data.user.role === 'RECRUITER') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <img src="/logo-icon.svg" alt="HireSphere" className="w-10 h-10" />
          <span className="text-2xl font-bold tracking-tight text-[#172554]">
            Hire<span className="text-[#4338CA]">Sphere</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Create your account</h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Connect with 50,000+ top employers or hire pre-vetted engineers
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl border border-[#CBD5E1]">
          {/* Tab Selector: Candidate vs Recruiter */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole('CANDIDATE')}
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                role === 'CANDIDATE'
                  ? 'bg-white text-[#4338CA] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <User className="w-4 h-4" /> I am a Job Seeker
            </button>

            <button
              type="button"
              onClick={() => setRole('RECRUITER')}
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                role === 'RECRUITER'
                  ? 'bg-white text-[#0D9488] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Building2 className="w-4 h-4" /> I am an Employer
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4338CA]"
                />
                <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                {role === 'RECRUITER' ? 'Official Work Email' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'RECRUITER' ? 'name@company.com' : 'name@example.com'}
                  className="w-full pl-9 pr-3 py-2.5 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4338CA]"
                />
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4338CA]"
                />
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4338CA]"
                />
                <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Recruiter-specific fields */}
            {role === 'RECRUITER' && (
              <>
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Company / Organization Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Technologies Inc."
                      className="w-full pl-9 pr-3 py-2.5 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0D9488]"
                    />
                    <Building2 className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Your Designation</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Talent Acquisition Lead"
                      className="w-full pl-9 pr-3 py-2.5 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0D9488]"
                    />
                    <Briefcase className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </>
            )}

            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              By clicking Register, you agree to HireSphere's{' '}
              <a href="#terms" className="text-[#4338CA] underline">User Agreement</a> and{' '}
              <a href="#privacy" className="text-[#4338CA] underline">Privacy Policy</a>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white rounded-full font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 ${
                role === 'RECRUITER'
                  ? 'bg-[#0D9488] hover:bg-[#0F766E]'
                  : 'bg-[#4338CA] hover:bg-[#3730A3]'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Creating Account...' : 'Register Now'}</span>
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#4338CA] hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
