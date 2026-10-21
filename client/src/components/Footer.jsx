import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#172554] text-slate-300 pt-14 pb-8 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-700/60">
          {/* Col 1: Brand & About */}
          <div className="lg:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo-icon.svg" alt="HireSphere" className="w-8 h-8 brightness-110" />
              <span className="text-xl font-bold tracking-tight text-white">
                Hire<span className="text-[#38BDF8]">Sphere</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier career discovery ecosystem connecting top talent with verified global employers and Fortune 500 enterprises.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Bengaluru, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>support@hiresphere.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Jobs by Category */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Jobs By Role</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/jobs?department=Software+Engineering" className="hover:text-white transition">
                  Software Engineering
                </Link>
              </li>
              <li>
                <Link to="/jobs?department=Design" className="hover:text-white transition">
                  Product & UI/UX Design
                </Link>
              </li>
              <li>
                <Link to="/jobs?department=Data+%26+Analytics" className="hover:text-white transition">
                  Data Science & GenAI
                </Link>
              </li>
              <li>
                <Link to="/jobs?department=Cloud+%26+AI" className="hover:text-white transition">
                  Cloud & DevOps
                </Link>
              </li>
              <li>
                <Link to="/jobs?minExp=0&maxExp=1" className="hover:text-white transition">
                  Fresher Graduate Jobs
                </Link>
              </li>
              <li>
                <Link to="/jobs?workMode=Remote" className="hover:text-white transition">
                  100% Remote Roles
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Jobs by Location */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Jobs By City</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/jobs?location=Bengaluru" className="hover:text-white transition">
                  Jobs in Bengaluru
                </Link>
              </li>
              <li>
                <Link to="/jobs?location=Hyderabad" className="hover:text-white transition">
                  Jobs in Hyderabad
                </Link>
              </li>
              <li>
                <Link to="/jobs?location=Pune" className="hover:text-white transition">
                  Jobs in Pune
                </Link>
              </li>
              <li>
                <Link to="/jobs?location=Gurugram" className="hover:text-white transition">
                  Jobs in Delhi NCR / Gurugram
                </Link>
              </li>
              <li>
                <Link to="/jobs?location=Mumbai" className="hover:text-white transition">
                  Jobs in Mumbai
                </Link>
              </li>
              <li>
                <Link to="/jobs?location=Remote" className="hover:text-white transition">
                  Work from Anywhere
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: For Employers */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Recruiter Hub</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/register?role=recruiter" className="hover:text-white transition">
                  Register as Recruiter
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Employer Sign In
                </Link>
              </li>
              <li>
                <Link to="/recruiter/dashboard?tab=post" className="hover:text-white transition">
                  Post Free Job Opening
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-white transition">
                  Featured Employers
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition">
                  Talent Sourcing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Candidate Tools & Support */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Support & Trust</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/candidate/dashboard?tab=resume" className="hover:text-white transition">
                  Resume Quality Check
                </Link>
              </li>
              <li>
                <Link to="/candidate/dashboard?tab=alerts" className="hover:text-white transition">
                  Job Alerts Manager
                </Link>
              </li>
              <li>
                <a href="#help" className="hover:text-white transition">
                  Trust & Security Center
                </a>
              </li>
              <li>
                <a href="#fraud" className="hover:text-white transition flex items-center gap-1 text-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Fraud Alert & Guidelines
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition">
                  Privacy Policy & Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} HireSphere Technologies Ltd. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span>Designed with deep care for recruiters & job seekers</span>
            <span className="inline-flex items-center gap-1 text-teal-400">
              <ShieldCheck className="w-4 h-4" /> 100% Verified Opportunities
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
