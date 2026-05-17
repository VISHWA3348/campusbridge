'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchCollegeReferrals } from '@/lib/api';
import { Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function ReferralsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollegeReferrals().then(res => {
      const referrals = Array.isArray(res) ? res : [];
      const stats = {
        total: referrals.length,
        pending: referrals.filter((r: any) => r.status === 'pending').length,
        accepted: referrals.filter((r: any) => r.status === 'accepted').length,
        rejected: referrals.filter((r: any) => r.status === 'rejected').length,
      };
      setData({ referrals, stats });
      setLoading(false);
    }).catch(() => {
      setData({ referrals: [], stats: { total: 0, pending: 0, accepted: 0, rejected: 0 } });
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending', count: data?.stats?.pending || 0, icon: <Clock />, color: 'amber' },
          { label: 'Accepted', count: data?.stats?.accepted || 0, icon: <CheckCircle2 />, color: 'green' },
          { label: 'Rejected', count: data?.stats?.rejected || 0, icon: <XCircle />, color: 'red' },
          { label: 'Total Requests', count: data?.stats?.total || 0, icon: <ArrowRight />, color: 'blue' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className={`w-10 h-10 bg-${s.color}-50 text-${s.color}-600 rounded-xl flex items-center justify-center`}>
              {s.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
              <h3 className="text-xl font-black text-slate-900">{s.count}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Alumni</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Requested On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : data?.referrals?.map((r: any) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{r.student.user.name}</td>
                <td className="px-6 py-4 text-slate-600">{r.alumni.user.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    r.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
