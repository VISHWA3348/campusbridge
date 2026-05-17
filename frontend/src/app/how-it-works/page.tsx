'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  ShieldCheck, 
  UserCircle, 
  Users, 
  Zap, 
  Video, 
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    title: 'Instant Signup',
    desc: 'Register as a student or alumni and select your institution from our verified list.',
    icon: <UserPlus />,
    color: 'blue'
  },
  {
    title: 'Account Verification',
    desc: 'Our team and college admins verify your institutional ID to ensure a safe environment.',
    icon: <ShieldCheck />,
    color: 'indigo'
  },
  {
    title: 'Complete Profile',
    desc: 'Showcase your skills, academic achievements, and professional interests to the community.',
    icon: <UserCircle />,
    color: 'blue'
  },
  {
    title: 'Connect & Engage',
    desc: 'Search for mentors, join community groups, and start building meaningful connections.',
    icon: <Users />,
    color: 'indigo'
  },
  {
    title: 'Request Referrals',
    desc: 'Apply for job referrals directly from verified alumni at your target companies.',
    icon: <Zap />,
    color: 'blue'
  },
  {
    title: 'Attend Events',
    desc: 'Participate in live webinars and mentorship sessions hosted by industry experts.',
    icon: <Video />,
    color: 'indigo'
  },
  {
    title: 'Career Success',
    desc: 'Land your dream role and track your placement growth within your institutional network.',
    icon: <TrendingUp />,
    color: 'blue'
  }
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      <Navbar />
      
      <main className="pt-48 pb-24 px-6 relative overflow-hidden">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px]"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-32">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Simple 7-Step Workflow
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 text-slate-900"
            >
              How it <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-600">Works</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 max-w-2xl mx-auto mb-14 font-medium leading-relaxed"
            >
              Follow our proven journey from registration to professional success. Every step is designed to maximize your potential.
            </motion.p>
          </div>

          {/* Steps Timeline */}
          <div className="relative">
             {/* Timeline Line */}
             <div className="absolute left-[31px] md:left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2 hidden md:block"></div>

             <div className="space-y-24">
                {steps.map((step, i) => (
                   <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`flex flex-col md:flex-row gap-12 items-center ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                   >
                      <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                         <div className="flex items-center gap-4 mb-6">
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Step 0{i+1}</span>
                         </div>
                         <h3 className="text-3xl font-black mb-6 tracking-tight">{step.title}</h3>
                         <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md">
                            {step.desc}
                         </p>
                      </div>

                      {/* Timeline Dot */}
                      <div className="w-16 h-16 bg-white border-4 border-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl relative z-10 flex-shrink-0 group hover:bg-indigo-600 hover:text-white transition-all duration-500">
                         {step.icon}
                      </div>

                      <div className="md:w-1/2">
                         {/* Placeholder for illustration/image */}
                         <div className="aspect-[16/10] bg-slate-50 rounded-[3rem] border border-slate-100 p-8 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                               <Sparkles className="w-20 h-20 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700" />
                            </div>
                         </div>
                      </div>
                   </motion.div>
                ))}
             </div>
          </div>

          {/* Final CTA */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-48 p-12 md:p-24 bg-slate-900 rounded-[4rem] text-center text-white relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
             <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">Ready to take the first step?</h2>
                <p className="text-slate-400 text-lg font-medium mb-12">Join thousands of students and alumni who are already transforming their professional lives through our platform.</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                   <Link href="/signup" className="w-full md:w-auto px-12 py-6 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl group">
                      Get Started Now <ArrowRight className="w-5 h-5 inline ml-2 group-hover:translate-x-1 transition-transform" />
                   </Link>
                   <Link href="/contact" className="w-full md:w-auto px-12 py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                      Speak to Us
                   </Link>
                </div>
             </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
