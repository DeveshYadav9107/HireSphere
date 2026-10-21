import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Clock,
  Building2,
  Star,
  Bookmark,
  Share2,
  CheckCircle2,
  Users,
  Calendar,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import ApplyModal from '../components/ApplyModal';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    async function loadJobDetails() {
      setLoading(true);
      try {
        const [jobData, similarData] = await Promise.all([
          apiRequest(`/jobs/${id}`),
          apiRequest(`/jobs/${id}/similar`),
        ]);

        setJob(jobData.job);
        setIsSaved(jobData.job.isSaved || false);
        setHasApplied(!!jobData.job.applicationStatus);
        setSimilarJobs(similarData.jobs || []);
      } catch (err) {
        console.error('Failed to load job details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadJobDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleSaveToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'CANDIDATE') return;

    try {
      if (isSaved) {
        await apiRequest(`/saved-jobs/${job.id}`, { method: 'DELETE' });
        setIsSaved(false);
      } else {
        await apiRequest(`/saved-jobs/${job.id}`, { method: 'POST' });
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-24 text-center">
        <Loader2 className="w-10 h-10 text-[#4338CA] animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#64748B]">Loading job posting details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-24 text-center max-w-md mx-auto px-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#0F172A]">Job Posting Not Found</h2>
        <p className="text-xs text-[#64748B] mt-1 mb-6">
          This job may have expired, been closed by the recruiter, or moved to another link.
        </p>
        <Link
          to="/jobs"
          className="px-6 py-2.5 rounded-full bg-[#4338CA] text-white text-xs font-semibold"
        >
          Browse All Openings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-6 flex-wrap">
          <Link to="/" className="hover:text-[#4338CA]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/jobs" className="hover:text-[#4338CA]">Jobs</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#0F172A] font-medium truncate max-w-xs">{job.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Header Card & Full Job Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Hero Card */}
            <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] leading-snug">
                    {job.title}
                  </h1>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Link
                      to={`/company/${job.company?.slug || job.companyId}`}
                      className="text-sm font-bold text-[#475569] hover:text-[#4338CA] hover:underline"
                    >
                      {job.company?.name}
                    </Link>

                    {job.company?.rating && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {job.company.rating}
                      </span>
                    )}

                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-[#0D9488] bg-[#F0FDFA] px-2.5 py-0.5 rounded-full border border-teal-100">
                      {job.workMode || 'Hybrid'}
                    </span>
                  </div>
                </div>

                {job.company?.logo && (
                  <img
                    src={job.company.logo}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover border border-[#E2E8F0] p-1 bg-white shrink-0 shadow-2xs"
                  />
                )}
              </div>

              {/* Attributes Grid (Experience, Salary, Location) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-[#4338CA] flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#64748B]">Experience</p>
                    <p className="text-xs font-bold text-[#0F172A]">
                      {job.minExp === 0 && job.maxExp <= 1
                        ? 'Fresher'
                        : `${job.minExp} - ${job.maxExp} Yrs`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#64748B]">Salary (Annual)</p>
                    <p className="text-xs font-bold text-[#0F172A]">
                      {job.minSalary && job.maxSalary
                        ? `${job.minSalary} - ${job.maxSalary} LPA`
                        : 'Not disclosed'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#64748B]">Location</p>
                    <p className="text-xs font-bold text-[#0F172A] truncate">{job.location}</p>
                  </div>
                </div>
              </div>

              {/* Action Bar (Apply, Save, Share) */}
              <div className="mt-6 pt-5 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs text-[#64748B] w-full sm:w-auto">
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Openings: {job.openings}</span>
                  <span>•</span>
                  <span>Applicants: {job.applicantCount || 0}</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleShare}
                    className="p-2.5 border border-[#CBD5E1] rounded-full text-[#475569] hover:bg-slate-50 transition relative"
                    title="Share this job"
                  >
                    <Share2 className="w-4 h-4" />
                    {shareCopied && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900 text-white text-[10px] rounded whitespace-nowrap">
                        Link copied!
                      </span>
                    )}
                  </button>

                  <button
                    onClick={handleSaveToggle}
                    className={`p-2.5 border rounded-full transition ${
                      isSaved
                        ? 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4338CA]'
                        : 'border-[#CBD5E1] text-[#475569] hover:bg-slate-50'
                    }`}
                    title={isSaved ? 'Remove from saved' : 'Save job'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  {hasApplied ? (
                    <div className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-xs shadow-2xs">
                      <CheckCircle2 className="w-4 h-4" /> Applied
                    </div>
                  ) : job.status !== 'ACTIVE' ? (
                    <div className="px-6 py-2.5 bg-slate-100 text-slate-500 rounded-full font-bold text-xs">
                      Position Closed
                    </div>
                  ) : (
                    <button
                      onClick={() => setApplyModalOpen(true)}
                      className="px-8 py-2.5 bg-[#4338CA] hover:bg-[#3730A3] text-white rounded-full font-bold text-xs shadow-md hover:shadow-lg transition flex-1 sm:flex-none text-center"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Description Card */}
            <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#0F172A] pb-3 border-b border-[#F1F5F9]">
                  Job Description & Key Responsibilities
                </h2>
                <div className="mt-4 text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>

              {/* Key Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="pt-4 border-t border-[#F1F5F9]">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
                    Key Skills Required
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-full bg-[#F1F5F9] text-[#334155] text-xs font-medium border border-[#E2E8F0]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements & Benefits */}
              {job.requirements && (
                <div className="pt-4 border-t border-[#F1F5F9]">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                    Candidate Requirements
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">{job.requirements}</p>
                </div>
              )}

              {job.benefits && (
                <div className="pt-4 border-t border-[#F1F5F9]">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                    Perks & Benefits
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">{job.benefits}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Company Snapshot & Similar Jobs */}
          <div className="space-y-6">
            {/* About Company Card */}
            <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs">
              <h3 className="text-sm font-bold text-[#0F172A] mb-4">About the Company</h3>
              <div className="flex items-center gap-3 mb-3">
                {job.company?.logo && (
                  <img
                    src={job.company.logo}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover border border-[#E2E8F0]"
                  />
                )}
                <div>
                  <h4 className="font-bold text-sm text-[#0F172A]">{job.company?.name}</h4>
                  <p className="text-xs text-[#64748B]">{job.company?.industry}</p>
                </div>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed line-clamp-4">
                {job.company?.description}
              </p>

              <div className="mt-4 pt-3 border-t border-[#F1F5F9] space-y-2 text-xs text-[#475569]">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Company Size:</span>
                  <span className="font-medium">{job.company?.size || '1,000+ Employees'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Headquarters:</span>
                  <span className="font-medium">{job.company?.location}</span>
                </div>
              </div>

              {job.company?.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4338CA] hover:underline"
                >
                  Visit Company Website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Recruiter Trust Badge */}
            <div className="bg-[#F0FDFA] rounded-2xl border border-[#CCFBF1] p-5 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-[#0D9488] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-[#0F172A]">HireSphere Verified Employer</h4>
                <p className="text-[11px] text-[#475569] mt-0.5 leading-relaxed">
                  This job opening has been verified by the HireSphere recruitment team. No application fees required.
                </p>
              </div>
            </div>

            {/* Similar Jobs List */}
            {similarJobs.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs">
                <h3 className="text-sm font-bold text-[#0F172A] mb-3">Similar Opportunities</h3>
                <div className="divide-y divide-[#F1F5F9]">
                  {similarJobs.map((sim) => (
                    <div key={sim.id} className="py-3 first:pt-0 last:pb-0">
                      <Link
                        to={`/jobs/${sim.id}`}
                        className="font-bold text-xs text-[#0F172A] hover:text-[#4338CA] transition block"
                      >
                        {sim.title}
                      </Link>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        {sim.company?.name} • {sim.location}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Apply Modal */}
      <ApplyModal
        job={job}
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSuccess={() => {
          setHasApplied(true);
        }}
      />
    </div>
  );
}
