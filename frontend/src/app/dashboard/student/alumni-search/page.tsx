'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { searchAlumni, requestMentorship, getFileUrl } from '@/lib/api';
import { Search, Filter, Briefcase, MapPin, Award, HeartHandshake, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { useDebounce } from '@/hooks/PerformanceHooks';
import { AlumniCardSkeleton } from '@/components/DashboardSkeletons';

export default function AlumniSearchPage() {
  const [alumniList, setAlumniList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [mentorshipLoading, setMentorshipLoading] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const loadAlumni = async (pageNum = 1, reset = false) => {
    setLoading(true);
    const data = await searchAlumni(debouncedSearch, companyFilter, '', pageNum, 12);
    const newAlumni = data.alumni || [];

    if (reset) {
      setAlumniList(newAlumni);
      setPage(1);
    } else {
      setAlumniList(prev => [...prev, ...newAlumni]);
      setPage(pageNum);
    }

    setHasMore(data.pagination ? pageNum < data.pagination.totalPages : false);
    setLoading(false);
  };

  useEffect(() => {
    loadAlumni(1, true);
  }, [debouncedSearch, companyFilter]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadAlumni(page + 1);
    }
  };

  const handleMentorshipRequest = async (alumniId: number) => {
    setMentorshipLoading(alumniId);
    try {
      const res = await requestMentorship({
        alumniId,
        message: "I would like to request mentorship for my career growth.",
        sessionType: "Career Guidance"
      });
      alert('Mentorship request sent successfully!');
    } catch (error) {
      alert('Failed to send mentorship request.');
    } finally {
      setMentorshipLoading(null);
    }
  };

  const companies = Array.from(new Set(alumniList.map(a => a.currentCompany || a.company).filter(Boolean)));
  const locations = Array.from(new Set(alumniList.map(a => a.permanentAddress || a.companyAddress).filter(Boolean)));

  return (
    <DashboardLayout>
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-4 uppercase">Network Directory</h1>
        <p className="text-slate-500 font-medium text-lg">Connect with alumni from top companies and industries.</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, skills, or department..."
            className="w-full pl-16 pr-6 py-5 bg-white border-2 border-slate-50 rounded-3xl outline-none focus:border-indigo-500 transition-all font-bold text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select
            className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-50 rounded-3xl outline-none focus:border-indigo-500 transition-all font-black text-[10px] uppercase tracking-widest appearance-none shadow-sm"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          >
            <option value="">All Companies</option>
            {companies.map((c: any) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="relative">
          <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select
            className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-50 rounded-3xl outline-none focus:border-indigo-500 transition-all font-black text-[10px] uppercase tracking-widest appearance-none shadow-sm"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map((l: any) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {alumniList.length > 0 ? (
          alumniList.map((alumni) => (
            <div key={alumni.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 hover:shadow-2xl hover:border-indigo-200 transition-all group relative overflow-hidden">
              {alumni.verified && (
                <div className="absolute top-8 right-8 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3 h-3" /> Verified
                </div>
              )}

              <Link href={`/dashboard/profile/${alumni.user?.id}`}>
                <div className="w-24 h-24 bg-slate-50 text-slate-900 rounded-[2rem] flex items-center justify-center mb-8 font-black text-3xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner overflow-hidden border-4 border-white shadow-xl">
                  {alumni.user?.profilePhoto ? (
                    <img src={getFileUrl(alumni.user.profilePhoto) || ''} alt={alumni.user?.name || 'Alumni'} className="w-full h-full object-cover" />
                  ) : (
                    alumni.user?.name?.[0] || '?'
                  )}
                </div>
              </Link>

              <div className="mb-8">
                <Link href={`/dashboard/profile/${alumni.user?.id}`} className="hover:text-indigo-600 transition-colors">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{alumni.user?.name || 'Unknown Alumni'}</h3>
                </Link>
                <p className="text-slate-500 font-bold text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-500" /> {alumni.jobRole || alumni.role || 'Professional'} at {alumni.currentCompany || alumni.company || 'Private'}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                  <p className="text-slate-400 text-xs font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {alumni.currentLocation || alumni.permanentAddress || alumni.companyAddress || 'Global'}
                  </p>
                  {alumni.experience && (
                    <p className="text-slate-400 text-xs font-medium flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" /> {alumni.experience} Exp
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-10">
                {alumni.skills?.split(',').slice(0, 3).map((skill: string) => (
                  <span key={skill} className="px-4 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {skill.trim()}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Link
                  href={`/dashboard/profile/${alumni.user?.id}`}
                  className="flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-indigo-100"
                >
                  <Search className="w-4 h-4" /> View Details
                </Link>
                <Link
                  href={`/dashboard/student/chat?userId=${alumni.user?.id || '0'}`}
                  className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  <MessageSquare className="w-4 h-4" /> Message
                </Link>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => handleMentorshipRequest(alumni.id)}
                  disabled={mentorshipLoading === alumni.id || alumni.readyForMentorship === 'No'}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${alumni.readyForMentorship === 'Yes'
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100'
                    : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                    }`}
                >
                  {mentorshipLoading === alumni.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <HeartHandshake className="w-4 h-4" />}
                  {alumni.readyForMentorship === 'Yes' ? 'Available for Mentorship' : 'Mentorship Not Available'}
                </button>
              </div>
            </div>
          ))
        ) : loading ? (
          [...Array(6)].map((_, i) => <AlumniCardSkeleton key={i} />)
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">No Alumni Found</h3>
            <p className="text-slate-400 font-medium">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          ) : (
            <button
              onClick={handleLoadMore}
              className="px-12 py-5 bg-white border-2 border-slate-100 rounded-[2.5rem] font-black text-slate-900 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm flex items-center gap-3"
            >
              Load More Alumni
            </button>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
