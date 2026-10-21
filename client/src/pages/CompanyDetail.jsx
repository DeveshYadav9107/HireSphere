import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, Globe, Users, Calendar, Star, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import JobCard from '../components/JobCard';
import { apiRequest } from '../utils/api';

export default function CompanyDetail() {
  const { idOrSlug } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompany() {
      setLoading(true);
      try {
        const data = await apiRequest(`/companies/${idOrSlug}`);
        setCompany(data.company);
      } catch (err) {
        console.error('Failed to load company detail:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-24 text-center">
        <Loader2 className="w-10 h-10 text-[#4338CA] animate-spin mx-auto mb-2" />
        <p className="text-sm text-[#64748B]">Loading company overview...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-24 text-center max-w-md mx-auto px-4">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#0F172A]">Company Profile Not Found</h2>
        <p className="text-xs text-[#64748B] mt-1 mb-6">
          We could not locate this company directory record.
        </p>
        <Link to="/companies" className="px-6 py-2 bg-[#4338CA] text-white rounded-full text-xs font-bold">
          Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Company Header Hero */}
        <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={company.logo || 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=128&q=80'}
                alt={company.name}
                className="w-20 h-20 rounded-2xl object-cover border border-[#E2E8F0] p-1.5 bg-white shadow-2xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">{company.name}</h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-[#ECFDF5] border border-teal-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1">{company.industry}</p>
                <div className="flex items-center gap-4 text-xs text-[#475569] mt-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" /> {company.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#94A3B8]" /> {company.size || '1,000+ Employees'}
                  </span>
                  {company.foundedYear && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" /> Founded {company.foundedYear}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
              {company.rating && (
                <div className="flex items-center gap-2 p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  <div>
                    <span className="text-base font-extrabold text-amber-900">{company.rating} / 5.0</span>
                    <p className="text-[10px] text-amber-700">Based on {company.reviewsCount || 100}+ reviews</p>
                  </div>
                </div>
              )}

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 border border-[#CBD5E1] rounded-full text-xs font-bold text-[#4338CA] hover:bg-indigo-50 transition flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" /> Company Website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#F1F5F9]">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
              About {company.name}
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-4xl">
              {company.description}
            </p>
          </div>
        </div>

        {/* Company Active Job Postings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0F172A]">
              Open Positions at {company.name} ({company.jobs?.length || 0})
            </h2>
            <span className="text-xs text-[#64748B]">All roles verified by HireSphere</span>
          </div>

          {(!company.jobs || company.jobs.length === 0) ? (
            <div className="bg-white rounded-2xl border border-[#CBD5E1] p-12 text-center text-xs text-[#64748B]">
              No active job openings posted at this moment. Check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {company.jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={{
                    ...job,
                    company: {
                      id: company.id,
                      name: company.name,
                      logo: company.logo,
                      rating: company.rating,
                      location: company.location,
                    },
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
