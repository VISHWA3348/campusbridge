'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Globe,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Instagram, Linkedin, Twitter } from '@/components/BrandIcons';

const contactDetails = [
  {
    icon: <MapPin />,
    title: 'Visit Our Office',
    content: '2/124, Nayandahalli, Bangalore, India',
    label: 'Address'
  },
  {
    icon: <Phone />,
    title: 'Call Us Directly',
    content: '+91 9113063448',
    label: 'Phone'
  },
  {
    icon: <Mail />,
    title: 'Email Our Support',
    content: 'zinointech@gmail.com',
    label: 'Email'
  }
];

const socials = [
  { name: 'LinkedIn', icon: <Linkedin />, href: 'https://www.linkedin.com/company/zinoin/', color: 'blue' },
  { name: 'Instagram', icon: <Instagram />, href: 'https://www.instagram.com/zinoingroup/', color: 'pink' },
  { name: 'Twitter', icon: <Twitter />, href: '#', color: 'slate' }
];

export default function ContactPage() {
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
              <Mail className="w-3.5 h-3.5" /> Get In Touch
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 text-slate-900"
            >
              Let's Start a <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-600">Conversation</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 max-w-2xl mx-auto mb-14 font-medium leading-relaxed"
            >
              Have questions or want to learn more about how we can help your institution? Our team is here to support you.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Left Column: Contact Info */}
            <div className="space-y-12">
              <div className="grid grid-cols-1 gap-8">
                {contactDetails.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex gap-8 items-center group hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{item.label}</p>
                      <h4 className="text-xl font-black text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-500 font-bold">{item.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-12 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-indigo-600/20 transition-all"></div>
                <h3 className="text-2xl font-black mb-8 relative z-10">Follow Our Journey</h3>
                <div className="flex gap-4 relative z-10">
                  {socials.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-sm"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="h-80 bg-slate-100 rounded-[3rem] overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-700 shadow-sm border border-slate-200">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent"></div>
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                  <MapPin className="w-10 h-10" />
                  <p className="font-black uppercase tracking-[0.2em] text-xs">Interactive Map Coming Soon</p>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl -z-10"></div>
              <div className="bg-white p-2 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
                <ContactForm />
              </div>

              {/* Support Badge */}
              <div className="mt-12 p-8 bg-indigo-50 rounded-3xl flex items-center gap-6 border border-indigo-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black text-blue-900 text-sm">Response Time: &lt; 4 Hours</p>
                  <p className="text-blue-700/60 text-xs font-bold uppercase tracking-widest mt-1">During Business Hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
