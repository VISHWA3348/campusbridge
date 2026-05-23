'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Trophy,
  Medal,
  Crown,
  User,
  Star,
  Building2,
  ArrowUpRight,
  TrendingUp,
  Award,
  Users,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getFileUrl } from '@/lib/api';

export default function HonorBoardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALUMNI' | 'STUDENT'>('ALUMNI');
  const [filterType, setFilterType] = useState<'GLOBAL' | 'COLLEGE'>('GLOBAL');

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, filterType]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const url = new URL((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')) + '/global/leaderboard');
      url.searchParams.append('role', activeTab);
      if (filterType === 'COLLEGE') {
        // We'll get collegeId from local storage user info
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          url.searchParams.append('collegeId', user.collegeId);
        }
      }

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-12 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] opacity-50 -z-10"></div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-2xl"
          >
            <Trophy className="w-3 h-3 text-amber-400" /> System Honor Board
          </motion.div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tight mb-4">Elite Contributors</h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">Recognizing real-world impact. Rankings are calculated automatically based on system contributions.</p>
        </header>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-16 items-center justify-between">
          <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] w-full lg:w-auto shadow-inner">
            <button
              onClick={() => setActiveTab('ALUMNI')}
              className={`flex-1 lg:px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'ALUMNI' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <Award className="w-4 h-4" /> Alumni Legends
            </button>
            <button
              onClick={() => setActiveTab('STUDENT')}
              className={`flex-1 lg:px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'STUDENT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <Zap className="w-4 h-4" /> Student Stars
            </button>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] w-full lg:w-auto">
            <button
              onClick={() => setFilterType('GLOBAL')}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'GLOBAL' ? 'bg-slate-900 text-white' : 'text-slate-400'
                }`}
            >
              Global
            </button>
            <button
              onClick={() => setFilterType('COLLEGE')}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'COLLEGE' ? 'bg-slate-900 text-white' : 'text-slate-400'
                }`}
            >
              My College
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-black uppercase tracking-widest text-[10px]">Calculating Standings...</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 items-end">
              {/* 2nd Place */}
              {topThree[1] && <PodiumItem entry={topThree[1]} rank={2} color="slate" />}
              {/* 1st Place */}
              {topThree[0] && <PodiumItem entry={topThree[0]} rank={1} color="slate-900" />}
              {/* 3rd Place */}
              {topThree[2] && <PodiumItem entry={topThree[2]} rank={3} color="amber-700" />}
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden mb-20">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" /> Honor Roll
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top 50 Rankings</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white border-b border-slate-50">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Rank</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Contributor</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Impact Stats</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Activity Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {remaining.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-8">
                          <span className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-black text-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                            {entry.rank}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <button
                            onClick={() => router.push(`/dashboard/profile/${entry.id}`)}
                            className="flex items-center gap-4 text-left group/profile"
                          >
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-sm">
                              {entry.photo ? (
                                <img src={getFileUrl(entry.photo) || ''} className="w-full h-full object-cover" />
                              ) : <div className="w-full h-full flex items-center justify-center font-black text-xl text-slate-300">{entry.name[0]}</div>}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 group-hover/profile:text-indigo-600 transition-colors">{entry.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.college}</p>
                            </div>
                          </button>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex gap-6">
                            {activeTab === 'ALUMNI' ? (
                              <>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Referrals</p>
                                  <p className="text-sm font-black text-slate-900">{entry.referrals} Accepted</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Company</p>
                                  <p className="text-sm font-black text-slate-900">{entry.company || 'Professional'}</p>
                                </div>
                              </>
                            ) : (
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expertise</p>
                                <div className="flex gap-1">
                                  {entry.skills?.split(',').slice(0, 2).map((s: any, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black uppercase">{s.trim()}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="inline-flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-2xl shadow-xl shadow-slate-200">
                            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="font-black text-sm">{entry.points.toLocaleString()} XP</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function PodiumItem({ entry, rank, color }: { entry: any, rank: number, color: string }) {
  const router = useRouter();
  const isFirst = rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative p-10 rounded-[3rem] border flex flex-col items-center transition-all hover:translate-y-[-10px] ${isFirst ? 'bg-slate-900 text-white border-slate-900 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.3)] z-10' : 'bg-white border-slate-100 shadow-sm z-0'
        }`}
    >
      <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-20 -mr-24 -mt-24 ${isFirst ? 'bg-indigo-400' : 'bg-slate-200'}`}></div>

      <div className="mb-8 relative">
        {rank === 1 && <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 w-12 h-12 text-amber-400 drop-shadow-lg" />}
        <div className={`w-32 h-32 rounded-[2.5rem] p-1.5 ${isFirst ? 'bg-gradient-to-tr from-amber-200 via-amber-400 to-amber-200 shadow-2xl' : 'bg-slate-100'}`}>
          <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-white relative">
            {entry.photo ? (
              <img src={getFileUrl(entry.photo) || ''} className="w-full h-full object-cover" />
            ) : <div className="w-full h-full flex items-center justify-center font-black text-4xl text-slate-200">{entry.name[0]}</div>}
          </div>
        </div>
        <div className={`absolute -bottom-4 -right-4 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl ${rank === 1 ? 'bg-amber-400 text-slate-900' : 'bg-slate-900 text-white'
          }`}>
          {rank}
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-2xl font-black mb-1 truncate max-w-[180px]">{entry.name}</h3>
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isFirst ? 'text-slate-400' : 'text-slate-500'}`}>
          {entry.role} • {entry.college}
        </p>
      </div>

      <div className={`w-full p-6 rounded-[2rem] flex flex-col items-center gap-3 ${isFirst ? 'bg-white/10' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-2">
          <Zap className={`w-5 h-5 ${isFirst ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className="text-3xl font-black">{entry.points.toLocaleString()}</span>
        </div>
        <p className={`text-[10px] font-black uppercase tracking-widest ${isFirst ? 'text-slate-400' : 'text-slate-400'}`}>System Impact Points</p>
      </div>

      <button
        onClick={() => router.push(`/dashboard/profile/${entry.id}`)}
        className={`mt-8 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isFirst ? 'bg-white text-slate-900 hover:bg-amber-400 hover:text-slate-900' : 'bg-slate-900 text-white hover:bg-indigo-600'
          }`}>
        View Achievements <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
