'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchAlumniPlacements } from '@/lib/api';
import { Loader2, Briefcase, Building2, Calendar, MapPin, DollarSign, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AlumniPlacementsPage() {
  const [placements, setPlacements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAlumniPlacements();
        setPlacements(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Mentorship & Referrals Success</h1>
          <p className="text-slate-500 font-medium text-lg">See the students you helped place in the industry.</p>
        </div>
      </div>

      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] -ml-32 -mt-32"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-3xl flex items-center justify-center font-black">
            <Award className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-black mb-1">{placements.length}</h2>
            <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">Total Students Placed With Your Help</p>
          </div>
        </div>
        <Link href="/dashboard/alumni/referrals" className="relative z-10 flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-bold text-sm">
          View Pending Referrals <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-indigo-600" /></div>
      ) : placements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {placements.map(p => (
            <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center font-black text-xl">
                  {p.student?.user?.name?.[0]}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{p.student?.user?.name}</h3>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{p.student?.department}</p>
                </div>
              </div>

              <div className="space-y-4 relative z-10 bg-slate-50 p-5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  <span className="font-bold text-slate-900 text-sm">{p.company}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-600 text-sm">{p.role}</span>
                </div>
                {p.salary && (
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <DollarSign className="w-4 h-4 text-slate-400" /> {p.salary}
                  </div>
                )}
                <div className="flex items-center gap-3 text-slate-500 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" /> {new Date(p.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <Award className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">No Placed Students Yet</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">Start mentoring or referring students to help them land their dream jobs.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
