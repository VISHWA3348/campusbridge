'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchAlumniReferrals, updateReferralStatus } from '@/lib/api';
import { CheckCircle2, XCircle, Clock, User, Mail, ShieldCheck } from 'lucide-react';

export default function AlumniReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAlumniReferrals();
    if (Array.isArray(data)) {
      setReferrals(data);
    } else {
      setReferrals([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (id: number, status: string) => {
    await updateReferralStatus(id, status);
    loadData();
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Referral Requests</h1>
        <p className="text-slate-500">Manage incoming requests from students in your network.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Requested On</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-medium">Loading requests...</td></tr>
            ) : referrals.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {r.student?.user?.name ? r.student.user.name[0] : '?'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{r.student?.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" /> {r.student?.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-300" />
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    r.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {r.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleAction(r.id, 'rejected')}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleAction(r.id, 'accepted')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" /> Accept
                      </button>
                    </div>
                  )}
                  {r.status !== 'pending' && (
                    <span className="text-xs text-slate-400 font-medium italic">Action Taken</span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && referrals.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold">No referral requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
