'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ArrowLeft, Lock, Mail, Loader2 } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleLoginSuccess = (data: any) => {
    login(data.token, data.user);
    const role = data.user.role;
    if (role === 'SUPER_ADMIN') router.push('/dashboard/super-admin');
    else if (role === 'COLLEGE_ADMIN') router.push('/dashboard/college-admin');
    else if (role === 'ALUMNI') router.push('/dashboard/alumni');
    else router.push('/dashboard/student');
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api')
        ? process.env.NEXT_PUBLIC_API_URL
        : 'https://campusbridge-e4cv.onrender.com/api';
      const res = await fetch(baseUrl + '/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      
      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.error('Failed to parse Google login JSON:', jsonErr);
          throw new Error('Server returned an invalid JSON response. Please try again.');
        }
      } else {
        const text = await res.text();
        console.error('Server returned non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned an invalid response. Please ensure the backend is running.');
      }
      
      if (!res.ok) {
        if (data.status === 'PENDING_APPROVAL') {
          router.push('/auth/pending');
          return;
        }
        if (data.status === 'REJECTED') {
          router.push(`/auth/rejected?reason=${encodeURIComponent(data.rejectionReason || '')}`);
          return;
        }
        throw new Error(data.error || 'Login failed. Please try again.');
      }
      
      handleLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api')
        ? process.env.NEXT_PUBLIC_API_URL
        : 'https://campusbridge-e4cv.onrender.com/api';
      const res = await fetch(baseUrl + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.error('Failed to parse login JSON:', jsonErr);
          throw new Error('Server returned an invalid JSON response. Please try again.');
        }
      } else {
        const text = await res.text();
        console.error('Server returned non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned an invalid response. Please ensure the backend is running.');
      }
      
      if (!res.ok) {
        if (data.status === 'PENDING_APPROVAL') {
          router.push('/auth/pending');
          return;
        }
        if (data.status === 'REJECTED') {
          router.push(`/auth/rejected?reason=${encodeURIComponent(data.rejectionReason || '')}`);
          return;
        }
        throw new Error(data.error || 'Login failed. Please try again.');
      }
      
      handleLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-400 font-medium">Log in to your professional dashboard.</p>
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

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input 
                  type="password" required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
               <Link href="/forgot-password" className="text-xs font-black text-indigo-600 hover:underline">Forgot password?</Link>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div> {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Log in Now'}
            </button>
          </form>

          <div className="mt-8 mb-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-100"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-300">Or continue with</p>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <div className="flex justify-center w-full [&>div]:w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in failed. Please try again.')}
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
            />
          </div>

          <p className="text-center mt-8 text-slate-400 font-medium">
            Don't have an account? <Link href="/signup" className="text-indigo-600 font-black hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'placeholder'}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}
