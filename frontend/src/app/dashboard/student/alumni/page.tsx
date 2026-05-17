'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { searchAlumni, requestReferral, generateReferralMessage } from '@/lib/api';
import { Search, Building2, Briefcase, Zap, CheckCircle2, Sparkles, MessageSquare, Send, X } from 'lucide-react';

export default function AlumniSearchPage() {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ company: '', role: '' });
  const [requesting, setRequesting] = useState<number | null>(null);
  
  // AI State
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  const [aiMessage, setAiMessage] = useState('');
  const [generating, setGenerating] = useState(false);

  const loadAlumni = async () => {
    setLoading(true);
    const data = await searchAlumni(filters.company, filters.role);
    if (Array.isArray(data)) {
      setAlumni(data);
    } else {
      setAlumni([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadAlumni(); }, []);

  const handleOpenAi = async (alum: any) => {
    setSelectedAlumni(alum);
    setShowAiModal(true);
    setGenerating(true);
    const res = await generateReferralMessage(alum.user?.name || 'Alumni', alum.company || 'their company');
    setAiMessage(res.message);
    setGenerating(false);
  };

  const handleRequest = async (id: number) => {
    setRequesting(id);
    await requestReferral(id);
    setRequesting(null);
    setShowAiModal(false);
    alert('Referral request sent successfully with AI message!');
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Alumni Network</h1>
          <p className="text-slate-500 font-medium">Connect with professionals who graduated from your college.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search by company..."
            value={filters.company}
            onChange={(e) => setFilters({...filters, company: e.target.value})}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-500 outline-none transition-all font-medium"
          />
        </div>
        <div className="flex-1 relative">
          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search by role..."
            value={filters.role}
            onChange={(e) => setFilters({...filters, role: e.target.value})}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-500 outline-none transition-all font-medium"
          />
        </div>
        <button 
          onClick={loadAlumni}
          className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
        >
          <Search className="w-5 h-5" /> Find Alumni
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
             Searching the network...
          </div>
        ) : alumni.map((a) => (
          <div key={a.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all group flex flex-col">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 bg-slate-50 text-slate-900 rounded-3xl flex items-center justify-center font-black text-3xl group-hover:scale-110 transition-transform">
                {a.user?.name?.[0] || '?'}
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-xl leading-tight mb-1">{a.user?.name || 'Verified Alumni'}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Alumni
                </p>
              </div>
            </div>
            <div className="space-y-4 mb-10 flex-1">
              <div className="flex items-center gap-4 text-slate-600 font-bold">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"><Building2 className="w-5 h-5 text-slate-400" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Company</p>
                  <p className="text-sm">{a.company || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-600 font-bold">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"><Briefcase className="w-5 h-5 text-slate-400" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Position</p>
                  <p className="text-sm">{a.role || 'N/A'}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => handleOpenAi(a)}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 active:scale-95"
            >
              <Sparkles className="w-4 h-4" /> Request Referral
            </button>
          </div>
        ))}
      </div>

      {/* AI Referral Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative">
             <div className="bg-slate-900 p-8 text-white">
                <button onClick={() => setShowAiModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X /></button>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                  <h3 className="text-xl font-black">AI Referral Assistant</h3>
                </div>
                <p className="text-slate-400 text-sm font-medium">Crafting the perfect request for <span className="text-white font-bold">{selectedAlumni?.name}</span>.</p>
             </div>
             <div className="p-8">
                <div className="mb-8">
                   <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Generated Message</label>
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed min-h-[120px] relative">
                      {generating ? (
                        <div className="flex items-center justify-center h-full gap-2 font-bold text-slate-400">
                           <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                        </div>
                      ) : (
                        <p>{aiMessage}</p>
                      )}
                   </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowAiModal(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                  <button 
                    onClick={() => handleRequest(selectedAlumni?.id)}
                    disabled={requesting !== null}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> Send Request
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
