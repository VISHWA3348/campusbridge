'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchResumeData, fetchStudentProfile } from '@/lib/api';
import { FileText, Download, Loader2, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ResumeBuilderPage() {
  const [resume, setResume] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [data, pData] = await Promise.all([
          fetchResumeData(),
          fetchStudentProfile()
        ]);
        
        if (data && !data.error) {
          setResume(data);
        } else {
          console.error('Resume data error:', data?.error);
        }
        
        setProfile(pData);
      } catch (err) {
        console.error('Failed to load resume data:', err);
        setError('Failed to connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const isProfileComplete = resume && 
    resume.skills?.length > 0 && 
    resume.header.phone !== 'Not provided' &&
    resume.header.linkedin !== 'Not provided';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          <p className="text-slate-500 font-medium animate-pulse">Building your professional resume...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl inline-block mb-4">
            <p className="font-bold">{error}</p>
          </div>
          <button onClick={() => window.location.reload()} className="block mx-auto text-indigo-600 font-bold underline">
            Retry Loading
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-preview, #resume-preview * {
            visibility: visible;
          }
          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none !important;
            box-shadow: none !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>

      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print-hidden">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Resume Builder</h1>
          <p className="text-slate-500 font-medium text-lg">Auto-generated professional resume based on your profile.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            disabled={!resume}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" /> Download PDF
          </button>
        </div>
      </div>

      {!isProfileComplete && !loading && resume && (
        <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-100 rounded-3xl flex items-start gap-4 print-hidden">
          <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-amber-900 uppercase text-sm mb-1">Resume Tip</h3>
            <p className="text-amber-700 font-medium text-sm">Complete your profile (Skills, Phone, LinkedIn, Certifications) to generate a better resume.</p>
            <Link href="/dashboard/student/settings" className="text-amber-900 font-black text-xs uppercase mt-2 inline-block hover:underline">
              Go to Profile Settings →
            </Link>
          </div>
        </div>
      )}

      {profile?.college?.subscription?.plan !== 'PREMIUM' ? (
        <div className="bg-slate-900 p-16 rounded-[3rem] text-center text-white relative overflow-hidden print-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <Crown className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4">Premium Feature Locked</h2>
          <p className="text-slate-400 font-medium text-lg mb-8 max-w-md mx-auto">Upgrade to the Premium Plan to unlock the AI Resume Builder and other advanced features.</p>
          <Link href="/#pricing" className="inline-flex items-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-all shadow-xl shadow-purple-900/50">
            Upgrade to Premium <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : resume ? (
        <div id="resume-preview" className="max-w-4xl mx-auto bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none">
          {/* Resume Content */}
          <div className="p-10 md:p-16 space-y-12">
            {/* Header */}
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none">{resume.header.name}</h1>
              <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-slate-500 font-bold text-xs md:text-sm">
                <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-600" /> {resume.header.email}</span>
                <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-indigo-600" /> {resume.header.phone}</span>
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-600" /> {resume.header.linkedin}</span>
                {resume.header.portfolio !== 'Not provided' && (
                  <span className="flex items-center gap-2"><Crown className="w-4 h-4 text-indigo-600" /> {resume.header.portfolio}</span>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-100"></div>

            {/* About / Summary */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                <User className="w-4 h-4" /> About Me
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium text-lg italic">
                "{resume.summary}"
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Left Column */}
              <div className="space-y-12">
                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Education
                  </h3>
                  {resume.education.map((edu: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <p className="font-black text-slate-900 text-sm uppercase leading-tight">{edu.institution}</p>
                      <p className="font-bold text-slate-700 text-xs">{edu.degree}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Batch {edu.year}</span>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase tracking-widest">GPA: {edu.cgpa}</span>
                      </div>
                    </div>
                  ))}
                </section>

                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.length > 0 ? resume.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {skill}
                      </span>
                    )) : (
                      <p className="text-slate-400 text-xs italic">No skills listed yet.</p>
                    )}
                  </div>
                </section>

                {resume.certifications?.length > 0 && (
                  <section className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                      <Award className="w-4 h-4" /> Certifications
                    </h3>
                    <div className="space-y-3">
                      {resume.certifications.map((cert: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                          {cert}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column */}
              <div className="md:col-span-2 space-y-12">
                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Professional Experience
                  </h3>
                  {resume.experience?.length > 0 ? (
                    <div className="space-y-8">
                      {/* Experience list would go here */}
                    </div>
                  ) : (
                    <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                      <p className="text-slate-400 text-sm font-medium italic mb-2">Complete your experience details in profile.</p>
                      <p className="text-slate-300 text-[10px] uppercase font-black tracking-widest">No internship data found</p>
                    </div>
                  )}
                </section>

                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Projects & Research
                  </h3>
                  {resume.projects?.length > 0 ? (
                    <div className="space-y-6">
                      {resume.projects.map((proj: any, idx: number) => (
                        <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <h4 className="font-black text-slate-900 uppercase text-sm mb-2">{proj.name}</h4>
                          <p className="text-indigo-600 text-xs font-bold truncate">{proj.link}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                      <p className="text-slate-400 text-sm font-medium italic mb-2">Add your GitHub projects to your profile.</p>
                      <p className="text-slate-300 text-[10px] uppercase font-black tracking-widest">No project data found</p>
                    </div>
                  )}
                </section>

                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" /> Career Interests
                  </h3>
                  <div className="p-6 bg-indigo-600 text-white rounded-3xl">
                    <p className="font-black uppercase tracking-widest text-[10px] opacity-70 mb-2">Primary Domain</p>
                    <p className="text-xl font-black">{resume.careerInterests}</p>
                  </div>
                </section>
              </div>
            </div>

            <div className="h-px bg-slate-100"></div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-300">
              <p>Generated by CampusBridge AI</p>
              <p>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="bg-slate-100 p-8 rounded-[3rem] inline-block mb-6">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">No Resume Data Found</h2>
          <p className="text-slate-500 font-medium mb-8">Please complete your profile to generate your professional resume.</p>
          <Link href="/dashboard/student/settings" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
            Complete Profile
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}
