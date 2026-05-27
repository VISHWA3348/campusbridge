'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchCollegeWebinars } from '@/lib/api';
import { Video, Calendar, Users, ArrowUpRight } from 'lucide-react';

export default function WebinarsPage() {
  const [webinars, setWebinars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollegeWebinars()
      .then(data => {
        setWebinars(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Failed to fetch college webinars:", err);
        setWebinars([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Alumni Webinars</h1>
        <p className="text-slate-500">Monitor engagement and participation in alumni-hosted events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Loading events...</div>
        ) : webinars.map((w) => (
          <div key={w.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:border-indigo-200 transition-all">
            <div className="p-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2 leading-tight">{w.title}</h3>
              <p className="text-xs text-slate-500 mb-4 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> {new Date(w.date).toLocaleDateString()}
              </p>
              
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Host</p>
                  <p className="text-sm font-bold text-slate-700">{w.alumni?.user?.name || 'Unknown'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Registered</p>
                  <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                    <Users className="w-4 h-4" />
                    <span>{w._count?.registrations || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full py-4 bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all">
              View Participant List <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        ))}
        {webinars.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">No webinars scheduled yet.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
