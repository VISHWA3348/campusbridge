'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchPlacementReadiness, reanalyzeReadiness } from '@/lib/api';
import { 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  ArrowRight, 
  Activity, 
  Award,
  Zap,
  Sparkles,
  Briefcase,
  Users,
  Video,
  FileText,
  GraduationCap,
  ChevronRight,
  Info,
  Calendar,
  BarChart3,
  Search,
  Check,
  RefreshCcw,
  ShieldAlert,
  BrainCircuit,
  PieChart,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const MetricCard = ({ label, value, icon, color, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
  >
    <div className={`w-12 h-12 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon, { className: "w-6 h-6" })}
    </div>
    <div className="text-2xl font-black text-slate-900">{value}</div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</p>
    <div className="mt-4 w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay: delay + 0.5 }}
        className={`h-full bg-${color}-500 rounded-full`}
      />
    </div>
  </motion.div>
);

const ProgressLineChart = ({ data }: { data: any[] }) => {
  if (!data || data.length < 2) return (
    <div className="h-40 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-slate-100 rounded-[2rem]">
      Collecting historical data...
    </div>
  );

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - d.score
  }));

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="relative h-40 w-full mt-4">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          d={pathD}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d={`${pathD} L 100,100 L 0,100 Z`}
          fill="url(#gradient)"
        />
        {points.map((p, i) => (
          <motion.circle
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 + i * 0.1 }}
            cx={p.x} cy={p.y} r="1.5"
            className="fill-indigo-600 stroke-white stroke-[0.5]"
          />
        ))}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[8px] font-black text-slate-400 uppercase tracking-tighter pt-2 border-t border-slate-100">
        <span>{new Date(data[0].createdAt).toLocaleDateString()}</span>
        <span>Today</span>
      </div>
    </div>
  );
};

export default function PlacementTracker() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await fetchPlacementReadiness();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await reanalyzeReadiness();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-[80vh] flex-col gap-6">
        <div className="w-20 h-20 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="animate-pulse font-black text-2xl text-slate-300 uppercase tracking-[0.3em]">Calibrating AI Mentor...</div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 pt-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl font-black text-slate-900 tracking-tight flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 uppercase">AI Placement Mentor</span>
            </h1>
            <p className="text-slate-500 font-medium mt-3 text-lg">Intelligent career readiness engine powered by DeepSeek.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <button 
              onClick={handleReanalyze}
              disabled={analyzing}
              className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50 shadow-2xl shadow-slate-200"
            >
              <RefreshCcw className={`w-4 h-4 ${analyzing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
              {analyzing ? 'Analyzing...' : 'Re-analyze Profile'}
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Readiness & Analytics */}
          <div className="lg:col-span-8 space-y-10">
            {/* Main Scorecard */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 p-12 rounded-[4rem] text-white relative overflow-hidden group shadow-2xl shadow-indigo-100"
            >
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -mr-60 -mt-60 transition-all group-hover:bg-indigo-600/30"></div>
              <div className="relative z-10 flex flex-col xl:flex-row items-center gap-16">
                <div className="relative shrink-0">
                  <div className="w-64 h-64 rounded-full border-[16px] border-white/5 flex items-center justify-center shadow-inner">
                    <div className="text-center">
                      <AnimatePresence mode="wait">
                        <motion.span 
                          key={data.readinessScore}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.5 }}
                          className="text-8xl font-black tabular-nums block"
                        >
                          {data.readinessScore}%
                        </motion.span>
                      </AnimatePresence>
                      <p className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400 mt-2">Overall Readiness</p>
                    </div>
                  </div>
                  <svg className="absolute top-0 left-0 w-64 h-64 -rotate-90">
                    <motion.circle 
                      initial={{ strokeDashoffset: 2 * Math.PI * 108 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 108 * (1 - data.readinessScore / 100) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      cx="128" cy="128" r="108" 
                      fill="transparent" 
                      stroke="currentColor" 
                      strokeWidth="16" 
                      strokeDasharray={2 * Math.PI * 108}
                      className="text-indigo-500"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                
                <div className="flex-1 text-center xl:text-left">
                  <div className="flex flex-wrap items-center justify-center xl:justify-start gap-4 mb-8">
                    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                      data.level === 'Placement Ready' ? 'bg-green-600/20 text-green-400 border-green-500/20' : 
                      data.level === 'Intermediate' ? 'bg-amber-600/20 text-amber-400 border-amber-500/20' : 
                      'bg-indigo-600/20 text-indigo-400 border-indigo-500/20'
                    }`}>
                      <Award className="w-4 h-4" /> {data.level} Level
                    </div>
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700">
                      <TrendingUp className="w-4 h-4" /> {data.probability} Probability
                    </div>
                  </div>
                  <h2 className="text-5xl font-black mb-6 tracking-tight uppercase leading-tight">Career Potential <br/><span className="text-indigo-400">Analysis</span></h2>
                  <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-xl">
                    {data.readinessScore > 80 
                      ? "You are exceptionally prepared for high-tier roles. Focus on niche specialization and networking." 
                      : data.readinessScore > 60 
                      ? "Solid foundation established. Target specific missing skills to move into the 'Ready' category."
                      : "Developing phase. Follow the AI action plan to build core competencies and profile strength."}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <MetricCard label="Technical Skills" value={data.metrics?.technical || 65} icon={<Zap/>} color="indigo" delay={0.1} />
              <MetricCard label="Resume Quality" value={data.metrics?.resume || 70} icon={<FileText/>} color="emerald" delay={0.2} />
              <MetricCard label="Communication" value={data.metrics?.communication || 60} icon={<Users/>} color="amber" delay={0.3} />
              <MetricCard label="Profile Health" value={data.metrics?.profileHealth || 55} icon={<ShieldAlert/>} color="rose" delay={0.4} />
            </div>

            {/* Detailed Analysis Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight text-xs mb-8">
                  <Sparkles className="w-5 h-5 text-indigo-600" /> Improvement Alerts
                </h3>
                <div className="space-y-4">
                  {data.topWeaknesses?.map((weakness: string, i: number) => (
                    <div key={i} className="flex gap-4 p-5 bg-rose-50 rounded-2xl border border-rose-100">
                      <div className="w-6 h-6 bg-rose-200 text-rose-700 rounded-lg flex items-center justify-center shrink-0 mt-1">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold text-rose-900 leading-relaxed">{weakness}</p>
                    </div>
                  ))}
                  {(!data.topWeaknesses || data.topWeaknesses.length === 0) && (
                    <p className="text-slate-400 text-sm font-bold italic text-center py-10">No critical weaknesses detected!</p>
                  )}
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col">
                <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight text-xs mb-8">
                  <TrendingUp className="w-5 h-5 text-indigo-600" /> Readiness Timeline
                </h3>
                <div className="flex-1">
                   <ProgressLineChart data={data.history || []} />
                </div>
                <div className="mt-6 p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">AI Prediction</p>
                  <p className="text-xs font-bold text-indigo-700 leading-relaxed">
                    Based on current growth, you'll reach <span className="font-black">90% readiness</span> in approximately 3 weeks.
                  </p>
                </div>
              </div>
            </div>

            {/* Job Eligibility & Recommended Roles */}
            <div className="bg-indigo-600 p-12 rounded-[4rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="font-black flex items-center gap-3 uppercase tracking-tight text-xs mb-8">
                      <Briefcase className="w-5 h-5 text-indigo-200" /> Market Eligibility
                    </h3>
                    <div className="flex items-center gap-8 mb-8">
                       <div className="text-7xl font-black">{data.jobEligibility || '65%'}</div>
                       <div className="h-16 w-px bg-white/20"></div>
                       <div>
                         <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Target Roles</p>
                         <div className="flex flex-wrap gap-2">
                           {data.recommendedRoles?.map((role: string, i: number) => (
                             <span key={i} className="text-xs font-black uppercase text-white">{role}{i < data.recommendedRoles.length - 1 ? ',' : ''}</span>
                           ))}
                         </div>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Missing Key Technologies</p>
                       <div className="flex flex-wrap gap-2">
                         {data.missingSkillsForJobs?.map((skill: string, i: number) => (
                           <span key={i} className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                             {skill}
                           </span>
                         ))}
                       </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-[3rem] p-8 border border-white/10 backdrop-blur-sm">
                    <h4 className="font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-3">
                      <LayoutDashboard className="w-4 h-4" /> Career Insights
                    </h4>
                    <div className="space-y-4">
                      {data.careerInsights?.map((insight: string, i: number) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center shrink-0 text-[10px] font-black">
                            {i + 1}
                          </div>
                          <p className="text-xs font-bold text-indigo-100 leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Guidance & Actions */}
          <div className="lg:col-span-4 space-y-10">
            {/* Smart Suggestions */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
              <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight text-xs mb-8">
                <Zap className="w-5 h-5 text-amber-500" /> AI Action Plan
              </h3>
              <div className="space-y-4">
                {data.suggestions?.map((s: string, i: number) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-start gap-4 hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all cursor-pointer group">
                    <div className="w-10 h-10 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 font-black text-xs shadow-md group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {i + 1}
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-snug pt-2">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions / Boosters */}
            <div className="space-y-4">
              <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest px-8">Readiness Boosters</h3>
              
              <Link href="/dashboard/student/career-roadmap" className="block group">
                <div className="flex items-center justify-between p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[1.25rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <BarChart3 className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="font-black text-xs uppercase tracking-widest text-slate-900 block mb-1">Continue Roadmap</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Boost Skill Maturity</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              <Link href="/dashboard/student/resume-analyzer" className="block group">
                <div className="flex items-center justify-between p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[1.25rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="font-black text-xs uppercase tracking-widest text-slate-900 block mb-1">Optimize Resume</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Boost ATS Score</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              <Link href="/dashboard/student/mentorship" className="block group">
                <div className="flex items-center justify-between p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-amber-200 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-[1.25rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="font-black text-xs uppercase tracking-widest text-slate-900 block mb-1">Mock Interview</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Boost Communication</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </div>

            {/* Profile Integration Health */}
            <div className="bg-slate-50 p-10 rounded-[3.5rem] border border-slate-100">
              <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-8 text-center">Data Connectors</h3>
              <div className="flex justify-around items-center">
                <div className="flex flex-col items-center gap-2 group cursor-help">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-lg transition-all">
                    <Briefcase className="w-6 h-6 text-slate-900" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="flex flex-col items-center gap-2 group cursor-help">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-lg transition-all">
                    <Users className="w-6 h-6 text-[#0077b5]" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="flex flex-col items-center gap-2 group cursor-help">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-lg transition-all">
                    <GraduationCap className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-8 text-center leading-relaxed">
                Platform syncs your activity every 24 hours to update readiness scores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
