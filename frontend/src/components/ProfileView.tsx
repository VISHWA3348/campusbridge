'use client';

import React from 'react';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  Code, 
  Share2, 
  Award, 
  FileText, 
  Globe, 
  MessageSquare, 
  ArrowRight,
  Phone,
  Target,
  Rocket,
  Compass,
  Building2,
  Clock,
  History,
  HeartHandshake,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Linkedin } from '@/components/BrandIcons';
import { getFileUrl } from '@/lib/api';

interface ProfileViewProps {
  data: any;
}

export default function ProfileView({ data }: ProfileViewProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  
  if (!data || data.error) {
    return (
      <div className="p-12 text-center bg-white border border-slate-100 rounded-[2.5rem] shadow-sm max-w-xl mx-auto my-12">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Failed to Load Profile</h2>
        <p className="text-slate-500 font-medium mb-6">{data?.error || 'The profile details could not be retrieved.'}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md">
          Retry
        </button>
      </div>
    );
  }

  const isStudent = data.role === 'STUDENT';
  const isAlumni = data.role === 'ALUMNI';
  const roleData = isStudent ? data.student : data.alumni;

  const handleStartChat = () => {
    if (!currentUser) return router.push('/login');
    const rolePath = currentUser.role?.toLowerCase()?.replace('_', '-');
    if (rolePath) {
      router.push(`/dashboard/${rolePath}/chat?userId=${data.id}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 md:p-16">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/50 rounded-full -mr-40 -mt-40 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-50/50 rounded-full -ml-40 -mb-40 blur-3xl opacity-50"></div>
        
        <div className="relative flex flex-col md:flex-row items-start gap-12">
          <div className="relative group mx-auto md:mx-0">
            <div className="absolute -inset-1.5 bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative w-56 h-56 bg-slate-900 rounded-[2.5rem] overflow-hidden flex items-center justify-center border-4 border-white shadow-2xl">
              {data.profilePhoto ? (
                <img 
                  src={getFileUrl(data.profilePhoto) || ''} 
                  alt={data.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <span className="text-8xl font-black text-white">{data.name?.[0]}</span>
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left pt-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                {(data.role || '').replace('_', ' ')}
              </div>
              {data.verificationStatus === 'APPROVED' && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
                </div>
              )}
              {data.verificationStatus === 'PENDING_APPROVAL' && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                  <Clock className="w-3.5 h-3.5" /> Verification Pending
                </div>
              )}
              {data.verificationStatus === 'REJECTED' && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                  <XCircle className="w-3.5 h-3.5" /> Verification Rejected
                </div>
              )}
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter leading-none">{data.name}</h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed mb-8">
              {data.bio || "Crafting a unique path in the industry."}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-bold text-slate-400 mb-10">
              <div className="flex items-center gap-3 bg-slate-50/50 px-4 py-3 rounded-2xl">
                <Mail className="w-4 h-4 text-indigo-500" /> {data.email}
              </div>
              <div className="flex items-center gap-3 bg-slate-50/50 px-4 py-3 rounded-2xl">
                <Phone className="w-4 h-4 text-indigo-500" /> {roleData?.phoneNumber || 'Private'}
              </div>
              <div className="flex items-center gap-3 bg-slate-50/50 px-4 py-3 rounded-2xl">
                <GraduationCap className="w-4 h-4 text-purple-500" /> {data.college?.name}
              </div>
              <div className="flex items-center gap-3 bg-slate-50/50 px-4 py-3 rounded-2xl">
                <MapPin className="w-4 h-4 text-red-500" /> {roleData?.currentLocation || roleData?.preferredLocation || 'Worldwide'}
              </div>
            </div>

            {currentUser?.id !== data.id ? (
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button 
                  onClick={handleStartChat}
                  className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-sm flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-100 group"
                >
                  <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" /> Message Now
                </button>
                <button className="bg-white border-2 border-slate-100 text-slate-600 px-10 py-5 rounded-3xl font-black text-sm flex items-center gap-3 hover:border-slate-900 hover:text-slate-900 transition-all">
                  Follow Connection <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : isStudent && data.verificationStatus !== 'APPROVED' && (
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem]">
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 italic">Identity Proof</p>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                       <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-black text-slate-900">Your College ID Proof</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status: {data.verificationStatus?.replace('_', ' ')}</p>
                    </div>
                    <a href={data.idProofUrl} target="_blank" rel="noreferrer" className="text-xs font-black text-indigo-600 bg-white px-4 py-2 rounded-xl shadow-sm hover:bg-indigo-50 transition-all">View Uploaded</a>
                 </div>
                 {data.verificationStatus === 'REJECTED' && (
                   <div className="mt-4 pt-4 border-t border-slate-200/50">
                      <p className="text-xs font-bold text-red-500 mb-3">Rejection Reason: {data.rejectionReason}</p>
                      <button 
                        onClick={() => router.push('/dashboard/student/settings')}
                        className="w-full py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-100"
                      >
                        Re-upload Correct Document
                      </button>
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Role-Specific Grid */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-10">
             <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Award className="w-6 h-6" /></div>
                {isStudent ? 'Academic Profile' : 'Professional Dossier'}
             </h3>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                {isStudent ? (
                  <>
                    <DetailItem label="Department" value={roleData?.department} icon={<GraduationCap />} />
                    <DetailItem label="College ID" value={data.college?.collegeCode} icon={<History />} />
                    <DetailItem label="Roll Number" value={roleData?.rollNumber} icon={<FileText />} />
                    <DetailItem label="Academic Year" value={roleData?.currentYear} icon={<Calendar />} />
                    <DetailItem label="Target Role" value={roleData?.interestedJobRole} icon={<Target />} />
                    <DetailItem label="Interests" value={roleData?.careerInterests} icon={<Rocket />} />
                  </>
                ) : (
                  <>
                    <DetailItem label="Department" value={roleData?.department} icon={<GraduationCap />} />
                    <DetailItem label="Roll Number" value={data.collegeIdNumber} icon={<FileText />} />
                    <DetailItem label="Current Company" value={roleData?.currentCompany} icon={<Building2 />} />
                    <DetailItem label="Professional Role" value={roleData?.jobRole} icon={<Award />} />
                    <DetailItem label="Industry Experience" value={roleData?.experience ? `${roleData.experience} Years` : 'N/A'} icon={<Clock />} />
                    <DetailItem label="Location" value={roleData?.currentLocation} icon={<MapPin />} />
                    <DetailItem label="Passout Year" value={roleData?.passoutYear} icon={<GraduationCap />} />
                    <DetailItem label="Previous Orgs" value={roleData?.previousCompanies} icon={<Building2 />} />
                  </>
                )}
             </div>

             {/* Skills Section */}
             <div className="mt-12 pt-12 border-t border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-1">Expertise & Capabilities</h4>
                <div className="flex flex-wrap gap-3">
                  {roleData?.skills?.split(',').map((skill: string, i: number) => (
                    <span key={i} className="px-6 py-3 bg-slate-50 text-slate-900 rounded-2xl text-xs font-black border border-slate-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-default">
                      {skill.trim()}
                    </span>
                  )) || <span className="text-slate-400 font-bold italic">Skills not yet added.</span>}
                </div>
             </div>
          </div>

          {/* Ambitions / Goals */}
          {isStudent && (roleData?.careerGoals || roleData?.interests) && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-10">
               <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Rocket className="w-6 h-6" /></div>
                  Goals & Interests
               </h3>
               <div className="space-y-6">
                  {roleData.careerGoals && (
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Career Roadmap</p>
                      <p className="text-slate-600 font-medium leading-relaxed">{roleData.careerGoals}</p>
                    </div>
                  )}
                  {roleData.interests && (
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Personal Interests</p>
                      <p className="text-slate-600 font-medium leading-relaxed">{roleData.interests}</p>
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* Certifications / Achievements */}
          {(roleData?.certifications || roleData?.achievements) && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-10">
               <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Award className="w-6 h-6" /></div>
                  Milestones & Certifications
               </h3>
               <div className="space-y-6">
                  {roleData.certifications && (
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Industry Certifications</p>
                      <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{roleData.certifications}</p>
                    </div>
                  )}
                  {roleData.achievements && (
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Key Achievements</p>
                      <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{roleData.achievements}</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Digital Network */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8">
            <h3 className="text-xl font-black text-slate-900 mb-8 px-2">Network Links</h3>
            <div className="space-y-3">
              <SocialLink icon={<Linkedin />} label="LinkedIn" href={roleData?.linkedIn} color="text-indigo-600 bg-indigo-50" />
              {isStudent && (
                <>
                  <SocialLink icon={<Code />} label="GitHub / Portfolio" href={roleData?.githubLink || roleData?.portfolioLink} color="text-slate-900 bg-slate-100" />
                  <SocialLink icon={<FileText />} label="View Resume" href={roleData?.resumeLink} color="text-red-600 bg-red-50" />
                </>
              )}
              {isAlumni && (
                <SocialLink icon={<Globe />} label="Professional Portfolio" href={roleData?.portfolio} color="text-indigo-600 bg-indigo-50" />
              )}
            </div>
          </div>

          {/* Alumni Specific Availability */}
          {isAlumni && (
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
              <h3 className="text-xl font-black mb-8 px-2 flex items-center gap-3">
                <HeartHandshake className="w-6 h-6 text-indigo-400" /> Availability
              </h3>
              <div className="space-y-5">
                <AvailabilityItem label="Referral Support" value={roleData?.readyForReferral} />
                <AvailabilityItem label="One-on-One Mentorship" value={roleData?.readyForMentorship} />
                <AvailabilityItem label="Resume Auditing" value={roleData?.resumeReview} />
              </div>
              <div className="mt-10 pt-8 border-t border-white/10 text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Response Mode</p>
                 <p className="text-sm font-bold text-white">{roleData?.preferredContactMode || 'Direct Message'}</p>
              </div>
            </div>
          )}

          {/* Student Status Card */}
          {isStudent && (
             <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl">
                <h3 className="text-xl font-black mb-8 px-2 flex items-center gap-3">
                  <Target className="w-6 h-6 text-indigo-200" /> Career Status
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                      <span className="text-xs font-bold opacity-70">Target Salary</span>
                      <span className="text-sm font-black">{roleData?.expectedSalary || 'Competitive'}</span>
                   </div>
                   <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                      <span className="text-xs font-bold opacity-70">Relocation</span>
                      <span className="text-sm font-black">{roleData?.readyToRelocate || 'Open'}</span>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-5 group">
      <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' }) : icon}
      </div>
      <div className="pt-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-2">{label}</p>
        <p className="text-base font-black text-slate-900">{value || 'Not Specified'}</p>
      </div>
    </div>
  );
}

function SocialLink({ icon, label, href, color }: { icon: React.ReactNode, label: string, href: string, color: string }) {
  if (!href) return null;
  return (
    <a 
      href={href.startsWith('http') ? href : `https://${href}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' }) : icon}
      </div>
      <span className="font-black text-xs uppercase tracking-widest text-slate-600 group-hover:text-slate-900">{label}</span>
    </a>
  );
}

function AvailabilityItem({ label, value }: { label: string, value: string }) {
  const isYes = value === 'Yes' || value === 'YES' || value === 'true';
  return (
    <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
      <span className="text-slate-400 text-xs font-bold">{label}</span>
      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${isYes ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
        {isYes ? 'Active' : 'N/A'}
      </span>
    </div>
  );
}
