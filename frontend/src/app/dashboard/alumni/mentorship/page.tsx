'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  fetchMentorshipRequests, 
  updateMentorshipRequest, 
  fetchOwnSlots, 
  addMentorshipSlot, 
  deleteMentorshipSlot,
  fetchMentorshipAnalytics,
  updateAlumniExpertise,
  fetchAlumniProfile,
  getFileUrl
} from '@/lib/api';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  MessageSquare,
  ChevronRight,
  UserCheck,
  Briefcase,
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Video,
  ExternalLink,
  ShieldCheck,
  Star,
  Settings,
  Layout,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlumniMentorship() {
  const [requests, setRequests] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // requests, schedule, expertise, analytics
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00' });
  const [showMeetModal, setShowMeetModal] = useState<any>(null);
  const [meetLink, setMeetLink] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [newExpertise, setNewExpertise] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reqs, slts, stats, prof] = await Promise.all([
        fetchMentorshipRequests().catch(err => { console.error(err); return []; }),
        fetchOwnSlots().catch(err => { console.error(err); return []; }),
        fetchMentorshipAnalytics().catch(err => { console.error(err); return null; }),
        fetchAlumniProfile().catch(err => { console.error(err); return null; })
      ]);
      setRequests(Array.isArray(reqs) ? reqs : []);
      setSlots(Array.isArray(slts) ? slts : []);
      setAnalytics(stats && !stats.error ? stats : null);
      setProfile(prof && !prof.error ? prof : null);
      if (prof && !prof.error && prof.mentorshipExpertise) {
        try {
          setExpertise(JSON.parse(prof.mentorshipExpertise));
        } catch (e) {
          console.error("Failed to parse mentorshipExpertise:", e);
          setExpertise([]);
        }
      } else {
        setExpertise([]);
      }
    } catch (err) {
      console.error(err);
      setRequests([]);
      setSlots([]);
      setAnalytics(null);
      setProfile(null);
      setExpertise([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string, additionalData: any = {}) => {
    try {
      await updateMentorshipRequest(id, status, additionalData);
      loadData();
      setShowMeetModal(null);
      setMeetLink('');
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAddSlot = async () => {
    try {
      await addMentorshipSlot(newSlot);
      loadData();
    } catch (err) {
      alert("Failed to add slot");
    }
  };

  const handleDeleteSlot = async (id: number) => {
    try {
      await deleteMentorshipSlot(id);
      loadData();
    } catch (err) {
      alert("Failed to delete slot");
    }
  };

  const handleUpdateExpertise = async () => {
    try {
      await updateAlumniExpertise(expertise);
      alert("Expertise updated!");
    } catch (err) {
      alert("Failed to update expertise");
    }
  };

  const addExpertiseTag = () => {
    if (newExpertise && !expertise.includes(newExpertise)) {
      setExpertise([...expertise, newExpertise]);
      setNewExpertise('');
    }
  };

  const removeExpertiseTag = (tag: string) => {
    setExpertise(expertise.filter(e => e !== tag));
  };

  const tabs = [
    { id: 'requests', label: 'Sessions', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'schedule', label: 'Availability', icon: <Calendar className="w-4 h-4" /> },
    { id: 'expertise', label: 'Expertise', icon: <Target className="w-4 h-4" /> },
    { id: 'analytics', label: 'Impact', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-20">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Certified Mentor
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Award className="w-3 h-3" /> {analytics?.xp > 500 ? 'Top Mentor' : 'Rising Guide'}
              </span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase">
              Mentorship <span className="text-indigo-600">Hub</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2 max-w-lg">Manage your sessions, set availability, and track your impact on the student community.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Sessions', value: analytics?.totalSessions || 0, icon: <Layout />, color: 'blue' },
            { label: 'Students Mentored', value: analytics?.studentsMentored || 0, icon: <Users />, color: 'purple' },
            { label: 'Impact Score', value: analytics?.impactScore || 0, icon: <TrendingUp />, color: 'green' },
            { label: 'Avg. Rating', value: analytics?.rating?.toFixed(1) || '0.0', icon: <Star />, color: 'amber' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'requests' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Upcoming & Pending Sessions</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full">
                    <Clock className="w-4 h-4" /> {requests.filter((r: any) => r.status === 'pending').length} Actions Required
                  </div>
                </div>

                <div className="space-y-6">
                  {requests.map((req: any) => (
                    <div key={req.id} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 group hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all relative overflow-hidden">
                      {req.status === 'completed' && <div className="absolute top-0 right-0 bg-green-500 text-white px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest">Completed</div>}
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-white text-indigo-600 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {req.student.user.profilePhoto ? (
                              <img src={getFileUrl(req.student.user.profilePhoto) || ''} className="w-full h-full object-cover rounded-[1.5rem]" />
                            ) : (req.student.user.name[0])}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-xl leading-tight mb-1">{req.student.user.name}</h4>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-white px-2 py-1 rounded-md border border-slate-100">{req.student.department}</span>
                              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Year {req.student.currentYear}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            req.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                            req.status === 'accepted' ? 'bg-indigo-100 text-indigo-600' :
                            req.status === 'completed' ? 'bg-green-100 text-green-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="p-6 bg-white rounded-3xl border border-slate-100">
                          <div className="flex items-center gap-3 mb-4">
                            <Target className="w-4 h-4 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Session Type</span>
                          </div>
                          <p className="text-slate-900 font-black text-lg">{req.sessionType || 'Career Guidance'}</p>
                          <p className="text-slate-500 text-sm mt-2 leading-relaxed">"{req.message || 'No additional message'}"</p>
                        </div>
                        <div className="p-6 bg-white rounded-3xl border border-slate-100">
                          <div className="flex items-center gap-3 mb-4">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scheduled Time</span>
                          </div>
                          <p className="text-slate-900 font-black text-lg">
                            {req.scheduledAt ? new Date(req.scheduledAt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Flexible'}
                          </p>
                          <p className="text-indigo-600 font-black text-sm mt-1">
                            {req.scheduledAt ? new Date(req.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Anytime'}
                          </p>
                        </div>
                      </div>

                      {req.meetingLink && (
                        <div className="mb-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Video className="w-5 h-5 text-indigo-600" />
                            <div>
                              <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{req.meetingPlatform || 'Google Meet'}</p>
                              <p className="text-xs font-bold text-slate-700 truncate max-w-xs">{req.meetingLink}</p>
                            </div>
                          </div>
                          <a href={req.meetingLink} target="_blank" className="p-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}

                      <div className="flex gap-4">
                        {req.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => setShowMeetModal(req)}
                              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-200"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve Session
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(req.id, 'rejected')}
                              className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-red-100 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                            >
                              <XCircle className="w-4 h-4" /> Decline
                            </button>
                          </>
                        )}
                        {req.status === 'accepted' && (
                          <button 
                            onClick={() => handleStatusUpdate(req.id, 'completed')}
                            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Mark as Completed
                          </button>
                        )}
                        {req.status === 'completed' && req.rating && (
                          <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < req.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                            <p className="text-xs font-medium text-slate-600 italic">"{req.review || 'No review'}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {requests.length === 0 && !loading && (
                    <div className="py-24 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-6">
                        <MessageSquare className="w-10 h-10" />
                      </div>
                      <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">No Active Sessions</p>
                      <p className="text-slate-500 font-medium mt-2">When students request mentorship, they will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-10"
            >
              <div className="lg:col-span-1">
                <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white sticky top-10">
                  <h3 className="text-2xl font-black mb-10 flex items-center gap-3 uppercase tracking-tight">
                    <Calendar className="w-8 h-8 text-indigo-400" /> Availability
                  </h3>
                  
                  <div className="space-y-8 mb-10">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3">Target Day</label>
                      <select 
                        value={newSlot.dayOfWeek}
                        onChange={(e) => setNewSlot({...newSlot, dayOfWeek: e.target.value})}
                        className="w-full p-5 bg-white/5 border border-white/10 rounded-[1.5rem] outline-none focus:border-indigo-600 font-black transition-all text-white appearance-none"
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} className="text-slate-900 font-bold">{d}</option>)}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3">From</label>
                        <input 
                          type="time" 
                          value={newSlot.startTime}
                          onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                          className="w-full p-5 bg-white/5 border border-white/10 rounded-[1.5rem] outline-none focus:border-indigo-600 font-black transition-all text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3">To</label>
                        <input 
                          type="time" 
                          value={newSlot.endTime}
                          onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                          className="w-full p-5 bg-white/5 border border-white/10 rounded-[1.5rem] outline-none focus:border-indigo-600 font-black transition-all text-white"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleAddSlot}
                      className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/40"
                    >
                      <Plus className="w-5 h-5" /> Add Time Slot
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm min-h-[600px]">
                  <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight uppercase">Current Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {slots.map((slot: any) => (
                      <div key={slot.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group/slot hover:bg-white hover:shadow-xl transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{slot.dayOfWeek}</p>
                            <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{slot.startTime} - {slot.endTime}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {slots.length === 0 && (
                      <div className="col-span-2 py-32 text-center">
                         <Calendar className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                         <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No Active Slots</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'expertise' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm">
                <div className="mb-12">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-4">Define Your Expertise</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">Select the areas where you can provide the most value. This helps students find the right mentor for their goals.</p>
                </div>

                <div className="space-y-12">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-6">Your Expertise Areas</label>
                    <div className="flex flex-wrap gap-3 mb-8">
                      {expertise.map(tag => (
                        <span key={tag} className="flex items-center gap-2 px-5 py-3 bg-indigo-50 text-indigo-600 rounded-[1.2rem] text-xs font-black uppercase tracking-widest group">
                          {tag}
                          <button onClick={() => removeExpertiseTag(tag)} className="hover:text-red-500"><XCircle className="w-4 h-4" /></button>
                        </span>
                      ))}
                      {expertise.length === 0 && <p className="text-slate-400 text-xs italic">No tags added yet...</p>}
                    </div>
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="e.g. AI/ML, Resume Review, Full Stack..."
                        className="flex-1 p-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold"
                        value={newExpertise}
                        onChange={(e) => setNewExpertise(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addExpertiseTag()}
                      />
                      <button 
                        onClick={addExpertiseTag}
                        className="p-5 bg-slate-900 text-white rounded-[1.5rem] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <button 
                      onClick={handleUpdateExpertise}
                      className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Save Expertise Profile
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                  <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight uppercase">Mentorship Success Timeline</h3>
                  <div className="h-64 flex items-center justify-center text-slate-300 font-medium italic border-2 border-dashed border-slate-50 rounded-[2rem]">
                    <TrendingUp className="w-8 h-8 mr-4" /> Analytics visualization coming soon...
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tight">
                      <Award className="w-8 h-8 text-indigo-400" /> Achievements
                    </h3>
                    <div className="space-y-6">
                      {[
                        { name: 'Top Mentor', date: 'May 2026', icon: <Star className="text-amber-400" /> },
                        { name: 'Industry Expert', date: 'Apr 2026', icon: <ShieldCheck className="text-indigo-400" /> },
                        { name: 'Quick Responder', date: 'Mar 2026', icon: <Zap className="text-purple-400" /> },
                      ].map((badge, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            {badge.icon}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest">{badge.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold">Earned {badge.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meeting Link Modal */}
        {showMeetModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[4rem] p-12 max-w-xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-4">Accept Session</h3>
              <p className="text-slate-500 font-medium mb-8">Share a meeting link (Google Meet, Zoom, etc.) to confirm the session with the student.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 px-2">Meeting URL</label>
                  <div className="relative group">
                    <Video className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="url" 
                      placeholder="https://meet.google.com/..."
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold"
                      value={meetLink}
                      onChange={(e) => setMeetLink(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleStatusUpdate(showMeetModal.id, 'accepted', { meetingLink: meetLink, meetingPlatform: 'Online' })}
                    className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-indigo-200 transition-all"
                  >
                    Confirm Session
                  </button>
                  <button 
                    onClick={() => setShowMeetModal(null)}
                    className="px-8 py-5 bg-slate-50 text-slate-500 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
