import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Clock,
  Bookmark,
  CheckCircle2,
  Building,
  Star,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';

export default function JobCard({ job, onSaveToggle, onApplyClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(job.isSaved || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'CANDIDATE') return;

    setSaving(true);
    try {
      if (isSaved) {
        await apiRequest(`/saved-jobs/${job.id}`, { method: 'DELETE' });
        setIsSaved(false);
      } else {
        await apiRequest(`/saved-jobs/${job.id}`, { method: 'POST' });
        setIsSaved(true);
      }
      if (onSaveToggle) onSaveToggle(job.id, !isSaved);
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setSaving(false);
    }
  };

  // Format posted date
  const formatPostedDate = (dateStr) => {
    if (!dateStr) return 'Recently posted';
    const diffDays = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    if (diffDays < 30) return `Posted ${diffDays} days ago`;
    return `Posted on ${new Date(dateStr).toLocaleDateString()}`;
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md hover:border-[#CBD5E1] transition-all group relative">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Job Header & Company Info */}
        <div className="flex-1">
          <Link
            to={`/jobs/${job.id}`}
            className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-[#4338CA] transition line-clamp-1"
          >
            {job.title}
          </Link>

          {/* Company Details & Rating */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Link
              to={job.company?.slug ? `/company/${job.company.slug}` : `/jobs?companyId=${job.companyId}`}
              className="text-xs sm:text-sm font-semibold text-[#475569] hover:text-[#0F172A] hover:underline"
            >
              {job.company?.name || 'Verified Employer'}
            </Link>

            {job.company?.rating && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {job.company.rating}
                {job.company.reviewsCount && (
                  <span className="text-slate-400 font-normal">({job.company.reviewsCount})</span>
                )}
              </span>
            )}

            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded-full border border-teal-100">
              {job.workMode || 'Hybrid'}
            </span>
          </div>

          {/* Key Job Attributes Row (Experience, Salary, Location) */}
          <div className="flex items-center gap-y-2 gap-x-5 mt-3 text-xs text-[#64748B] flex-wrap">
            {/* Experience */}
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>
                {job.minExp === 0 && job.maxExp <= 1
                  ? 'Fresher'
                  : `${job.minExp} - ${job.maxExp} Yrs`}
              </span>
            </div>

            {/* Salary */}
            <div className="flex items-center gap-1.5 font-medium text-[#0F172A]">
              <IndianRupee className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>
                {job.minSalary && job.maxSalary
                  ? `${job.minSalary} - ${job.maxSalary} LPA`
                  : 'Not disclosed'}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>{job.location}</span>
            </div>
          </div>

          {/* Short Job Description snippet */}
          <p className="text-xs text-[#64748B] mt-3 line-clamp-2 leading-relaxed">
            {job.description ? job.description.replace(/###|\*\*/g, '').slice(0, 160) + '...' : ''}
          </p>

          {/* Skills Badges */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3.5 flex-wrap">
              {job.skills.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] hover:bg-[#EEF2FF] hover:text-[#4338CA] transition"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="text-[11px] text-[#94A3B8] font-medium">
                  +{job.skills.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Company Logo & Bookmark */}
        <div className="flex flex-col items-end justify-between shrink-0 h-full gap-3">
          {job.company?.logo ? (
            <img
              src={job.company.logo}
              alt=""
              className="w-12 h-12 rounded-lg object-cover border border-[#E2E8F0] p-1 bg-white shadow-2xs"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
              <Building className="w-6 h-6" />
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            title={isSaved ? 'Remove from saved' : 'Save this job'}
            className={`p-2 rounded-full border transition ${
              isSaved
                ? 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4338CA]'
                : 'bg-white border-[#E2E8F0] text-[#94A3B8] hover:text-[#4338CA] hover:border-[#CBD5E1]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Footer: Posted Date & Quick Actions */}
      <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#94A3B8]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatPostedDate(job.createdAt)}
          </span>
          {job.applicantCount > 0 && (
            <span>• {job.applicantCount} applicants</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {job.hasApplied ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Applied
            </span>
          ) : (
            <Link
              to={`/jobs/${job.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#4338CA] hover:text-[#3730A3] hover:underline"
            >
              View & Apply <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
