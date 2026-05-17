'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  fetchAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement, 
  togglePinAnnouncement, 
  fetchAnnouncementAnalytics 
} from '@/lib/api';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Pin, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye, 
  X, 
  Loader2, 
  Send, 
  Users, 
  Calendar, 
  BarChart3, 
  FileText, 
  Paperclip,
  CheckCircle2,
  Clock,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CollegeAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    title: '', description: '', priority: 'low', targetRole: 'ALL', targetDept: '', targetYear: '', attachment: '', isPinned: false 
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [annData, analyticsData] = await Promise.all([
        fetchAnnouncements(),
        fetchAnnouncementAnalytics()
      ]);
      setAnnouncements(Array.isArray(annData) ? annData : []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleTogglePin = async (id: number) => {
    await togglePinAnnouncement(id);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      await deleteAnnouncement(id);
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selectedAnn) {
        await updateAnnouncement(selectedAnn.id, formData);
      } else {
        await createAnnouncement(formData);
      }
      setShowAddModal(false);
      setSelectedAnn(null);
      setFormData({ title: '', description: '', priority: 'low', targetRole: 'ALL', targetDept: '', targetYear: '', attachment: '', isPinned: false });
      loadData();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Broadcast Hub</h1>
          <p className="text-slate-500 font-medium italic">Communicate important updates to your students and alumni ecosystem.</p>
        </div>
        <button 
          onClick={() => { setSelectedAnn(null); setShowAddModal(true); }}
          className="px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-sm flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200/50 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Create Announcement
        </button>
      </header>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl">
            <Megaphone />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Broadcasts</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{analytics?.totalAnnouncements || 0}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl">
            <Eye />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Engagement (Views)</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{analytics?.totalViews || 0}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl">
            <BarChart3 />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Impact Level</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">High</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm mb-12 flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search announcements..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-[2rem] outline-none border border-transparent focus:border-indigo-500 transition-all font-bold text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-2 py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" /></div>
        ) : filteredAnnouncements.map((ann, i) => (
          <motion.div 
            key={ann.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative group hover:shadow-2xl transition-all ${ann.isPinned ? 'ring-2 ring-indigo-500/20 bg-indigo-50/10' : ''}`}
          >
            {ann.isPinned && <Pin className="absolute top-10 right-10 text-indigo-600 w-6 h-6 rotate-45" />}
            <div className="flex items-center gap-4 mb-6">
               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                 ann.priority === 'high' ? 'bg-red-50 text-red-600' :
                 ann.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                 'bg-green-50 text-green-600'
               }`}>
                 {ann.priority} priority
               </span>
               <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                 {ann.targetRole}
               </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">{ann.title}</h3>
            <p className="text-slate-500 font-medium line-clamp-3 mb-8 leading-relaxed">{ann.description}</p>
            
            <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-50">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                     <Clock className="w-4 h-4" /> {new Date(ann.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                     <Eye className="w-4 h-4" /> {ann._count?.views || 0} Views
                  </div>
               </div>
               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleTogglePin(ann.id)} className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Pin/Unpin">
                     <Pin className="w-5 h-5" />
                  </button>
                  <button onClick={() => { setSelectedAnn(ann); setFormData({...ann}); setShowAddModal(true); }} className="p-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-all" title="Edit">
                     <Edit3 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(ann.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                     <Trash2 className="w-5 h-5" />
                  </button>
               </div>
            </div>
          </motion.div>
        ))}
        {filteredAnnouncements.length === 0 && !loading && (
          <div className="col-span-2 py-32 text-center bg-slate-50 rounded-[4rem] border border-dashed border-slate-200">
             <Megaphone className="w-20 h-20 text-slate-200 mx-auto mb-6" />
             <p className="text-slate-400 font-black italic text-lg uppercase tracking-tight">No broadcasts found. Start communicating with your college.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedAnn ? 'Edit Broadcast' : 'New Broadcast'}</h2>
                <button onClick={() => setShowAddModal(false)} className="p-4 hover:bg-white rounded-full transition-colors shadow-sm">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="p-10 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Announcement Title</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Campus Placement Drive 2026"
                      className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Description / Message</label>
                    <textarea 
                      required
                      placeholder="Detailed update for students and alumni..."
                      className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all h-40"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Priority</label>
                      <select 
                        className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all appearance-none"
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Target Role</label>
                      <select 
                        className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all appearance-none"
                        value={formData.targetRole}
                        onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                      >
                        <option value="ALL">Everyone</option>
                        <option value="STUDENT">Students Only</option>
                        <option value="ALUMNI">Alumni Only</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                     <input 
                       type="checkbox" 
                       id="isPinned"
                       className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500"
                       checked={formData.isPinned}
                       onChange={(e) => setFormData({...formData, isPinned: e.target.checked})}
                     />
                     <label htmlFor="isPinned" className="font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                        <Pin className="w-4 h-4" /> Pin to top of dashboard
                     </label>
                  </div>
                  <button 
                    disabled={saving}
                    type="submit"
                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" /> : <Send className="w-6 h-6" />}
                    {selectedAnn ? 'Update Broadcast' : 'Send Announcement'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </DashboardLayout>
  );
}
