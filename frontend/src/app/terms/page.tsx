'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { FileText, Shield, AlertCircle, Scale, CheckCircle2, Lock } from 'lucide-react';

const termSections = [
  {
    title: 'User Responsibilities',
    icon: <Scale className="w-6 h-6" />,
    content: `As a member of the CampusBridge, you agree to:
    • Provide accurate and truthful information during registration.
    • Maintain the security of your account credentials.
    • Interact with other members professionally and respectfully.
    • Use the platform solely for academic and professional purposes.`
  },
  {
    title: 'Platform Usage Policy',
    icon: <AlertCircle className="w-6 h-6" />,
    content: `Prohibited activities include, but are not limited to:
    • Harassing, spamming, or threatening other users.
    • Attempting to gain unauthorized access to our systems.
    • Sharing misleading or fraudulent job/referral information.
    • Scraping or automated harvesting of data from the platform.`
  },
  {
    title: 'Account Restrictions',
    icon: <Lock className="w-6 h-6" />,
    content: `We reserve the right to suspend or terminate accounts that:
    • Violate these terms or our community guidelines.
    • Engage in fraudulent or suspicious behavior.
    • Remain inactive for extended periods (subject to institutional policy).
    • Are requested to be removed by the associated college admin.`
  },
  {
    title: 'Content Policy',
    icon: <Shield className="w-6 h-6" />,
    content: `You retain ownership of the content you post, but you grant us a license to host and share it within the platform parameters. We reserve the right to remove any content that violates professional standards or legal requirements.`
  }
];

export default function TermsPage() {
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
              <FileText className="w-3.5 h-3.5" /> Legal Agreement
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 text-slate-900"
            >
              Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Conditions</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 max-w-2xl mx-auto mb-14 font-medium leading-relaxed"
            >
              Last Updated: May 2026. Please read these terms carefully before using our platform.
            </motion.p>
          </div>

          {/* Intro Text */}
          <div className="p-12 bg-indigo-50 rounded-[3rem] border border-indigo-100 mb-16 text-indigo-900 font-medium leading-relaxed">
             By accessing or using the CampusBridge, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.
          </div>

          {/* Terms Sections */}
          <div className="space-y-16">
            {termSections.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
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

          {/* Acceptance CTA */}
          <div className="mt-32 p-12 md:p-20 bg-slate-900 rounded-[3rem] text-center text-white relative overflow-hidden">
             <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-xl shadow-indigo-900/20">
                <CheckCircle2 className="w-10 h-10" />
             </div>
             <h3 className="text-3xl font-black mb-8 relative z-10">We Value Your Trust</h3>
             <p className="text-slate-400 font-medium mb-10 relative z-10 max-w-lg mx-auto">Our terms are designed to protect the integrity of our professional community and ensure a safe space for growth.</p>
             <a 
              href="/" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all relative z-10"
             >
                I Accept These Terms
             </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
