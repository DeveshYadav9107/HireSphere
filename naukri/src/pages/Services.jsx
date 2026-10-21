import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Zap,
  Sparkles,
  Users,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
} from 'lucide-react';

export default function Services() {
  const services = [
    {
      title: 'Resume Quality & ATS Checker',
      tag: 'Candidate Essential',
      description:
        'Get a comprehensive evaluation of your resume formatting, keyword density, and ATS-compatibility tailored for top MNCs.',
      features: [
        'Instant ATS readability scoring',
        'Keyword gap analysis vs job descriptions',
        'Grammar and presentation recommendations',
        'Exportable feedback report',
      ],
      cta: 'Check Resume Now',
      link: '/candidate/dashboard?tab=resume',
      highlight: true,
    },
    {
      title: 'Real-Time Job Alerts',
      tag: '100% Free',
      description:
        'Customized notification engine delivering instant opportunities matching your skills and salary expectations directly to your dashboard.',
      features: [
        'Unlimited custom search alerts',
        'Direct recruiter contact alerts',
        'Daily and weekly frequency toggles',
        'Zero spam guarantee',
      ],
      cta: 'Create Job Alert',
      link: '/candidate/dashboard?tab=alerts',
      highlight: false,
    },
    {
      title: 'Direct Employer Recruiter Hub',
      tag: 'For Recruiters',
      description:
        'Accelerate hiring with verified candidate talent pools, automated applicant screening, and 1-click status updates.',
      features: [
        'Post unlimited free tech job listings',
        'Candidate management with resume downloads',
        'Application status notification triggers',
        'Pre-screened tech developer profiles',
      ],
      cta: 'Post an Opening',
      link: '/recruiter/dashboard?tab=post',
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#4338CA] uppercase tracking-wider">
            Career Accelerator Services
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-2">
            Supercharge Your Job Search
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-2">
            Powerful tools and features inspired by modern recruitment ecosystems to help you land your dream job faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between border transition ${
                srv.highlight
                  ? 'bg-white border-[#4338CA] shadow-xl ring-2 ring-indigo-100'
                  : 'bg-white border-[#CBD5E1] shadow-xs hover:border-[#4338CA]'
              }`}
            >
              <div>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#EEF2FF] text-[#4338CA]">
                  {srv.tag}
                </span>

                <h3 className="text-lg font-bold text-[#0F172A] mt-4">{srv.title}</h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">{srv.description}</p>

                <div className="mt-6 space-y-2.5">
                  {srv.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-[#475569]">
                      <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#F1F5F9]">
                <Link
                  to={srv.link}
                  className={`w-full py-2.5 rounded-full text-xs font-bold text-center block transition ${
                    srv.highlight
                      ? 'bg-[#4338CA] hover:bg-[#3730A3] text-white shadow-md'
                      : 'border border-[#CBD5E1] hover:bg-slate-50 text-[#0F172A]'
                  }`}
                >
                  {srv.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
