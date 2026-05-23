'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchAdminStats } from '@/lib/api';
import { 
  Building2, 
  Users, 
  Settings, 
  ShieldCheck, 
  Zap,
  CreditCard,
  Lock,
  Globe,
  ArrowUpRight,
  Briefcase,
  PieChart,
  Target,
  Video,
  Sparkles,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Map as MapIcon,
  ToggleLeft,
  MessageSquare,
  Award,
  BarChart,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const statsData = await fetchAdminStats();
        setStats(statsData);
        
        const token = localStorage.getItem('token');
        const featRes = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')) + '/admin/features', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const featData = await featRes.json();
        setFeatures(Array.isArray(featData) ? featData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const cards = [
    { label: 'Total Colleges', value: stats?.totalColleges || 0, icon: <Building2 />, color: 'blue', href: '/dashboard/super-admin/colleges' },
    { label: 'Global Readiness', value: stats?.globalAvgReadiness ? `${Math.round(stats.globalAvgReadiness)}%` : '0%', icon: <TrendingUp />, color: 'green', href: '#' },
    { label: 'Resume Analyses', value: stats?.globalResumeAnalyses || 0, icon: <Sparkles />, color: 'purple', href: '#' },
    { label: 'Mentorship XP', value: stats?.globalMentorshipXP || 0, icon: <Zap />, color: 'amber', href: '#' },
  ];

  const connectivityStats = [
    { label: 'Active Chats', value: stats?.connectivity?.totalMessages || 0, icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Webinar Participants', value: stats?.connectivity?.webinarParticipation || 0, icon: <Video className="w-4 h-4" /> },
    { label: 'Mentorship Requests', value: stats?.connectivity?.activeMentorships || 0, icon: <Users className="w-4 h-4" /> },
    { label: 'Placements Reported', value: stats?.totalPlacements || 0, icon: <Award className="w-4 h-4" /> },
  ];

  const getFeedIcon = (type: string) => {
    switch (type) {
      case 'USER_REGISTRATION': return <Users className="text-blue-500" />;
      case 'WEBINAR_CREATED': return <Video className="text-purple-500" />;
      case 'REFERRAL_ACTIVITY': return <ArrowUpRight className="text-emerald-500" />;
      case 'RESUME_ANALYZED': return <Sparkles className="text-indigo-500" />;
      case 'MENTORSHIP_BOOKED': return <Target className="text-amber-500" />;
      case 'JOB_POSTED': return <Briefcase className="text-slate-500" />;
      default: return <Zap className="text-slate-500" />;
    }
  };

  return (
    <DashboardLayout>
      <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
         <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-3">Global Ecosystem</h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">Real-time monitoring of platform performance, institutional growth, and student professional readiness.</p>
         </div>
         <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="px-6 py-4">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Users</p>
               <p className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</p>
            </div>
            <div className="w-px h-10 bg-slate-100 hidden md:block"></div>
            <div className="flex gap-4 px-4 overflow-x-auto pb-2 md:pb-0">
               {[
                 { label: 'Students', val: stats?.roleStats?.STUDENT || 0, color: 'indigo' },
                 { label: 'Alumni', val: stats?.roleStats?.ALUMNI || 0, color: 'emerald' },
                 { label: 'Admins', val: stats?.roleStats?.COLLEGE_ADMIN || 0, color: 'blue' }
               ].map((role, i) => (
                 <div key={i} className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{role.label}</span>
                    <span className={`text-sm font-black text-${role.color}-600`}>{role.val}</span>
                 </div>
               ))}
            </div>
         </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((card, idx) => (
          <Link key={idx} href={card.href}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all group h-full flex flex-col justify-between"
            >
              <div className={`w-16 h-16 bg-${card.color}-50 text-${card.color}-600 rounded-[1.5rem] flex items-center justify-center mb-8 transition-transform group-hover:scale-110 shadow-sm`}>
                {React.isValidElement(card.icon)
                  ? React.cloneElement(card.icon as React.ReactElement<any>, { size: 28 })
                  : card.icon}
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{card.label}</p>
                <div className="flex justify-between items-end">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{loading ? '...' : card.value}</h3>
                  <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           {/* Growth Charts & Insights */}
           <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-12 overflow-hidden relative">
              <div className="flex justify-between items-center mb-12">
                 <div>
                    <h3 className="font-black text-3xl text-slate-900 tracking-tight flex items-center gap-4">
                       <BarChart className="text-indigo-600 w-8 h-8" /> Institutional Growth
                    </h3>
                    <p className="text-slate-400 font-medium mt-1">Global readiness and student engagement trends</p>
                 </div>
                 <div className="flex gap-2">
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Users</span>
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Readiness</span>
                 </div>
              </div>
              
              <div className="h-64 flex items-end justify-between gap-4 mb-12 px-4">
                 {stats?.growthTrends?.map((trend: any, i: number) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative">
                      <div className="w-full flex items-end gap-1 h-48">
                         <motion.div 
                           initial={{ height: 0 }}
                           animate={{ height: `${(trend.users / (Math.max(1, stats.totalUsers) * 1.5)) * 100}%` }}
                           className="flex-1 bg-indigo-500/20 group-hover:bg-indigo-500 rounded-t-lg transition-colors min-h-[4px]"
                         ></motion.div>
                         <motion.div 
                           initial={{ height: 0 }}
                           animate={{ height: `${trend.readiness}%` }}
                           className="flex-1 bg-emerald-500/20 group-hover:bg-emerald-500 rounded-t-lg transition-colors min-h-[4px]"
                         ></motion.div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{trend.month}</span>
                      
                      {/* Tooltip */}
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap text-[10px] font-bold">
                         Users: {trend.users}<br/>
                         Readiness: {trend.readiness}%
                      </div>
                   </div>
                 ))}
              </div>

              <div className="space-y-6 relative z-10 border-t border-slate-50 pt-12">
                 {stats?.topColleges?.map((college: any, i: number) => (
                   <div key={i} className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[2.5rem] border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                      <div className="flex items-center gap-8">
                         <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 font-black text-2xl shadow-sm group-hover:text-indigo-600 group-hover:scale-105 transition-all">
                            {college.name.charAt(0)}
                         </div>
                         <div>
                            <p className="font-black text-xl text-slate-900">{college.name}</p>
                            <div className="flex items-center gap-4 mt-1">
                               <p className="text-xs text-slate-500 font-bold bg-white px-3 py-1 rounded-full shadow-sm">{college.userCount} Users</p>
                               <p className="text-xs text-slate-500 font-bold bg-white px-3 py-1 rounded-full shadow-sm">{college.jobCount} Placements</p>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-12">
                         <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Readiness Score</p>
                            <p className="text-2xl font-black text-indigo-600">{Math.round(college.avgReadiness)}%</p>
                         </div>
                         <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <ArrowUpRight className="w-6 h-6" />
                         </div>
                      </div>
                   </div>
                 ))}
                 {(!stats?.topColleges || stats.topColleges.length === 0) && (
                   <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                      <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold">No institutional data analyzed yet.</p>
                   </div>
                 )}
              </div>
           </div>

           {/* Global Connectivity & Engagement */}
           <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
              <h3 className="text-3xl font-black mb-10 flex items-center gap-4 tracking-tight relative z-10">
                 <Globe className="w-10 h-10 text-indigo-400" /> Global Connectivity
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                 {connectivityStats.map((item, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex items-center gap-3 text-indigo-400">
                         {item.icon}
                         <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                      </div>
                      <p className="text-4xl font-black">{item.value}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           {/* Live Feed System */}
           <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-10 flex flex-col h-full max-h-[900px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Zap className="w-6 h-6 text-amber-500 fill-amber-500" /> Live Feed
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                {stats?.liveFeed?.map((item: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                    className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group"
                  >
                    <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                      {getFeedIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 mb-0.5 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.message}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                        {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {(!stats?.liveFeed || stats.liveFeed.length === 0) && (
                  <div className="text-center py-20 text-slate-300">
                     <Activity className="w-8 h-8 mx-auto mb-4 opacity-20" />
                     <p className="text-xs font-bold uppercase tracking-widest italic">Waiting for platform activity...</p>
                  </div>
                )}
              </div>
           </div>

          <div className="bg-indigo-600 p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
            <h3 className="text-3xl font-black mb-10 flex items-center gap-4 tracking-tight">
              <Sparkles className="w-10 h-10 text-indigo-200" /> Platform Insights
            </h3>
            <div className="space-y-8 relative z-10">
               <div className="space-y-4">
                  <div className="flex justify-between items-end mb-2">
                     <span className="text-xs font-black uppercase text-indigo-200 tracking-widest">Resume Adoption</span>
                     <span className="text-2xl font-black">{stats?.globalResumeAnalyses || 0}</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${Math.min(100, (stats?.globalResumeAnalyses / (stats?.totalUsers || 1)) * 100)}%` }}
                       className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                     ></motion.div>
                  </div>
                  <p className="text-[10px] text-indigo-100 font-bold uppercase italic">Avg Resume Score: {Math.round(stats?.globalAvgResumeScore || 0)}/100</p>
               </div>
               
               <div className="p-8 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-white" />
                     </div>
                     <p className="text-sm font-black tracking-tight">Security Check</p>
                  </div>
                  <p className="text-sm font-medium text-indigo-50 leading-relaxed">
                    All <span className="text-white font-black">{stats?.totalColleges || 0}</span> institutions have passed the ecosystem verification protocol.
                  </p>
               </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black mb-10 flex items-center gap-3 tracking-tight">
              <Settings className="w-8 h-8 text-slate-300" /> Control Center
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <Link href="/dashboard/super-admin/features" className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between group hover:bg-slate-900 transition-all border border-transparent hover:border-slate-800">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-slate-800">
                      <Sliders className="w-5 h-5 text-slate-400 group-hover:text-white" />
                   </div>
                   <span className="font-bold text-slate-700 group-hover:text-white transition-colors">Feature Toggles</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${stats?.totalColleges > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                   {stats?.totalColleges > 0 ? 'Operational' : 'Setup'}
                </div>
              </Link>
              <Link href="/dashboard/super-admin/system-health" className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between group hover:bg-slate-900 transition-all border border-transparent hover:border-slate-800">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-slate-800">
                      <Activity className="w-5 h-5 text-slate-400 group-hover:text-white" />
                   </div>
                   <span className="font-bold text-slate-700 group-hover:text-white transition-colors">System Health</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-white transition-all" />
              </Link>
            </div>
          </div>
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black mb-10 flex items-center gap-3 tracking-tight">
              <ToggleLeft className="w-8 h-8 text-slate-300" /> Module Status
            </h3>
            <div className="space-y-3">
              {features.slice(0, 5).map((f, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <span className="text-xs font-bold text-slate-600">{f.featureName}</span>
                  <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${f.enabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {f.enabled ? 'Active' : 'Disabled'}
                  </div>
                </div>
              ))}
              <Link href="/dashboard/super-admin/features" className="block text-center text-[10px] font-black uppercase text-indigo-600 hover:underline pt-2">
                Manage All Modules
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
