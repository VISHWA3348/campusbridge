'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ImageUpload from '@/components/ImageUpload';
import NotificationSettings from '@/components/NotificationSettings';
import { useAuth } from '@/context/AuthContext';
import { Save, User, Building2, Hash, GraduationCap, Users, FileText, Link as LinkIcon, Code, Share2, Globe, Upload, ShieldCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function StudentSettings() {
  const { user, token, refreshUser } = useAuth();
  const [formData, setFormData] = useState<any>({
    name: '',
    bio: '',
    department: '',
    rollNumber: '',
    currentYear: '',
    totalStudents: '',
    fullDetails: '',
    skills: '',
    githubLink: '',
    portfolioLink: '',
    linkedIn: '',
    cgpa: '',
    // Missing fields added
    interestedJobRole: '',
    preferredCompanyType: '',
    expectedSalary: '',
    resumeLink: '',
    preferredLocation: '',
    readyToRelocate: 'Yes',
    interestMode: 'Seminar',
    interestedDomain: '',
    phoneNumber: '',
    certifications: '',
    careerInterests: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const resumeInputRef = React.useRef<HTMLInputElement>(null);
  const proofInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/profile/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setFormData({
            name: data.name || '',
            bio: data.bio || '',
            collegeName: data.college?.name || '',
            collegeCode: data.college?.collegeCode || '',
            department: data.student?.department || '',
            rollNumber: data.student?.rollNumber || '',
            currentYear: data.student?.currentYear || '',
            totalStudents: data.student?.totalStudents?.toString() || '',
            fullDetails: data.student?.fullDetails || '',
            skills: data.student?.skills || '',
            githubLink: data.student?.githubLink || '',
            portfolioLink: data.student?.portfolioLink || '',
            linkedIn: data.student?.linkedIn || '',
            cgpa: data.student?.cgpa || '',
            interestedJobRole: data.student?.interestedJobRole || '',
            preferredCompanyType: data.student?.preferredCompanyType || '',
            expectedSalary: data.student?.expectedSalary || '',
            resumeLink: data.student?.resumeLink || '',
            preferredLocation: data.student?.preferredLocation || '',
            readyToRelocate: data.student?.readyToRelocate || 'Yes',
            interestMode: data.student?.interestMode || 'Seminar',
            interestedDomain: data.student?.interestedDomain || '',
            phoneNumber: data.student?.phoneNumber || '',
            certifications: data.student?.certifications || '',
            careerInterests: data.student?.careerInterests || '',
          });
        })
        .catch(err => console.error(err));
    }
  }, [user, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to update settings');

      await refreshUser();
      setMessage('Settings updated successfully!');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);

    const res = await fetch('http://localhost:5000/api/profile/photo', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      await refreshUser();
    } else {
      throw new Error('Upload failed');
    }
  };

  const handlePhotoRemove = async () => {
    const res = await fetch('http://localhost:5000/api/profile/photo', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      await refreshUser();
    }
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('proof', file);
      
      const uploadRes = await fetch('http://localhost:5000/api/verification/upload-proof', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      const updateRes = await fetch('http://localhost:5000/api/profile/re-verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          idProofUrl: uploadData.fileUrl,
          idProofPublicId: uploadData.publicId
        })
      });

      if (!updateRes.ok) throw new Error('Failed to submit for re-verification');
      
      await refreshUser();
      setMessage('New ID proof submitted for verification.');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('http://localhost:5000/api/profile/resume', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setFormData((prev: any) => ({ ...prev, resumeLink: data.resumeLink }));
      setMessage('Resume uploaded successfully!');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Student Settings</h1>
          <p className="text-slate-500 font-medium">Manage your professional presence and academic data.</p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <ImageUpload
            currentImage={user?.profilePhoto}
            onUpload={handlePhotoUpload}
            onRemove={handlePhotoRemove}
          />

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Institutional Section (Read-Only) */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Institutional Connection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <span className="block text-[10px] font-black uppercase text-slate-400 mb-1">College Name</span>
                  <p className="text-sm font-bold text-slate-700 bg-white px-4 py-3 rounded-xl border border-slate-200">{formData.collegeName || 'N/A'}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase text-slate-400 mb-1">College Code</span>
                  <p className="text-sm font-bold text-slate-700 bg-white px-4 py-3 rounded-xl border border-slate-200">{formData.collegeCode || 'N/A'}</p>
                </div>
              </div>

              {/* Identity Proof Management */}
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 italic">
                  <ShieldCheck className="w-3 h-3" /> Identity Verification Status
                </h3>
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user?.verificationStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : user?.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                         {user?.verificationStatus === 'APPROVED' ? <CheckCircle2 className="w-6 h-6" /> : user?.verificationStatus === 'REJECTED' ? <XCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900">{user?.verificationStatus?.replace('_', ' ') || 'PENDING'}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Card Proof</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      {user?.idProofUrl && <a href={user.idProofUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all">View Current</a>}
                      {user?.verificationStatus === 'REJECTED' && (
                        <button 
                          type="button"
                          onClick={() => proofInputRef.current?.click()}
                          className="text-[10px] font-black uppercase tracking-widest text-white bg-red-600 px-4 py-2 rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition-all flex items-center gap-2"
                        >
                          <Upload className="w-3 h-3" /> Re-upload
                        </button>
                      )}
                      <input 
                        type="file"
                        ref={proofInputRef}
                        onChange={handleProofUpload}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                      />
                   </div>
                </div>
                {user?.verificationStatus === 'REJECTED' && (
                  <p className="mt-3 px-4 text-[10px] font-bold text-red-500 italic">Reason: {user.rejectionReason}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input
                    type="text" required
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Academic Department</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input
                    type="text" required
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Short Bio</label>
              <textarea
                placeholder="A brief introduction about yourself..."
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm min-h-[100px]"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Roll Number</label>
                <input
                  type="text" required
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Current Year</label>
                <input
                  type="text" required
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.currentYear}
                  onChange={(e) => setFormData({ ...formData, currentYear: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">CGPA</label>
                <input
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Skills (Comma separated)</label>
              <input
                type="text"
                placeholder="React, Node.js, Python, Figma"
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">LinkedIn URL</label>
                <div className="relative">
                  <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.linkedIn}
                    onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">GitHub URL</label>
                <div className="relative">
                  <Code className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.githubLink}
                    onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Portfolio URL</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.portfolioLink}
                    onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Phone Number</label>
                <input
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Professional Resume (PDF)</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Upload your resume..."
                    className="flex-1 px-6 py-4 bg-slate-100 rounded-2xl border-2 border-transparent font-bold text-sm text-slate-500 truncate"
                    value={formData.resumeLink}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                    className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4" /> Upload
                  </button>
                  <input
                    type="file"
                    ref={resumeInputRef}
                    onChange={handleResumeUpload}
                    accept=".pdf"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Interested Job Role</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.interestedJobRole}
                  onChange={(e) => setFormData({ ...formData, interestedJobRole: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Expected Salary</label>
                <input
                  type="text"
                  placeholder="e.g. 10 LPA"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Preferred Location</label>
                <input
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.preferredLocation}
                  onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Ready to Relocate?</label>
                <select
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.readyToRelocate}
                  onChange={(e) => setFormData({ ...formData, readyToRelocate: e.target.value })}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Certifications</label>
              <textarea
                placeholder="List your certifications, e.g. AWS Certified, Google Cloud Associate..."
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm min-h-[100px]"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Career Interests & Goals</label>
              <textarea
                placeholder="What are your career aspirations?"
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm min-h-[100px]"
                value={formData.careerInterests}
                onChange={(e) => setFormData({ ...formData, careerInterests: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">About Me / Full Details</label>
              <textarea
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm min-h-[150px]"
                value={formData.fullDetails}
                onChange={(e) => setFormData({ ...formData, fullDetails: e.target.value })}
              />
            </div>

            {message && (
              <div className={`p-4 rounded-2xl text-xs font-black uppercase tracking-widest ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-sm hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50"
            >
              <Save className="w-5 h-5" /> {loading ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </form>
        </div>

        <div className="mt-12">
          <NotificationSettings />
        </div>
      </div>
    </DashboardLayout>
  );
}
