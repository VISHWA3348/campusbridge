'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ImageUpload from '@/components/ImageUpload';
import NotificationSettings from '@/components/NotificationSettings';
import { useAuth } from '@/context/AuthContext';
import { Save, User, Building2, Hash, GraduationCap, Briefcase, MapPin, Calendar, Heart, Share2, Globe } from 'lucide-react';

export default function AlumniSettings() {
  const { user, token, refreshUser, updateUser } = useAuth();
  const [formData, setFormData] = useState<any>({
    name: '',
    bio: '',
    department: '',
    passoutYear: '',
    currentCompany: '',
    companyAddress: '',
    experience: '',
    maritalStatus: '',
    skills: '',
    linkedIn: '',
    portfolio: '',
    currentLocation: '',
    readyForReferral: 'No',
    readyForMentorship: 'No',
    resumeReview: 'No',
    // Missing fields added
    jobRole: '',
    previousCompanies: '',
    certifications: '',
    achievements: '',
    availableTime: '',
    preferredContactMode: 'LinkedIn',
    permanentAddress: '',
    temporaryAddress: '',
    childrenDetails: '',
    collegeName: '',
    collegeCode: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      const rawBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com');
      const baseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
      fetch(`${baseUrl}/profile/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('Non-JSON response');
      })
      .then(data => {
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          department: data.alumni?.department || '',
          passoutYear: data.alumni?.passoutYear || '',
          currentCompany: data.alumni?.currentCompany || '',
          companyAddress: data.alumni?.companyAddress || '',
          experience: data.alumni?.experience || '',
          maritalStatus: data.alumni?.maritalStatus || '',
          skills: data.alumni?.skills || '',
          linkedIn: data.alumni?.linkedIn || '',
          portfolio: data.alumni?.portfolio || '',
          currentLocation: data.alumni?.currentLocation || '',
          readyForReferral: data.alumni?.readyForReferral || 'No',
          readyForMentorship: data.alumni?.readyForMentorship || 'No',
          resumeReview: data.alumni?.resumeReview || 'No',
          jobRole: data.alumni?.jobRole || '',
          previousCompanies: data.alumni?.previousCompanies || '',
          certifications: data.alumni?.certifications || '',
          achievements: data.alumni?.achievements || '',
          availableTime: data.alumni?.availableTime || '',
          preferredContactMode: data.alumni?.preferredContactMode || 'LinkedIn',
          permanentAddress: data.alumni?.permanentAddress || '',
          temporaryAddress: data.alumni?.temporaryAddress || '',
          childrenDetails: data.alumni?.childrenDetails || '',
          collegeName: data.college?.name || '',
          collegeCode: data.college?.collegeCode || '',
          phoneNumber: data.alumni?.phoneNumber || ''
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
      const rawBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com');
      const baseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
      const res = await fetch(baseUrl + '/profile/me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        let errMessage = 'Failed to update settings';
        if (contentType && contentType.includes('application/json')) {
          const errData = await res.json();
          errMessage = errData.error || errMessage;
        }
        throw new Error(errMessage);
      }

      const profileData = await res.json();
      if (profileData.user && updateUser) {
        updateUser(profileData.user);
      } else {
        await refreshUser();
      }
      
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

    const rawBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com');
    const baseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
    const res = await fetch(baseUrl + '/profile/photo', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      await refreshUser();
    }
  };

  const handlePhotoRemove = async () => {
    const rawBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com');
    const baseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
    const res = await fetch(baseUrl + '/profile/photo', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      await refreshUser();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Alumni Settings</h1>
          <p className="text-slate-500 font-medium">Update your professional identity and preferences.</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="block text-[10px] font-black uppercase text-slate-400 mb-1">College Name</span>
                  <p className="text-sm font-bold text-slate-700 bg-white px-4 py-3 rounded-xl border border-slate-200">{formData.collegeName || 'N/A'}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase text-slate-400 mb-1">College Code</span>
                  <p className="text-sm font-bold text-slate-700 bg-white px-4 py-3 rounded-xl border border-slate-200">{formData.collegeCode || 'N/A'}</p>
                </div>
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
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Department</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input 
                    type="text" required
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Bio</label>
              <textarea 
                placeholder="Share your professional journey..."
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm min-h-[100px]"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Passout Year</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input 
                    type="text" required
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.passoutYear}
                    onChange={(e) => setFormData({...formData, passoutYear: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Job Role</label>
                <input 
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.jobRole}
                  onChange={(e) => setFormData({...formData, jobRole: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Experience (Years)</label>
                <input 
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Skills (Comma separated)</label>
                <input 
                  type="text"
                  placeholder="Java, Python, React, AWS"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Current Company</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData({...formData, currentCompany: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Current Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.currentLocation}
                  onChange={(e) => setFormData({...formData, currentLocation: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Previous Companies</label>
              <input 
                type="text"
                placeholder="Amazon, Microsoft, etc."
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                value={formData.previousCompanies}
                onChange={(e) => setFormData({...formData, previousCompanies: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Certifications</label>
                <input 
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.certifications}
                  onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Permanent Address</label>
                <input 
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({...formData, permanentAddress: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Contact Mode</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.preferredContactMode}
                  onChange={(e) => setFormData({...formData, preferredContactMode: e.target.value})}
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Phone Number</label>
                <input 
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">LinkedIn URL</label>
                <div className="relative">
                  <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input 
                    type="text"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.linkedIn}
                    onChange={(e) => setFormData({...formData, linkedIn: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Portfolio/Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input 
                    type="text"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <h4 className="text-sm font-black text-slate-900 mb-6">Engagement Preferences</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PreferenceToggle 
                  label="Ready for Referral" 
                  value={formData.readyForReferral} 
                  onChange={(val) => setFormData({...formData, readyForReferral: val})} 
                />
                <PreferenceToggle 
                  label="Ready for Mentorship" 
                  value={formData.readyForMentorship} 
                  onChange={(val) => setFormData({...formData, readyForMentorship: val})} 
                />
                <PreferenceToggle 
                  label="Resume Review" 
                  value={formData.resumeReview} 
                  onChange={(val) => setFormData({...formData, resumeReview: val})} 
                />
              </div>
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
              <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save Settings'}
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

function PreferenceToggle({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  const isYes = value === 'Yes' || value === 'YES';
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <div className="flex bg-white p-1 rounded-xl border border-slate-200">
        <button 
          type="button"
          onClick={() => onChange('Yes')}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${isYes ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Yes
        </button>
        <button 
          type="button"
          onClick={() => onChange('No')}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${!isYes ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          No
        </button>
      </div>
    </div>
  );
}
