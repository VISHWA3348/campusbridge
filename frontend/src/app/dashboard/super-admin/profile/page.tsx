'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileView from '@/components/ProfileView';
import { useAuth } from '@/context/AuthContext';

const API_BASE = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1'
  ? 'https://campusbridge-e4cv.onrender.com/api'
  : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : 'https://campusbridge-e4cv.onrender.com/api');

export default function SuperAdminProfile() {
  const { user, token, logout } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    
    if (!activeToken) {
      setError('No authentication token found. Please login again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/profile/me`, {
        headers: { 
          'Authorization': `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401) {
        const body = await res.json().catch(() => ({}));
        if (body.code === 'TOKEN_EXPIRED') {
          setError('Your session has expired. Please login again.');
          setTimeout(() => logout(), 2000);
        } else {
          setError('Authentication failed. Please login again.');
        }
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(`Failed to load profile (${res.status}). Please try again.`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProfileData(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-2">System Admin Profile</h1>
          <p className="text-slate-500 font-medium">Global administrator profile.</p>
        </div>

        {loading ? (
          <div className="h-96 bg-white rounded-[2.5rem] border border-slate-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-400">Loading profile...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-96 bg-white rounded-[2.5rem] border border-red-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center px-8">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 mb-2">Failed to Load Profile</p>
                <p className="text-sm text-slate-500 mb-6">{error}</p>
              </div>
              <button
                onClick={fetchProfile}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <ProfileView data={profileData} />
        )}
      </div>
    </DashboardLayout>
  );
}
