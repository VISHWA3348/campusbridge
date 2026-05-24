'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Users, 
  MapPin, 
  Calendar,
  Building2,
  ExternalLink,
  ChevronRight,
  Loader2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AlumniJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')) + '/jobs/alumni', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job post?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')}/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        setJobs(jobs.filter((j: any) => j.id !== id));
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const filteredJobs = jobs.filter((job: any) => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Manage Jobs</h1>
            <p className="text-slate-500 font-medium">Post opportunities for students from your college.</p>
          </div>
          <Link 
            href="/dashboard/alumni/jobs/post" 
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Post New Job
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Active Postings', val: jobs.length, icon: <Briefcase />, color: 'blue' },
            { label: 'Total Reach', val: jobs.length * 150, icon: <Users />, color: 'indigo' }, // Mock reach
            { label: 'Award Points', val: jobs.length * 10, icon: <Calendar />, color: 'green' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className={`w-14 h-14 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900">{stat.val}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search your job postings..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
            <Filter className="w-5 h-5" /> Filters
          </button>
        </div>

        {/* Job List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold">Loading your job posts...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job: any) => (
              <motion.div 
                layout
                key={job.id}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex gap-6 items-start">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors flex-shrink-0">
                      <Building2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                      <p className="text-lg font-bold text-slate-500 mb-4">{job.company}</p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-xs font-black text-slate-500">
                          <MapPin className="w-3.5 h-3.5" /> {job.location || 'Remote'}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl text-xs font-black text-indigo-600">
                          <Clock className="w-3.5 h-3.5" /> {job.workType || 'Full-time'}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl text-xs font-black text-green-600">
                          ₹ {job.salary || 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t lg:border-t-0 pt-6 lg:pt-0">
                    <Link 
                      href={`/dashboard/alumni/jobs/post?edit=${job.id}`}
                      className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                      title="Edit Post"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(job.id)}
                      className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all"
                      title="Delete Post"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="h-12 w-[2px] bg-slate-100 mx-2 hidden lg:block"></div>
                    <button className="bg-slate-900 text-white px-8 h-12 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
                      View Applicants <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-slate-50 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6 shadow-sm">
                <Briefcase className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No jobs posted yet</h3>
              <p className="text-slate-500 font-medium mb-8">Start by creating your first job opportunity for students.</p>
              <Link 
                href="/dashboard/alumni/jobs/post" 
                className="inline-flex bg-slate-900 text-white px-10 py-5 rounded-2xl font-black gap-3 hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200"
              >
                <Plus className="w-5 h-5" /> Post Your First Job
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
