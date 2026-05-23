'use client';

import React, { useEffect, useState } from 'react';
import { fetchMyAnnouncements, markAnnouncementAsRead } from '@/lib/api';
import { 
  Megaphone, 
  Pin, 
  ChevronRight, 
  X, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Bell,
  ArrowRight,
  Download,
  Info,
  Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementsView({ role }: { role: string }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnn, setSelectedAnn] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchMyAnnouncements(role);
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleRead = async (id: number) => {
    await markAnnouncementAsRead(id, role);
    loadData();
  };

  const openDetails = (ann: any) => {
    setSelectedAnn(ann);
    if (!ann.isRead) {
      handleRead(ann.id);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Bell className="animate-bounce text-slate-200 w-12 h-12" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-4">
         <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Megaphone className="text-indigo-600" /> College Broadcasts
         </h3>
         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Latest Updates</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map((ann, i) => (
          <motion.div 
            key={ann.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => openDetails(ann)}
            className={`group relative p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm cursor-pointer hover:shadow-2xl transition-all ${!ann.isRead ? 'ring-2 ring-indigo-500/10 bg-indigo-50/5' : ''}`}
          >
            {!ann.isRead && <div className="absolute top-8 right-8 w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>}
            {ann.isPinned && <Pin className="absolute top-8 right-8 text-indigo-300 w-4 h-4 rotate-45 group-hover:text-indigo-500 transition-colors" />}
            
            <div className="flex items-center gap-3 mb-4">
               <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                 ann.priority === 'high' ? 'bg-red-50 text-red-600' :
                 ann.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                 'bg-green-50 text-green-600'
               }`}>
                 {ann.priority}
               </span>
               <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(ann.createdAt).toLocaleDateString()}
               </span>
            </div>
            
            <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-3 line-clamp-1">{ann.title}</h4>
            <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">{ann.description}</p>
            
            <div className="mt-6 flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2 group-hover:gap-4 transition-all">
                  Full Details <ArrowRight className="w-3 h-3" />
               </span>
               {ann.isRead && <CheckCircle2 className="w-4 h-4 text-slate-200" />}
            </div>
          </motion.div>
        ))}

        {announcements.length === 0 && (
          <div className="col-span-2 py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
             <Bell className="w-16 h-16 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-bold italic">No broadcasts from your college at the moment.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedAnn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSelectedAnn(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
               <div className={`p-10 flex justify-between items-center ${
                 selectedAnn.priority === 'high' ? 'bg-red-50' : 
                 selectedAnn.priority === 'medium' ? 'bg-amber-50' : 
                 'bg-indigo-50'
               }`}>
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                       selectedAnn.priority === 'high' ? 'bg-white text-red-600' : 
                       selectedAnn.priority === 'medium' ? 'bg-white text-amber-600' : 
                       'bg-white text-indigo-600'
                     }`}>
                        {selectedAnn.priority === 'high' ? <AlertCircle /> : <Info />}
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedAnn.title}</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Official College Broadcast</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedAnn(null)} className="p-3 bg-white/50 hover:bg-white rounded-full transition-colors shadow-sm">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
               </div>
               
               <div className="p-12 overflow-y-auto custom-scrollbar space-y-8">
                  <div className="flex flex-wrap gap-4">
                     <div className="px-5 py-3 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Posted on {new Date(selectedAnn.createdAt).toLocaleDateString()}
                     </div>
                     <div className="px-5 py-3 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Megaphone className="w-4 h-4" /> Priority: {selectedAnn.priority}
                     </div>
                  </div>
                  
                  <div className="text-slate-600 font-medium leading-[1.8] text-lg whitespace-pre-wrap">
                     {selectedAnn.description}
                  </div>

                  {selectedAnn.attachment && (
                    <div className="pt-8 border-t border-slate-50">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Attachments</p>
                       <a 
                         href={selectedAnn.attachment} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center justify-between p-6 bg-indigo-50 rounded-2xl group hover:bg-indigo-600 transition-all"
                       >
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                <Paperclip className="w-5 h-5" />
                             </div>
                             <span className="font-bold text-blue-900 group-hover:text-white transition-colors">Download Official Document</span>
                          </div>
                          <Download className="w-5 h-5 text-indigo-400 group-hover:text-white group-hover:translate-y-1 transition-all" />
                       </a>
                    </div>
                  )}
               </div>
               
               <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-center">
                  <button 
                    onClick={() => setSelectedAnn(null)}
                    className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-sm hover:bg-indigo-600 transition-all shadow-xl"
                  >
                    Close Broadcast
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
