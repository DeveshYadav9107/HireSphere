import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Filter,
  X,
  ChevronDown,
  RotateCcw,
  Search,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  Loader2,
  Frown,
} from 'lucide-react';
import SearchBanner from '../components/SearchBanner';
import JobCard from '../components/JobCard';
import { apiRequest } from '../utils/api';

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search Query Params
  const query = searchParams.get('q') || '';
  const locationParam = searchParams.get('location') || '';
  const minExpParam = searchParams.get('minExp') || '';
  const maxExpParam = searchParams.get('maxExp') || '';
  const minSalaryParam = searchParams.get('minSalary') || '';
  const workModeParam = searchParams.get('workMode') || '';
  const departmentParam = searchParams.get('department') || '';
  const freshnessParam = searchParams.get('freshness') || '';
  const sortByParam = searchParams.get('sortBy') || 'relevance';
  const pageParam = parseInt(searchParams.get('page') || '1');

  // State
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ totalJobs: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch jobs whenever searchParams change
  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const queryStr = searchParams.toString();
        const data = await apiRequest(`/jobs?${queryStr}`);
        setJobs(data.jobs || []);
        setPagination(data.pagination || { totalJobs: 0, totalPages: 1, currentPage: 1 });
      } catch (err) {
        console.error('Failed to load jobs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  // Helper to update filter
  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === undefined) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    nextParams.set('page', '1'); // Reset to page 1 on filter update
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', newPage.toString());
    setSearchParams(nextParams);
  };

  // Filter definitions
  const workModes = ['Remote', 'Hybrid', 'On-site'];
  const experienceRanges = [
    { label: 'Any Experience', min: '', max: '' },
    { label: 'Fresher (0 - 1 Yrs)', min: '0', max: '1' },
    { label: '1 - 3 Yrs', min: '1', max: '3' },
    { label: '3 - 5 Yrs', min: '3', max: '5' },
    { label: '5 - 8 Yrs', min: '5', max: '8' },
    { label: '8+ Yrs', min: '8', max: '' },
  ];
  const salaryRanges = [
    { label: 'Any Salary', min: '' },
    { label: '3+ Lakhs (LPA)', min: '3' },
    { label: '6+ Lakhs (LPA)', min: '6' },
    { label: '10+ Lakhs (LPA)', min: '10' },
    { label: '15+ Lakhs (LPA)', min: '15' },
    { label: '25+ Lakhs (LPA)', min: '25' },
    { label: '35+ Lakhs (LPA)', min: '35' },
  ];
  const popularLocations = ['Bengaluru', 'Hyderabad', 'Pune', 'Gurugram', 'Mumbai', 'Remote'];
  const departments = [
    'Software Engineering',
    'Design',
    'Data & Analytics',
    'Cloud & AI',
    'DevOps & Infrastructure',
    'Product Management',
  ];
  const freshnessOptions = [
    { label: 'All Time', value: '' },
    { label: 'Last 24 Hours', value: '1' },
    { label: 'Last 3 Days', value: '3' },
    { label: 'Last 7 Days', value: '7' },
    { label: 'Last 14 Days', value: '14' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Search Bar Header */}
      <div className="bg-white border-b border-[#E2E8F0] py-6 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBanner
            initialQuery={query}
            initialExp={minExpParam}
            initialLocation={locationParam}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
              {query ? `Jobs matching "${query}"` : 'All Available Jobs'}
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Showing {jobs.length > 0 ? (pagination.currentPage - 1) * 10 + 1 : 0} -{' '}
              {Math.min(pagination.currentPage * 10, pagination.totalJobs)} of {pagination.totalJobs} jobs
              {locationParam && ` in ${locationParam}`}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] shadow-2xs"
            >
              <Filter className="w-4 h-4 text-[#4338CA]" />
              Filters
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#64748B] font-medium hidden sm:inline">Sort by:</span>
              <select
                value={sortByParam}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg font-semibold text-[#0F172A] focus:outline-none focus:border-[#4338CA] cursor-pointer"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest First</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="salary_low">Salary: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Pills Bar */}
        {(query || locationParam || workModeParam || minExpParam || minSalaryParam || departmentParam || freshnessParam) && (
          <div className="flex items-center gap-2 pt-3 pb-1 flex-wrap text-xs">
            <span className="font-semibold text-[#64748B]">Active Filters:</span>

            {query && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[#4338CA] font-medium border border-indigo-200">
                Keyword: {query}
                <button onClick={() => updateFilter('q', '')}><X className="w-3 h-3 hover:text-red-500" /></button>
              </span>
            )}

            {locationParam && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0D9488] font-medium border border-teal-200">
                Location: {locationParam}
                <button onClick={() => updateFilter('location', '')}><X className="w-3 h-3 hover:text-red-500" /></button>
              </span>
            )}

            {workModeParam && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-medium border border-slate-200">
                Work Mode: {workModeParam}
                <button onClick={() => updateFilter('workMode', '')}><X className="w-3 h-3 hover:text-red-500" /></button>
              </span>
            )}

            {minSalaryParam && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-medium border border-amber-200">
                Salary: {minSalaryParam}+ LPA
                <button onClick={() => updateFilter('minSalary', '')}><X className="w-3 h-3 hover:text-red-500" /></button>
              </span>
            )}

            {departmentParam && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 font-medium border border-purple-200">
                Dept: {departmentParam}
                <button onClick={() => updateFilter('department', '')}><X className="w-3 h-3 hover:text-red-500" /></button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-xs text-[#EF4444] font-semibold hover:underline flex items-center gap-1 ml-2"
            >
              <RotateCcw className="w-3 h-3" /> Clear all
            </button>
          </div>
        )}

        {/* 2-Column Naukri Layout: Sidebar + Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
          {/* Left Column: Filter Sidebar */}
          <aside
            className={`fixed inset-0 z-40 bg-black/50 lg:bg-transparent lg:static lg:block ${
              mobileFilterOpen ? 'block' : 'hidden'
            }`}
          >
            <div className="bg-white lg:rounded-xl border border-[#E2E8F0] p-5 shadow-xs max-h-[85vh] lg:max-h-none overflow-y-auto w-80 lg:w-full ml-auto lg:ml-0 h-full lg:h-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
                <span className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#4338CA]" /> All Filters
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-[#4338CA] hover:underline font-semibold"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="lg:hidden p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filter 1: Work Mode */}
              <div className="py-3 border-b border-[#F1F5F9]">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
                  Work Mode
                </h3>
                <div className="space-y-2 text-xs">
                  {workModes.map((mode) => (
                    <label key={mode} className="flex items-center gap-2 cursor-pointer text-[#475569] hover:text-[#0F172A]">
                      <input
                        type="radio"
                        name="workMode"
                        checked={workModeParam === mode}
                        onChange={() => updateFilter('workMode', workModeParam === mode ? '' : mode)}
                        className="text-[#4338CA] focus:ring-indigo-500 rounded"
                      />
                      <span>{mode}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 2: Experience */}
              <div className="py-3 border-b border-[#F1F5F9]">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
                  Experience Level
                </h3>
                <div className="space-y-2 text-xs">
                  {experienceRanges.map((exp, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer text-[#475569] hover:text-[#0F172A]">
                      <input
                        type="radio"
                        name="expRange"
                        checked={minExpParam === exp.min && maxExpParam === exp.max}
                        onChange={() => {
                          const next = new URLSearchParams(searchParams);
                          if (exp.min) next.set('minExp', exp.min);
                          else next.delete('minExp');
                          if (exp.max) next.set('maxExp', exp.max);
                          else next.delete('maxExp');
                          next.set('page', '1');
                          setSearchParams(next);
                        }}
                        className="text-[#4338CA] focus:ring-indigo-500"
                      />
                      <span>{exp.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 3: Minimum Salary */}
              <div className="py-3 border-b border-[#F1F5F9]">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
                  Salary (Lakhs / Year)
                </h3>
                <div className="space-y-2 text-xs">
                  {salaryRanges.map((sal, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer text-[#475569] hover:text-[#0F172A]">
                      <input
                        type="radio"
                        name="salaryRange"
                        checked={minSalaryParam === sal.min}
                        onChange={() => updateFilter('minSalary', sal.min)}
                        className="text-[#4338CA] focus:ring-indigo-500"
                      />
                      <span>{sal.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 4: Location */}
              <div className="py-3 border-b border-[#F1F5F9]">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
                  Location
                </h3>
                <div className="space-y-2 text-xs">
                  {popularLocations.map((loc) => (
                    <label key={loc} className="flex items-center gap-2 cursor-pointer text-[#475569] hover:text-[#0F172A]">
                      <input
                        type="radio"
                        name="loc"
                        checked={locationParam.toLowerCase() === loc.toLowerCase()}
                        onChange={() => updateFilter('location', locationParam.toLowerCase() === loc.toLowerCase() ? '' : loc)}
                        className="text-[#4338CA] focus:ring-indigo-500"
                      />
                      <span>{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 5: Department */}
              <div className="py-3 border-b border-[#F1F5F9]">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
                  Department
                </h3>
                <div className="space-y-2 text-xs">
                  {departments.map((dept) => (
                    <label key={dept} className="flex items-center gap-2 cursor-pointer text-[#475569] hover:text-[#0F172A]">
                      <input
                        type="radio"
                        name="dept"
                        checked={departmentParam === dept}
                        onChange={() => updateFilter('department', departmentParam === dept ? '' : dept)}
                        className="text-[#4338CA] focus:ring-indigo-500"
                      />
                      <span className="truncate">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 6: Freshness */}
              <div className="pt-3">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
                  Freshness
                </h3>
                <div className="space-y-2 text-xs">
                  {freshnessOptions.map((f, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer text-[#475569] hover:text-[#0F172A]">
                      <input
                        type="radio"
                        name="freshness"
                        checked={freshnessParam === f.value}
                        onChange={() => updateFilter('freshness', f.value)}
                        className="text-[#4338CA] focus:ring-indigo-500"
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Search Results List */}
          <main className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="py-24 text-center">
                <Loader2 className="w-8 h-8 text-[#4338CA] animate-spin mx-auto mb-3" />
                <p className="text-sm text-[#64748B]">Finding matching opportunities...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center shadow-xs">
                <Frown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#0F172A]">No matching jobs found</h3>
                <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                  We couldn't find any positions matching your search filters. Try loosening criteria or clearing filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-5 px-5 py-2 rounded-full bg-[#4338CA] text-white text-xs font-semibold hover:bg-[#3730A3] transition shadow-xs"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="pt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                      className="px-4 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition ${
                          pagination.currentPage === p
                            ? 'bg-[#4338CA] text-white shadow-xs'
                            : 'border border-[#CBD5E1] text-[#0F172A] hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="px-4 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
