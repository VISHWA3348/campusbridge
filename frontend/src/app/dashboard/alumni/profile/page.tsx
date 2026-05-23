'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileView from '@/components/ProfileView';
import { useAuth } from '@/context/AuthContext';

export default function AlumniProfile() {
  const { user, token } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')) + '/profile/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setProfileData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [token]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-500 font-medium">Your professional identity in the alumni network.</p>
        </div>

        {loading ? (
          <div className="h-96 bg-white rounded-[2.5rem] border border-slate-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-400">Loading your profile...</p>
            </div>
          </div>
        ) : (
          <ProfileView data={profileData} />
        )}
      </div>
    </DashboardLayout>
  );
}
