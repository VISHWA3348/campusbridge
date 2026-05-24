'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Video, 
  Search, 
  Play, 
  Clock, 
  User, 
  Calendar,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useDebounce } from '@/hooks/PerformanceHooks';

export default function WebinarLibraryPage() {
  const [webinars, setWebinars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchPastWebinars(1, true);
  }, [debouncedSearch]);

  const fetchPastWebinars = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: pageNum.toString(),
        limit: '9',
        type: 'past',
        q: debouncedSearch
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')}/webinars?${query}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      
      const newWebinars = data.webinars || [];
      if (reset) {
        setWebinars(newWebinars);
        setPage(1);
      } else {
        setWebinars(prev => [...prev, ...newWebinars]);
        setPage(pageNum);
      }
      
      setHasMore(data.pagination ? pageNum < data.pagination.totalPages : false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPastWebinars(page + 1);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
            <Sparkles className="w-3 h-3" /> Learning Repository
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Webinar Library</h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl">Access recordings of past sessions and catch up on everything you missed.</p>
        </header>

        <div className="relative mb-12 max-w-xl">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
           <input 
             type="text" 
             placeholder="Search library topics..."
             className="w-full pl-12 pr-4 py-5 bg-white border-slate-100 rounded-[2rem] shadow-sm focus:shadow-xl transition-all outline-none font-bold text-sm"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {webinars.length > 0 ? (
            <>
              {webinars.map((webinar) => (
                <motion.div 
                  key={webinar.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden"
                >
                  <div className="h-48 bg-slate-900 relative">
                    {webinar.posterImage ? (
                      <img src={webinar.posterImage} className="w-full h-full object-cover opacity-60" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20"><Play className="w-16 h-16 text-white" /></div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/40">
                       <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                          <Play className="w-8 h-8 fill-current" />
                       </div>
                    </div>
                  </div>
                  <div className="p-8">
                     <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{webinar.domain}</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(webinar.date).getFullYear()}</span>
                     </div>
                     <h3 className="text-xl font-black text-slate-900 mb-4 line-clamp-2 leading-tight">{webinar.title}</h3>
                     <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-8">
                        <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {webinar.speakerName}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {webinar.duration}</span>
                     </div>
                     <button className="w-full py-4 rounded-2xl bg-slate-50 text-slate-900 font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all group">
                        Watch Recording <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </button>
                  </div>
                </motion.div>
              ))}

              {hasMore && (
                <div className="col-span-full flex justify-center mt-12">
                  <button 
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-12 py-5 bg-white border-2 border-slate-100 rounded-[2rem] font-black text-slate-900 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm flex items-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Load More Recordings'}
                  </button>
                </div>
              )}
            </>
          ) : loading ? (
             <div className="col-span-full flex justify-center py-24"><Loader2 className="animate-spin text-indigo-600 w-12 h-12" /></div>
          ) : (
            <div className="col-span-full bg-slate-50 rounded-[3rem] p-24 text-center">
               <Video className="w-16 h-16 text-slate-200 mx-auto mb-6" />
               <p className="font-bold text-slate-400">No matching recordings found in the library.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
