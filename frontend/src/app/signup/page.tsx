'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, Briefcase, ChevronRight } from 'lucide-react';

export default function SignupChoicePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Choose Your Path</h1>
          <p className="text-slate-400 font-medium text-xl">Join the community that connects talent with experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ChoiceCard 
            title="I am a Student"
            description="Looking for referrals, mentorship, and career opportunities."
            icon={<GraduationCap className="w-12 h-12" />}
            href="/signup/student"
            color="indigo"
          />
          <ChoiceCard 
            title="I am an Alumni"
            description="Sharing experience, providing referrals, and giving back."
            icon={<Briefcase className="w-12 h-12" />}
            href="/signup/alumni"
            color="slate"
          />
        </div>

        <p className="text-center mt-12 text-slate-400 font-medium">
          Already have an account? <Link href="/login" className="text-indigo-600 font-black hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

function ChoiceCard({ title, description, icon, href, color }: any) {
  const isIndigo = color === 'indigo';
  return (
    <Link href={href} className="group">
      <div className={`h-full p-12 rounded-[3.5rem] border-2 transition-all duration-500 bg-white ${
        isIndigo 
          ? 'border-indigo-50 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100' 
          : 'border-slate-50 hover:border-slate-900 hover:shadow-2xl hover:shadow-slate-100'
      }`}>
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-10 transition-transform duration-500 group-hover:scale-110 ${
          isIndigo ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-900'
        }`}>
          {icon}
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase flex items-center justify-between">
          {title}
          <ChevronRight className="w-8 h-8 opacity-0 -translate-x-4 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
        </h3>
        <p className="text-slate-400 font-medium text-lg leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
