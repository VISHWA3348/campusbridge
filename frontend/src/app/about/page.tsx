'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  Target, 
  Eye, 
  Users, 
  Heart, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      <Navbar />
      
      <main className="pt-48 pb-24 px-6 relative overflow-hidden">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px]"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-32">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-sm"
            >
              <Heart className="w-3.5 h-3.5" /> Driven by Purpose
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 text-slate-900"
            >
              Bridging the Gap Between <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Education & Success</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 max-w-3xl mx-auto mb-14 font-medium leading-relaxed"
            >
              CampusBridge was born from a simple idea: that the most valuable resource for a student's career growth is the wisdom and network of those who walked the same halls before them.
            </motion.p>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-48">
             <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-12 md:p-20 bg-slate-900 text-white rounded-[4rem] relative overflow-hidden group"
             >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-indigo-600/20 transition-all"></div>
                <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-blue-900/20">
                   <Target className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-black mb-8 tracking-tight">Our Mission</h2>
                <p className="text-slate-400 font-medium text-lg leading-relaxed">
                   To empower every student with a verified professional network, providing equal access to mentorship and referral opportunities regardless of their background or personal connections.
                </p>
             </motion.div>

             <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-12 md:p-20 bg-indigo-50 rounded-[4rem] relative overflow-hidden group"
             >
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 mb-10 shadow-sm group-hover:scale-110 transition-transform">
                   <Eye className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-black mb-8 tracking-tight text-slate-900">Our Vision</h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                   To become the global standard for institutional alumni-student interaction, fostering a culture of lifelong giving back and professional excellence within academic communities.
                </p>
             </motion.div>
          </div>

          {/* Company Story */}
          <section className="mb-48" id="mission">
             <div className="flex flex-col lg:flex-row gap-20 items-center">
                <div className="lg:w-1/2">
                   <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" /> Why We Started
                   </div>
                   <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 leading-[0.9]">Built by Students, <br/><span className="text-indigo-600">for the Future.</span></h2>
                   <div className="space-y-6 text-slate-500 font-medium text-lg leading-relaxed">
                      <p>
                         Traditional job boards and social networks are often overwhelming and impersonal. For students, breaking into the professional world can feel like navigating a maze without a map.
                      </p>
                      <p>
                         We realized that the most authentic guidance comes from alumni who understand the specific challenges of their institution. By creating a verified environment, we ensure that every connection made on our platform is built on trust and shared heritage.
                      </p>
                   </div>
                </div>
                <div className="lg:w-1/2 grid grid-cols-2 gap-6">
                   {[
                      { icon: <Users />, label: 'Verified Community', color: 'blue' },
                      { icon: <TrendingUp />, label: 'Career Growth', color: 'indigo' },
                      { icon: <ShieldCheck />, label: 'Secure Networking', color: 'slate' },
                      { icon: <Building2 />, label: 'Institutional Success', color: 'blue' }
                   ].map((item, i) => (
                      <div key={i} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all">
                         <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-${item.color}-600 mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                            {item.icon}
                         </div>
                         <p className="font-black text-slate-900 tracking-tight">{item.label}</p>
                      </div>
                   ))}
                </div>
             </div>
          </section>

          {/* Team Preview CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 md:p-24 bg-slate-900 rounded-[4rem] text-center text-white relative overflow-hidden"
          >
             <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -mr-32 -mb-32"></div>
             <div className="relative z-10 max-w-2xl mx-auto">
                <h3 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">Meet the Minds Behind the Platform</h3>
                <p className="text-slate-400 text-lg font-medium mb-12">Our diverse team of innovators and educators is dedicated to building a better professional future for everyone.</p>
                <Link href="/team" className="inline-flex items-center gap-3 px-12 py-6 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-indigo-900/20 group">
                   View Our Team <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
             </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
