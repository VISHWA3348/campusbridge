'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  Building2, 
  ShieldCheck, 
  Zap, 
  Search, 
  MessageSquare, 
  Briefcase, 
  PieChart, 
  Video, 
  FileText, 
  Map,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const featureSections = [
  {
    id: 'students',
    title: 'For Students',
    description: 'Jumpstart your career with direct access to your college alumni network.',
    features: [
      { name: 'AI Resume Analyzer', desc: 'Get instant feedback on your resume with industry-specific ATS scoring.', icon: <FileText /> },
      { name: 'Mentorship Booking', desc: 'Book 1:1 sessions with alumni working in your dream companies.', icon: <Users /> },
      { name: 'Direct Referrals', desc: 'Request referrals directly from verified alumni for job openings.', icon: <Zap /> },
      { name: 'Career Roadmap', desc: 'AI-generated paths based on your skills and career goals.', icon: <Map /> }
    ]
  },
  {
    id: 'alumni',
    title: 'For Alumni',
    description: 'Give back to your alma mater and help the next generation of talent.',
    features: [
      { name: 'Mentorship Dashboard', desc: 'Manage your mentoring sessions and track student progress.', icon: <UserCheck /> },
      { name: 'Referral System', desc: 'Easily refer talented students from your college to your organization.', icon: <ShieldCheck /> },
      { name: 'Host Webinars', desc: 'Share your industry knowledge through live video sessions.', icon: <Video /> },
      { name: 'Professional Networking', desc: 'Connect with fellow alumni and grow your professional circle.', icon: <MessageSquare /> }
    ]
  },
  {
    id: 'colleges',
    title: 'For Colleges',
    description: 'Track and improve your institution\'s placement outcomes with ease.',
    features: [
      { name: 'Placement Tracker', desc: 'Real-time monitoring of student placements and salary statistics.', icon: <PieChart /> },
      { name: 'Alumni Directory', desc: 'A verified, searchable database of your institution\'s alumni.', icon: <Building2 /> },
      { name: 'Broadcasting', desc: 'Send announcements and job alerts to students and alumni instantly.', icon: <Zap /> },
      { name: 'Analytics Suite', desc: 'Deep insights into department-wise placement performance.', icon: <PieChart /> }
    ]
  }
];

const aiFeatures = [
  { name: 'Smart Matchmaking', desc: 'AI pairs students with the most relevant alumni based on skills and interests.' },
  { name: 'Automated Interview Prep', desc: 'Practice with AI-driven mock interviews tailored to specific roles.' },
  { name: 'Predictive Analytics', desc: 'Forecast placement trends and identify skill gaps in real-time.' }
];

export default function FeaturesPage() {
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
          <div className="text-center mb-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Platform Capabilities
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 text-slate-900"
            >
              Powerful Features for <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-600">Every Stakeholder</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 max-w-2xl mx-auto mb-14 font-medium leading-relaxed"
            >
              Explore the tools we've built to revolutionize the connection between students, alumni, and institutions.
            </motion.p>
          </div>

          {/* Feature Sections */}
          <div className="space-y-32">
            {featureSections.map((section, idx) => (
              <section key={section.id} id={section.id} className="relative">
                <div className="flex flex-col lg:flex-row gap-20 items-start">
                  <div className="lg:w-1/3 sticky top-32">
                    <div className="w-12 h-1 bg-indigo-600 mb-6 rounded-full"></div>
                    <h2 className="text-4xl font-black mb-6 tracking-tight">{section.title}</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">{section.description}</p>
                  </div>
                  <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {section.features.map((feature, fIdx) => (
                      <motion.div
                        key={feature.name}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: fIdx * 0.1 }}
                        className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all group"
                      >
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mb-8 shadow-sm group-hover:scale-110 transition-transform">
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-black mb-4">{feature.name}</h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">{feature.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* AI Features Highlight */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-48 p-12 md:p-20 bg-slate-900 rounded-[4rem] text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] -mr-64 -mt-64"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row gap-20 items-center">
                <div className="lg:w-1/2">
                   <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" /> Intelligence Driven
                   </div>
                   <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 leading-[0.9]">AI Features that <br/><span className="text-indigo-500">Accelerate Growth.</span></h2>
                   <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
                      Our proprietary AI algorithms process thousands of data points to provide highly personalized career recommendations and match students with the perfect mentors.
                   </p>
                </div>
                <div className="lg:w-1/2 space-y-6">
                   {aiFeatures.map((item, i) => (
                      <div key={i} className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm flex gap-6 group hover:bg-white/10 transition-all">
                         <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 flex-shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                         </div>
                         <div>
                            <h4 className="text-xl font-black mb-2">{item.name}</h4>
                            <p className="text-slate-400 font-medium text-sm leading-relaxed">{item.desc}</p>
                         </div>
                      </div>
                   ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
