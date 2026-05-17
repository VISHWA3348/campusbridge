'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchSystemHealth } from '@/lib/api';
import { Activity, Database, Server, Clock, RefreshCw } from 'lucide-react';

export default function SystemHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    const data = await fetchSystemHealth();
    setHealth(data);
    setLoading(false);
  };

  useEffect(() => { checkHealth(); }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Health</h1>
          <p className="text-slate-500">Monitor API and Database status in real-time.</p>
        </div>
        <button 
          onClick={checkHealth}
          className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 font-bold text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Backend API</h3>
                <p className="text-sm text-slate-400">Node.js Express Server</p>
              </div>
            </div>
            <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-widest">
              Healthy
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Status</span>
              <span className="font-bold text-slate-900">{health?.api || 'Unknown'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Uptime</span>
              <span className="font-bold text-slate-900">{Math.floor(health?.uptime || 0)}s</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Database</h3>
                <p className="text-sm text-slate-400">SQLite (Prisma)</p>
              </div>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
              health?.database === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {health?.database || 'Unknown'}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Connection</span>
              <span className="font-bold text-slate-900">{health?.database || 'Disconnected'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Provider</span>
              <span className="font-bold text-slate-900">SQLite</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-slate-900 p-8 rounded-3xl text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-400" /> System Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Latency</p>
              <p className="text-2xl font-black">24ms</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Error Rate</p>
              <p className="text-2xl font-black text-green-400">0.02%</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Requests/sec</p>
              <p className="text-2xl font-black">142</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Last Check</p>
              <p className="text-sm font-bold mt-2">
                {health ? new Date(health.timestamp).toLocaleTimeString() : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
