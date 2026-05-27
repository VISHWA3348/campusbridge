'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchStudentReferrals, fetchAllJobs, fetchAvailableWebinars, fetchStudentNotifications, fetchRecommendations, fetchStudentProfile, fetchPlacementReadiness, fetchDashboardInsights, sendChatMessage } from '@/lib/api';
import {
  Zap,
  Briefcase,
  Video,
  Bell,
  Users,
  ArrowRight,
  Sparkles,
  Target,
  Trophy,
  CheckCircle2,
  Crown,
  FileText,
  TrendingUp,
  Award,
  Map as MapIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import AnnouncementsView from '@/components/AnnouncementsView';

export default function StudentDashboard() {
  const [data, setData] = useState<any>({
    referrals: [],
    jobs: [],
    webinars: [],
    notifications: [],
    suggestedAlumni: [],
    profile: null,
    readiness: null,
    aiSuggestions: []
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [sendingChat, setSendingChat] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [r, j, w, n, a, p, tracker, insights] = await Promise.all([
          fetchStudentReferrals().catch(() => []),
          fetchAllJobs().catch(() => []),
          fetchAvailableWebinars().catch(() => []),
          fetchStudentNotifications().catch(() => []),
          fetchRecommendations().catch(() => []),
          fetchStudentProfile().catch(() => null),
          fetchPlacementReadiness().catch(() => null),
          fetchDashboardInsights().catch(() => ({ suggestions: [] }))
        ]);
        setData({
          referrals: Array.isArray(r) ? r : [],
          jobs: Array.isArray(j) ? j : [],
          webinars: Array.isArray(w) ? w : [],
          notifications: Array.isArray(n) ? n : [],
          suggestedAlumni: Array.isArray(a) ? a : [],
          profile: p,
          readiness: tracker,
          aiSuggestions: insights.suggestions || []
        });
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = [
    { label: 'Referrals', value: `${data.referrals.filter((r: any) => r.status === 'accepted').length} Accepted`, icon: <Target />, color: 'amber', href: '/dashboard/student/referrals' },
    { label: 'Opportunities', value: `${data.jobs.length} Active`, icon: <Briefcase />, color: 'blue', href: '/dashboard/student/jobs' },
    { label: 'Gamification', value: '450 XP', icon: <Trophy />, color: 'purple', href: '/dashboard/student/leaderboard' },
    { label: 'Readiness', value: `${data.readiness?.readinessScore || 0}%`, icon: <TrendingUp />, color: 'green', href: '/dashboard/student/placement-tracker' },
  ];

  return (
    <DashboardLayout>
      {/* Welcome & Readiness Header */}
      <div className="flex flex-col lg:flex-row gap-8 mb-10">
        <div className="flex-1 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="w-24 h-24 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center font-black text-4xl shadow-xl relative z-10">
            {data.profile?.name?.[0]}
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hi {data.profile?.name?.split(' ')?.[0] || 'Student'}!</h1>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Crown className="w-3 h-3" /> {data.readiness?.level || 'BEGINNER'}
              </span>
            </div>
            <p className="text-slate-500 font-medium mt-1">Your career ecosystem is ready for action.</p>
          </div>
        </div>

        <Link href="/dashboard/student/placement-tracker" className="lg:w-96 bg-slate-900 p-8 rounded-[3rem] text-white group hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Placement Readiness</h4>
            <span className="text-xl font-black text-indigo-400">{data.readiness?.readinessScore || 0}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
              style={{ width: `${data.readiness?.readinessScore || 0}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Next Step: {(Array.isArray(data.readiness?.suggestions) && data.readiness.suggestions[0]) ? data.readiness.suggestions[0].substring(0, 20) : 'Complete your profile'}...</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <Link key={idx} href={stat.href}>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group">
              <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                {stat.icon}
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{loading ? '...' : stat.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Announcements & AI Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2">
          <AnnouncementsView role="STUDENT" />
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden h-full">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
           <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight text-sm mb-8 relative z-10">
             <Sparkles className="w-5 h-5 text-amber-500" /> SMART AI INSIGHTS
           </h3>
           <div className="space-y-6 relative z-10">
             {data.aiSuggestions.map((s: string, i: number) => (
               <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-amber-200 transition-all cursor-pointer group">
                 <div className="w-8 h-8 bg-white text-amber-600 rounded-xl flex items-center justify-center shrink-0 font-black text-[10px] shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-all">
                   {i+1}
                 </div>
                 <p className="text-xs font-bold text-slate-700 leading-relaxed">{s}</p>
               </div>
             ))}
             {data.aiSuggestions.length === 0 && !loading && (
               <p className="text-slate-400 text-xs italic font-medium py-10 text-center">Thinking of new suggestions for you...</p>
             )}
           </div>
           <Link href="/dashboard/student/placement-tracker" className="mt-10 block w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-indigo-600 transition-all">
             Full Analysis Report
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main AI Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">AI RESUME ANALYZER</h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed text-sm">Upload your resume and get an instant ATS score with improvement suggestions.</p>
              <Link href="/dashboard/student/resume-analyzer" className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">
                Start Analysis <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm group hover:border-purple-200 transition-all">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <MapIcon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">AI CAREER ROADMAP</h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed text-sm">Follow a step-by-step verified path to reach your dream career goals.</p>
              <Link href="/dashboard/student/career-roadmap" className="inline-flex items-center gap-2 text-xs font-black text-purple-600 uppercase tracking-widest hover:underline">
                View Roadmaps <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Smart Matching */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-black text-2xl text-slate-900 flex items-center gap-3 tracking-tight">
                <Users className="w-8 h-8 text-indigo-500" /> RECOMMENDED ALUMNI
              </h3>
              <Link href="/dashboard/student/alumni-search" className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.suggestedAlumni.slice(0, 3).map((a: any) => (
                <div key={a.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all group">
                  <div className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {a.user?.name ? a.user.name[0] : '?'}
                  </div>
                  <h4 className="font-black text-slate-900 text-sm mb-1">{a.user?.name || 'Alumni'}</h4>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-6 truncate">{a.currentCompany || 'Alumni'}</p>
                  <Link href="/dashboard/student/mentorship" className="block w-full py-3 bg-white border-2 border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                    Book
                  </Link>
                </div>
              ))}
              {data.suggestedAlumni.length === 0 && !loading && (
                <div className="col-span-3 py-10 text-center text-slate-400 italic font-medium">Updating recommendations...</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Next Goal Widget */}
          <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-200">
            <h3 className="font-black text-xl mb-4 uppercase tracking-tight">Next Goal</h3>
            <div className="bg-white/10 p-6 rounded-2xl border border-white/10 mb-6">
              <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-2">Ongoing Roadmap</p>
              <h4 className="text-lg font-black">{data.readiness?.level === 'BEGINNER' ? 'Python Foundations' : 'Interview Preparation'}</h4>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="text-xs font-black">45%</span>
              </div>
            </div>
            <Link href="/dashboard/student/career-roadmap" className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest hover:translate-x-2 transition-transform">
              Resume Journey <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight text-sm">
                <Bell className="w-5 h-5 text-indigo-600" /> ACTIVITY FEED
              </h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {data.notifications.map((n: any) => (
                <div key={n.id} className={`p-6 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                  <p className="text-xs text-slate-700 font-bold leading-snug mb-2">{n.message}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()}</p>
                    {!n.read && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}
                  </div>
                </div>
              ))}
              {data.notifications.length === 0 && !loading && (
                <div className="p-12 text-center text-slate-400 text-xs italic font-medium">All caught up!</div>
              )}
            </div>
          </div>
        </div>
    </div>

      {/* AI Chat Assistant Floating Widget */}
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
              style={{ height: '500px' }}
            >
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-widest">CampusBridge AI</h4>
                    <p className="text-[8px] text-indigo-400 font-black uppercase tracking-[0.2em]">Always Online</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                <div className="bg-slate-50 p-4 rounded-2xl text-xs font-medium text-slate-700">
                  Hi {data.profile?.name?.split(' ')?.[0] || 'Student'}! I'm your AI career assistant. How can I help you today?
                </div>
                {chatHistory.map((chat, i) => (
                  <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium ${
                      chat.role === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-50 text-slate-700'
                    }`}>
                      {chat.content}
                    </div>
                  </div>
                ))}
                {sendingChat && <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest animate-pulse">AI is typing...</div>}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask anything..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={handleSendChat}
                  disabled={sendingChat || !chatMessage.trim()}
                  className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-all disabled:opacity-50"
                >
                  <ArrowRight className="w-5 h-5 -rotate-45" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatOpen(!chatOpen)}
          className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] shadow-2xl flex items-center justify-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Sparkles className="w-8 h-8 relative z-10" />
        </motion.button>
      </div>
    </DashboardLayout>
  );

  async function handleSendChat() {
    if (!chatMessage.trim() || sendingChat) return;
    
    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setSendingChat(true);

    try {
      const result = await sendChatMessage(chatMessage, chatHistory);
      setChatHistory(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setSendingChat(false);
    }
  }
}
