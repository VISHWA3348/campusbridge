'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Lock, Building2, GraduationCap, Briefcase, Link as LinkIcon, Phone, MapPin, Globe, Loader2, MailCheck, Hash, Target, Award, CheckCircle2, ChevronDown, FileText, Upload, X, Eye, AlertCircle, ShieldCheck } from 'lucide-react';
import OTPVerification from '@/components/OTPVerification';
import { div } from 'framer-motion/client';

export default function StudentSignup() {
  const [formData, setFormData] = useState({
    role: 'STUDENT',
    name: '', email: '', password: '',
    collegeName: '', collegeCode: '', inviteCode: '', departmentName: '', departmentId: '', rollNumber: '', collegeIdNumber: '', currentYear: '', totalStudents: '',
    skills: '', interestedJobRole: '', preferredCompanyType: '', expectedSalary: '', cgpa: '',
    resumeLink: '', portfolioLink: '', githubLink: '',
    preferredLocation: '', readyToRelocate: 'Yes',
    interestMode: 'Seminar', interestedDomain: '',
    phoneNumber: '', linkedIn: '', idProofUrl: '', idProofPublicId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [codeValidating, setCodeValidating] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    // Handle code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setFormData(prev => ({ ...prev, inviteCode: code.toUpperCase() }));
      validateInviteCode(code.toUpperCase());
    }

    fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')) + '/auth/colleges')
      .then(res => res.json())
      .then(data => setColleges(data))
      .catch(err => console.error('Failed to load colleges', err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleCollegeChange = (collegeName: string) => {
    const college = colleges.find(c => c.name === collegeName);
    if (college) {
      setFormData({
        ...formData,
        collegeName: college.name,
        collegeCode: college.collegeCode,
        departmentName: '', // Reset department on college change
        departmentId: ''
      });
      // Prioritize relational list if it has items, fallback to comma string
      const deptsRaw = (Array.isArray(college.departmentsList) && college.departmentsList.length > 0)
        ? college.departmentsList.map((d: any) => ({ name: d.name.trim(), code: d.code }))
        : (college.departments ? college.departments.split(',').map((d: string) => ({ name: d.trim(), code: '' })) : []);

      // Deduplicate departments by name
      const uniqueDepts = Array.from(new Map(deptsRaw.map((item: any) => [item.name, item])).values());
      setAvailableDepartments(uniqueDepts);
    }
  };

  const handleDepartmentChange = (deptName: string) => {
    const dept = availableDepartments.find(d => d.name === deptName);
    setFormData({
      ...formData,
      departmentName: deptName,
      departmentId: dept ? dept.code : ''
    });
  };

  const validateInviteCode = async (code: string) => {
    if (!code || code.length < 5) {
        setCodeError('');
        setCodeSuccess(false);
        return;
    }
    setCodeValidating(true);
    setCodeError('');
    setCodeSuccess(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')}/auth/validate-invite-code?code=${code}&role=STUDENT`);
      const data = await res.json();

      if (!res.ok) {
        setCodeError(data.error || 'Invalid invite code');
        return;
      }

      // Auto-fill and lock
      setFormData(prev => ({
        ...prev,
        inviteCode: code,
        collegeName: data.college.name,
        collegeCode: data.college.collegeCode,
        departmentName: data.departmentName || '',
        departmentId: data.departmentId || '',
        currentYear: data.batch || prev.currentYear
      }));
      setCodeSuccess(true);
    } catch (err) {
      setCodeError('Connection failed');
    } finally {
      setCodeValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedFile) {
      setError('Please upload your College ID Card for verification.');
      setLoading(false);
      return;
    }

    try {
      // 1. Upload File first
      const fileFormData = new FormData();
      fileFormData.append('proof', selectedFile);

      const uploadRes = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')) + '/verification/upload-proof', {
        method: 'POST',
        body: fileFormData
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'File upload failed');

      // 2. Signup with File URL & Public ID
      const finalFormData = {
        ...formData,
        idProofUrl: uploadData.fileUrl,
        idProofPublicId: uploadData.publicId
      };

      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')) + '/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalFormData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setShowOTP(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')) + '/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setIsVerified(true);
      setShowOTP(false);
    } catch (err: any) {
      throw err;
    }
  };

  const handleResendOTP = async () => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')) + '/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
    } catch (err: any) {
      throw err;
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Registration Submitted!</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed mb-6">Your account is now <b>pending admin approval</b>. You will be notified once your college admin verifies your ID card.</p>
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-700 text-sm font-bold mb-10 border border-amber-100">
            ⏳ Approval typically takes 24-48 hours.
          </div>
          <Link href="/login" className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black text-xl transition-all hover:bg-slate-800 shadow-2xl shadow-slate-200 inline-block">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (showOTP) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white p-12 md:p-16 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 relative">
          <button
            onClick={() => setShowOTP(false)}
            className="absolute left-8 top-8 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <OTPVerification
            email={formData.email}
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/signup" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Choice
        </Link>

        <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="mb-16">
            <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Student Signup</h1>
            <p className="text-slate-400 font-medium text-lg italic">Complete your profile to unlock real opportunities.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Section 1: Basic Details */}
            <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-3">
                <span className="w-8 h-px bg-indigo-100"></span> 01. Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="Full Name" icon={<User />} placeholder="John Doe" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} />
                <Input label="Email Address" icon={<Mail />} placeholder="john@example.com" type="email" value={formData.email} onChange={(v: string) => setFormData({ ...formData, email: v })} />
                <Input label="Password" icon={<Lock />} placeholder="••••••••" type="password" value={formData.password} onChange={(v: string) => setFormData({ ...formData, password: v })} />
                <Input label="Phone Number" icon={<Phone />} placeholder="+91 9876543210" value={formData.phoneNumber} onChange={(v: string) => setFormData({ ...formData, phoneNumber: v })} />
              </div>
            </div>

            {/* Section 2: College Details */}
            <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-3">
                <span className="w-8 h-px bg-indigo-100"></span> 02. Institutional Access
              </h3>

              <div className="bg-indigo-50/50 p-10 rounded-[2.5rem] border-2 border-indigo-100 mb-8">
                <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3 px-4">Enter Secure Invite Code</label>
                <div className="relative">
                  <Lock className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${codeSuccess ? 'text-emerald-500' : 'text-indigo-300'}`} />
                  <input
                    type="text"
                    required
                    placeholder="E.g. ABC-STUDENT-X7A92"
                    className={`w-full pl-16 pr-24 py-5 rounded-3xl border-2 outline-none transition-all font-black text-lg tracking-wider uppercase ${codeError ? 'border-red-200 bg-red-50 text-red-600' : codeSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-indigo-200 bg-white text-indigo-900 focus:border-indigo-500'}`}
                    value={formData.inviteCode}
                    onChange={(e) => {
                      setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() });
                      if (e.target.value.length > 5) validateInviteCode(e.target.value.toUpperCase());
                    }}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    {codeValidating ? <Loader2 className="w-6 h-6 animate-spin text-indigo-400" /> : codeSuccess ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : null}
                  </div>
                </div>
                {codeError && <p className="mt-3 px-4 text-xs font-bold text-red-500 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {codeError}</p>}
                {codeSuccess && <p className="mt-3 px-4 text-xs font-bold text-emerald-600 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Code verified! College details auto-filled.</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-4">College Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 pointer-events-none" />
                    <input
                      readOnly
                      placeholder="Verified via Invite Code"
                      className="w-full pl-16 pr-12 py-5 bg-slate-100 rounded-3xl border-2 border-transparent outline-none font-bold text-sm text-slate-500 cursor-not-allowed"
                      value={formData.collegeName}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-4">Department</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 pointer-events-none" />
                    <input
                      readOnly
                      placeholder="Verified via Invite Code"
                      className="w-full pl-16 pr-12 py-5 bg-slate-100 rounded-3xl border-2 border-transparent outline-none font-bold text-sm text-slate-500 cursor-not-allowed"
                      value={formData.departmentName}
                    />
                  </div>
                </div>

                <Input label="Roll Number" icon={<Hash />} placeholder="2024CS101" value={formData.rollNumber} onChange={(v: string) => setFormData({ ...formData, rollNumber: v })} />
                <Input label="College ID Number" icon={<Hash />} placeholder="CID-123456" value={formData.collegeIdNumber} onChange={(v: string) => setFormData({ ...formData, collegeIdNumber: v })} />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Current Year / Batch"
                    placeholder="2026"
                    value={formData.currentYear}
                    onChange={(v: string) => setFormData({ ...formData, currentYear: v })}
                    disabled={codeSuccess && !!formData.currentYear}
                  />
                  <Input label="Total Students" placeholder="60" value={formData.totalStudents} onChange={(v: string) => setFormData({ ...formData, totalStudents: v })} />
                </div>
              </div>
            </div>



            {/* Section 3: Verification Proof */}
            <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-3">
                <span className="w-8 h-px bg-indigo-100"></span> 03. Identity Verification
              </h3>
              <div className="bg-slate-50 p-10 rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-indigo-500 transition-all group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center cursor-pointer py-10"
                  >
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:scale-110 transition-all mb-6">
                      <Upload className="w-10 h-10" />
                    </div>
                    <p className="text-lg font-black text-slate-900 mb-2">Upload College ID Card</p>
                    <p className="text-sm font-bold text-slate-400 italic">PNG, JPG or PDF up to 5MB</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    {filePreview ? (
                      <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg bg-white p-2">
                        <img src={filePreview} alt="ID Preview" className="w-full h-full object-cover rounded-xl" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-2xl shadow-lg bg-white flex items-center justify-center text-slate-300">
                        <FileText className="w-12 h-12" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xl font-black text-slate-900 mb-1">{selectedFile.name}</p>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setFilePreview(null); }}
                      className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Academic & Skills */}
            <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-3">
                <span className="w-8 h-px bg-indigo-100"></span> 04. Academic & Skills
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="Skills (Optional)" icon={<Briefcase />} placeholder="Java, Python, React..." value={formData.skills} onChange={(v: string) => setFormData({ ...formData, skills: v })} required={false} />
                <Input label="Interested Job Role (Optional)" icon={<Target />} placeholder="Full Stack Developer" value={formData.interestedJobRole} onChange={(v: string) => setFormData({ ...formData, interestedJobRole: v })} required={false} />
                <Input label="Preferred Company (Optional)" icon={<Building2 />} placeholder="Product Based / Startup" value={formData.preferredCompanyType} onChange={(v: string) => setFormData({ ...formData, preferredCompanyType: v })} required={false} />
                <Input label="CGPA / Percentage (Optional)" icon={<Award />} placeholder="8.5 / 85%" value={formData.cgpa} onChange={(v: string) => setFormData({ ...formData, cgpa: v })} required={false} />
              </div>
            </div>

            {/* Section 5: Links & Preferences */}
            <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-3">
                <span className="w-8 h-px bg-indigo-100"></span> 05. Digital Presence
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="Resume Link (Optional)" icon={<LinkIcon />} placeholder="Google Drive Link" value={formData.resumeLink} onChange={(v: string) => setFormData({ ...formData, resumeLink: v })} required={false} />
                <Input label="Portfolio (Optional)" icon={<Globe />} placeholder="https://myportfolio.com" value={formData.portfolioLink} onChange={(v: string) => setFormData({ ...formData, portfolioLink: v })} required={false} />
                <Input label="GitHub (Optional)" icon={<LinkIcon />} placeholder="https://github.com/..." value={formData.githubLink} onChange={(v: string) => setFormData({ ...formData, githubLink: v })} required={false} />
                <Input label="LinkedIn (Optional)" icon={<LinkIcon />} placeholder="https://linkedin.com/in/..." value={formData.linkedIn} onChange={(v: string) => setFormData({ ...formData, linkedIn: v })} required={false} />
              </div>
            </div>

            {error && (
              <div className="p-6 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div> {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : 'Join as Student'}
            </button>
          </form>
        </div >
      </div >
    </div >
  );
}

function Input({ label, icon, placeholder, type = 'text', value, onChange, disabled = false, required = true }: any) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-4">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5">{icon}</div>}
        <input
          type={type} required={required && !disabled}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${icon ? 'pl-16' : 'px-8'} pr-8 py-5 bg-slate-50 rounded-3xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
