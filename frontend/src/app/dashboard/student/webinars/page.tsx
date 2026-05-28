'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getFileUrl } from '@/lib/api';
import { 
  Video, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Building2, 
  ExternalLink, 
  Calendar,
  ChevronRight,
  Loader2,
  Sparkles,
  Bookmark,
  Share2,
  AlertCircle,
  User,
  CheckCircle2,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentWebinarsPage() {
  const [webinars, setWebinars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('upcoming'); // upcoming, past, registered

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api') + '/webinars', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setWebinars(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (id: number) => {
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')}/webinars/${id}/register`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) fetchWebinars();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredWebinars = webinars.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         w.speakerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const webinarDate = new Date(w.date);
    
    if (filter === 'upcoming') return matchesSearch && webinarDate >= now;
    if (filter === 'past') return matchesSearch && webinarDate < now;
    if (filter === 'registered') return matchesSearch && w.registrations?.length > 0;
    
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
            <Sparkles className="w-3 h-3" /> Learning & Mentorship
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Webinar Hub</h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl">Exclusive knowledge sharing sessions hosted by alumni who've walked your path.</p>
        </header>

        {/* Tabs & Search */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-center justify-between">
           <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] w-full lg:w-auto">
              {[
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'past', label: 'Past Sessions' },
                { id: 'registered', label: 'My Registrations' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`flex-1 lg:px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    filter === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
           </div>

           <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search by topic or speaker..."
                className="w-full pl-11 pr-4 py-4 bg-white border-slate-100 rounded-[1.2rem] shadow-sm focus:shadow-xl focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {/* Webinar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-bold">Syncing latest sessions...</p>
            </div>
          ) : filteredWebinars.length > 0 ? (
            filteredWebinars.map((webinar) => {
              const isRegistered = webinar.registrations?.length > 0;
              const isUpcoming = new Date(webinar.date) >= new Date();

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={webinar.id}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col"
                >
                  {/* Image Placeholder / Poster */}
                  <div className="h-48 bg-slate-900 relative overflow-hidden">
                    {webinar.posterImage ? (
                      <img src={webinar.posterImage} alt={webinar.title} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <Video className="w-20 h-20 text-white" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest">
                      {webinar.domain || 'General'}
                    </div>
                    {isRegistered && (
                      <div className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                         <CheckCircle2 className="w-3 h-3" /> Registered
                      </div>
                    )}
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                         {webinar.alumni.user.profilePhoto ? (
                           <img src={getFileUrl(webinar.alumni.user.profilePhoto) || ''} className="w-full h-full object-cover" />
                         ) : <User className="w-4 h-4 text-slate-400" />}
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shared by {webinar.alumni.user.name}</span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{webinar.title}</h3>
                    <p className="text-sm font-medium text-slate-500 mb-6 line-clamp-2">{webinar.description}</p>

                    <div className="space-y-3 mb-8">
                       <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-300" /> {new Date(webinar.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                       </div>
                       <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                          <Clock className="w-4 h-4 text-slate-300" /> {new Date(webinar.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {webinar.duration}
                       </div>
                       <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                          <Monitor className="w-4 h-4 text-slate-300" /> {webinar.type}
                       </div>
                    </div>

                    <div className="mt-auto">
                      {isRegistered ? (
                        <a 
                          href={webinar.location} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                        >
                          Join Now <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : isUpcoming ? (
                        <button 
                          onClick={() => register(webinar.id)}
                          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100"
                        >
                          Register for Session
                        </button>
                      ) : (
                        <button className="w-full bg-slate-50 text-slate-400 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-not-allowed">
                          Session Concluded
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-[3rem] p-24 text-center border border-slate-100 shadow-sm">
              <Video className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-900 mb-2">No webinars found</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">Check back later for new knowledge sharing sessions from your alumni network.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
