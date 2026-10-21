import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, ChevronDown, Sparkles } from 'lucide-react';
import { apiRequest } from '../utils/api';

export default function SearchBanner({ initialQuery = '', initialExp = '', initialLocation = '' }) {
  const navigate = useNavigate();

  const [query, setQuery] = useState(initialQuery);
  const [experience, setExperience] = useState(initialExp);
  const [location, setLocation] = useState(initialLocation);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef(null);

  // Fetch live suggestions on keyword typing
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      apiRequest(`/jobs/autocomplete?q=${encodeURIComponent(query.trim())}`)
        .then((data) => {
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        })
        .catch(() => {});
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);

    const params = new URLSearchParams();
    if (query.trim()) params.append('q', query.trim());
    if (experience !== '') params.append('minExp', experience);
    if (location.trim()) params.append('location', location.trim());

    navigate(`/jobs?${params.toString()}`);
  };

  const handleSelectSuggestion = (suggestionText) => {
    setQuery(suggestionText);
    setShowSuggestions(false);
    navigate(`/jobs?q=${encodeURIComponent(suggestionText)}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto" ref={searchBoxRef}>
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl md:rounded-full p-2.5 shadow-2xl border border-[#CBD5E1] flex flex-col md:flex-row items-stretch md:items-center gap-2"
      >
        {/* Field 1: Skills / Designation / Companies */}
        <div className="relative flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-[#E2E8F0]">
          <Search className="w-5 h-5 text-[#4338CA] shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Enter skills / designations / companies"
            className="w-full text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none bg-transparent"
          />

          {/* Autocomplete Popup */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-2 w-full md:w-80 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Matching Suggestions
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item.label)}
                  className="w-full px-4 py-2 text-left text-xs text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4338CA] flex items-center justify-between transition"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-[10px] text-[#94A3B8] bg-slate-100 px-1.5 py-0.5 rounded">
                    {item.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Field 2: Experience Selector */}
        <div className="flex-none md:w-52 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-[#E2E8F0]">
          <Briefcase className="w-5 h-5 text-[#64748B] shrink-0 mr-2.5" />
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full text-sm text-[#0F172A] bg-transparent focus:outline-none cursor-pointer appearance-none"
          >
            <option value="">Select experience</option>
            <option value="0">Fresher (less than 1 year)</option>
            <option value="1">1 Year</option>
            <option value="2">2 Years</option>
            <option value="3">3 Years</option>
            <option value="5">5+ Years</option>
            <option value="8">8+ Years</option>
            <option value="10">10+ Years</option>
          </select>
          <ChevronDown className="w-4 h-4 text-[#94A3B8] pointer-events-none -ml-4" />
        </div>

        {/* Field 3: Location */}
        <div className="flex-1 flex items-center px-4 py-2">
          <MapPin className="w-5 h-5 text-[#0D9488] shrink-0 mr-2.5" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (e.g. Bengaluru, Remote)"
            className="w-full text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none bg-transparent"
          />
        </div>

        {/* Search Submit Button */}
        <button
          type="submit"
          className="bg-[#4338CA] hover:bg-[#3730A3] text-white font-semibold px-8 py-3 rounded-full text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 shrink-0"
        >
          <span>Search</span>
        </button>
      </form>
    </div>
  );
}
