'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchStudentReferrals } from '@/lib/api';
import { Clock, CheckCircle2, XCircle, User, MapPin, Briefcase } from 'lucide-react';

export default function StudentReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchStudentReferrals();
      if (Array.isArray(data)) {
        setReferrals(data);
      } else {
        setReferrals([]);
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
      setReferrals([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Referral Tracker</h1>
        <p className="text-slate-500 font-medium">Keep track of all your referral requests and their status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Pending', count: referrals.filter(r => r.status === 'pending').length, icon: <Clock />, color: 'amber' },
          { label: 'Accepted', count: referrals.filter(r => r.status === 'accepted').length, icon: <CheckCircle2 />, color: 'green' },
          { label: 'Rejected', count: referrals.filter(r => r.status === 'rejected').length, icon: <XCircle />, color: 'red' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-5">
            <div className={`w-14 h-14 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center`}>
              {React.isValidElement(stat.icon) ? React.cloneElement(stat.icon as React.ReactElement<any>, { className: 'w-7 h-7' }) : stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.count}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900">Request History</h3>
          <span className="px-4 py-2 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100">
            {referrals.length} Total Requests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Alumni Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company & Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Requested Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p className="text-sm font-bold text-slate-400">Loading your referrals...</p>
                    </div>
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-black text-slate-900 mb-2">No Referrals Yet</h4>
                      <p className="text-sm text-slate-400 font-medium mb-6">Search for alumni from your college to request a referral and kickstart your career.</p>
                      <a href="/dashboard/student/alumni" className="inline-flex px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">Find Alumni</a>
                    </div>
                  </td>
                </tr>
              ) : referrals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg overflow-hidden border-2 border-slate-100 shadow-sm">
                        {r.alumni?.user?.profilePhoto ? (
                          <img src={`http://localhost:5000/${r.alumni.user.profilePhoto}`} alt={r.alumni.user.name} className="w-full h-full object-cover" />
                        ) : (
                          r.alumni?.user?.name?.[0] || '?'
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight mb-1">{r.alumni?.user?.name || 'N/A'}</p>
                        <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Alumni</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                        {r.alumni?.company || 'Not Specified'}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-200" />
                        {r.alumni?.role || 'Engineer'}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      r.status === 'accepted' ? 'bg-green-50 text-green-600 border border-green-100' :
                      r.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' : 
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        r.status === 'accepted' ? 'bg-green-600' :
                        r.status === 'rejected' ? 'bg-red-600' : 'bg-amber-600'
                      }`} />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-bold text-slate-900">{new Date(r.createdAt).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Requested On</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
