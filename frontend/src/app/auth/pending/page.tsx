'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PendingApproval() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Link href="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 text-center"
        >
          <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10 relative">
            <Clock className="w-12 h-12" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-amber-100">
               <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Verification Pending</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">
            Your institutional access is currently being reviewed by your college administrator. 
            This process usually takes <b>24-48 hours</b>.
          </p>

          <div className="space-y-4">
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">What happens next?</p>
                <ul className="text-sm font-bold text-slate-600 space-y-3">
                   <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0"></div> Admin verifies your ID card</li>
                   <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0"></div> System creates your dashboard</li>
                   <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0"></div> You receive an email notification</li>
                </ul>
             </div>
             
             <div className="pt-6">
                <p className="text-xs font-medium text-slate-400 mb-6">Need urgent access? Contact your college placement cell.</p>
                <Link href="/" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 inline-block">Return to Home</Link>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
