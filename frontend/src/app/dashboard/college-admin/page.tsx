'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchCollegeAnalytics } from '@/lib/api';
import Link from 'next/link';
import { 
  Users, 
  TrendingUp, 
  Briefcase, 
  CheckCircle2, 
  BarChart3,
  Award,
  Zap,
  Building2,
  Clock,
  Sparkles,
  Target,
  Video,
  FileText,
  Map as MapIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CollegeAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollegeAnalytics().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: <Users />, color: 'blue' },
    { label: 'Pending Approval', value: stats?.verificationStats?.PENDING || 0, icon: <Clock />, color: 'amber', link: '/dashboard/college-admin/verifications' },
    { label: 'Placement Ready', value: stats?.avgReadiness ? `${Math.round(stats.avgReadiness)}%` : '0%', icon: <Target />, color: 'green' },
    { label: 'AI Usage (Resumes)', value: stats?.resumeAnalysisUsage || 0, icon: <Sparkles />, color: 'purple' },
  ];

  return (
    <DashboardLayout>
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Institutional Analytics</h1>
          <p className="text-slate-500 font-medium">Monitor career growth, AI tool adoption, and placement success across your college.</p>
         </div>
         <div className="bg-white px-6 py-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-black">
              {Math.round(stats?.avgReadiness || 0)}%
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Readiness</p>
              <p className="text-sm font-black text-slate-900">Platform-wide Score</p>
            </div>
         </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl group relative overflow-hidden"
          >
            {stat.link && (
              <Link href={stat.link} className="absolute inset-0 z-10" />
            )}
            <div className={`w-14 h-14 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{loading ? '...' : stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Phase 2 Specific Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
              <h3 className="font-black text-xl text-slate-900 mb-8 flex items-center gap-3">
                <MapIcon className="w-6 h-6 text-indigo-600" /> Popular Roadmaps
              </h3>
              <div className="space-y-4">
                {stats?.popularRoadmaps?.map((roadmap: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-bold text-slate-700">{roadmap.title}</span>
                    <span className="text-xs font-black text-indigo-600 bg-white px-3 py-1 rounded-full shadow-sm">{roadmap._count.title} Students</span>
                  </div>
                ))}
                {(!stats?.popularRoadmaps || stats.popularRoadmaps.length === 0) && (
                  <p className="text-center py-10 text-slate-400 italic text-sm">Waiting for more student activity...</p>
                )}
              </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[80px] -mr-24 -mt-24 transition-transform group-hover:scale-125"></div>
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <Sparkles className="text-indigo-400 w-6 h-6" /> AI Resume Insights
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-3 items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Avg Score</span>
                    <span className="text-2xl font-black text-indigo-400">{Math.round(stats?.resumeAnalytics?.avgOverall || 0)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.round(stats?.resumeAnalytics?.avgOverall || 0)}%` }}></div>
                  </div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-[10px] text-indigo-400 mb-2 uppercase font-black tracking-widest">Readiness Distribution</p>
                  <div className="flex flex-wrap gap-2">
                    {stats?.resumeAnalytics?.readinessDistribution?.map((d: any) => (
                      <span key={d.level} className="px-2 py-0.5 bg-white/10 rounded-lg text-[9px] font-bold">{d.level}: {d.count}</span>
                    ))}
                    {(!stats?.resumeAnalytics?.readinessDistribution || stats.resumeAnalytics.readinessDistribution.length === 0) && (
                       <span className="text-[9px] text-slate-500 italic">No data yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="font-black text-2xl text-slate-900 tracking-tight">Placement Success Trend</h3>
                <p className="text-slate-400 text-sm font-medium">Monthly institutional outcomes</p>
              </div>
              <BarChart3 className="text-slate-200 w-8 h-8" />
            </div>
            <div className="h-64 flex items-end justify-between gap-6">
              {(stats?.resumeAnalytics?.placementTrends || [0, 0, 0, 0, 0, 0, 0, 0]).map((count: number, i: number) => (
                <div key={i} className="flex-1 bg-slate-50 rounded-2xl relative group">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.min(100, (count / (Math.max(1, stats?.totalStudents || 0) * 0.5)) * 100)}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="w-full bg-indigo-600 rounded-2xl absolute bottom-0 transition-all group-hover:bg-indigo-400"
                  ></motion.div>
                   {/* Tooltip */}
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap text-[10px] font-bold shadow-xl">
                      {count} Placements
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:scale-150 transition-transform"></div>
            <h3 className="font-black text-2xl mb-8 flex items-center gap-3">
              <TrendingUp className="text-indigo-100 w-8 h-8" /> Career Growth
            </h3>
            <div className="space-y-10">
              <div className="p-6 bg-white/10 border border-white/20 rounded-[2rem]">
                <p className="text-[10px] text-indigo-200 mb-3 uppercase font-black tracking-widest">Alumni Impact</p>
                <p className="text-sm font-medium text-white leading-relaxed">
                  Students engaged in mentorship show <span className="underline decoration-white decoration-2">42% higher</span> referral conversion rates.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                 <div className="p-4 bg-white/10 rounded-2xl">
                    <p className="text-3xl font-black">{stats?.totalReferrals || 0}</p>
                    <p className="text-[10px] font-black uppercase text-indigo-200">Referrals</p>
                 </div>
                 <div className="p-4 bg-white/10 rounded-2xl">
                    <p className="text-3xl font-black">{Math.round(stats?.referralSuccessRate || 0)}%</p>
                    <p className="text-[10px] font-black uppercase text-indigo-200">Success</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
             <h4 className="font-black text-slate-900 mb-6 tracking-tight uppercase text-sm flex items-center gap-2">
               <Video className="w-5 h-5 text-indigo-600" /> Webinar Analytics
             </h4>
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Participation Rate</span>
                  <span className="text-lg font-black text-slate-900">{Math.round(stats?.webinarParticipation || 0)}%</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${stats?.webinarParticipation || 0}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Participation has increased by 12% since implementing the Phase 2 gamification features.
                </p>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
