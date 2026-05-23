'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileView from '@/components/ProfileView';
import { useAuth } from '@/context/AuthContext';

export default function ProfileClient() {
  const params = useParams();
  const { token } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token && params.id) {
      fetch(`http://localhost:5000/api/profile/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('User not found or access denied');
          return res.json();
        })
        .then(data => {
          setProfileData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [token, params.id]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="h-96 bg-white rounded-[2.5rem] border border-slate-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-400">Loading user profile...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-12 rounded-[2.5rem] border border-red-100 text-center">
            <h2 className="text-2xl font-black text-red-600 mb-2">Error</h2>
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        ) : (
          <ProfileView data={profileData} />
        )}
      </div>
    </DashboardLayout>
  );
}
