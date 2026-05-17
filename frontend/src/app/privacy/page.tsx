'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, FileText, Globe, Clock } from 'lucide-react';

const policySections = [
  {
    title: 'Data Collection',
    icon: <Globe className="w-6 h-6" />,
    content: `We collect information you provide directly to us when you create an account, update your profile, or communicate with fellow members. This includes:
    • Personal details: Name, email address, institutional ID.
    • Professional details: Work history, skills, and academic achievements.
    • Communication data: Messages sent within our mentorship and referral systems.`
  },
  {
    title: 'Information Usage',
    icon: <Eye className="w-6 h-6" />,
    content: `We use the information we collect to:
    • Facilitate connections between students and verified alumni.
    • Provide personalized career recommendations and mentorship matching.
    • Track institutional placement outcomes for reporting to college admins.
    • Communicate with you about platform updates and security alerts.`
  },
  {
    title: 'Data Security',
    icon: <ShieldCheck className="w-6 h-6" />,
    content: `We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure. This includes:
    • End-to-end encryption for private messages.
    • Secure data storage with regular backups.
    • Multi-factor authentication options for all users.`
  },
  {
    title: 'Cookies & Tracking',
    icon: <Clock className="w-6 h-6" />,
    content: `We use cookies and similar technologies to enhance your experience, analyze platform performance, and remember your preferences. You can control cookie settings through your browser, but some features of the platform may not function correctly without them.`
  }
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      <Navbar />
      
      <main className="pt-48 pb-24 px-6 relative overflow-hidden">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px]"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-24 text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" /> Your Privacy Matters
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 text-slate-900"
            >
              Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Policy</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 max-w-2xl mx-auto mb-14 font-medium leading-relaxed"
            >
              Last Updated: May 2026. We are committed to protecting your personal data and ensuring a secure environment for our community.
            </motion.p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-16">
            {policySections.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group p-12 bg-slate-50 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all"
              >
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                    {section.icon}
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">{section.title}</h2>
                </div>
                <div className="text-slate-500 font-medium leading-loose text-lg whitespace-pre-line">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-32 p-12 md:p-20 bg-slate-900 rounded-[3rem] text-center text-white relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
             <h3 className="text-3xl font-black mb-8 relative z-10">Questions about your data?</h3>
             <p className="text-slate-400 font-medium mb-10 relative z-10">If you have any questions or concerns about our privacy practices, please contact our data protection team.</p>
             <a 
              href="mailto:zinointech@gmail.com" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all relative z-10"
             >
                <FileText className="w-4 h-4" /> Contact Data Team
             </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
