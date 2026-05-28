'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MailCheck, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found.');
      return;
    }

    fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')}/auth/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatus('error');
          setMessage(data.error);
        } else {
          setStatus('success');
          setMessage(data.message);
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Failed to connect to the server.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 text-center">
        {status === 'loading' && (
          <div className="py-20">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Verifying Email</h1>
            <p className="text-slate-500 font-medium">Please wait while we validate your link...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-20">
            <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <MailCheck className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Verified!</h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">{message}</p>
            <Link href="/login" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black transition-all hover:shadow-2xl">Login to Your Account</Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-20">
            <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <XCircle className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Link Expired</h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">{message}</p>
            <Link href="/signup" className="text-indigo-600 font-black hover:underline">Try signing up again</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 text-indigo-600 animate-spin" /></div>}>
      <VerifyEmailContent />
    </React.Suspense>
  );
}
