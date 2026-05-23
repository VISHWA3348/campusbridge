'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchRoadmaps, createRoadmap, updateRoadmapStep } from '@/lib/api';
import { 
  Target, 
  Map as MapIcon, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Zap, 
  BookOpen, 
  Code, 
  Shield, 
  Database, 
  TrendingUp,
  Sparkles,
  ArrowRight,
  Trophy,
  Terminal,
  MessageSquare,
  Cpu,
  Layers,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CareerRoadmapPage() {
  const [data, setData] = useState<any>({ userRoadmaps: [] });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [activeLevel, setActiveLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [customRole, setCustomRole] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await fetchRoadmaps();
      setData(result);
      if (result.userRoadmaps.length > 0) {
        setSelectedRoadmap(result.userRoadmaps[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoadmap = async (role: string) => {
    setGenerating(true);
    try {
      const roadmap = await createRoadmap(role);
      setData((prev: any) => ({
        ...prev,
        userRoadmaps: [...prev.userRoadmaps.filter((r: any) => r.id !== roadmap.id), roadmap]
      }));
      setSelectedRoadmap(roadmap);
    } catch (err) {
      alert("AI roadmap generation temporarily unavailable. Please try again later.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleStep = async (stepId: string) => {
    if (!selectedRoadmap) return;
    const completedSteps = JSON.parse(selectedRoadmap.completedSteps || "[]");
    const isCompleted = completedSteps.includes(stepId);
    
    try {
      const updated = await updateRoadmapStep({
        roadmapId: selectedRoadmap.id,
        stepId,
        completed: !isCompleted
      });
      setSelectedRoadmap(updated);
      setData((prev: any) => ({
        ...prev,
        userRoadmaps: prev.userRoadmaps.map((r: any) => r.id === updated.id ? updated : r)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const roadmapSteps = selectedRoadmap ? JSON.parse(selectedRoadmap.steps || "[]") : [];
  const detailedData = selectedRoadmap?.detailedData ? JSON.parse(selectedRoadmap.detailedData) : null;
  const completedCount = selectedRoadmap ? JSON.parse(selectedRoadmap.completedSteps || "[]").length : 0;

  const currentLevelData = detailedData?.levels ? detailedData.levels[activeLevel] : null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8 pt-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl font-black text-slate-900 tracking-tight flex items-center gap-5">
              <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
                <MapIcon className="w-8 h-8" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">AI ROADMAP</span>
            </h1>
            <p className="text-slate-500 font-medium mt-3 text-lg">Your personalized path to technical excellence.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-auto"
          >
            <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100 flex flex-wrap gap-3 items-center">
              <div className="flex -space-x-2 mr-4">
                {data.userRoadmaps.map((r: any, i: number) => (
                  <button 
                    key={r.id || `roadmap-${i}`}
                    onClick={() => setSelectedRoadmap(r)}
                    className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center text-xs font-black uppercase transition-all overflow-hidden ${
                      selectedRoadmap?.id === r.id ? 'bg-indigo-600 text-white scale-110 z-10' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {r.title?.substring(0, 2) || 'RM'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 flex-1">
                <input 
                  type="text" 
                  placeholder="Type any role..." 
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="bg-slate-50 border-none rounded-2xl px-6 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
                <button 
                  onClick={() => handleCreateRoadmap(customRole)}
                  disabled={!customRole || generating}
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {generating ? 'Generating...' : <><Sparkles className="w-4 h-4" /> Generate</>}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {!selectedRoadmap && !generating ? (
          <div className="bg-white p-20 rounded-[4rem] border border-slate-100 text-center shadow-2xl shadow-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.05),transparent)]"></div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10"
            >
              <div className="w-28 h-28 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-lg">
                <Sparkles className="w-14 h-14 animate-pulse" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Ready to start your journey?</h3>
              <p className="text-slate-500 font-medium mb-16 max-w-md mx-auto text-lg leading-relaxed">Select a predefined role or type any career goal. Our AI will craft a deep learning path just for you.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                {[
                  { title: "AI Engineer", icon: <Cpu />, color: "indigo" },
                  { title: "Full Stack Developer", icon: <Code />, color: "emerald" },
                  { title: "Data Analyst", icon: <Database />, color: "amber" },
                  { title: "Cyber Security", icon: <Shield />, color: "rose" }
                ].map((goal) => (
                  <button 
                    key={goal.title}
                    onClick={() => handleCreateRoadmap(goal.title)}
                    className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all group relative overflow-hidden"
                  >
                    <div className={`w-16 h-16 bg-white text-${goal.color}-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md`}>
                      {React.isValidElement(goal.icon)
                        ? React.cloneElement(goal.icon as React.ReactElement<any>, {
                            className: "w-8 h-8",
                          })
                        : goal.icon}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 block">{goal.title}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : generating ? (
          <div className="bg-white p-32 rounded-[4rem] border border-slate-100 text-center shadow-2xl">
            <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-10"></div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">AI is crafting your roadmap</h3>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Analyzing skills, market trends, and learning resources...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar Stats */}
            <div className="lg:col-span-3 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 p-10 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10 text-center">
                  <div className="text-6xl font-black text-indigo-400 mb-2">{selectedRoadmap.progress}%</div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10">Total Progress</p>
                  
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <span className="px-5 py-2 bg-white/10 rounded-full text-[11px] font-black uppercase tracking-widest border border-white/10">
                      {selectedRoadmap.currentLevel}
                    </span>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Tasks Done</span>
                      <span className="text-white">{completedCount} / {roadmapSteps.length}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedRoadmap.progress}%` }}
                        className="h-full bg-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight text-xs mb-8 border-b border-slate-50 pb-6">
                  <Layers className="w-4 h-4 text-indigo-600" /> Career Levels
                </h3>
                <div className="space-y-3">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setActiveLevel(level)}
                      className={`w-full p-6 rounded-3xl text-left transition-all border-2 flex items-center justify-between group ${
                        activeLevel === level 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' 
                          : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200 hover:bg-white'
                      }`}
                    >
                      <span className="font-black text-[11px] uppercase tracking-widest">{level}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeLevel === level ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {currentLevelData && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-2xl shadow-indigo-200"
                >
                  <h3 className="font-black flex items-center gap-3 uppercase tracking-tight text-xs mb-6">
                    <MessageSquare className="w-4 h-4 text-indigo-200" /> AI MENTOR TIP
                  </h3>
                  <p className="text-sm font-bold leading-relaxed text-indigo-50 italic">
                    "Focus on {currentLevelData.skills[0]} and {currentLevelData.skills[1]} first. This creates a strong foundation for {selectedRoadmap.title}."
                  </p>
                </motion.div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-10">
              {/* Level Details */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLevel}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-100/50"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
                        {activeLevel} Phase <div className={`w-3 h-3 rounded-full ${
                          activeLevel === 'beginner' ? 'bg-green-500' : activeLevel === 'intermediate' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></div>
                      </h2>
                      <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mt-2">Master the core essentials</p>
                    </div>
                  </div>

                  {currentLevelData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Projects */}
                      <div className="space-y-6">
                        <h4 className="font-black text-slate-900 flex items-center gap-3 text-sm uppercase tracking-widest border-l-4 border-indigo-600 pl-4 mb-8">
                          <Terminal className="w-5 h-5 text-indigo-600" /> Recommended Projects
                        </h4>
                        <div className="space-y-4">
                          {(currentLevelData.projects || []).map((project: any, i: number) => (
                            <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                              <h5 className="font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight">{project.title}</h5>
                              <p className="text-slate-500 text-xs font-medium leading-relaxed">{project.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certifications & Interview Prep */}
                      <div className="space-y-10">
                        <div>
                          <h4 className="font-black text-slate-900 flex items-center gap-3 text-sm uppercase tracking-widest border-l-4 border-emerald-600 pl-4 mb-8">
                            <Trophy className="w-5 h-5 text-emerald-600" /> Top Certifications
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {(currentLevelData.certifications || []).map((cert: string, i: number) => (
                              <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-black text-slate-900 flex items-center gap-3 text-sm uppercase tracking-widest border-l-4 border-amber-600 pl-4 mb-8">
                            <MessageSquare className="w-5 h-5 text-amber-600" /> Interview Prep
                          </h4>
                          <ul className="space-y-3">
                            {(currentLevelData.interviewPrep || []).map((topic: string, i: number) => (
                              <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></div>
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                      <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Level Details Available</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Learning Sequence (Steps) */}
              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-100/50">
                <h2 className="text-3xl font-black text-slate-900 mb-12 uppercase tracking-tighter flex items-center gap-4">
                  Step-by-Step Guide <div className="w-12 h-1 px-4 bg-indigo-100 rounded-full"></div>
                </h2>
                
                <div className="space-y-8 relative">
                  <div className="absolute left-10 top-0 bottom-0 w-1 bg-slate-100 rounded-full"></div>
                  
                  {roadmapSteps.map((step: any, idx: number) => {
                    const isCompleted = JSON.parse(selectedRoadmap.completedSteps || "[]").includes(step.id);
                    const isNext = !isCompleted && (idx === 0 || JSON.parse(selectedRoadmap.completedSteps || "[]").includes(roadmapSteps[idx-1].id));
                    
                    return (
                      <motion.div 
                        key={step.id || `step-${idx}`} 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`p-10 rounded-[3rem] border-4 transition-all flex items-start gap-10 relative group ${
                        isCompleted ? 'bg-indigo-50/30 border-indigo-100 shadow-sm' : 
                        isNext ? 'bg-white border-indigo-600 shadow-2xl shadow-indigo-100 scale-[1.02] z-10' :
                        'bg-slate-50/50 border-transparent grayscale opacity-70'
                      }`}>
                        <button 
                          onClick={() => toggleStep(step.id)}
                          className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 transition-all shadow-xl relative z-20 ${
                            isCompleted ? 'bg-indigo-600 text-white' : 
                            isNext ? 'bg-indigo-600 text-white animate-pulse' :
                            'bg-white text-slate-300'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-10 h-10" /> : <div className="text-2xl font-black">{idx + 1}</div>}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-4 mb-4">
                            <h4 className={`font-black text-2xl tracking-tight uppercase ${isCompleted ? 'text-indigo-900' : 'text-slate-900'}`}>{step.title}</h4>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              step.level === 'Beginner' ? 'bg-green-100 text-green-600' : 
                              step.level === 'Intermediate' ? 'bg-amber-100 text-amber-600' : 
                              'bg-purple-100 text-purple-600'
                            }`}>{step.level}</span>
                            {isNext && <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce">Next Up</span>}
                          </div>
                          <p className="text-slate-500 font-medium leading-relaxed text-lg mb-6">{step.description}</p>
                          
                          {isNext && (
                            <div className="flex flex-wrap gap-3">
                              {currentLevelData?.resources?.slice(0, 3).map((res: string, i: number) => (
                                <button key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
                                  <BookOpen className="w-4 h-4" /> {res}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
