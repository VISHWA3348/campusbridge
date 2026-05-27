'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ImageUpload from '@/components/ImageUpload';
import { useAuth } from '@/context/AuthContext';
import { Save, Globe, Shield, ToggleLeft, ToggleRight, User, FileText } from 'lucide-react';
import NotificationSettings from '@/components/NotificationSettings';

export default function SuperAdminSettings() {
  const { user, token, refreshUser } = useAuth();
  const [personalData, setPersonalData] = useState({
    name: '',
    bio: ''
  });
  const [platformName, setPlatformName] = useState('CampusBridge');
  const [features, setFeatures] = useState([
    { id: 'referrals', name: 'Referral System', enabled: true },
    { id: 'jobs', name: 'Job Postings', enabled: true },
    { id: 'chat', name: 'Real-time Chat', enabled: true },
    { id: 'webinars', name: 'Webinar Portal', enabled: true }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user && token) {
      const baseUrl = ((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api')));
      
      // Fetch profile
      fetch(baseUrl + '/profile/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setPersonalData({
          name: data.name || '',
          bio: data.bio || ''
        });
      })
      .catch(err => console.error(err));

      // Fetch global platform settings
      fetch(baseUrl + '/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.platformName) {
          setPlatformName(data.platformName);
        }
        if (Array.isArray(data.features)) {
          const map = (name: string) => {
            const n = name.toLowerCase();
            if (n === 'chat system' || n === 'chat' || n === 'real-time chat') return 'chat';
            if (n === 'job portal' || n === 'jobs' || n === 'job postings') return 'jobs';
            if (n === 'webinar module' || n === 'webinars' || n === 'webinar portal') return 'webinars';
            if (n === 'referral system' || n === 'referrals') return 'referrals';
            return null;
          };
          
          setFeatures(prev => prev.map(f => {
            const dbFeat = data.features.find((df: any) => map(df.featureName) === f.id);
            return dbFeat ? { ...f, enabled: dbFeat.enabled } : f;
          }));
        }
      })
      .catch(err => console.error(err));
    }
  }, [user, token]);

  const toggleFeature = async (id: string) => {
    // Instantly update local UI state
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    
    // Call server to toggle feature
    try {
      const baseUrl = ((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api')));
      
      const res = await fetch(`${baseUrl}/admin/features/${id}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('Failed to update feature toggle on server');
      }
    } catch (err: any) {
      console.error(err);
      // Revert UI state on failure
      setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
      setMessage('Failed to toggle feature. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const baseUrl = ((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api')));

      // 1. Update personal profile
      const res = await fetch(baseUrl + '/profile/me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(personalData)
      });
      
      if (!res.ok) throw new Error('Failed to update personal settings');

      // 2. Update platform name
      const platformRes = await fetch(baseUrl + '/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ platformName })
      });

      if (!platformRes.ok) throw new Error('Failed to update platform settings');

      if (user && token) {
        await refreshUser();
      }

      setMessage('Settings updated successfully!');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    const baseUrl = ((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api')));
    const fd = new FormData();
    fd.append('photo', file);
    const res = await fetch(baseUrl + '/profile/photo', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: fd
    });
    if (res.ok) {
      await refreshUser();
    }
  };

  const handlePhotoRemove = async () => {
    const baseUrl = ((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api')));
    const res = await fetch(baseUrl + '/profile/photo', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      await refreshUser();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Platform Settings</h1>
          <p className="text-slate-500 font-medium">Control global platform features and manage your admin profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Profile Section */}
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="text-xl font-black text-slate-900 mb-8">Personal Profile</h3>
            
            <ImageUpload 
              currentImage={user?.profilePhoto} 
              onUpload={handlePhotoUpload} 
              onRemove={handlePhotoRemove} 
            />

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input
                    type="text" required
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={personalData.name}
                    onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Bio</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-slate-300 w-4 h-4" />
                  <textarea
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm min-h-[100px]"
                    value={personalData.bio}
                    onChange={(e) => setPersonalData({ ...personalData, bio: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Platform Controls */}
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="text-xl font-black text-slate-900 mb-8">Platform Control</h3>
            
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Platform Name</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input 
                    type="text" required
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">Feature Control</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map(feature => (
                    <div key={feature.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <Shield className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm text-slate-700">{feature.name}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => toggleFeature(feature.id)}
                        className="transition-transform active:scale-95"
                      >
                        {feature.enabled ? <ToggleRight className="w-10 h-10 text-indigo-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-xs font-black uppercase tracking-widest ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-sm hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50"
          >
            <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save All Settings'}
          </button>
        </form>

        <div className="mt-12">
          <NotificationSettings />
        </div>
      </div>
    </DashboardLayout>
  );
}
