'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchAdminPlacements, fetchAdminPlacementStats } from '@/lib/api';
import { Loader2, Search, Building2, TrendingUp, Briefcase, GraduationCap, Award } from 'lucide-react';

export default function SuperAdminPlacementsPage() {
  const [placements, setPlacements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pData, sData] = await Promise.all([
          fetchAdminPlacements(),
          fetchAdminPlacementStats()
        ]);
        setPlacements(Array.isArray(pData) ? pData : []);
        setStats(sData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const colleges = Array.from(new Set(placements.map(p => p.student?.user?.college?.name).filter(Boolean)));
  const companies = Array.from(new Set(placements.map(p => p.company).filter(Boolean)));
  const departments = Array.from(new Set(placements.map(p => p.student?.department).filter(Boolean)));

  const filteredPlacements = placements.filter(p => {
    const matchesSearch = p.student?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.role?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollege = collegeFilter ? p.student?.user?.college?.name === collegeFilter : true;
    const matchesCompany = companyFilter ? p.company === companyFilter : true;
    const matchesDept = deptFilter ? p.student?.department === deptFilter : true;
    return matchesSearch && matchesCollege && matchesCompany && matchesDept;
  });

  return (
    <DashboardLayout>
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Global Placements</h1>
        <p className="text-slate-500 font-medium text-lg">Monitor placement activity across all institutions.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-indigo-600" /></div>
      ) : (
        <>
          {/* Global Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] -mr-16 -mt-16"></div>
              <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-4 relative z-10">
                <Briefcase className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 relative z-10">Global Placements</p>
              <h3 className="text-4xl font-black text-white relative z-10">{stats?.total || 0}</h3>
            </div>
            
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm col-span-1 lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Top Performing Colleges
                  </p>
                  <div className="space-y-3">
                    {stats?.topColleges?.map((c: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-700 truncate pr-4">{c.name}</span>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Top Global Employers
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stats?.topCompanies?.map((c: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                        <span className="font-bold text-xs text-slate-900">{c.name}</span>
                        <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search globally..."
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-xs uppercase tracking-widest appearance-none text-slate-600" value={collegeFilter} onChange={e => setCollegeFilter(e.target.value)}>
              <option value="">All Colleges</option>
              {colleges.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
            </select>
            <select className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-xs uppercase tracking-widest appearance-none text-slate-600" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}>
              <option value="">All Companies</option>
              {companies.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
            </select>
            <select className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-xs uppercase tracking-widest appearance-none text-slate-600" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d as string} value={d as string}>{d as string}</option>)}
            </select>
          </div>

          {/* Global Data Table */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Student & College</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Placement Details</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Compensation & Mode</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Alumni Referrer</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPlacements.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-black text-xs">
                            {p.student?.user?.name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{p.student?.user?.name}</p>
                            <p className="text-[10px] font-black uppercase text-slate-500 truncate max-w-[200px]">{p.student?.user?.college?.name}</p>
                            <p className="text-[10px] font-black uppercase text-indigo-500">{p.student?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-900">{p.company}</p>
                        <p className="text-[10px] font-black uppercase text-indigo-600">{p.role}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-900">{p.salary || 'Undisclosed'}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400">{p.mode || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-6">
                        {(p.alumni || p.referral?.alumni) ? (
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span className="font-bold text-sm text-slate-700">{p.alumni?.user?.name || p.referral?.alumni?.user?.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-300 italic">Self-applied</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-500">
                        {new Date(p.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {filteredPlacements.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-medium italic">
                        No placement records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
