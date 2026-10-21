import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Users,
  Search,
  Zap,
  Star,
  FileCheck,
} from 'lucide-react';
import SearchBanner from '../components/SearchBanner';
import JobCard from '../components/JobCard';
import { apiRequest } from '../utils/api';

export default function Home() {
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [jobsData, companiesData, categoriesData] = await Promise.all([
          apiRequest('/jobs/featured'),
          apiRequest('/companies'),
          apiRequest('/jobs/categories'),
        ]);

        setFeaturedJobs(jobsData.jobs || []);
        setCompanies(companiesData.companies || []);
        setCategories(categoriesData.categories || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const quickSearchTags = [
    { label: 'Remote', query: 'workMode=Remote' },
    { label: 'MNC', query: 'q=MNC' },
    { label: 'Software Engineer', query: 'q=Software+Engineer' },
    { label: 'Freshers', query: 'minExp=0&maxExp=1' },
    { label: 'Data Science', query: 'department=Data+%26+Analytics' },
    { label: 'Fintech', query: 'q=Fintech' },
    { label: 'High CTC (25+ LPA)', query: 'minSalary=25' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 1. HERO & SEARCH SECTION (Naukri-Inspired Information Density) */}
      <section className="relative pt-12 pb-20 bg-linear-to-b from-[#EEF2FF] via-[#F8FAFC] to-[#F8FAFC] overflow-hidden border-b border-[#E2E8F0]">
        {/* Subtle Decorative Background Spheres */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
          <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl"></div>
          <div className="absolute top-20 left-10 w-80 h-80 bg-teal-200/40 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 text-[#4338CA] text-xs font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#4338CA]" />
            <span>Over 50,000+ verified tech opportunities live today</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-tight max-w-4xl mx-auto">
            Find your dream job now
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto font-normal">
            500,000+ jobs for you to explore across top global technology leaders, unicorns, and high-growth enterprises.
          </p>

          {/* Signature 3-Field Search Component */}
          <div className="mt-10">
            <SearchBanner />
          </div>

          {/* Quick Trending Searches Chips */}
          <div className="mt-6 flex items-center justify-center gap-2 flex-wrap text-xs text-[#64748B]">
            <span className="font-semibold text-[#0F172A] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#4338CA]" /> Popular Searches:
            </span>
            {quickSearchTags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/jobs?${tag.query}`)}
                className="px-3 py-1 rounded-full bg-white border border-[#CBD5E1] text-[#475569] hover:border-[#4338CA] hover:text-[#4338CA] hover:bg-[#EEF2FF] transition shadow-2xs"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. TOP HIRING COMPANIES (Naukri Carousel / Grid Experience) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D9488] uppercase tracking-wider">
              <Building2 className="w-4 h-4" /> Top Employers
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
              Top companies actively hiring
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Get hired by industry pioneers offering industry-leading compensation & growth
            </p>
          </div>

          <Link
            to="/companies"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#4338CA] hover:underline"
          >
            View all companies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {companies.slice(0, 8).map((comp) => (
            <div
              key={comp.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md hover:border-[#CBD5E1] transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <img
                    src={comp.logo || 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=128&q=80'}
                    alt={comp.name}
                    className="w-12 h-12 rounded-lg object-cover border border-[#E2E8F0] p-1 bg-white"
                  />
                  {comp.rating && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {comp.rating}
                    </span>
                  )}
                </div>

                <Link
                  to={`/company/${comp.slug}`}
                  className="font-bold text-sm sm:text-base text-[#0F172A] group-hover:text-[#4338CA] transition block"
                >
                  {comp.name}
                </Link>

                <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                  {comp.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0D9488] bg-[#F0FDFA] px-2.5 py-0.5 rounded-full border border-teal-100">
                  {comp.openJobsCount || 1} Open Jobs
                </span>

                <Link
                  to={`/company/${comp.slug}`}
                  className="text-xs font-semibold text-[#4338CA] hover:underline"
                >
                  Explore →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED & RECOMMENDED JOBS */}
      <section className="py-16 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#4338CA] uppercase tracking-wider">
                <Zap className="w-4 h-4" /> Recommended Opportunities
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
                Featured job openings
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                Hand-picked verified roles with high response rates and immediate interviews
              </p>
            </div>

            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#4338CA] hover:underline"
            >
              Browse all 50,000+ jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. POPULAR JOB CATEGORIES */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#4338CA] uppercase tracking-wider">
            Explore By Domain
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
            Popular job categories
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Find the right role matched to your specialization and skills
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { title: 'Software Engineering', count: '14,200+ jobs', icon: Briefcase, dept: 'Software Engineering' },
            { title: 'Cloud & DevOps', count: '6,400+ jobs', icon: Zap, dept: 'DevOps & Infrastructure' },
            { title: 'Data Science & AI', count: '5,100+ jobs', icon: Sparkles, dept: 'Data & Analytics' },
            { title: 'UI/UX & Product Design', count: '3,800+ jobs', icon: Star, dept: 'Design' },
            { title: 'Product Management', count: '2,900+ jobs', icon: TrendingUp, dept: 'Product Management' },
            { title: 'Remote & Hybrid', count: '18,500+ jobs', icon: MapPin, mode: 'Remote' },
            { title: 'Fresher Accelerators', count: '8,200+ jobs', icon: Award, exp: '0' },
            { title: 'Fintech & Banking', count: '7,100+ jobs', icon: Building2, q: 'Fintech' },
          ].map((cat, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (cat.dept) navigate(`/jobs?department=${encodeURIComponent(cat.dept)}`);
                else if (cat.mode) navigate(`/jobs?workMode=${cat.mode}`);
                else if (cat.exp) navigate(`/jobs?minExp=0&maxExp=1`);
                else if (cat.q) navigate(`/jobs?q=${cat.q}`);
                else navigate('/jobs');
              }}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:border-[#4338CA] hover:shadow-md transition cursor-pointer group"
            >
              <cat.icon className="w-8 h-8 text-[#4338CA] group-hover:scale-110 transition-transform mb-3" />
              <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#4338CA] transition">
                {cat.title}
              </h3>
              <p className="text-xs text-[#64748B] mt-1">{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAST-TRACK CAREER BOOSTERS (Naukri FastForward Value Add) */}
      <section className="py-14 bg-linear-to-r from-[#172554] via-[#1E1B4B] to-[#172554] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1 space-y-3">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                Fast-Forward Career
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Accelerate your career search with HireSphere Tools
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                85% of candidates who complete their profile and enable alerts receive interview callbacks within 7 days.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/15">
                <FileCheck className="w-8 h-8 text-teal-300 mb-3" />
                <h3 className="font-bold text-sm">Resume Score</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Upload your CV to check formatting, keyword match, and recruiter visibility score.
                </p>
                <Link
                  to="/candidate/dashboard?tab=resume"
                  className="mt-4 inline-block text-xs font-semibold text-teal-300 hover:text-white"
                >
                  Upload & Analyze →
                </Link>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/15">
                <Zap className="w-8 h-8 text-indigo-300 mb-3" />
                <h3 className="font-bold text-sm">Custom Job Alerts</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Never miss an opening. Get instant notifications when matching jobs are posted.
                </p>
                <Link
                  to="/candidate/dashboard?tab=alerts"
                  className="mt-4 inline-block text-xs font-semibold text-indigo-300 hover:text-white"
                >
                  Set Free Alert →
                </Link>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/15">
                <Users className="w-8 h-8 text-amber-300 mb-3" />
                <h3 className="font-bold text-sm">Direct Recruiter Access</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Connect directly with verified talent acquisition leads at top tech firms.
                </p>
                <Link
                  to="/jobs"
                  className="mt-4 inline-block text-xs font-semibold text-amber-300 hover:text-white"
                >
                  View Openings →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. EMPLOYER BANNER (Recruiter CTA) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-r from-indigo-50 to-teal-50 border border-indigo-100 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="max-w-xl">
            <span className="px-3 py-1 bg-white border border-[#CBD5E1] text-[#4338CA] text-xs font-bold rounded-full">
              For Recruiters & Hiring Managers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-3">
              Looking to hire top software engineers and designers?
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-2">
              Post your job in under 2 minutes and start receiving pre-screened applications from certified candidates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/register?role=recruiter"
              className="px-6 py-3 bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs sm:text-sm font-semibold rounded-full shadow-md text-center transition"
            >
              Post a Free Job
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-slate-50 text-xs sm:text-sm font-semibold rounded-full text-center transition"
            >
              Recruiter Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
