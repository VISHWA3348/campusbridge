'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail');
    if (!savedEmail) router.push('/forgot-password');
    else setEmail(savedEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api'))) + '/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem('resetOTP', otp);
      router.push('/reset-password');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="mb-10 text-center">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Verify OTP</h1>
            <p className="text-slate-400 font-medium text-sm">Enter the 6-digit code sent to your email.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text" required maxLength={6}
                placeholder="000000"
                className="w-full text-center px-8 py-6 bg-slate-50 rounded-3xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-black text-4xl tracking-[0.5em]"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-2 text-center">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div> {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify Code'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
