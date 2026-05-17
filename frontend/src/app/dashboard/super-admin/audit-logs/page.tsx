'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchAuditLogs } from '@/lib/api';
import { Shield, Clock, User as UserIcon } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs().then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-slate-500">Track all administrative actions across the platform.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">Loading logs...</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">{log.action}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-300" />
                    {log.user.name} ({log.user.email})
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {!loading && logs.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400">No activity recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
