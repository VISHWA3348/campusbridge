'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Briefcase, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Building2, 
  ExternalLink, 
  Calendar,
  ChevronRight,
  Loader2,
  Sparkles,
  Bookmark,
  Share2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/PerformanceHooks';
import { JobCardSkeleton } from '@/components/DashboardSkeletons';
import Link from 'next/link';

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchJobs(1, true);
  }, [debouncedSearch, selectedWorkType]);

  const fetchJobs = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        q: debouncedSearch,
        workType: selectedWorkType
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')}/jobs?${query}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      
      if (reset) {
        setJobs(data.jobs || []);
        setPage(1);
      } else {
        setJobs(prev => [...prev, ...(data.jobs || [])]);
        setPage(pageNum);
      }
      
      setHasMore(data.pagination ? pageNum < data.pagination.totalPages : false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchJobs(page + 1);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
            <Sparkles className="w-3 h-3" /> Career Opportunities
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Job Board</h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl">Exclusive career opportunities shared by alumni from your college. Connect, apply, and grow.</p>
        </header>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12">
          <div className="lg:col-span-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by title, company, or skills..."
              className="w-full pl-12 pr-4 py-5 bg-white border-slate-100 rounded-[1.5rem] shadow-sm focus:shadow-xl focus:border-indigo-500 transition-all outline-none font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="lg:col-span-3">
            <select 
              className="w-full px-6 py-5 bg-white border-slate-100 rounded-[1.5rem] shadow-sm focus:shadow-xl focus:border-indigo-500 transition-all outline-none font-bold text-sm appearance-none cursor-pointer"
              value={selectedWorkType}
              onChange={(e) => setSelectedWorkType(e.target.value)}
            >
              <option value="All">All Work Types</option>
              <option value="Office">Office / On-Site</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div className="lg:col-span-3">
            <button className="w-full h-full bg-slate-900 text-white rounded-[1.5rem] font-black flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
              <Filter className="w-5 h-5" /> More Filters
            </button>
          </div>
        </div>

        {/* Job Grid */}
        <div className="space-y-8">
          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {jobs.map((job: any) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={job.id}
                  className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors flex-shrink-0 shadow-inner">
                        <Building2 className="w-12 h-12" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            job.workType === 'Remote' ? 'bg-purple-50 text-purple-600' : 
                            job.workType === 'Hybrid' ? 'bg-orange-50 text-orange-600' : 
                            'bg-indigo-50 text-indigo-600'
                          }`}>
                            {job.workType}
                          </div>
                        </div>
                        <p className="text-xl font-bold text-slate-500 mb-6 flex items-center gap-2">
                          {job.company} <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span> 
                          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Shared by Alumni</span>
                        </p>
                        
                        <div className="flex flex-wrap gap-4 mb-8">
                          <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-2xl text-xs font-black text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" /> {job.location || 'Remote'}
                          </div>
                          <div className="flex items-center gap-2 px-5 py-2.5 bg-green-50 rounded-2xl text-xs font-black text-green-600">
                            <IndianRupee className="w-4 h-4 text-green-400" /> {job.salary || 'Not specified'}
                          </div>
                          <div className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 rounded-2xl text-xs font-black text-indigo-600">
                            <Calendar className="w-4 h-4 text-indigo-400" /> Apply by {job.lastDate ? new Date(job.lastDate).toLocaleDateString() : 'ASAP'}
                          </div>
                        </div>

                        {job.skills && (
                          <div className="flex flex-wrap gap-2">
                            {job.skills.split(',').map((skill: string, idx: number) => (
                              <span key={idx} className="px-4 py-1.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:border-indigo-100 group-hover:text-indigo-400 transition-colors">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 min-w-[200px]">
                      <a 
                        href={job.applicationLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full bg-slate-900 text-white px-8 py-5 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200"
                      >
                        Apply Now <ExternalLink className="w-4 h-4" />
                      </a>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 py-4 bg-slate-50 rounded-2xl text-slate-400 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                          <Bookmark className="w-4 h-4" /> Save
                        </button>
                        <button className="flex items-center justify-center gap-2 py-4 bg-slate-50 rounded-2xl text-slate-400 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                          <Share2 className="w-4 h-4" /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {hasMore && (
                <div className="flex justify-center mt-12">
                   {loading ? (
                     <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                   ) : (
                     <button 
                       onClick={handleLoadMore}
                       className="px-12 py-5 bg-white border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-900 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm flex items-center gap-3"
                     >
                       Load More Opportunities
                     </button>
                   )}
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 gap-8">
              {[...Array(3)].map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-24 text-center border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] opacity-50"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-8 shadow-inner">
                  <Briefcase className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No jobs found</h3>
                <p className="text-slate-500 font-medium max-w-md mx-auto mb-10 leading-relaxed text-lg">
                  We couldn't find any jobs matching your search for your college. Check back soon for new opportunities!
                </p>
                <button 
                  onClick={() => {setSearchTerm(''); setSelectedWorkType('All');}}
                  className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200"
                >
                  Reset Search
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Advisory Note */}
        <div className="mt-20 p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex gap-6 items-center">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-sm">
              <AlertCircle className="w-6 h-6" />
           </div>
           <p className="text-sm font-bold text-blue-900/70 leading-relaxed">
             <span className="font-black text-indigo-600 uppercase tracking-widest block mb-1 text-[10px]">Alumni Referral Tip</span>
             Most of these jobs are shared by alumni from your college. Don't forget to reach out to them via the 
             <Link href="/dashboard/student/referrals" className="text-indigo-600 underline mx-1 hover:text-blue-800 transition-colors">Referral Hub</Link>
             to ask for a direct referral before applying!
           </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
