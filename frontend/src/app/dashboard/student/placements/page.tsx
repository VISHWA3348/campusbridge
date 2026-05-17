'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchStudentPlacements, reportPlacement, searchAlumni } from '@/lib/api';
import { Briefcase, Building2, Calendar, MapPin, DollarSign, Award, Loader2, Plus, ArrowRight } from 'lucide-react';

export default function StudentPlacementsPage() {
  const [placements, setPlacements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [mode, setMode] = useState('On-campus');
  const [date, setDate] = useState('');
  const [alumniId, setAlumniId] = useState('');
  const [alumniList, setAlumniList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPlacements();
    loadAlumni();
  }, []);

  const loadPlacements = async () => {
    try {
      const data = await fetchStudentPlacements();
      setPlacements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAlumni = async () => {
    try {
      // In a real scenario, this might search alumni or use a specific API. 
      // Using searchAlumni here as it's the correct one for students.
      const data = await searchAlumni();
      setAlumniList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reportPlacement({ company, role, salary, mode, date, alumniId });
      alert('Placement reported successfully!');
      setShowForm(false);
      loadPlacements();
    } catch (error) {
      alert('Failed to report placement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">My Placements</h1>
          <p className="text-slate-500 font-medium text-lg">Track and report your career milestones.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-indigo-600/30"
        >
          {showForm ? 'Cancel' : <><Plus className="w-5 h-5" /> Report Placement</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl mb-12 animate-fade-in">
          <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">Report New Placement</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Company Name</label>
              <input type="text" required value={company} onChange={e => setCompany(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all" placeholder="e.g., Google" />
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Job Role</label>
              <input type="text" required value={role} onChange={e => setRole(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all" placeholder="e.g., Software Engineer" />
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Salary Package (Optional)</label>
              <input type="text" value={salary} onChange={e => setSalary(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all" placeholder="e.g., 12 LPA" />
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Placement Date</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all" />
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Placement Mode</label>
              <select value={mode} onChange={e => setMode(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all appearance-none">
                <option value="On-campus">On-campus</option>
                <option value="Off-campus">Off-campus</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Referred by Alumni? (Optional)</label>
              <select value={alumniId} onChange={e => setAlumniId(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all appearance-none">
                <option value="">No Referral</option>
                {alumniList.map(a => (
                  <option key={a.id} value={a.id}>{a.user?.name} - {a.currentCompany}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 pt-4">
              <button disabled={submitting} type="submit" className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Placement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-indigo-600" /></div>
      ) : placements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {placements.map(p => (
            <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="flex items-center gap-6 mb-8 relative z-10">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{p.company}</h3>
                  <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">{p.role}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex items-center gap-3 text-slate-500 font-medium">
                  <Calendar className="w-5 h-5 text-slate-400" /> {new Date(p.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3 text-slate-500 font-medium">
                  <MapPin className="w-5 h-5 text-slate-400" /> {p.mode}
                </div>
                {p.salary && (
                  <div className="flex items-center gap-3 text-slate-500 font-medium">
                    <DollarSign className="w-5 h-5 text-slate-400" /> {p.salary}
                  </div>
                )}
              </div>

              {(p.alumni || p.referral?.alumni) && (
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 relative z-10">
                  <Award className="w-6 h-6 text-amber-500" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Referred By</p>
                    <p className="font-bold text-slate-900">{p.alumni?.user?.name || p.referral?.alumni?.user?.name}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">No Placements Yet</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">Report your placements to build your career profile and inspire juniors.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
