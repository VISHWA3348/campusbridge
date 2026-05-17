'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail');
    const savedOTP = localStorage.getItem('resetOTP');
    if (!savedEmail || !savedOTP) router.push('/forgot-password');
    else {
      setEmail(savedEmail);
      setOtp(savedOTP);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(true);
      localStorage.removeItem('resetEmail');
      localStorage.removeItem('resetOTP');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Password Reset!</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">Your password has been updated successfully. Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Set New Password</h1>
            <p className="text-slate-400 font-medium text-sm">Choose a strong password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-4">New Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input 
                  type="password" required
                  placeholder="••••••••"
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-3xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-4">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input 
                  type="password" required
                  placeholder="••••••••"
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-3xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div> {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
