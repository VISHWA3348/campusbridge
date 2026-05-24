'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Cookie, ShieldCheck, Lock, Globe, Clock, FileText, Sliders, BarChart3, Key, Layers } from 'lucide-react';

const cookieSections = [
  {
    title: 'What Are Cookies?',
    icon: <Cookie className="w-6 h-6" />,
    content: `Cookies are small text files stored on your device (computer, tablet, or mobile) when you visit websites. They are widely used to make websites work more efficiently, remember your preferences, and provide analytical data to the website owners.

At CampusBridge, we use cookies to provide a premium, seamless, and highly secure networking experience for students, alumni, and administrators.`
  },
  {
    title: 'Essential Cookies',
    icon: <ShieldCheck className="w-6 h-6" />,
    content: `These cookies are strictly necessary to provide you with the core services available through our platform and to use its essential security features.

Without these cookies, basic platform operations—such as page navigation, cross-origin request security, and session validation—cannot function properly. They cannot be disabled, as they are required to maintain site stability and security.`
  },
  {
    title: 'Authentication & Session Cookies',
    icon: <Key className="w-6 h-6" />,
    content: `We use authentication cookies to verify your identity and keep you securely signed in as you navigate between different sections of the campus network.

These cookies protect your personal dashboard, career profiles, direct messages, and referral statuses from unauthorized access. They are cleared when you log out of the platform.`
  },
  {
    title: 'Analytics & Performance Cookies',
    icon: <BarChart3 className="w-6 h-6" />,
    content: `Performance cookies collect anonymous information about how our community interacts with the platform.

This includes tracking the most visited pages, average loading times, mentorship match popularity, and page navigation paths. This data allows us to identify performance bottlenecks, improve user interface journeys, and build a more efficient experience for everyone.`
  },
  {
    title: 'Third-Party Cookies',
    icon: <Layers className="w-6 h-6" />,
    content: `Some premium integrations on our platform rely on trusted third parties. These include Google OAuth for easy single sign-on (SSO), and real-time database networks for our messaging systems.

These third-party providers may set their own tracking cookies on your device to facilitate these features. We recommend checking their respective privacy policies for more information.`
  },
  {
    title: 'How to Control Cookies',
    icon: <Sliders className="w-6 h-6" />,
    content: `Most web browsers allow you to control, delete, or block cookies through their settings. You can configure your browser to alert you when a cookie is placed or block cookies entirely.

Please note: If you disable essential or authentication cookies, you will not be able to log in, message mentors, track placements, or use key interactive features of CampusBridge.`
  }
];

export default function CookiesPolicyContent() {
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
              <Cookie className="w-3.5 h-3.5" /> Respecting Your Choices
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 text-slate-900"
            >
              Cookies <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Policy</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 max-w-2xl mx-auto mb-14 font-medium leading-relaxed"
            >
              Last Updated: May 2026. This policy outlines how CampusBridge uses cookies and other tracing technologies to optimize, secure, and personalize your experience.
            </motion.p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-16">
            {cookieSections.map((section, idx) => (
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
             <h3 className="text-3xl font-black mb-8 relative z-10">Have Cookie Queries?</h3>
             <p className="text-slate-400 font-medium mb-10 relative z-10">If you have any questions or feedback regarding our Cookie Policy, please contact our technical administration team.</p>
             <a 
              href="mailto:zinointech@gmail.com" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all relative z-10"
             >
                <FileText className="w-4 h-4" /> Contact Support Team
             </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
