'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchAlumni } from '@/lib/api';
import { 
  ShieldCheck, User, Mail, Building2, CheckCircle2, Loader2, ExternalLink, Hash, Calendar, FileText, Eye, AlertCircle, XCircle, Phone,
  GraduationCap, Briefcase, MapPin, Link as LinkIcon, Code, Share2, Award, Globe, MessageSquare, ArrowRight, Target, Rocket, Compass, Clock, History, HeartHandshake
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin } from '@/components/BrandIcons';
import { useRouter } from 'next/navigation';

export default function CollegeAlumniPage() {
  const router = useRouter();
  const [alumniList, setAlumniList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadAlumni = async () => {
    const data = await fetchAlumni();
    setAlumniList(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    loadAlumni();
  }, []);

  const handleApprove = async (userId: number) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api'))}/college/verifications/approve/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedAlumni(null);
        loadAlumni();
      }
    } catch (err) {
      console.error('Approval failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedAlumni || !rejectionReason) return;
    setActionLoading(selectedAlumni.user.id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api'))}/college/verifications/reject/${selectedAlumni.user.id}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });
      if (res.ok) {
        setSelectedAlumni(null);
        setShowRejectModal(false);
        setRejectionReason('');
        loadAlumni();
      }
    } catch (err) {
      console.error('Rejection failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getFileUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api')
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
      : 'https://campusbridge-e4cv.onrender.com';
    return `${baseUrl}${url}`;
  };

  return (
    <DashboardLayout>
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Manage Alumni</h1>
          <p className="text-slate-500 font-medium">Verify and monitor alumni status within your institution.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumniList.map((alumni) => (
            <div key={alumni.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:shadow-2xl">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 font-black text-2xl">
                  {alumni.user?.name?.[0] || '?'}
                </div>
                {alumni.user?.verificationStatus === 'APPROVED' ? (
                  <div className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" /> Approved
                  </div>
                ) : alumni.user?.verificationStatus === 'REJECTED' ? (
                  <div className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <XCircle className="w-3 h-3" /> Rejected
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <AlertCircle className="w-3 h-3" /> Pending
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2">{alumni.user?.name || 'Unknown Alumni'}</h3>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-500">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-bold">{alumni.currentCompany || alumni.company || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-bold">{alumni.user?.email || 'No Email'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold">{alumni.department} ({alumni.passoutYear})</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Joined {alumni.user?.createdAt ? new Date(alumni.user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                <button 
                  onClick={() => setSelectedAlumni(alumni)}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-800 transition-all shadow-md"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
          {alumniList.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 italic">No alumni found for your institution.</div>
          )}
        </div>
      )}

      {/* Premium View Details Modal */}
      <AnimatePresence>
        {selectedAlumni && !showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedAlumni(null)}></div>
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-slate-50 w-full max-w-6xl h-[95vh] rounded-[3.5rem] shadow-2xl relative z-10 flex flex-col overflow-hidden"
            >
              {/* Header Bar */}
              <div className="flex justify-between items-center p-6 sm:p-8 pb-4 shrink-0 bg-slate-50 border-b border-slate-200/50">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" /> 
                  Alumni Verification Profile
                </h2>
                <button onClick={() => setSelectedAlumni(null)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-colors shadow-sm">
                  <XCircle className="w-7 h-7" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
                {/* Premium Header Section */}
                <div className="relative overflow-hidden bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 md:p-16">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/50 rounded-full -mr-40 -mt-40 blur-3xl opacity-50"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-50/50 rounded-full -ml-40 -mb-40 blur-3xl opacity-50"></div>
                  
                  <div className="relative flex flex-col md:flex-row items-start gap-12">
                    <div className="relative group mx-auto md:mx-0">
                      <div className="absolute -inset-1.5 bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                      <div className="relative w-56 h-56 bg-slate-900 rounded-[2.5rem] overflow-hidden flex items-center justify-center border-4 border-white shadow-2xl">
                        {selectedAlumni.user?.profilePhoto ? (
                          <img 
                            src={getFileUrl(selectedAlumni.user.profilePhoto) || ''} 
                            alt={selectedAlumni.user?.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <span className="text-8xl font-black text-white">{selectedAlumni.user?.name?.[0] || '?'}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left pt-4">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                          ALUMNI
                        </div>
                        {selectedAlumni.user?.verificationStatus === 'APPROVED' && (
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
                          </div>
                        )}
                        {selectedAlumni.user?.verificationStatus === 'PENDING_APPROVAL' && (
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                            <Clock className="w-3.5 h-3.5" /> Verification Pending
                          </div>
                        )}
                        {selectedAlumni.user?.verificationStatus === 'REJECTED' && (
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                            <XCircle className="w-3.5 h-3.5" /> Verification Rejected
                          </div>
                        )}
                      </div>
                      <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter leading-none">{selectedAlumni.user?.name}</h1>
                      <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed mb-8">
                        {selectedAlumni.user?.bio || "Crafting a unique path in the industry."}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-bold text-slate-400 mb-10">
                        <div className="flex items-center gap-3 bg-slate-50/50 px-4 py-3 rounded-2xl">
                          <Mail className="w-4 h-4 text-indigo-500" /> {selectedAlumni.user?.email}
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50/50 px-4 py-3 rounded-2xl">
                          <Phone className="w-4 h-4 text-indigo-500" /> {selectedAlumni.phoneNumber || 'Private'}
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50/50 px-4 py-3 rounded-2xl">
                          <GraduationCap className="w-4 h-4 text-purple-500" /> {selectedAlumni.user?.college?.name || 'N/A'}
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50/50 px-4 py-3 rounded-2xl">
                          <MapPin className="w-4 h-4 text-red-500" /> {selectedAlumni.currentLocation || 'Worldwide'}
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <button className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-sm flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-100 group">
                          <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" /> Message Now
                        </button>
                        <button className="bg-white border-2 border-slate-100 text-slate-600 px-10 py-5 rounded-3xl font-black text-sm flex items-center gap-3 hover:border-slate-900 hover:text-slate-900 transition-all">
                          Follow Connection <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Details Column */}
                  <div className="lg:col-span-2 space-y-8">
                    
                    {/* Professional/Academic Grid */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-10">
                      <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Award className="w-6 h-6" /></div>
                          Professional Dossier
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                        <DetailItem label="Department" value={selectedAlumni.department} icon={<GraduationCap />} />
                        <DetailItem label="Roll Number" value={selectedAlumni.user?.collegeIdNumber} icon={<FileText />} />
                        <DetailItem label="Current Company" value={selectedAlumni.currentCompany || selectedAlumni.company} icon={<Building2 />} />
                        <DetailItem label="Professional Role" value={selectedAlumni.jobRole || selectedAlumni.role} icon={<Award />} />
                        <DetailItem label="Industry Experience" value={selectedAlumni.experience ? `${selectedAlumni.experience} Years` : 'N/A'} icon={<Clock />} />
                        <DetailItem label="Passout Year" value={selectedAlumni.passoutYear} icon={<GraduationCap />} />
                        <DetailItem label="Previous Orgs" value={selectedAlumni.previousCompanies} icon={<Building2 />} />
                        <DetailItem label="Invite Code Used" value={selectedAlumni.user?.inviteCodeUsed?.code} icon={<ShieldCheck />} />
                      </div>

                      {/* Skills Section */}
                      <div className="mt-12 pt-12 border-t border-slate-100">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-1">Expertise & Capabilities</h4>
                          <div className="flex flex-wrap gap-3">
                            {selectedAlumni.skills ? selectedAlumni.skills.split(',').map((skill: string, i: number) => (
                              <span key={i} className="px-6 py-3 bg-slate-50 text-slate-900 rounded-2xl text-xs font-black border border-slate-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-default">
                                {skill.trim()}
                              </span>
                            )) : <span className="text-slate-400 font-bold italic">Skills not provided.</span>}
                          </div>
                      </div>
                    </div>

                    {/* Certifications / Achievements */}
                    {(selectedAlumni.certifications || selectedAlumni.achievements) && (
                      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-10">
                        <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Award className="w-6 h-6" /></div>
                            Milestones & Certifications
                        </h3>
                        <div className="space-y-6">
                            {selectedAlumni.certifications && (
                              <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Industry Certifications</p>
                                <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{selectedAlumni.certifications}</p>
                              </div>
                            )}
                            {selectedAlumni.achievements && (
                              <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Key Achievements</p>
                                <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{selectedAlumni.achievements}</p>
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
                        <SocialLink icon={<Linkedin />} label="LinkedIn" href={selectedAlumni.linkedIn} color="text-indigo-600 bg-indigo-50" />
                        <SocialLink icon={<Globe />} label="Professional Portfolio" href={selectedAlumni.portfolio} color="text-slate-900 bg-slate-100" />
                        {!(selectedAlumni.linkedIn || selectedAlumni.portfolio) && (
                          <div className="p-4 text-center text-slate-400 font-bold text-xs bg-slate-50 rounded-2xl border border-slate-100">
                            Not Provided
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Alumni Specific Availability */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                      <h3 className="text-xl font-black mb-8 px-2 flex items-center gap-3">
                        <HeartHandshake className="w-6 h-6 text-indigo-400" /> Availability
                      </h3>
                      <div className="space-y-5">
                        <AvailabilityItem label="Referral Support" value={selectedAlumni.readyForReferral} />
                        <AvailabilityItem label="One-on-One Mentorship" value={selectedAlumni.readyForMentorship} />
                        <AvailabilityItem label="Resume Auditing" value={selectedAlumni.resumeReview} />
                      </div>
                      <div className="mt-10 pt-8 border-t border-white/10 text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Response Mode</p>
                          <p className="text-sm font-bold text-white">{selectedAlumni.preferredContactMode || 'Direct Message'}</p>
                      </div>
                    </div>

                    {/* Uploaded Verification Proof */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8">
                      <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-indigo-600" /> Document Proof
                      </h3>
                      
                      <div className="relative group rounded-3xl overflow-hidden bg-slate-50 border-2 border-slate-100 aspect-[4/3] flex items-center justify-center">
                        {selectedAlumni.alumniProofUrl || selectedAlumni.user?.idProofUrl ? (
                          <>
                            <img 
                              src={getFileUrl(selectedAlumni.alumniProofUrl || selectedAlumni.user?.idProofUrl) || ''} 
                              alt="Verification Proof" 
                              className="w-full h-full object-contain"
                              onError={(e: any) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden absolute inset-0 bg-slate-50 flex-col items-center justify-center p-8 text-center">
                              <FileText className="w-12 h-12 text-slate-200 mb-4" />
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Document (PDF/File)</p>
                            </div>
                            <a 
                              href={getFileUrl(selectedAlumni.alumniProofUrl || selectedAlumni.user?.idProofUrl) || '#'}
                              target="_blank"
                              className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                              <div className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-2xl">
                                <Eye className="w-4 h-4" /> Preview
                              </div>
                            </a>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-300 gap-4">
                            <AlertCircle className="w-10 h-10" />
                            <p className="text-xs font-black uppercase tracking-widest text-center">No proof uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pinned Action Bar at Bottom */}
              {selectedAlumni.user?.verificationStatus === 'PENDING_APPROVAL' && (
                <div className="shrink-0 p-6 sm:p-8 bg-white border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-b-[3.5rem] flex gap-4">
                  <button 
                    onClick={() => handleApprove(selectedAlumni.user.id)}
                    disabled={actionLoading !== null}
                    className="flex-1 bg-green-600 text-white py-6 rounded-[2rem] font-black text-base hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {actionLoading === selectedAlumni.user.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> Approve Alumni</>}
                  </button>
                  <button 
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading !== null}
                    className="flex-1 bg-slate-900 text-white py-6 rounded-[2rem] font-black text-base hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <XCircle className="w-6 h-6" /> Reject Alumni
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl relative z-10"
          >
            <h3 className="text-2xl font-black text-slate-900 mb-2">Reject Alumni</h3>
            <p className="text-slate-500 font-medium mb-8">Please provide a reason for rejection. This will be shown to the user.</p>
            
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Degree certificate is blurry, Company name is invalid..."
              className="w-full p-6 bg-slate-50 rounded-3xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-sm min-h-[150px] mb-8"
            />

            <div className="flex gap-4">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-4 font-black text-slate-400 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                disabled={!rejectionReason || actionLoading !== null}
                className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Reject'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
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
