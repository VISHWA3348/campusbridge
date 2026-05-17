'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  GraduationCap, 
  MapPin, 
  Code, 
  MessageSquare, 
  User, 
  Filter, 
  Users, 
  Loader2, 
  ArrowRight,
  Rocket
} from 'lucide-react';
import Link from 'next/link';

export default function StudentSearchPage() {
  const { token, user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        q: searchTerm,
        department: filters.department
      }).toString();

      const res = await fetch(`http://localhost:5000/api/alumni/students?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-20">
        <div className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase">
            Student <span className="text-indigo-600">Directory</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">Discover and mentor talented students from your college. Help them build their careers.</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by name, skills, or domain..."
                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none font-bold transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Department..."
                className="w-full pl-12 pr-4 py-5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none font-bold transition-all text-sm"
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
              />
            </div>

            <button 
              onClick={fetchStudents}
              className="bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 py-5"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Student Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Finding talented students...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {students.map((student: any) => (
              <div key={student.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center gap-6 mb-8 relative">
                  <div className="w-20 h-20 bg-slate-50 rounded-[1.8rem] overflow-hidden flex items-center justify-center font-black text-2xl shadow-sm border border-slate-100 group-hover:border-indigo-200 transition-all">
                    {student.user?.profilePhoto ? (
                      <img src={`http://localhost:5000/${student.user.profilePhoto}`} className="w-full h-full object-cover" />
                    ) : (student.user?.name?.[0] || '?')}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl leading-tight mb-1">{student.user?.name || 'Anonymous Student'}</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> {student.department} • Year {student.currentYear}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <Rocket className="w-4 h-4 text-indigo-400" />
                    <span>Interested in {student.interestedDomain || 'Technology'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <MapPin className="w-4 h-4" />
                    <span>{student.preferredLocation || 'Anywhere'}</span>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {(student.skills?.split(',') || ['Passionate']).slice(0, 3).map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-tight group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{s.trim()}</span>
                      ))}
                      {student.skills?.split(',').length > 3 && (
                        <span className="px-3 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-tight">+{student.skills.split(',').length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href={`/dashboard/profile/${student.user?.id}`}
                    className="flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-100 shadow-sm"
                  >
                    <User className="w-4 h-4" /> View Details
                  </Link>
                  <Link
                    href={`/dashboard/alumni/chat?userId=${student.user?.id}`}
                    className="flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-indigo-100"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </Link>
                </div>
              </div>
            ))}

            {students.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border border-slate-100 border-dashed">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mx-auto mb-8">
                  <Users className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">No students found</h3>
                <p className="text-slate-500 font-medium">Try broadening your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
