import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  PlusCircle,
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Eye,
  Download,
  Filter,
  Loader2,
  AlertCircle,
  Star,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest, API_BASE } from '../utils/api';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const preselectedJobId = searchParams.get('jobId') || '';

  // Stats
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    shortlistedCount: 0,
    totalViews: 0,
  });

  // Jobs & Applicants
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(preselectedJobId);
  const [applicants, setApplicants] = useState([]);
  const [applicantFilter, setApplicantFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Post Job Form State
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('Razorpay');
  const [department, setDepartment] = useState('Software Engineering');
  const [workMode, setWorkMode] = useState('Hybrid');
  const [location, setLocation] = useState('Bengaluru');
  const [minExp, setMinExp] = useState('2');
  const [maxExp, setMaxExp] = useState('5');
  const [minSalary, setMinSalary] = useState('15');
  const [maxSalary, setMaxSalary] = useState('28');
  const [employmentType, setEmploymentType] = useState('Full Time');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [skillTags, setSkillTags] = useState(['React.js', 'Node.js', 'TypeScript']);
  const [skillInput, setSkillInput] = useState('');
  const [postingJob, setPostingJob] = useState(false);
  const [postSuccess, setPostSuccess] = useState('');
  const [postError, setPostError] = useState('');

  // Initial Data Load
  useEffect(() => {
    if (!user) return;

    async function loadRecruiterData() {
      setLoading(true);
      try {
        const [statsData, jobsData] = await Promise.all([
          apiRequest('/recruiter/stats'),
          apiRequest('/recruiter/jobs'),
        ]);

        setStats(statsData);
        setJobs(jobsData.jobs || []);

        // If a jobId is preselected or first job exists
        const targetJobId = preselectedJobId || (jobsData.jobs?.[0]?.id || '');
        setSelectedJobId(targetJobId);

        if (targetJobId) {
          const appData = await apiRequest(`/applications/job/${targetJobId}`);
          setApplicants(appData.applications || []);
        }
      } catch (err) {
        console.error('Failed to load recruiter data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRecruiterData();
  }, [user]);

  // Load applicants when selectedJobId changes
  useEffect(() => {
    if (!selectedJobId) return;

    apiRequest(`/applications/job/${selectedJobId}`)
      .then((data) => {
        setApplicants(data.applications || []);
      })
      .catch((err) => console.error(err));
  }, [selectedJobId]);

  const setTab = (tabName, jobId = '') => {
    const params = new URLSearchParams();
    params.set('tab', tabName);
    if (jobId) params.set('jobId', jobId);
    setSearchParams(params);
  };

  // Add/Remove skill in Post Job
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skillTags.includes(skillInput.trim())) {
      setSkillTags([...skillTags, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillTags(skillTags.filter((s) => s !== skillToRemove));
  };

  // Submit Post Job
  const handlePostJob = async (e) => {
    e.preventDefault();
    setPostingJob(true);
    setPostSuccess('');
    setPostError('');

    try {
      const data = await apiRequest('/recruiter/jobs', {
        method: 'POST',
        body: {
          title,
          companyName,
          department,
          workMode,
          location,
          minExp: parseInt(minExp) || 0,
          maxExp: parseInt(maxExp) || 5,
          minSalary: minSalary ? parseFloat(minSalary) : null,
          maxSalary: maxSalary ? parseFloat(maxSalary) : null,
          employmentType,
          description,
          requirements,
          benefits,
          skills: skillTags,
        },
      });

      setPostSuccess(`Job "${data.job.title}" was published live!`);
      // Refresh jobs list
      const updatedJobs = await apiRequest('/recruiter/jobs');
      setJobs(updatedJobs.jobs || []);

      // Reset form
      setTitle('');
      setDescription('');
      setRequirements('');
      setTimeout(() => {
        setTab('manage');
      }, 1500);
    } catch (err) {
      setPostError(err.message || 'Failed to post job.');
    } finally {
      setPostingJob(false);
    }
  };

  // Update Applicant Status
  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await apiRequest(`/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });

      setApplicants((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // Toggle Job Status (ACTIVE / CLOSED)
  const handleToggleJobStatus = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    try {
      await apiRequest(`/recruiter/jobs/${jobId}/status`, {
        method: 'PATCH',
        body: { status: nextStatus },
      });
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: nextStatus } : j))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This cannot be undone.')) return;
    try {
      await apiRequest(`/recruiter/jobs/${jobId}`, { method: 'DELETE' });
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      alert(err.message);
    }
  };

  // Download Candidate Resume
  const handleDownloadResume = async (resumeId, candidateName) => {
    try {
      const token = localStorage.getItem('hiresphere_token');
      const response = await fetch(`${API_BASE}/resumes/download/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(`Could not download candidate resume: ${err.message}`);
    }
  };

  const filteredApplicants =
    applicantFilter === 'ALL'
      ? applicants
      : applicants.filter((a) => a.status === applicantFilter);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Recruiter Header Bar */}
        <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D9488] uppercase tracking-wider">
              <Building2 className="w-4 h-4" /> Recruiter Management Console
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] mt-1">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Manage your talent pipeline, evaluate applicant submissions, and publish job listings
            </p>
          </div>

          <button
            onClick={() => setTab('post')}
            className="px-5 py-2.5 bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs font-bold rounded-full shadow-sm transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Post a New Job
          </button>
        </div>

        {/* Recruiter Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#CBD5E1] pb-3 mb-6 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'overview'
                ? 'bg-[#EEF2FF] text-[#4338CA]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Overview Metrics
          </button>
          <button
            onClick={() => setTab('manage')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'manage'
                ? 'bg-[#EEF2FF] text-[#4338CA]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Manage Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setTab('applicants')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'applicants'
                ? 'bg-[#EEF2FF] text-[#4338CA]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Candidate Applicants ({stats.totalApplicants})
          </button>
          <button
            onClick={() => setTab('post')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'post'
                ? 'bg-[#EEF2FF] text-[#4338CA]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            + Post Job
          </button>
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#64748B]">Active Job Openings</span>
                  <Briefcase className="w-5 h-5 text-[#4338CA]" />
                </div>
                <p className="text-2xl font-extrabold text-[#0F172A] mt-2">{stats.activeJobs}</p>
                <span className="text-[11px] text-emerald-600 font-semibold">Live on HireSphere</span>
              </div>

              <div className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#64748B]">Total Candidates Applied</span>
                  <Users className="w-5 h-5 text-[#0D9488]" />
                </div>
                <p className="text-2xl font-extrabold text-[#0F172A] mt-2">{stats.totalApplicants}</p>
                <span className="text-[11px] text-slate-500">Across all postings</span>
              </div>

              <div className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#64748B]">Shortlisted Candidates</span>
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-2xl font-extrabold text-[#0F172A] mt-2">{stats.shortlistedCount}</p>
                <span className="text-[11px] text-amber-600 font-semibold">Ready for interview</span>
              </div>

              <div className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#64748B]">Total Job Views</span>
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-extrabold text-[#0F172A] mt-2">{stats.totalViews}</p>
                <span className="text-[11px] text-purple-600 font-semibold">Candidate impressions</span>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-linear-to-r from-indigo-50 to-teal-50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Need to fill an urgent vacancy?</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Publish a new job requirement to reach our 500,000+ certified software engineering candidates.
                </p>
              </div>
              <button
                onClick={() => setTab('post')}
                className="px-6 py-2.5 bg-[#4338CA] hover:bg-[#3730A3] text-white rounded-full font-bold text-xs shrink-0"
              >
                Post Job Opening Now
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE JOBS */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Your Posted Jobs</h2>
                <p className="text-xs text-[#64748B]">
                  Manage active listings, review candidate counts, or close filled positions
                </p>
              </div>
            </div>

            {jobs.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B]">
                You haven't posted any jobs yet.{' '}
                <button onClick={() => setTab('post')} className="text-[#4338CA] font-bold underline">
                  Post your first job
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#475569] font-bold">
                    <tr>
                      <th className="py-3 px-4">Job Title</th>
                      <th className="py-3 px-4">Department & Mode</th>
                      <th className="py-3 px-4">Applicants</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Posted Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {jobs.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                          <Link to={`/jobs/${j.id}`} className="hover:text-[#4338CA]">
                            {j.title}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B]">
                          {j.department} • <span className="font-semibold text-teal-700">{j.workMode}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setTab('applicants', j.id)}
                            className="inline-flex items-center gap-1 font-bold text-[#4338CA] bg-indigo-50 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition"
                          >
                            <Users className="w-3.5 h-3.5" />
                            {j.applicantCount || 0} Applicants
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              j.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {j.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(j.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleJobStatus(j.id, j.status)}
                            className="text-xs font-semibold text-[#4338CA] hover:underline"
                          >
                            {j.status === 'ACTIVE' ? 'Close' : 'Reactivate'}
                          </button>
                          <button
                            onClick={() => handleDeleteJob(j.id)}
                            className="text-xs font-semibold text-rose-500 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: APPLICANT MANAGEMENT */}
        {activeTab === 'applicants' && (
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Candidate Applicants</h2>
                <p className="text-xs text-[#64748B]">
                  Review candidate resumes, evaluation notes, and advance statuses
                </p>
              </div>

              {/* Job Selector Dropdown */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold bg-white text-[#0F172A] focus:outline-none"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.applicantCount || 0})
                    </option>
                  ))}
                </select>

                <select
                  value={applicantFilter}
                  onChange={(e) => setApplicantFilter(e.target.value)}
                  className="px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold bg-white text-[#0F172A] focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="APPLIED">Applied</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="SELECTED">Selected</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {filteredApplicants.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#64748B]">
                No applicants found for this filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplicants.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 border border-[#E2E8F0] rounded-xl hover:border-[#CBD5E1] transition bg-white space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            app.candidate.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              app.candidate.name
                            )}&background=4338CA&color=fff`
                          }
                          alt=""
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h3 className="font-bold text-sm text-[#0F172A]">
                            {app.candidate.name}
                          </h3>
                          <p className="text-xs text-[#64748B]">
                            {app.candidate.candidateProfile?.headline || 'Candidate'}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span>{app.candidate.email}</span>
                            {app.candidate.phone && <span>• {app.candidate.phone}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Status Update Dropdown */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-[#64748B]">Status:</span>
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                          className="px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs font-bold bg-white text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="SHORTLISTED">Shortlisted</option>
                          <option value="INTERVIEW">Interview Round</option>
                          <option value="SELECTED">Selected 🏆</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    </div>

                    {/* Candidate Details & Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
                      <div>
                        <span className="text-[#94A3B8]">Current CTC:</span>
                        <p className="font-bold text-[#0F172A]">
                          {app.currentCtc ? `${app.currentCtc} LPA` : 'Not stated'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[#94A3B8]">Expected CTC:</span>
                        <p className="font-bold text-[#0F172A]">
                          {app.expectedCtc ? `${app.expectedCtc} LPA` : 'Not stated'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[#94A3B8]">Notice Period:</span>
                        <p className="font-bold text-[#0F172A]">{app.noticePeriod || '1 Month'}</p>
                      </div>
                      <div>
                        <span className="text-[#94A3B8]">Applied On:</span>
                        <p className="font-bold text-[#0F172A]">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Cover Note */}
                    {app.coverNote && (
                      <p className="text-xs text-[#475569] italic bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                        "{app.coverNote}"
                      </p>
                    )}

                    {/* Resume Download Action */}
                    {app.resume && (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#4338CA]" />
                          Attached Resume: {app.resume.fileName}
                        </span>

                        <button
                          onClick={() => handleDownloadResume(app.resume.id, app.candidate.name)}
                          className="px-4 py-1.5 bg-slate-100 hover:bg-indigo-50 text-[#4338CA] rounded-full text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Candidate Resume
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: POST A JOB */}
        {activeTab === 'post' && (
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 sm:p-8 shadow-xs max-w-3xl mx-auto">
            <div className="pb-4 border-b border-[#E2E8F0] mb-6">
              <h2 className="text-xl font-bold text-[#0F172A]">Create New Job Opening</h2>
              <p className="text-xs text-[#64748B]">
                Specify technical requirements, compensation, and location to attract verified talent
              </p>
            </div>

            {postSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="font-semibold">{postSuccess}</span>
              </div>
            )}
            {postError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-semibold">{postError}</span>
              </div>
            )}

            <form onSubmit={handlePostJob} className="space-y-5 text-xs">
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Architect (React / Next.js)"
                  className="w-full px-3 py-2.5 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4338CA]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Razorpay"
                    className="w-full px-3 py-2.5 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4338CA]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#CBD5E1] rounded-xl bg-white"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Design">UI/UX & Design</option>
                    <option value="Data & Analytics">Data & Analytics</option>
                    <option value="Cloud & AI">Cloud & AI</option>
                    <option value="DevOps & Infrastructure">DevOps & Infrastructure</option>
                    <option value="Product Management">Product Management</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Work Mode</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#CBD5E1] rounded-xl bg-white"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">100% Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3 py-2.5 border border-[#CBD5E1] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#CBD5E1] rounded-xl bg-white"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              {/* Experience & Salary Ranges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Min Exp (Yrs)</label>
                  <input
                    type="number"
                    value={minExp}
                    onChange={(e) => setMinExp(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Max Exp (Yrs)</label>
                  <input
                    type="number"
                    value={maxExp}
                    onChange={(e) => setMaxExp(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Min CTC (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Max CTC (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg"
                  />
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1.5">Required Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a required skill (e.g. React.js, GraphQL)"
                    className="flex-1 px-3 py-2 border border-[#CBD5E1] rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-[#4338CA] text-white font-bold rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-slate-800 font-medium"
                    >
                      {tag}
                      <button type="button" onClick={() => handleRemoveSkill(tag)}>
                        <X className="w-3 h-3 hover:text-red-500" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">Job Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline core responsibilities, day-to-day duties, and team context..."
                  className="w-full px-3 py-2.5 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4338CA]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">Requirements & Qualifications</label>
                <textarea
                  rows={2}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Educational degrees, years of hands-on experience, or certifications..."
                  className="w-full px-3 py-2.5 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4338CA]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">Perks & Benefits</label>
                <input
                  type="text"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="Health insurance, ESOPs, remote allowance, annual learning budget"
                  className="w-full px-3 py-2.5 border border-[#CBD5E1] rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                <button
                  type="submit"
                  disabled={postingJob}
                  className="px-8 py-3 bg-[#4338CA] hover:bg-[#3730A3] text-white rounded-full font-bold shadow-md hover:shadow-lg transition flex items-center gap-2"
                >
                  {postingJob && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{postingJob ? 'Publishing Job...' : 'Publish Job Listing'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
