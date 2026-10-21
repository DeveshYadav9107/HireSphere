import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  FileText,
  Send,
  Bookmark,
  Bell,
  Settings,
  UploadCloud,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  ExternalLink,
  Loader2,
  Building2,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';

export default function CandidateDashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  // Profile Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [location, setLocation] = useState('');
  const [currentSalary, setCurrentSalary] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('1 Month');
  const [preferredLocations, setPreferredLocations] = useState('');
  const [preferredRoles, setPreferredRoles] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  // Dashboard Data State
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Resume Upload State
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [resumeSuccess, setResumeSuccess] = useState('');

  // New Alert Modal/Form
  const [alertTitle, setAlertTitle] = useState('');
  const [alertKeywords, setAlertKeywords] = useState('');
  const [alertLocation, setAlertLocation] = useState('');
  const [creatingAlert, setCreatingAlert] = useState(false);

  // Sync profile form when user object updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      if (user.candidateProfile) {
        setHeadline(user.candidateProfile.headline || '');
        setSummary(user.candidateProfile.summary || '');
        setLocation(user.candidateProfile.location || '');
        setCurrentSalary(user.candidateProfile.currentSalary ? String(user.candidateProfile.currentSalary) : '');
        setExpectedSalary(user.candidateProfile.expectedSalary ? String(user.candidateProfile.expectedSalary) : '');
        setNoticePeriod(user.candidateProfile.noticePeriod || '1 Month');
        setPreferredLocations(user.candidateProfile.preferredLocations || '');
        setPreferredRoles(user.candidateProfile.preferredRoles || '');
        setSkills(user.candidateProfile.skills?.map((s) => s.name) || []);
      }
    }
  }, [user]);

  // Fetch applications, saved jobs, alerts
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      setLoading(true);
      try {
        const [appData, savedData, alertData] = await Promise.all([
          apiRequest('/applications/my'),
          apiRequest('/saved-jobs'),
          apiRequest('/alerts'),
        ]);

        setApplications(appData.applications || []);
        setSavedJobs(savedData.savedJobs || []);
        setAlerts(alertData.alerts || []);
      } catch (err) {
        console.error('Failed to load candidate data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, activeTab]);

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Add & Remove Skill Tags
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Save Candidate Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');

    try {
      await apiRequest('/auth/profile', {
        method: 'PUT',
        body: {
          name,
          phone,
          headline,
          summary,
          location,
          currentSalary,
          expectedSalary,
          noticePeriod,
          preferredLocations,
          preferredRoles,
          skills,
        },
      });

      setProfileMsg('Profile saved successfully!');
      await refreshUser();
      setTimeout(() => setProfileMsg(''), 4000);
    } catch (err) {
      setProfileMsg(`Error: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Resume Upload
  const handleResumeFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResumeError('');
    setResumeSuccess('');
    setUploadingResume(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('hiresphere_token');
      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed');

      setResumeSuccess('Resume uploaded successfully!');
      await refreshUser();
    } catch (err) {
      setResumeError(err.message || 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
      e.target.value = null;
    }
  };

  // Handle Resume Download
  const handleDownloadResume = async (resumeId, originalName) => {
    try {
      const token = localStorage.getItem('hiresphere_token');
      const response = await fetch(`/api/resumes/download/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(`Could not download resume: ${err.message}`);
    }
  };

  // Delete Resume
  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await apiRequest(`/resumes/${resumeId}`, { method: 'DELETE' });
      await refreshUser();
    } catch (err) {
      alert(err.message);
    }
  };

  // Remove Saved Job
  const handleUnsave = async (jobId) => {
    try {
      await apiRequest(`/saved-jobs/${jobId}`, { method: 'DELETE' });
      setSavedJobs((prev) => prev.filter((item) => item.job.id !== jobId));
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Job Alert
  const handleToggleAlert = async (alertId) => {
    try {
      const res = await apiRequest(`/alerts/${alertId}/toggle`, { method: 'PATCH' });
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, isActive: res.alert.isActive } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Job Alert
  const handleDeleteAlert = async (alertId) => {
    try {
      await apiRequest(`/alerts/${alertId}`, { method: 'DELETE' });
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error(err);
    }
  };

  // Create New Job Alert
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setCreatingAlert(true);
    try {
      const data = await apiRequest('/alerts', {
        method: 'POST',
        body: {
          title: alertTitle,
          keywords: alertKeywords,
          location: alertLocation,
        },
      });
      setAlerts([data.alert, ...alerts]);
      setAlertTitle('');
      setAlertKeywords('');
      setAlertLocation('');
    } catch (err) {
      alert(err.message);
    } finally {
      setCreatingAlert(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      APPLIED: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Applied' },
      UNDER_REVIEW: { bg: 'bg-indigo-50 text-[#4338CA] border-indigo-200', label: 'Under Review' },
      SHORTLISTED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Shortlisted' },
      INTERVIEW: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Interview Round' },
      REJECTED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Not Selected' },
      SELECTED: { bg: 'bg-teal-50 text-[#0D9488] border-teal-200', label: 'Selected 🏆' },
    };
    const s = map[status] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: status };
    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${s.bg}`}>
        {s.label}
      </span>
    );
  };

  const completionScore = user?.candidateProfile?.profileCompletion || 30;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Profile Header Banner */}
        <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4338CA&color=fff`}
              alt=""
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 p-0.5"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">{user?.name}</h1>
              <p className="text-xs text-[#64748B] mt-0.5">{user?.candidateProfile?.headline || 'Candidate Profile'}</p>
              <div className="flex items-center gap-3 text-xs text-[#475569] mt-2">
                <span>{user?.email}</span>
                {user?.phone && <span>• {user.phone}</span>}
                {user?.candidateProfile?.location && <span>• {user.candidateProfile.location}</span>}
              </div>
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div className="w-full md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
              <span className="text-[#0F172A]">Profile Strength</span>
              <span className="text-[#4338CA]">{completionScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-linear-to-r from-[#4338CA] to-[#0D9488] h-full rounded-full transition-all duration-500"
                style={{ width: `${completionScore}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-[#64748B] mt-2">
              {completionScore < 100 ? 'Add skills and resume to reach 100%' : 'Profile is 100% complete!'}
            </p>
          </div>
        </div>

        {/* 2-Column Dashboard Layout: Sidebar + Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="space-y-1">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-2 shadow-xs">
              <button
                onClick={() => setTab('profile')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition text-left ${
                  activeTab === 'profile'
                    ? 'bg-[#EEF2FF] text-[#4338CA]'
                    : 'text-[#475569] hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4" /> My Profile
              </button>

              <button
                onClick={() => setTab('resume')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition text-left ${
                  activeTab === 'resume'
                    ? 'bg-[#EEF2FF] text-[#4338CA]'
                    : 'text-[#475569] hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <FileText className="w-4 h-4" /> Resume Manager
                </span>
                {user?.resumes && user.resumes.length > 0 && (
                  <span className="text-[10px] bg-indigo-100 text-[#4338CA] px-2 py-0.5 rounded-full">
                    {user.resumes.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setTab('applications')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition text-left ${
                  activeTab === 'applications'
                    ? 'bg-[#EEF2FF] text-[#4338CA]'
                    : 'text-[#475569] hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Send className="w-4 h-4" /> Applied Jobs
                </span>
                {applications.length > 0 && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {applications.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setTab('saved')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition text-left ${
                  activeTab === 'saved'
                    ? 'bg-[#EEF2FF] text-[#4338CA]'
                    : 'text-[#475569] hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Bookmark className="w-4 h-4" /> Saved Jobs
                </span>
                {savedJobs.length > 0 && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {savedJobs.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setTab('alerts')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition text-left ${
                  activeTab === 'alerts'
                    ? 'bg-[#EEF2FF] text-[#4338CA]'
                    : 'text-[#475569] hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Bell className="w-4 h-4" /> Job Alerts
                </span>
                {alerts.length > 0 && (
                  <span className="text-[10px] bg-teal-100 text-[#0D9488] px-2 py-0.5 rounded-full">
                    {alerts.length}
                  </span>
                )}
              </button>
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <main className="lg:col-span-3">
            {/* 1. MY PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs">
                <div className="pb-4 border-b border-[#E2E8F0] mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#0F172A]">Candidate Profile</h2>
                    <p className="text-xs text-[#64748B]">
                      Update your career headline, skills, and compensation expectations
                    </p>
                  </div>
                  {profileMsg && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      {profileMsg}
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
                  {/* Basic Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4338CA]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4338CA]"
                      />
                    </div>
                  </div>

                  {/* Headline */}
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Senior Full Stack Engineer | React, Node.js, Cloud Architectures"
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4338CA]"
                    />
                  </div>

                  {/* Career Summary */}
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Career Summary & Bio
                    </label>
                    <textarea
                      rows={3}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Brief overview of your experience, key achievements, and career focus..."
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4338CA]"
                    />
                  </div>

                  {/* Skills Management */}
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-2">
                      Key Technical & Professional Skills
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill (e.g. Next.js, Docker, Python)"
                        className="flex-1 px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4338CA]"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-[#4338CA] text-white rounded-lg font-bold hover:bg-[#3730A3] transition"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[#0F172A] font-medium border border-slate-200"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(s)}
                            className="hover:text-red-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Compensation & Notice */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#F1F5F9]">
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">Current Salary (LPA)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={currentSalary}
                        onChange={(e) => setCurrentSalary(e.target.value)}
                        placeholder="18.5"
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4338CA]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">Expected Salary (LPA)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={expectedSalary}
                        onChange={(e) => setExpectedSalary(e.target.value)}
                        placeholder="26.0"
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

                  {/* Location & Preferred */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">Current Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Bengaluru, Karnataka"
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4338CA]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">Preferred Locations</label>
                      <input
                        type="text"
                        value={preferredLocations}
                        onChange={(e) => setPreferredLocations(e.target.value)}
                        placeholder="e.g. Bengaluru, Hyderabad, Remote"
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#4338CA]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-8 py-2.5 bg-[#4338CA] hover:bg-[#3730A3] text-white rounded-full font-bold shadow-sm transition flex items-center gap-2"
                    >
                      {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. RESUME MANAGEMENT TAB */}
            {activeTab === 'resume' && (
              <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">Resume Management</h2>
                  <p className="text-xs text-[#64748B]">
                    Upload and manage your CVs for 1-click recruiter applications
                  </p>
                </div>

                {resumeSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{resumeSuccess}</span>
                  </div>
                )}
                {resumeError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{resumeError}</span>
                  </div>
                )}

                {/* Upload Area */}
                <div className="border-2 border-dashed border-[#CBD5E1] hover:border-[#4338CA] rounded-2xl p-8 text-center bg-slate-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeFileChange}
                    disabled={uploadingResume}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-12 h-12 text-[#4338CA] mx-auto mb-3" />
                  <p className="text-sm font-bold text-[#0F172A]">
                    {uploadingResume ? 'Uploading resume...' : 'Click or drag resume file here to upload'}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
                </div>

                {/* Resumes List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Uploaded Resumes ({user?.resumes?.length || 0})
                  </h3>

                  {(!user?.resumes || user.resumes.length === 0) ? (
                    <p className="text-xs text-[#64748B] py-4 text-center">No resumes uploaded yet.</p>
                  ) : (
                    user.resumes.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-4 bg-white border border-[#E2E8F0] rounded-xl hover:border-[#CBD5E1] transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-[#4338CA] flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#0F172A]">{r.originalName || r.fileName}</p>
                            <p className="text-[11px] text-[#64748B]">
                              Uploaded on {new Date(r.uploadedAt).toLocaleDateString()} • {(r.fileSize / 1024).toFixed(1)} KB
                              {r.isDefault && (
                                <span className="ml-2 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadResume(r.id, r.originalName)}
                            className="p-2 text-[#4338CA] hover:bg-indigo-50 rounded-lg transition"
                            title="Download resume"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteResume(r.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="Delete resume"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. APPLIED JOBS TAB */}
            {activeTab === 'applications' && (
              <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">Applied Jobs ({applications.length})</h2>
                  <p className="text-xs text-[#64748B]">
                    Track recruiter review status and interview progress in real time
                  </p>
                </div>

                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Send className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#0F172A]">You haven't applied to any jobs yet</p>
                    <p className="text-xs text-[#64748B] mt-1 mb-4">Start discovering positions matched to your profile</p>
                    <Link
                      to="/jobs"
                      className="px-5 py-2 bg-[#4338CA] text-white rounded-full text-xs font-bold"
                    >
                      Search Jobs
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="p-5 border border-[#E2E8F0] rounded-xl hover:border-[#CBD5E1] transition bg-white"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <Link
                              to={`/jobs/${app.job.id}`}
                              className="text-sm font-bold text-[#0F172A] hover:text-[#4338CA] transition"
                            >
                              {app.job.title}
                            </Link>
                            <p className="text-xs text-[#64748B] mt-0.5">
                              {app.job.company?.name} • {app.job.location} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div>{statusBadge(app.status)}</div>
                        </div>

                        {app.coverNote && (
                          <p className="text-xs text-slate-500 mt-3 p-2.5 bg-slate-50 rounded-lg">
                            <span className="font-semibold text-slate-700">Cover Note:</span> "{app.coverNote}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. SAVED JOBS TAB */}
            {activeTab === 'saved' && (
              <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">Saved Jobs ({savedJobs.length})</h2>
                  <p className="text-xs text-[#64748B]">Jobs you have bookmarked for later application</p>
                </div>

                {savedJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#0F172A]">No saved jobs</p>
                    <p className="text-xs text-[#64748B] mt-1 mb-4">Click the bookmark icon on any job card to save it</p>
                    <Link
                      to="/jobs"
                      className="px-5 py-2 bg-[#4338CA] text-white rounded-full text-xs font-bold"
                    >
                      Browse Jobs
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedJobs.map((item) => (
                      <div
                        key={item.job.id}
                        className="p-5 border border-[#E2E8F0] rounded-xl hover:border-[#CBD5E1] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div>
                          <Link
                            to={`/jobs/${item.job.id}`}
                            className="text-sm font-bold text-[#0F172A] hover:text-[#4338CA] transition"
                          >
                            {item.job.title}
                          </Link>
                          <p className="text-xs text-[#64748B] mt-0.5">
                            {item.job.company?.name} • {item.job.location} • {item.job.minSalary && `${item.job.minSalary}-${item.job.maxSalary} LPA`}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleUnsave(item.job.id)}
                            className="text-xs font-semibold text-rose-500 hover:underline"
                          >
                            Remove
                          </button>
                          <Link
                            to={`/jobs/${item.job.id}`}
                            className="px-4 py-2 bg-[#4338CA] text-white text-xs font-bold rounded-full hover:bg-[#3730A3]"
                          >
                            Apply Now
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. JOB ALERTS TAB */}
            {activeTab === 'alerts' && (
              <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">Job Alerts Manager</h2>
                  <p className="text-xs text-[#64748B]">
                    Get notified immediately when new jobs match your targeted keywords
                  </p>
                </div>

                {/* Create Alert Form */}
                <form onSubmit={handleCreateAlert} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <h3 className="font-bold text-[#0F172A]">Create New Job Alert</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      value={alertTitle}
                      onChange={(e) => setAlertTitle(e.target.value)}
                      placeholder="Alert Name (e.g. React Lead Jobs)"
                      className="px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      required
                      value={alertKeywords}
                      onChange={(e) => setAlertKeywords(e.target.value)}
                      placeholder="Keywords (e.g. React, Next.js)"
                      className="px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      value={alertLocation}
                      onChange={(e) => setAlertLocation(e.target.value)}
                      placeholder="City (e.g. Bengaluru, Remote)"
                      className="px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creatingAlert}
                    className="px-5 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-full text-xs transition"
                  >
                    {creatingAlert ? 'Creating...' : '+ Create Alert'}
                  </button>
                </form>

                {/* Alerts List */}
                <div className="space-y-3">
                  {alerts.map((al) => (
                    <div
                      key={al.id}
                      className="flex items-center justify-between p-4 border border-[#E2E8F0] rounded-xl hover:border-[#CBD5E1] transition"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-[#0F172A]">{al.title}</h4>
                        <p className="text-[11px] text-[#64748B]">
                          Keywords: <span className="font-medium text-slate-800">{al.keywords}</span>
                          {al.location && ` • Location: ${al.location}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleAlert(al.id)}
                          className="text-xs font-semibold"
                        >
                          {al.isActive ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <ToggleRight className="w-5 h-5" /> Active
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-1">
                              <ToggleLeft className="w-5 h-5" /> Paused
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteAlert(al.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                          title="Delete alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
