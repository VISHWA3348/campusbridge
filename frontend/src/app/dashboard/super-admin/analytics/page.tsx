'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart, Users, Building2, TrendingUp, PieChart, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/analytics/overview', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Global Platform Analytics</h1>
        <p className="text-slate-500 font-medium">Monitoring growth and engagement across all institutions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: <Users />, color: 'blue' },
          { label: 'Active (30d)', value: stats.activeUsers, icon: <TrendingUp />, color: 'green' },
          { label: 'Active Codes', value: stats.inviteStats?.active || 0, icon: <ShieldCheck />, color: 'indigo' },
          { label: 'Total Uses', value: stats.inviteStats?.used || 0, icon: <Users />, color: 'purple' },
        ].map((s: any, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:border-indigo-200">
            <div className={`w-12 h-12 bg-${s.color}-50 text-${s.color}-600 rounded-2xl flex items-center justify-center mb-4`}>
              {s.icon}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-3xl font-black text-slate-900">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Verification Status Distribution */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm col-span-1">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-8">
            <PieChart className="w-6 h-6 text-indigo-600" /> Verification Status
          </h3>
          <div className="space-y-6">
            {stats.verificationStats?.map((s: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{s.status}</span>
                  <span className="text-sm font-black text-slate-900">{s.count}</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${s.status === 'APPROVED' ? 'bg-emerald-500' : s.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'} rounded-full`} 
                    style={{ width: `${(s.count / stats.totalUsers) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Distribution by College */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BarChart className="w-6 h-6 text-indigo-600" /> Top Institutions by Growth
            </h3>
          </div>
          <div className="space-y-6">
            {stats.topColleges?.map((college: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">{college.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">{college._count.users} Users</span>
                    <span className="text-sm font-black text-indigo-600">{Math.round((college._count.users / stats.totalUsers) * 100)}%</span>
                  </div>
                </div>
                <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${(college._count.users / stats.totalUsers) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <h3 className="text-xl font-black mb-8 flex items-center gap-2 uppercase tracking-tighter">
            <TrendingUp className="w-6 h-6 text-indigo-400" /> Platform Vitality
          </h3>
          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem]">
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Growth Score</p>
               <h4 className="text-4xl font-black">+{Math.round((stats.activeUsers / stats.totalUsers) * 100)}%</h4>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem]">
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Active Codes</p>
               <h4 className="text-4xl font-black">{stats.inviteStats?.active || 0}</h4>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed font-medium mt-8 italic">
            "Institutional engagement is up by {Math.round((stats.activeUsers / stats.totalUsers) * 10) / 10}% this week. {stats.topColleges?.[0]?.name} remains the fastest growing ecosystem."
          </p>
        </div>

        <div className="bg-indigo-600 p-10 rounded-[3.5rem] text-white flex flex-col justify-between">
           <div>
              <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">Invite System Health</h3>
              <p className="text-indigo-100 text-sm font-medium opacity-80">Monitoring code usage and expiry patterns.</p>
           </div>
           <div className="flex items-end justify-between gap-4 mt-8">
              <div className="flex-1">
                 <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                    <span>Usage Efficiency</span>
                    <span>{Math.round((stats.inviteStats?.used / (stats.inviteStats?.total * 10 || 1)) * 100)}%</span>
                 </div>
                 <div className="h-2 bg-indigo-400 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '65%' }}></div>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black uppercase opacity-60">Total Generated</p>
                 <p className="text-3xl font-black">{stats.inviteStats?.total || 0}</p>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


