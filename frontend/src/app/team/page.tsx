'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';
import { Instagram, Linkedin } from '@/components/BrandIcons';
import Link from 'next/link';

const teamMembers = [
  {
    name: 'Vishwa K',
    role: 'Founder of Zinoin Group',
    description: 'Visionary leader driving innovation in alumni networking and professional growth ecosystems.',
    image: '/img/team/vishwa.jpeg',
    social: {
      instagram: 'https://www.instagram.com/theva._?igsh=MWx4ZGQydHQxYTE4bw%3D%3D&utm',
      linkedin: 'https://www.linkedin.com/in/vis-b0ba2834b?utm_content=profile&utm_medium=member_android&utm',
      email: 'mailto:thevishofficial@gmail.com'
    }
  },
  {
    name: 'Seeman P',
    role: 'Project Director',
    description: 'Expert strategist ensuring excellence in project execution and institutional partnerships.',
    image: '/img/team/seeman.jpg',
    social: {
      instagram: 'https://www.instagram.com/dhe._spyro._?igsh=MWVidmYxYTltb2E2bw%3D%3D&utm',
      linkedin: 'https://www.linkedin.com/in/seeman-seeman-3b5468380?utm_content=profile&utm_medium=member_android&utm',
      email: 'mailto:seemanvishal@gmail.com'
    }
  },
  {
    name: 'Brighty S',
    role: 'Managing Director of Zinoin Group',
    description: 'Expert strategist ensuring excellence in project execution and institutional partnerships.',
    image: '/img/team/brighty.jpeg',
    social: {
      instagram: 'https://www.instagram.com/zinoingroup?igsh=MTJvNmR0azIwbmhhNw==',
      linkedin: 'https://www.linkedin.com/company/zinoin/',
      email: 'mailto:zinointech@gmail.com'
    }
  }
];

export default function TeamPage() {
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
          {/* Header Section */}
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Our Incredible Team
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 text-slate-900"
            >
              Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-600">Visionaries</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 max-w-2xl mx-auto mb-14 font-medium leading-relaxed"
            >
              Building the future of alumni-student professional networking. Our dedicated team works tirelessly to bridge the gap between education and career success.
            </motion.p>
          </div>

          {/* Team Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group relative p-1 bg-gradient-to-br from-slate-100 to-white rounded-[3rem] hover:from-indigo-100 hover:to-indigo-100 transition-all duration-500 shadow-sm hover:shadow-2xl"
              >
                <div className="bg-white rounded-[2.8rem] p-8 h-full flex flex-col items-center text-center">
                  {/* Profile Image */}
                  <div className="relative mb-8">
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-slate-50 group-hover:border-indigo-200 transition-all duration-500 shadow-xl">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg transform rotate-12 group-hover:rotate-0 transition-all">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Member Info */}
                  <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{member.name}</h3>
                  <p className="text-indigo-600 font-bold uppercase tracking-widest text-[11px] mb-6">{member.role}</p>
                  <p className="text-slate-500 font-medium leading-relaxed mb-10 max-w-xs">
                    {member.description}
                  </p>

                  {/* Social Buttons */}
                  <div className="flex items-center gap-4 mt-auto">
                    <Link
                      href={member.social.linkedin}
                      target="_blank"
                      className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm"
                    >
                      <Linkedin className="w-5 h-5" />
                    </Link>
                    <Link
                      href={member.social.instagram}
                      target="_blank"
                      className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all duration-300 shadow-sm"
                    >
                      <Instagram className="w-5 h-5" />
                    </Link>
                    <Link
                      href={member.social.email}
                      className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-sm"
                    >
                      <Mail className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mission Statement Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-32 p-12 md:p-20 bg-slate-900 rounded-[3rem] text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Our Mission</h2>
              <p className="text-xl text-slate-400 font-medium leading-relaxed mb-10">
                "Building the future of alumni-student professional networking."
              </p>
              <div className="h-1 w-24 bg-indigo-600 mx-auto rounded-full mb-10"></div>
              <p className="text-slate-500 font-medium">
                We believe that every student deserves a mentor and every alumni has a story worth sharing.
                Our platform is the bridge that makes these connections possible, fostering a global community
                of professional excellence.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
