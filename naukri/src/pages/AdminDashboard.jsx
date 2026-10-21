import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Briefcase,
  Building2,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  UserX,
  UserCheck,
  Loader2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Load data based on active tab
  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      try {
        const statsData = await apiRequest('/admin/stats');
        setStats(statsData.stats);

        if (activeTab === 'users' || activeTab === 'overview') {
          const usersData = await apiRequest(`/admin/users?q=${encodeURIComponent(userSearch)}`);
          setUsersList(usersData.users || []);
        }
        if (activeTab === 'jobs') {
          const jobsData = await apiRequest('/admin/jobs');
          setJobsList(jobsData.jobs || []);
        }
        if (activeTab === 'logs') {
          const logsData = await apiRequest('/admin/audit-logs');
          setAuditLogs(logsData.logs || []);
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [activeTab, userSearch]);

  // Toggle user suspension
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await apiRequest(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: { isActive: !currentStatus },
      });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Change user role
  const handleChangeRole = async (userId, newRole) => {
    try {
      await apiRequest(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: { role: newRole },
      });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing as an admin?')) return;
    try {
      await apiRequest(`/admin/jobs/${jobId}`, { method: 'DELETE' });
      setJobsList((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-24 text-center max-w-md mx-auto px-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#0F172A]">Access Denied</h2>
        <p className="text-xs text-[#64748B] mt-1 mb-6">
          This area is strictly restricted to platform administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Platform Governance
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] mt-1">HireSphere Admin Portal</h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              System health, user moderation, job compliance, and audit log tracking
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-[#CBD5E1] pb-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'overview' ? 'bg-[#EEF2FF] text-[#4338CA]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            System Metrics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'users' ? 'bg-[#EEF2FF] text-[#4338CA]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            User Management ({stats?.totalUsers || 0})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'jobs' ? 'bg-[#EEF2FF] text-[#4338CA]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Job Moderation ({stats?.totalJobs || 0})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'logs' ? 'bg-[#EEF2FF] text-[#4338CA]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Audit Logs
          </button>
        </div>

        {/* TAB 1: SYSTEM METRICS OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#64748B]">Total Registered Users</span>
                  <Users className="w-5 h-5 text-[#4338CA]" />
                </div>
                <p className="text-2xl font-extrabold text-[#0F172A] mt-2">{stats.totalUsers}</p>
                <span className="text-[11px] text-slate-500">
                  {stats.totalCandidates} Candidates • {stats.totalRecruiters} Recruiters
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#64748B]">Total Job Listings</span>
                  <Briefcase className="w-5 h-5 text-[#0D9488]" />
                </div>
                <p className="text-2xl font-extrabold text-[#0F172A] mt-2">{stats.totalJobs}</p>
                <span className="text-[11px] text-emerald-600 font-semibold">{stats.activeJobs} Active</span>
              </div>

              <div className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#64748B]">Job Applications</span>
                  <FileText className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-2xl font-extrabold text-[#0F172A] mt-2">{stats.totalApplications}</p>
                <span className="text-[11px] text-amber-600 font-semibold">Submitted to date</span>
              </div>

              <div className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#64748B]">Hiring Companies</span>
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-extrabold text-[#0F172A] mt-2">{stats.totalCompanies}</p>
                <span className="text-[11px] text-purple-600 font-semibold">Verified employers</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Platform Users</h2>
                <p className="text-xs text-[#64748B]">Manage accounts, role assignments, and suspensions</p>
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by name or email..."
                  className="w-full pl-9 pr-3 py-2 border border-[#CBD5E1] rounded-lg text-xs"
                />
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#475569] font-bold">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-[#0F172A]">{u.name}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          className="px-2 py-1 border border-slate-200 rounded text-xs font-semibold bg-white"
                        >
                          <option value="CANDIDATE">CANDIDATE</option>
                          <option value="RECRUITER">RECRUITER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                          className={`text-xs font-semibold hover:underline ${
                            u.isActive ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: JOB MODERATION */}
        {activeTab === 'jobs' && (
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-6">
            <div className="pb-4 border-b border-[#E2E8F0]">
              <h2 className="text-lg font-bold text-[#0F172A]">All Job Postings</h2>
              <p className="text-xs text-[#64748B]">Review, moderate, or remove inappropriate listings</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#475569] font-bold">
                  <tr>
                    <th className="py-3 px-4">Job Title</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Posted By</th>
                    <th className="py-3 px-4">Applications</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {jobsList.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-[#0F172A]">{j.title}</td>
                      <td className="py-3.5 px-4 text-[#475569]">{j.company?.name}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{j.recruiter?.name}</td>
                      <td className="py-3.5 px-4">{j._count?.applications || 0}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100">
                          {j.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteJob(j.id)}
                          className="text-xs font-semibold text-rose-500 hover:underline"
                        >
                          Remove Listing
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-6">
            <div className="pb-4 border-b border-[#E2E8F0]">
              <h2 className="text-lg font-bold text-[#0F172A]">Administrative Audit Logs</h2>
              <p className="text-xs text-[#64748B]">Complete record of administrative actions taken</p>
            </div>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border border-[#E2E8F0] rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#4338CA]">{log.action}</span>
                    <p className="text-[#0F172A] mt-0.5">{log.details}</p>
                    <span className="text-[10px] text-slate-400">
                      Executed by: {log.admin?.name || 'Administrator'} • Target: {log.targetType} ({log.targetId})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
