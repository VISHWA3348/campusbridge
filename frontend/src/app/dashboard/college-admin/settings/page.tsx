'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ImageUpload from '@/components/ImageUpload';
import { useAuth } from '@/context/AuthContext';
import { Save, Building2, Hash, Layers, Users, User, FileText } from 'lucide-react';
import NotificationSettings from '@/components/NotificationSettings';

export default function CollegeAdminSettings() {
  const { user, token, refreshUser, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    collegeName: '',
    collegeCode: '',
    departments: '',
    studentCount: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      // Fetch user profile for personal details
      fetch(`${(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api'))}/profile/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          if (!res.ok) throw new Error('Failed to fetch profile');
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return res.json();
          }
          throw new Error('Non-JSON response');
        })
        .then(data => {
          setFormData(prev => ({
            ...prev,
            name: data.name || '',
            bio: data.bio || '',
            collegeName: data.college?.name || '',
            collegeCode: data.college?.collegeCode || '',
            departments: data.college?.departments || '',
            studentCount: data.college?._count?.users?.toString() || '0'
          }));
        })
        .catch(err => console.error(err));
    }
  }, [user, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Update personal profile
      const profileRes = await fetch(((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api'))) + '/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: formData.name, bio: formData.bio })
      });

      if (!profileRes.ok) {
        const contentType = profileRes.headers.get('content-type');
        let errMessage = 'Failed to update personal profile';
        if (contentType && contentType.includes('application/json')) {
          const errData = await profileRes.json();
          errMessage = errData.error || errMessage;
        }
        throw new Error(errMessage);
      }

      const profileData = await profileRes.json();
      if (profileData.user && updateUser) {
        updateUser(profileData.user);
      } else {
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
    const fd = new FormData();
    fd.append('photo', file);
    const res = await fetch(((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api'))) + '/profile/photo', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: fd
    });
    if (res.ok) {
      await refreshUser();
    }
  };

  const handlePhotoRemove = async () => {
    const res = await fetch(((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api'))) + '/profile/photo', {
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
          <h1 className="text-3xl font-black text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-500 font-medium">Manage your personal profile and institution details.</p>
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Bio / Role Description</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-slate-300 w-4 h-4" />
                  <textarea
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm min-h-[100px]"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Institution Section (Read-Only) */}
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="text-xl font-black text-slate-900 mb-8">Institution Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">College Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <p className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent font-bold text-sm text-slate-500">
                    {formData.collegeName}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">College Code</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <p className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent font-bold text-sm text-slate-500">
                    {formData.collegeCode}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Departments (Current)</label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <p className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent font-bold text-sm text-slate-500">
                  {formData.departments}
                </p>
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
            <Save className="w-5 h-5" /> {loading ? 'Saving Changes...' : 'Save All Settings'}
          </button>
        </form>

        <div className="mt-12">
          <NotificationSettings />
        </div>
      </div>
    </DashboardLayout>
  );
}
