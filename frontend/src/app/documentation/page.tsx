'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Terminal, 
  Users, 
  Building2, 
  ShieldCheck, 
  Zap, 
  Search, 
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const docCategories = [
  {
    title: 'Getting Started',
    icon: <Sparkles className="w-6 h-6" />,
    links: ['Introduction', 'Account Verification', 'Role Selection', 'System Requirements']
  },
  {
    title: 'For Students',
    icon: <Users className="w-6 h-6" />,
    links: ['Creating Profile', 'Finding Mentors', 'Applying for Referrals', 'Career Roadmaps']
  },
  {
    title: 'For Alumni',
    icon: <ShieldCheck className="w-6 h-6" />,
    links: ['Verification Process', 'Hosting Webinars', 'Managing Mentorships', 'Professional Ethics']
  },
  {
    title: 'Admin Guide',
    icon: <Building2 className="w-6 h-6" />,
    links: ['User Management', 'Placement Analytics', 'Broadcasting Job Alerts', 'Audit Logs']
  }
];

export default function DocumentationPage() {
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
          <div className="text-center mb-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" /> Documentation Center
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 text-slate-900"
            >
              Everything You Need <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">to Succeed</span>
            </motion.h1>
            
            {/* Search Placeholder */}
            <div className="relative max-w-2xl mx-auto mt-16">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
               <input 
                type="text" 
                placeholder="Search the docs..." 
                className="w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm"
               />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-16">
             {/* Sidebar Navigation (Desktop) */}
             <aside className="lg:w-1/4 hidden lg:block sticky top-32 h-fit">
                <div className="space-y-10">
                   {docCategories.map((cat) => (
                      <div key={cat.title}>
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            {cat.icon} {cat.title}
                         </h4>
                         <ul className="space-y-4">
                            {cat.links.map((link) => (
                               <li key={link}>
                                  <a href="#" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center justify-between group">
                                     {link}
                                     <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                  </a>
                               </li>
                            ))}
                         </ul>
                      </div>
                   ))}
                </div>
             </aside>

             {/* Main Content Area */}
             <div className="lg:w-3/4 space-y-16">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-12 md:p-16 bg-slate-50 rounded-[3rem] border border-slate-100"
                >
                   <h2 className="text-4xl font-black mb-8 tracking-tight">Quick Start Guide</h2>
                   <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">
                      Welcome to the CampusBridge! Whether you are a student looking for guidance or an alumni wanting to give back, this guide will help you set up your account and start connecting.
                   </p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                         { title: 'Student Guide', desc: 'Learn how to apply for referrals and mentorship.', icon: <Users /> },
                         { title: 'Alumni Guide', desc: 'Manage your referrals and hosting webinars.', icon: <ShieldCheck /> }
                      ].map((card, i) => (
                         <div key={i} className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl hover:border-indigo-100 transition-all">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                               {card.icon}
                            </div>
                            <h4 className="text-xl font-black mb-2">{card.title}</h4>
                            <p className="text-slate-500 text-sm font-medium mb-6">{card.desc}</p>
                            <a href="#" className="text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                               Read More <ArrowRight className="w-4 h-4" />
                            </a>
                         </div>
                      ))}
                   </div>
                </motion.div>

                {/* FAQ Section in Docs */}
                <section>
                   <h2 className="text-3xl font-black mb-10 tracking-tight ml-4">Popular Documentation</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                         'How does account verification work?',
                         'Can I message alumni directly?',
                         'What are the referral guidelines?',
                         'Institutional analytics for admins',
                         'Managing mentor availability',
                         'Host your first webinar guide'
                      ].map((topic, i) => (
                         <a 
                          key={topic} 
                          href="#" 
                          className="p-8 bg-white rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-indigo-100 hover:shadow-lg transition-all"
                         >
                            <div className="flex items-center gap-6">
                               <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                               <span className="font-bold text-slate-700">{topic}</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                         </a>
                      ))}
                   </div>
                </section>

                {/* Support CTA */}
                <div className="p-12 md:p-20 bg-slate-900 rounded-[3rem] text-center text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                   <h3 className="text-3xl font-black mb-6">Need more help?</h3>
                   <p className="text-slate-400 font-medium mb-10">Our support team is always here to help you with any technical or platform-related questions.</p>
                   <Link href="/contact" className="inline-flex items-center gap-3 px-12 py-6 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl group">
                      Talk to Support <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                   </Link>
                </div>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
