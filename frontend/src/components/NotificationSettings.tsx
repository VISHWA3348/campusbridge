'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Smartphone, Bell, Save, AlertCircle } from 'lucide-react';

export default function NotificationSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      const rawBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com');
      const baseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
      const res = await fetch(baseUrl + '/notifications/settings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch settings');
      }

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        
        // Convert backend object to frontend array format for the table
        const mappedSettings = [
          { type: 'WEBINARS', email: data.webinarAlerts, push: data.webinarPush },
          { type: 'JOBS', email: data.jobAlerts, push: data.jobPush },
          { type: 'REFERRALS', email: data.referralAlerts, push: data.referralPush },
          { type: 'CHATS', email: data.chatAlerts, push: data.chatPush }
        ];
        setSettings(mappedSettings);
      } else {
        throw new Error('Server returned non-JSON response');
      }
    } catch (e) {
      console.error('Error fetching notification settings:', e);
      setMessage({ type: 'error', text: 'Failed to load notification settings. Please refresh.' });
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = (type: string, field: 'email' | 'push') => {
    setSettings(prev => prev.map(s => 
      s.type === type ? { ...s, [field]: !s[field] } : s
    ));
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // Map back to backend structure
      const payload = {
        emailEnabled: settings.some(s => s.email),
        pushEnabled: settings.some(s => s.push),
        webinarAlerts: settings.find(s => s.type === 'WEBINARS')?.email || false,
        jobAlerts: settings.find(s => s.type === 'JOBS')?.email || false,
        referralAlerts: settings.find(s => s.type === 'REFERRALS')?.email || false,
        chatAlerts: settings.find(s => s.type === 'CHATS')?.email || false,
        webinarPush: settings.find(s => s.type === 'WEBINARS')?.push || false,
        jobPush: settings.find(s => s.type === 'JOBS')?.push || false,
        referralPush: settings.find(s => s.type === 'REFERRALS')?.push || false,
        chatPush: settings.find(s => s.type === 'CHATS')?.push || false,
      };

      const rawBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com');
      const baseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
      const res = await fetch(baseUrl + '/notifications/settings', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        if (!res.ok) {
          throw new Error("Server returned invalid response");
        }
      }

      if (res.ok) {
        setMessage({ type: 'success', text: 'Notification preferences updated successfully!' });
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to update preferences. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-xl">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading preferences...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Notification Preferences</h2>
        <p className="text-slate-500 font-medium">Choose how you want to be notified for different activities.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {message.type === 'success' ? <Save className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Type</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">In-App Alert</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Email Notify</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Push / SMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {settings.map((s) => (
                <tr key={s.type} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 capitalize">{s.type.replace('_', ' ').toLowerCase()}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Real-time alerts</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 bg-green-50 text-green-600 rounded-md flex items-center justify-center">
                        <Save className="w-4 h-4" />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={s.email}
                          onChange={() => handleToggle(s.type, 'email')}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={s.push}
                          onChange={() => handleToggle(s.type, 'push')}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-400">
            <Mail className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Updates are instant</span>
          </div>
          <button 
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
