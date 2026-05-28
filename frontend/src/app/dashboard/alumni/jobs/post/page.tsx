'use client';

import React, { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Briefcase, 
  ArrowLeft, 
  Save, 
  Building2, 
  MapPin, 
  Clock, 
  IndianRupee, 
  AlignLeft, 
  Code, 
  Link as LinkIcon, 
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PostJobPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    skills: '',
    salary: '',
    location: '',
    workType: 'Office',
    applicationLink: '',
    lastDate: ''
  });

  useEffect(() => {
    if (editId) {
      fetchJobDetails();
    }
  }, [editId]);

  const fetchJobDetails = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')}/jobs/alumni`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const jobs = await res.json();
      const job = jobs.find((j: any) => j.id === parseInt(editId as string));
      if (job) {
        setFormData({
          title: job.title || '',
          company: job.company || '',
          description: job.description || '',
          skills: job.skills || '',
          salary: job.salary || '',
          location: job.location || '',
          workType: job.workType || 'Office',
          applicationLink: job.applicationLink || '',
          lastDate: job.lastDate ? new Date(job.lastDate).toISOString().split('T')[0] : ''
        });
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editId 
        ? `${(process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')}/jobs/${editId}` 
        : (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api') + '/jobs';
      
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        router.push('/dashboard/alumni/jobs');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <Link 
          href="/dashboard/alumni/jobs" 
          className="inline-flex items-center gap-2 text-slate-500 font-black uppercase tracking-widest text-[10px] mb-8 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to My Postings
        </Link>

        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="relative z-10 mb-12">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              {editId ? 'Edit Job Posting' : 'Post a New Job'}
            </h1>
            <p className="text-slate-500 font-medium">Fill in the details to share this opportunity with your college community.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Briefcase className="w-3 h-3" /> Job Title
                </label>
                <input 
                  type="text" required
                  placeholder="Software Engineer Intern"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> Company Name
                </label>
                <input 
                  type="text" required
                  placeholder="Google / Microsoft / Startup"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Job Description
              </label>
              <textarea 
                required
                rows={5}
                placeholder="Tell students about the role, responsibilities, and team..."
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm min-h-[150px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Code className="w-3 h-3" /> Skills Required
                </label>
                <input 
                  type="text"
                  placeholder="React, Node.js, Python..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <IndianRupee className="w-3 h-3" /> Salary Package (e.g. 12 LPA)
                </label>
                <input 
                  type="text"
                  placeholder="₹ 10,00,000 - ₹ 15,00,000"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Location
                </label>
                <input 
                  type="text"
                  placeholder="Bangalore / Hybrid"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Work Type
                </label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm appearance-none cursor-pointer"
                  value={formData.workType}
                  onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                >
                  <option value="Office">On-Site / Office</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Last Date to Apply
                </label>
                <input 
                  type="date"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  value={formData.lastDate}
                  onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <LinkIcon className="w-3 h-3" /> Application Link
              </label>
              <input 
                type="url" required
                placeholder="https://company-careers-portal.com/apply"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                value={formData.applicationLink}
                onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
              />
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" /> {editId ? 'Updating...' : 'Posting...'}
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" /> {editId ? 'Update Job Post' : 'Share Opportunity Now'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PostJobPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    }>
      <PostJobPageContent />
    </Suspense>
  );
}
