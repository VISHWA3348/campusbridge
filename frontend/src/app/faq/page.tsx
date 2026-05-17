'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, Minus, Sparkles, Search, MessageCircle } from 'lucide-react';

const faqs = [
  {
    category: 'General',
    items: [
      { q: 'How do I sign up as an alumni?', a: 'You can register through our signup page by selecting the "Alumni" role. You will need to provide your graduation details and institutional ID for verification.' },
      { q: 'Is the platform free for students?', a: 'Yes, basic features including alumni search and general resources are free. Some advanced features like 1:1 mentorship may require a Pro subscription.' },
      { q: 'How long does verification take?', a: 'Account verification typically takes 24-48 hours as our team and your college admin need to verify your credentials.' }
    ]
  },
  {
    category: 'Mentorship & Referrals',
    items: [
      { q: 'How do I request a referral?', a: 'Once verified, you can search for alumni in your target companies and click the "Request Referral" button on their profile. We recommend connecting with them first via mentorship or chat.' },
      { q: 'Can I book multiple mentorship sessions?', a: 'Yes, depending on your plan and the alumni\'s availability, you can schedule multiple sessions to gain deeper industry insights.' },
      { q: 'What should I prepare for a mentorship session?', a: 'We recommend having your updated resume ready and a clear list of questions regarding career paths, skill requirements, or company culture.' }
    ]
  },
  {
    category: 'Technical & Security',
    items: [
      { q: 'Is my chat data private?', a: 'Absolutely. All 1:1 communications between students and alumni are end-to-end encrypted and only visible to the participants.' },
      { q: 'How do I reset my password?', a: 'Click the "Forgot Password" link on the login page and follow the instructions sent to your registered email address.' },
      { q: 'What browser is best for the platform?', a: 'Our platform is optimized for modern browsers including Chrome, Firefox, Safari, and Edge.' }
    ]
  }
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, number | null>>({});

  const toggleItem = (category: string, idx: number) => {
    setOpenItems(prev => ({
      ...prev,
      [category]: prev[category] === idx ? null : idx
    }));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      <Navbar />
      
      <main className="pt-48 pb-24 px-6 relative overflow-hidden">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px]"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-sm"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 text-slate-900"
            >
              How can we <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-600">Help You?</span>
            </motion.h1>
            
            {/* Search Bar Placeholder */}
            <div className="relative max-w-2xl mx-auto mt-16">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
               <input 
                type="text" 
                placeholder="Search for answers..." 
                className="w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm"
               />
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-20">
            {faqs.map((section, sIdx) => (
              <div key={section.category}>
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-8 ml-4">
                  {section.category}
                </h2>
                <div className="space-y-4">
                  {section.items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="border border-slate-100 rounded-3xl overflow-hidden bg-white hover:border-indigo-100 transition-all shadow-sm hover:shadow-xl"
                    >
                      <button 
                        onClick={() => toggleItem(section.category, idx)}
                        className="w-full px-8 py-8 flex items-center justify-between text-left group"
                      >
                        <span className="font-black text-xl text-slate-900 tracking-tight">{item.q}</span>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${openItems[section.category] === idx ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                          {openItems[section.category] === idx ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {openItems[section.category] === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                          >
                            <div className="px-8 pb-10">
                              <div className="h-px w-full bg-slate-50 mb-8"></div>
                              <p className="text-slate-500 font-medium leading-relaxed text-lg italic">
                                "{item.a}"
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-32 p-12 md:p-20 bg-slate-50 rounded-[4rem] text-center border border-slate-100 relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-3xl font-black mb-8">Still have questions?</h3>
                <p className="text-slate-500 font-medium mb-12 max-w-lg mx-auto">Can't find the answer you're looking for? Please chat to our friendly team.</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                   <a href="/contact" className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
                      Contact Us
                   </a>
                   <button className="w-full md:w-auto px-10 py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                      <MessageCircle className="w-5 h-5" /> Live Chat
                   </button>
                </div>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
