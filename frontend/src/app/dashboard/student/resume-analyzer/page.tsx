'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { analyzeResume, fetchResumeHistory, uploadResumeFile } from '@/lib/api';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Activity, 
  Target, 
  History,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Award,
  Zap,
  BarChart3,
  Briefcase,
  Search,
  Check,
  ArrowUpRight,
  Download,
  Eye,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const DOMAINS = [
  { id: 'Full Stack Developer', icon: <Layers className="w-5 h-5" />, color: 'blue' },
  { id: 'AI Engineer', icon: <Cpu className="w-5 h-5" />, color: 'purple' },
  { id: 'Data Analyst', icon: <BarChart3 className="w-5 h-5" />, color: 'amber' },
  { id: 'Cyber Security', icon: <ShieldCheck className="w-5 h-5" />, color: 'emerald' },
  { id: 'Cloud Engineer', icon: <Zap className="w-5 h-5" />, color: 'orange' },
  { id: 'Custom', icon: <Search className="w-5 h-5" />, color: 'slate' }
];

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState(DOMAINS[0].id);
  const [customRole, setCustomRole] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await fetchResumeHistory();
      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!analyzing) return;
    const steps = [
      'Extracting text...',
      'Checking ATS score...',
      'Matching industry keywords...',
      'Generating improvement suggestions...',
      'Finalizing Report...'
    ];
    let i = 0;
    setAnalysisStep(steps[0]);
    const interval = setInterval(() => {
      i++;
      if (i < steps.length) {
        setAnalysisStep(steps[i]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [analyzing]);

  const handleUpload = async () => {
    if (!file) return;
    setAnalyzing(true);
    try {
      // 1. Upload to Cloudinary
      const uploadRes = await uploadResumeFile(file);
      if (uploadRes.error) throw new Error(uploadRes.error);

      // 2. Analyze with AI
      const data = await analyzeResume({
        fileName: file.name,
        fileUrl: uploadRes.resumeLink, // REAL Cloudinary URL
        targetRole: targetRole === 'Custom' ? customRole : targetRole
      });

      if (data.error) throw new Error(data.error);

      setResult(data);
      loadHistory();
    } catch (err: any) {
      alert(err.message || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getPreviousScore = () => {
    if (history.length < 2) return null;
    return history[1].score;
  };

  const ScoreCircle = ({ value, label, icon, color }: { value: number, label: string, icon: any, color: string }) => (
    <div className="flex flex-col items-center p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm relative group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
      <div className="relative w-24 h-24 mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-50" />
          <motion.circle 
            cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
            strokeDasharray={251.2}
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: 251.2 - (251.2 * value) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`text-${color}-500`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-slate-900">{value}%</span>
        </div>
      </div>
      <div className={`w-8 h-8 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 pt-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-200">
                AI Powered
              </div>
              <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                v2.0 Professional
              </div>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 leading-none">
              RESUME <span className="text-indigo-600">ANALYZER</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-2xl">
              Elevate your career with deep ATS analysis, domain-specific skill mapping, and placement readiness tracking.
            </p>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={() => setShowHistory(!showHistory)}
              className="px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <History className="w-4 h-4" /> History
            </button>
            <button className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
              New Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Workspace */}
          <div className="lg:col-span-8 space-y-8">
            {!result ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* Domain Selection */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 px-2">1. Select Your Target Career</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {DOMAINS.map((domain) => (
                      <button
                        key={domain.id}
                        onClick={() => setTargetRole(domain.id)}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 text-center ${
                          targetRole === domain.id 
                            ? `border-${domain.color}-500 bg-${domain.color}-50 text-${domain.color}-600 shadow-lg shadow-${domain.color}-100` 
                            : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          targetRole === domain.id ? 'bg-white shadow-sm' : 'bg-slate-100'
                        }`}>
                          {domain.icon}
                        </div>
                        <span className="text-[10px] font-black leading-tight uppercase tracking-wider">{domain.id}</span>
                        {targetRole === domain.id && <div className="w-2 h-2 bg-current rounded-full" />}
                      </button>
                    ))}
                  </div>
                  
                  {targetRole === 'Custom' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 px-2"
                    >
                      <input 
                        type="text" 
                        placeholder="Enter your custom target role (e.g., DevOps Engineer, UI/UX Designer...)"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-slate-900 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Upload Zone */}
                <div className="bg-white p-16 rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center text-center relative overflow-hidden group hover:border-indigo-200 transition-all">
                  <div className="absolute inset-0 bg-indigo-50/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mb-10 mx-auto shadow-2xl shadow-indigo-200 group-hover:scale-110 transition-transform duration-500">
                      <Upload className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Drop your Resume</h2>
                    <p className="text-slate-500 font-medium mb-12 max-w-md mx-auto text-lg leading-relaxed">
                      Our AI will analyze your structure, keywords, and skill gaps for <span className="text-slate-900 font-black">{targetRole}</span> roles.
                    </p>
                    
                    <input 
                      type="file" 
                      id="resume-upload" 
                      className="hidden" 
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept=".pdf,.docx,.txt"
                    />
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <label 
                        htmlFor="resume-upload" 
                        className="px-12 py-6 bg-white border-2 border-slate-900 text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all cursor-pointer shadow-xl shadow-slate-100 min-w-[200px]"
                      >
                        {file ? file.name : 'Choose File'}
                      </label>

                      {file && (
                        <button 
                          onClick={handleUpload}
                          disabled={analyzing}
                          className="px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-3 min-w-[200px]"
                        >
                          {analyzing ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {analysisStep}
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 fill-white" />
                              Start AI Scan
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <p className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">PDF • DOCX • TXT (MAX 5MB)</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Advanced Results View */
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                {/* Hero Result Section */}
                <div className="bg-slate-900 p-12 rounded-[4rem] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -mr-[250px] -mt-[250px]"></div>
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                           <button onClick={() => setResult(null)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                            <ArrowRight className="w-5 h-5 rotate-180" />
                          </button>
                          <h2 className="text-3xl font-black tracking-tight uppercase">Analysis Complete</h2>
                        </div>
                        <h3 className="text-5xl font-black mb-4 leading-none">{targetRole} <span className="text-indigo-400">Path</span></h3>
                        <p className="text-slate-400 font-medium text-lg mb-8 max-w-xl">
                          Based on our deep scan, your resume is <span className="text-white font-black">{result.placementReadiness}</span> level.
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            <span className="text-xs font-black uppercase tracking-widest">ATS Verified</span>
                          </div>
                          <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                            <Award className="w-5 h-5 text-amber-400" />
                            <span className="text-xs font-black uppercase tracking-widest">{result.score}% Score</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-auto flex flex-col items-center">
                        <div className="relative w-48 h-48">
                           <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                            <motion.circle 
                              cx="96" cy="96" r="80" stroke="#3b82f6" strokeWidth="12" fill="transparent" 
                              strokeDasharray={502.4}
                              initial={{ strokeDashoffset: 502.4 }}
                              animate={{ strokeDashoffset: 502.4 - (502.4 * result.score) / 100 }}
                              transition={{ duration: 2, ease: "easeInOut" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-black tracking-tighter">{result.score}</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Readiness</span>
                          </div>
                        </div>
                        {getPreviousScore() && (
                          <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              +{result.score - getPreviousScore()}% vs Previous
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                      <ScoreCircle value={result.atsScore} label="ATS COMPAT." icon={<ShieldCheck className="w-4 h-4" />} color="blue" />
                      <ScoreCircle value={result.skillScore} label="TECH SKILLS" icon={<Cpu className="w-4 h-4" />} color="purple" />
                      <ScoreCircle value={result.projectQuality} label="PROJECTS" icon={<Layers className="w-4 h-4" />} color="amber" />
                      <ScoreCircle value={result.communicationScore} label="LANGUAGE" icon={<Briefcase className="w-4 h-4" />} color="emerald" />
                      <ScoreCircle value={result.designScore} label="DESIGN" icon={<Target className="w-4 h-4" />} color="orange" />
                    </div>
                  </div>
                </div>

                {/* AI Insights Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Strengths & Weaknesses */}
                  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm h-full">
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                      <Zap className="w-6 h-6 text-amber-500 fill-amber-500" /> RESUME STRENGTHS
                    </h3>
                    <div className="space-y-4 mb-10">
                      {JSON.parse(result.strengths || "[]").map((s: string, i: number) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={i} 
                          className="flex items-start gap-4 p-5 bg-green-50/50 rounded-[1.5rem] border border-green-100"
                        >
                          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed">{s}</p>
                        </motion.div>
                      ))}
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-red-500" /> CRITICAL WEAKNESSES
                    </h3>
                    <div className="space-y-4">
                      {JSON.parse(result.weaknesses || "[]").map((w: string, i: number) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={i} 
                          className="flex items-start gap-4 p-5 bg-red-50/50 rounded-[1.5rem] border border-red-100"
                        >
                          <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                            <AlertCircle className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed">{w}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Smart Suggestions */}
                  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm h-full">
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-indigo-600" /> SMART SUGGESTIONS
                    </h3>
                    <div className="space-y-6">
                      {JSON.parse(result.suggestions || "[]").map((s: string, i: number) => (
                        <div key={i} className="group relative">
                          <div className="flex items-start gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {i+1}
                            </div>
                            <div>
                              <p className="text-slate-800 font-bold leading-relaxed mb-2">{s}</p>
                              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                <TrendingUp className="w-3 h-3" /> Potential Score Boost: +5%
                              </div>
                            </div>
                          </div>
                          {i < JSON.parse(result.suggestions).length - 1 && (
                            <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-50 -mb-6" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white">
                      <h4 className="font-black mb-2 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" /> CAREER BOOST
                      </h4>
                      <p className="text-slate-400 text-xs font-medium mb-6">Need expert help implementing these suggestions?</p>
                      <Link href="/dashboard/student/mentorship" className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all">
                        Talk to an Alumni Mentor <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Missing Skills Section */}
                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                  <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-500" /> MISSING REQUIREMENTS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {(() => {
                      const missing = JSON.parse(result.missingSkills || "{}");
                      return (
                        <>
                          <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Technologies</p>
                            <div className="flex flex-wrap gap-2">
                              {missing.technologies?.map((t: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold border border-red-100">{t}</span>
                              )) || <span className="text-slate-300 text-[10px] font-bold">None missing</span>}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Certifications</p>
                            <div className="flex flex-wrap gap-2">
                              {missing.certifications?.map((c: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold border border-amber-100">{c}</span>
                              )) || <span className="text-slate-300 text-[10px] font-bold">None missing</span>}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Keywords</p>
                            <div className="flex flex-wrap gap-2">
                              {missing.keywords?.map((k: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100">{k}</span>
                              )) || <span className="text-slate-300 text-[10px] font-bold">None missing</span>}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Skill Gap Analysis */}
                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2">SKILL GAP ANALYSIS</h3>
                      <p className="text-slate-500 font-medium">Your current profile vs Industry expectations for <span className="text-slate-900 font-black">{targetRole}</span>.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Have</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-slate-200 rounded-full" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Need</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                    <div className="space-y-6">
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Critical Tech Stack</h4>
                      {(() => {
                        const gap = JSON.parse(result.skillGapAnalysis || "{}");
                        return (gap.expected || []).map((skill: string, i: number) => {
                          const hasIt = gap.current?.includes(skill);
                          return (
                            <div key={i} className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-black text-slate-900">{skill}</span>
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${hasIt ? 'text-indigo-600' : 'text-slate-300'}`}>
                                    {hasIt ? 'Matched' : 'Missing'}
                                  </span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: hasIt ? '100%' : '20%' }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className={`h-full rounded-full ${hasIt ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                  />
                                </div>
                              </div>
                              {hasIt ? (
                                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                                  <CheckCircle2 className="w-5 h-5" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center shrink-0">
                                  <Search className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>

                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Learning Path</h4>
                      <div className="space-y-4">
                        {(JSON.parse(result.skillGapAnalysis || "{}").recommendations || []).map((rec: string, i: number) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 group cursor-pointer hover:border-indigo-500 transition-all">
                            <span className="text-sm font-bold text-slate-700">{rec}</span>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        ))}
                      </div>
                      <Link href="/dashboard/student/roadmaps" className="mt-8 w-full flex items-center justify-center gap-3 py-5 bg-white text-slate-900 rounded-[1.5rem] border-2 border-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-slate-100">
                        View Custom Roadmap <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Project Analysis Section */}
                <div className="bg-indigo-600 p-12 rounded-[4rem] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -mr-[200px] -mt-[200px]"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-8">PROJECT & INNOVATION DEEP-SCAN</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(JSON.parse(result.projectAnalysis || "[]")).map((item: string, i: number) => (
                        <div key={i} className="p-8 bg-white/10 rounded-[2.5rem] border border-white/20 backdrop-blur-md">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <p className="text-sm font-bold leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* History Card */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight text-sm">
                  <History className="w-5 h-5 text-indigo-600" /> SCAN HISTORY
                </h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase">{history.length} SCANS</span>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {history.map((h: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={h.id} 
                    className={`p-5 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${
                      result?.id === h.id ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200'
                    }`}
                    onClick={() => setResult(h)}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          result?.id === h.id ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 shadow-sm'
                        }`}>
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 line-clamp-1 mb-1">{h.fileName}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(h.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-black ${h.score > 80 ? 'text-green-600' : 'text-indigo-600'}`}>{h.score}%</p>
                      </div>
                    </div>
                    {idx === 0 && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-bl-xl">Latest</div>
                    )}
                  </motion.div>
                ))}
                {history.length === 0 && !loadingHistory && (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                      <Search className="w-8 h-8" />
                    </div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest leading-loose">No analysis history yet</p>
                  </div>
                )}
                {loadingHistory && (
                  <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-200" /></div>
                )}
              </div>
            </div>

            {/* Placement Readiness Banner */}
            <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              <h3 className="text-xl font-black mb-4 relative z-10">PLACEMENT TRACKER</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">
                Your resume is just the start. Track your mock interviews, coding tests, and behavioral readiness.
              </p>
              <Link href="/dashboard/student/placement-tracker" className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-indigo-600 hover:border-indigo-600 transition-all relative z-10">
                <span className="font-black text-[10px] uppercase tracking-[0.2em]">Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button className="p-6 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-indigo-600 hover:text-white transition-all group">
                <Download className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Report</span>
              </button>
              <button className="p-6 bg-slate-50 text-slate-900 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-slate-900 hover:text-white transition-all group">
                <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Preview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
