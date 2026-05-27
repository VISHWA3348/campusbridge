'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileView from '@/components/ProfileView';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, User, Mail, LogIn, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const API_BASE = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1'
  ? 'https://campusbridge-e4cv.onrender.com/api'
  : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : 'https://campusbridge-e4cv.onrender.com/api');

/** Check if a JWT token is expired client-side */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default function SuperAdminProfile() {
  const { user, token, logout } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'token_expired' | 'auth_failed' | 'network' | 'server' | null>(null);

  const fetchProfile = useCallback(async () => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    
    // Check token expiry client-side first
    if (!activeToken) {
      setError('No authentication token found. Please login again.');
      setErrorType('token_expired');
      setLoading(false);
      return;
    }

    if (isTokenExpired(activeToken)) {
      setError('Your session has expired. Please login again to continue.');
      setErrorType('token_expired');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorType(null);

    try {
      // First try the dedicated Super Admin self-profile endpoint
      const res = await fetch(`${API_BASE}/admin/me`, {
        headers: { 
          'Authorization': `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401) {
        const body = await res.json().catch(() => ({}));
        if (body.code === 'TOKEN_EXPIRED' || body.error?.includes('expired')) {
          setError('Your session has expired. Please login again.');
          setErrorType('token_expired');
        } else {
          setError(`Authentication failed: ${body.error || 'Invalid token'}. Please login again.`);
          setErrorType('auth_failed');
        }
        setLoading(false);
        return;
      }

      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        setError(`Access denied: ${body.error || 'Forbidden'}. This page is for Super Admins only.`);
        setErrorType('auth_failed');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        // Fallback: try the general profile endpoint
        const fallbackRes = await fetch(`${API_BASE}/profile/me`, {
          headers: { 
            'Authorization': `Bearer ${activeToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setProfileData(fallbackData);
          setLoading(false);
          return;
        }

        setError(`Failed to load profile (${res.status}). Please try again.`);
        setErrorType('server');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProfileData(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError('Network error. Please check your connection and try again.');
      setErrorType('network');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogoutAndLogin = () => {
    logout();
  };

  const renderError = () => {
    if (errorType === 'token_expired') {
      return (
        <div className="h-96 bg-white rounded-[2.5rem] border border-amber-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 text-center px-8 max-w-md">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-800 mb-2">Session Expired</p>
              <p className="text-sm text-slate-500 mb-6">{error}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleLogoutAndLogin}
                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Login Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-96 bg-white rounded-[2.5rem] border border-red-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center px-8 max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-black text-slate-800 mb-2">Failed to Load Profile</p>
            <p className="text-sm text-slate-500 mb-2">{error}</p>
            {errorType === 'auth_failed' && (
              <p className="text-xs text-slate-400">
                If this keeps happening, try clearing your browser storage and logging in again.
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchProfile}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            {errorType === 'auth_failed' && (
              <button
                onClick={handleLogoutAndLogin}
                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Re-login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSuperAdminProfile = () => {
    if (!profileData) return null;
    
    // For SUPER_ADMIN, show a dedicated admin profile card
    if (profileData.role === 'SUPER_ADMIN') {
      return (
        <div className="space-y-8">
          {/* Admin Header Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full -ml-24 -mb-24 blur-3xl" />
            
            <div className="relative flex flex-col md:flex-row items-start gap-10">
              <div className="w-32 h-32 bg-indigo-500/20 border-2 border-indigo-400/30 rounded-[2rem] flex items-center justify-center shrink-0">
                {profileData.profilePhoto ? (
                  <img src={profileData.profilePhoto} alt={profileData.name} className="w-full h-full object-cover rounded-[2rem]" />
                ) : (
                  <ShieldCheck className="w-16 h-16 text-indigo-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Super Administrator
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                    ● Active
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tighter">
                  {profileData.name}
                </h1>
                <p className="text-slate-400 font-medium mb-6">
                  {profileData.bio || 'Platform Administrator — Global System Control'}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    {profileData.email}
                  </div>
                  {profileData.college && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <User className="w-4 h-4 text-indigo-400" />
                      {profileData.college.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Role', value: 'Super Administrator', icon: <ShieldCheck className="w-5 h-5 text-indigo-500" /> },
              { label: 'Account Status', value: 'Active & Verified', icon: <User className="w-5 h-5 text-emerald-500" /> },
              { label: 'Email', value: profileData.email, icon: <Mail className="w-5 h-5 text-blue-500" /> },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                </div>
                <p className="text-sm font-black text-slate-900 truncate">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6">Admin Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Manage Colleges', href: '/dashboard/super-admin/colleges' },
                { label: 'Manage Users', href: '/dashboard/super-admin/users' },
                { label: 'Subscriptions', href: '/dashboard/super-admin/subscriptions' },
                { label: 'System Settings', href: '/dashboard/super-admin/settings' },
              ].map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all group"
                >
                  <span className="font-bold text-sm text-slate-700 group-hover:text-white">{link.label}</span>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // For other roles viewing their profile through this page
    return <ProfileView data={profileData} />;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-2">System Admin Profile</h1>
          <p className="text-slate-500 font-medium">Global administrator profile and account details.</p>
        </div>

        {loading ? (
          <div className="h-96 bg-white rounded-[2.5rem] border border-slate-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-400">Loading profile...</p>
            </div>
          </div>
        ) : error ? (
          renderError()
        ) : (
          renderSuperAdminProfile()
        )}
      </div>
    </DashboardLayout>
  );
}
