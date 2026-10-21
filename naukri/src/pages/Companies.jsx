import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Star, Search, Briefcase, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { apiRequest } from '../utils/api';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      try {
        const query = search ? `?q=${encodeURIComponent(search)}` : '';
        const data = await apiRequest(`/companies${query}`);
        setCompanies(data.companies || []);
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchCompanies, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const industries = [
    'ALL',
    'Financial Technology',
    'Enterprise Software & Cloud',
    'Internet & Artificial Intelligence',
    'IT Services & Consulting',
    'E-commerce & Supply Chain',
    'On-demand Delivery & Tech',
  ];

  const filteredCompanies =
    industryFilter === 'ALL'
      ? companies
      : companies.filter((c) => c.industry === industryFilter);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">
            Verified Employers Directory
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] mt-1">
            Explore Top Hiring Companies
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-2">
            Discover company cultures, verified employee reviews, and open positions at leading technology firms
          </p>

          {/* Search Box */}
          <div className="mt-6 relative max-w-lg mx-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies by name (e.g. Razorpay, Microsoft)..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#CBD5E1] rounded-full text-xs shadow-xs focus:outline-none focus:border-[#4338CA]"
            />
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-4 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Industry Pill Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs font-semibold">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setIndustryFilter(ind)}
              className={`px-4 py-2 rounded-full border transition whitespace-nowrap ${
                industryFilter === ind
                  ? 'bg-[#4338CA] text-white border-[#4338CA] shadow-2xs'
                  : 'bg-white border-[#CBD5E1] text-[#475569] hover:border-[#4338CA]'
              }`}
            >
              {ind === 'ALL' ? 'All Industries' : ind}
            </button>
          ))}
        </div>

        {/* Company Cards Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-[#4338CA] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#64748B]">Loading companies...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xs hover:shadow-md hover:border-[#4338CA] transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <img
                      src={c.logo || 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=128&q=80'}
                      alt={c.name}
                      className="w-14 h-14 rounded-xl object-cover border border-[#E2E8F0] p-1 bg-white shrink-0"
                    />

                    {c.rating && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {c.rating}
                        <span className="text-slate-400 font-normal">({c.reviewsCount})</span>
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/company/${c.slug}`}
                    className="text-base font-bold text-[#0F172A] group-hover:text-[#4338CA] transition block"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs text-[#64748B] mt-0.5">{c.industry}</p>

                  <p className="text-xs text-[#475569] mt-3 line-clamp-3 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" /> {c.location}
                    </span>
                    <span>{c.size}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0D9488] bg-[#F0FDFA] px-3 py-1 rounded-full border border-teal-100">
                    {c.openJobsCount || 1} Open Vacancies
                  </span>

                  <Link
                    to={`/company/${c.slug}`}
                    className="text-xs font-bold text-[#4338CA] hover:underline flex items-center gap-1"
                  >
                    View Jobs <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
