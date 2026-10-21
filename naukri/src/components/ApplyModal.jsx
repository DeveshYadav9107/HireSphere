import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, FileText, CheckCircle2, AlertCircle, UploadCloud, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';

export default function ApplyModal({ job, isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentCtc, setCurrentCtc] = useState(
    user?.candidateProfile?.currentSalary ? String(user.candidateProfile.currentSalary) : ''
  );
  const [expectedCtc, setExpectedCtc] = useState(
    user?.candidateProfile?.expectedSalary ? String(user.candidateProfile.expectedSalary) : ''
  );
  const [noticePeriod, setNoticePeriod] = useState(
    user?.candidateProfile?.noticePeriod || '1 Month'
  );
  const [coverNote, setCoverNote] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState(
    user?.resumes && user.resumes.length > 0 ? user.resumes[0].id : ''
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // If user is not logged in
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-indigo-50 text-[#4338CA] rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">Sign in to Apply</h3>
          <p className="text-xs text-[#64748B] mt-2 mb-6">
            You need a candidate account on HireSphere to apply for "{job.title}".
          </p>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="flex-1 py-2.5 rounded-full border border-[#4338CA] text-[#4338CA] text-xs font-semibold hover:bg-indigo-50 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="flex-1 py-2.5 rounded-full bg-[#4338CA] text-white text-xs font-semibold hover:bg-[#3730A3] transition"
            >
              Register Free
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user is not a candidate
  if (user.role !== 'CANDIDATE') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0F172A]">Recruiter Account Detected</h3>
          <p className="text-xs text-[#64748B] mt-2 mb-4">
            You are logged in as a Recruiter. Job applications can only be submitted by registered candidates.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await apiRequest('/applications/apply', {
        method: 'POST',
        body: {
          jobId: job.id,
          resumeId: selectedResumeId || null,
          coverNote,
          currentCtc: currentCtc ? parseFloat(currentCtc) : null,
          expectedCtc: expectedCtc ? parseFloat(expectedCtc) : null,
          noticePeriod,
        },
      });

      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8 animate-in fade-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A]">Application Submitted!</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Your profile and resume were successfully submitted to <span className="font-semibold">{job.company?.name}</span> for <span className="font-semibold">{job.title}</span>.
            </p>
            <div className="pt-4 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-full border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Close
              </button>
              <Link
                to="/candidate/dashboard?tab=applications"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-full bg-[#4338CA] text-white text-xs font-semibold hover:bg-[#3730A3] transition text-center"
              >
                View Applied Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="pb-4 border-b border-[#E2E8F0]">
              <span className="text-[11px] font-bold text-[#4338CA] uppercase tracking-wider">Quick Apply</span>
              <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">{job.title}</h3>
              <p className="text-xs text-[#64748B]">{job.company?.name} • {job.location}</p>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Resume Selector */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1.5">
                  Select Resume to Submit
                </label>
                {user.resumes && user.resumes.length > 0 ? (
                  <div className="space-y-2">
                    {user.resumes.map((r) => (
                      <label
                        key={r.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                          selectedResumeId === r.id
                            ? 'border-[#4338CA] bg-indigo-50/50'
                            : 'border-[#E2E8F0] hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="resume"
                            checked={selectedResumeId === r.id}
                            onChange={() => setSelectedResumeId(r.id)}
                            className="text-[#4338CA] focus:ring-indigo-500"
                          />
                          <FileText className="w-4 h-4 text-[#4338CA]" />
                          <span className="font-medium text-[#0F172A] truncate max-w-[200px]">
                            {r.originalName || r.fileName}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#94A3B8]">
                          {new Date(r.uploadedAt).toLocaleDateString()}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center">
                    <p className="text-slate-600 mb-2">No resume uploaded to your profile yet.</p>
                    <Link
                      to="/candidate/dashboard?tab=resume"
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 text-xs text-[#4338CA] font-semibold hover:underline"
                    >
                      <UploadCloud className="w-4 h-4" /> Upload Resume in Dashboard
                    </Link>
                  </div>
                )}
              </div>

              {/* CTC & Notice Period Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Current CTC (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentCtc}
                    onChange={(e) => setCurrentCtc(e.target.value)}
                    placeholder="e.g. 15.5"
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4338CA]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Expected CTC (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={expectedCtc}
                    onChange={(e) => setExpectedCtc(e.target.value)}
                    placeholder="e.g. 24.0"
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4338CA]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Notice Period</label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4338CA] bg-white"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="15 Days">15 Days</option>
                    <option value="1 Month">1 Month</option>
                    <option value="2 Months">2 Months</option>
                    <option value="3 Months">3 Months</option>
                  </select>
                </div>
              </div>

              {/* Cover Note */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Note to Recruiter (Optional)
                </label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Highlight why your skills make you a strong fit for this position..."
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4338CA]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#CBD5E1] rounded-full text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#4338CA] hover:bg-[#3730A3] text-white rounded-full font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
