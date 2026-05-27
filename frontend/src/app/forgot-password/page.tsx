'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api'))) + '/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      // Store email for next steps
      sessionStorage.setItem('resetEmail', email);
      router.push('/forgot-password/verify');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100"
        >
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-10">
            <div className="h-1.5 flex-1 bg-indigo-600 rounded-full"></div>
            <div className="h-1.5 flex-1 bg-slate-100 rounded-full"></div>
            <div className="h-1.5 flex-1 bg-slate-100 rounded-full"></div>
          </div>

          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Forgot Password?</h1>
            <p className="text-slate-400 font-medium text-sm">Enter your registered email address to receive a 6-digit verification code.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input 
                  type="email" required
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div> {error}
              </motion.div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Send Verification Code'}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-400 text-xs font-medium italic">
            Don't worry, we'll help you get back into your account.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
