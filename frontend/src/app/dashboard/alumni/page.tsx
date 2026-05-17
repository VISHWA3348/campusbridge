'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchAlumniReferrals, fetchAlumniJobs, fetchGamification, fetchLeaderboard } from '@/lib/api';
import {
  Award,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Users,
  CheckCircle2,
  Trophy,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import AnnouncementsView from '@/components/AnnouncementsView';

export default function AlumniDashboard() {
  const [stats, setStats] = useState({
    pendingReferrals: 0,
    acceptedReferrals: 0,
    jobsPosted: 0,
    points: 0,
    rank: 1
  });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [referrals, jobs, game, board] = await Promise.all([
        fetchAlumniReferrals(),
        fetchAlumniJobs(),
        fetchGamification(),
        fetchLeaderboard()
      ]);

      const safeReferrals = Array.isArray(referrals) ? referrals : [];
      const safeJobs = Array.isArray(jobs) ? jobs : [];
      const safeBoard = Array.isArray(board) ? board : [];

      setStats({
        pendingReferrals: safeReferrals.filter((r: any) => r.status === 'pending').length,
        acceptedReferrals: safeReferrals.filter((r: any) => r.status === 'accepted').length,
        jobsPosted: safeJobs.length,
        points: game?.points || 0,
        rank: safeBoard.findIndex((u: any) => u.id === game?.userId) + 1 || 1
      });
      setLeaderboard(safeBoard);
    };
    loadData();
  }, []);

  const cards = [
    { label: 'Pending Referrals', value: stats.pendingReferrals, icon: <TrendingUp />, color: 'amber', href: '/dashboard/alumni/referrals' },
    { label: 'Referrals Accepted', value: stats.acceptedReferrals, icon: <CheckCircle2 />, color: 'green', href: '/dashboard/alumni/referrals' },
    { label: 'Jobs Posted', value: stats.jobsPosted, icon: <Briefcase />, color: 'blue', href: '/dashboard/alumni/jobs' },
    { label: 'Impact Points', value: stats.points, icon: <Trophy />, color: 'purple', href: '#' },
  ];

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, idx) => (
          <Link key={idx} href={card.href}>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group">
              <div className={`w-12 h-12 bg-${card.color}-50 text-${card.color}-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{card.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Announcements Section */}
      <div className="mb-10">
        <AnnouncementsView role="ALUMNI" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Alumni Leaderboard</h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Global Rank: #{stats.rank}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {leaderboard.map((entry, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-100 text-amber-600' :
                      idx === 1 ? 'bg-slate-100 text-slate-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-600' : 'text-slate-400'
                    }`}>
                    {idx + 1}
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                    {entry.name ? entry.name[0] : '?'}
                  </div>
                  <span className="font-bold text-slate-900">{entry.name || 'Unknown User'}</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-indigo-600">{entry.points}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Points</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Summary */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <TrendingUp className="text-indigo-400" /> Your Impact
          </h3>
          <div className="space-y-8">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-3">Community Growth</p>
              <p className="text-sm leading-relaxed">
                You have helped <span className="text-indigo-400 font-bold">{stats.acceptedReferrals} students</span> land referrals this month.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/alumni/referrals" className="p-4 bg-indigo-600 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-blue-700 transition-all group">
                <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Referrals</span>
              </Link>
              <Link href="/dashboard/alumni/jobs" className="p-4 bg-white/10 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/20 transition-all group">
                <Briefcase className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Post Job</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
