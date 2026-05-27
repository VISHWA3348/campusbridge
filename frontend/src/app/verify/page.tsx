'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found.');
      return;
    }

    fetch(`${(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api'))}/auth/verify?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, [searchParams]);

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 text-center">
      {status === 'loading' && (
        <div className="py-12">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-black text-slate-900 mb-2">Verifying Email...</h1>
          <p className="text-slate-400 font-medium">Please wait while we secure your account.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-12">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Email Verified!</h1>
          <p className="text-slate-500 font-medium mb-10">{message}</p>
          <Link href="/login" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            Continue to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="py-12">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Verification Failed</h1>
          <p className="text-slate-500 font-medium mb-10">{message}</p>
          <Link href="/signup" className="text-indigo-600 font-black hover:underline">
            Try Signing Up Again
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
