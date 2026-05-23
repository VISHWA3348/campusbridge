'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { XCircle, ArrowLeft, AlertTriangle, RefreshCcw, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

function VerificationRejectedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Link href="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 text-center"
        >
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10">
            <XCircle className="w-12 h-12" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Access Rejected</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8">
            Unfortunately, your account verification request was rejected by the college administrator.
          </p>

          <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 text-left mb-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertTriangle className="w-12 h-12 text-red-900" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-3">Rejection Reason</p>
             <p className="text-red-900 font-black text-lg italic leading-tight">
                "{reason || 'No specific reason provided by the administrator.'}"
             </p>
          </div>

          <div className="space-y-4">
             <Link href="/signup" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
                <RefreshCcw className="w-5 h-5" /> Try Again with Correct Info
             </Link>
             
             <Link href="/contact" className="w-full bg-white text-slate-600 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all border border-slate-100 flex items-center justify-center gap-3">
                <HelpCircle className="w-5 h-5" /> Contact Support
             </Link>
          </div>
          
          <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
             Please ensure your ID card is clear and all details are correct.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerificationRejected() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading...</div>}>
      <VerificationRejectedContent />
    </Suspense>
  );
}
