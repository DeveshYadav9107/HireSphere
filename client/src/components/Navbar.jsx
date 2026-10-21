import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import {
  Briefcase,
  Building2,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  PlusCircle,
  ShieldCheck,
  Bookmark,
  FileText,
  Send,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [jobsDropdownOpen, setJobsDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications if user is logged in
  useEffect(() => {
    if (user) {
      apiRequest('/notifications')
        .then((data) => {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const markAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo-icon.svg"
                alt="HireSphere Logo"
                className="w-9 h-9 transition-transform group-hover:scale-105"
              />
              <span className="text-xl font-bold tracking-tight text-[#172554]">
                Hire<span className="text-[#4338CA]">Sphere</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {/* Jobs Dropdown */}
              <div className="relative group">
                <button
                  onClick={() => setJobsDropdownOpen(!jobsDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#0F172A] hover:text-[#4338CA] rounded-md transition"
                >
                  Jobs
                  <ChevronDown className="w-4 h-4 text-[#64748B] group-hover:text-[#4338CA]" />
                </button>
                <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-150 z-50">
                  <Link
                    to="/jobs"
                    className="block px-4 py-2 text-sm text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                  >
                    All Jobs
                  </Link>
                  <Link
                    to="/jobs?workMode=Remote"
                    className="block px-4 py-2 text-sm text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                  >
                    Remote Jobs
                  </Link>
                  <Link
                    to="/jobs?minExp=0&maxExp=1"
                    className="block px-4 py-2 text-sm text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                  >
                    Fresher Jobs
                  </Link>
                  <Link
                    to="/jobs?department=Software+Engineering"
                    className="block px-4 py-2 text-sm text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                  >
                    IT & Software Jobs
                  </Link>
                  <Link
                    to="/jobs?minSalary=20"
                    className="block px-4 py-2 text-sm text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                  >
                    High Salary Jobs (20+ LPA)
                  </Link>
                </div>
              </div>

              {/* Companies Link */}
              <Link
                to="/companies"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#0F172A] hover:text-[#4338CA] rounded-md transition"
              >
                Companies
              </Link>

              {/* Services Link */}
              <Link
                to="/services"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#0F172A] hover:text-[#4338CA] rounded-md transition"
              >
                Services
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#ECFDF5] text-[#065F46] rounded-full">
                  Free
                </span>
              </Link>
            </nav>
          </div>

          {/* Right: Actions, Recruiter Portal & Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Recruiter Corner */}
            {(!user || user.role === 'RECRUITER') && (
              <Link
                to={user?.role === 'RECRUITER' ? '/recruiter/dashboard?tab=post' : '/register?role=recruiter'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D9488] bg-[#F0FDFA] border border-[#CCFBF1] hover:bg-[#CCFBF1] rounded-full transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {user?.role === 'RECRUITER' ? 'Post a Job' : 'For Employers'}
              </Link>
            )}

            {/* Notification Bell (Logged-in users) */}
            {user && (
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-full relative transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Panel */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-[#E2E8F0] p-3 z-50">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                      <span className="font-semibold text-sm text-[#0F172A]">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-[#4338CA] hover:underline font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-[#64748B]">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-2.5 rounded-lg transition hover:bg-slate-50 ${
                              !notif.isRead ? 'bg-[#EEF2FF]/60' : ''
                            }`}
                          >
                            <p className="text-xs font-semibold text-[#0F172A]">{notif.title}</p>
                            <p className="text-xs text-[#64748B] mt-0.5">{notif.message}</p>
                            <span className="text-[10px] text-[#94A3B8] mt-1 block">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Menu or Login/Register */}
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-3 bg-slate-100 hover:bg-slate-200 rounded-full transition text-sm font-medium text-[#0F172A]"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4338CA&color=fff`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-white"
                  />
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50">
                    <div className="px-4 py-3 border-b border-[#E2E8F0]">
                      <p className="text-xs text-[#64748B]">Signed in as</p>
                      <p className="text-sm font-bold text-[#0F172A] truncate">{user.name}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#EEF2FF] text-[#4338CA]">
                          {user.role}
                        </span>
                        <span className="text-xs text-[#64748B] truncate">{user.email}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      {user.role === 'CANDIDATE' && (
                        <>
                          <Link
                            to="/candidate/dashboard?tab=profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                          >
                            <User className="w-4 h-4 text-[#64748B]" />
                            My Profile
                          </Link>
                          <Link
                            to="/candidate/dashboard?tab=applications"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                          >
                            <Send className="w-4 h-4 text-[#64748B]" />
                            Applied Jobs
                          </Link>
                          <Link
                            to="/candidate/dashboard?tab=saved"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                          >
                            <Bookmark className="w-4 h-4 text-[#64748B]" />
                            Saved Jobs
                          </Link>
                          <Link
                            to="/candidate/dashboard?tab=resume"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                          >
                            <FileText className="w-4 h-4 text-[#64748B]" />
                            Manage Resume
                          </Link>
                        </>
                      )}

                      {user.role === 'RECRUITER' && (
                        <>
                          <Link
                            to="/recruiter/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                          >
                            <Briefcase className="w-4 h-4 text-[#64748B]" />
                            Recruiter Dashboard
                          </Link>
                          <Link
                            to="/recruiter/dashboard?tab=post"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                          >
                            <PlusCircle className="w-4 h-4 text-[#64748B]" />
                            Post a Job
                          </Link>
                          <Link
                            to="/recruiter/dashboard?tab=applicants"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                          >
                            <User className="w-4 h-4 text-[#64748B]" />
                            Candidate Applicants
                          </Link>
                        </>
                      )}

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#4338CA]" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-[#E2E8F0] pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#EF4444] hover:bg-[#FEF2F2] transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-semibold text-[#4338CA] border border-[#4338CA] rounded-full hover:bg-[#EEF2FF] transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-[#4338CA] hover:bg-[#3730A3] rounded-full shadow-sm hover:shadow transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link
                to={user.role === 'CANDIDATE' ? '/candidate/dashboard' : '/recruiter/dashboard'}
                className="p-1.5 text-xs font-semibold text-[#4338CA] bg-[#EEF2FF] rounded-full px-3"
              >
                Dashboard
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#0F172A] hover:bg-slate-100 rounded-lg"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E2E8F0] px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#0F172A] hover:text-[#4338CA]"
          >
            Find Jobs
          </Link>
          <Link
            to="/companies"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#0F172A] hover:text-[#4338CA]"
          >
            Top Companies
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#0F172A] hover:text-[#4338CA]"
          >
            Career Services
          </Link>

          {user ? (
            <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
              <div className="flex items-center gap-3 py-2">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                  alt=""
                  className="w-9 h-9 rounded-full"
                />
                <div>
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-[#64748B]">{user.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-semibold text-[#EF4444]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-[#E2E8F0] flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-[#4338CA] border border-[#4338CA] rounded-full"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-[#4338CA] rounded-full"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
