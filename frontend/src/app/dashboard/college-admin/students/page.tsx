'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  fetchStudents, 
  deleteStudent, 
  fetchPendingVerifications, 
  approveUser, 
  rejectUser 
} from '@/lib/api';
import { 
  User, Mail, GraduationCap, Trash2, Loader2, Search, 
  ExternalLink, CheckCircle2, XCircle, Clock, Eye, 
  ShieldCheck, FileText, X, AlertCircle, Check
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CollegeStudentsPage() {
  const [studentList, setStudentList] = useState<any[]>([]);
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean, userId: number | null }>({ isOpen: false, userId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [all, pending] = await Promise.all([
        fetchStudents(),
        fetchPendingVerifications()
      ]);
      setStudentList(Array.isArray(all) ? all : []);
      setPendingList(Array.isArray(pending) ? pending : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this student?')) {
      await deleteStudent(id);
      loadData();
    }
  };

  const handleApprove = async (userId: number) => {
    if (confirm('Approve this student for full platform access?')) {
      setActionLoading(true);
      await approveUser(userId);
      await loadData();
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return alert('Please provide a reason for rejection.');
    setActionLoading(true);
    if (rejectionModal.userId) {
      await rejectUser(rejectionModal.userId, rejectionReason);
      setRejectionModal({ isOpen: false, userId: null });
      setRejectionReason('');
      await loadData();
    }
    setActionLoading(false);
  };

  const currentList = activeTab === 'ALL' ? studentList : pendingList;
  
  const filteredStudents = currentList.filter(s => {
    const student = activeTab === 'ALL' ? s : s.student;
    const user = activeTab === 'ALL' ? s.user : s;
    return (
      (user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student?.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student?.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" /> Verified</span>;
      case 'PENDING_APPROVAL': return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full"><Clock className="w-3 h-3" /> Pending</span>;
      case 'REJECTED': return <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full"><XCircle className="w-3 h-3" /> Rejected</span>;
      default: return <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-3 uppercase">Manage Students</h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl italic">Verify student identities and manage institutional enrollment.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search by name, roll no, or dept..."
              className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] outline-none focus:border-indigo-500 transition-all text-sm font-bold shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8 bg-white p-2 rounded-[2.5rem] border border-slate-100 w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('ALL')}
          className={`px-8 py-4 rounded-[2rem] text-xs font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'ALL' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}
        >
          All Students ({studentList.length})
        </button>
        <button 
          onClick={() => setActiveTab('PENDING')}
          className={`px-8 py-4 rounded-[2rem] text-xs font-black uppercase tracking-[0.15em] transition-all relative ${activeTab === 'PENDING' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-slate-900'}`}
        >
          Pending Verification ({pendingList.length})
          {pendingList.length > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              {pendingList.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
           <Loader2 className="w-16 h-16 animate-spin text-indigo-600" />
           <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Syncing student database...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden relative min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</th>
                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Batch / Roll</th>
                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((item) => {
                const s = activeTab === 'ALL' ? item : item.student;
                const u = activeTab === 'ALL' ? item.user : item;
                if (!u) return null;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-900 text-xl border-2 border-white shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                           {u.profilePhoto ? (
                             <img src={`http://localhost:5000/${u.profilePhoto}`} alt="" className="w-full h-full object-cover" />
                           ) : u.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-xl text-slate-900 tracking-tight">{u.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                             <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5"><Mail className="w-3 h-3" /> {u.email}</p>
                             <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                             <p className="text-xs text-indigo-600 font-black uppercase tracking-tighter">{s?.department}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-center">
                      <p className="font-black text-slate-900 text-sm tracking-widest">{s?.rollNumber || 'N/A'}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400 mt-0.5">{s?.currentYear || 'Unknown'}</p>
                    </td>
                    <td className="px-8 py-8">
                       {getStatusBadge(u.verificationStatus)}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end items-center gap-3">
                        {u.idProofUrl && (
                          <button 
                            onClick={() => setSelectedProof(u.idProofUrl)}
                            className="p-4 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-2xl transition-all shadow-sm group/btn relative"
                            title="View ID Proof"
                          >
                            <Eye className="w-6 h-6" />
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">View ID Card</span>
                          </button>
                        )}
                        
                        {u.verificationStatus === 'PENDING_APPROVAL' ? (
                          <>
                            <button 
                              onClick={() => handleApprove(u.id)}
                              className="p-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-sm shadow-emerald-50"
                              title="Approve Student"
                            >
                              <Check className="w-6 h-6" />
                            </button>
                            <button 
                              onClick={() => setRejectionModal({ isOpen: true, userId: u.id })}
                              className="p-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm shadow-red-50"
                              title="Reject Student"
                            >
                              <X className="w-6 h-6" />
                            </button>
                          </>
                        ) : (
                          <div className="flex gap-2">
                             <Link 
                                href={`/dashboard/profile/${u.id}`}
                                className="p-4 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm"
                                title="View Details"
                             >
                                <ExternalLink className="w-6 h-6" />
                             </Link>
                             <button 
                                onClick={() => handleDelete(s?.id)}
                                className="p-4 bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"
                                title="Remove Student"
                             >
                                <Trash2 className="w-6 h-6" />
                             </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="py-40 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-6">
                <Search className="w-10 h-10" />
              </div>
              <p className="text-slate-400 font-black text-xl italic uppercase tracking-tighter">No students found matching your filters.</p>
              <button onClick={() => setSearchTerm('')} className="mt-4 text-indigo-600 font-bold hover:underline">Clear search</button>
            </div>
          )}
        </div>
      )}

      {/* ID Proof Modal */}
      <AnimatePresence>
        {selectedProof && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl relative"
            >
               <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                      <ShieldCheck className="w-10 h-10 text-indigo-600" /> Student Verification Proof
                    </h2>
                    <p className="text-slate-400 font-bold mt-1 uppercase text-xs tracking-widest italic">Review the provided college identity card carefully.</p>
                  </div>
                  <button 
                    onClick={() => setSelectedProof(null)}
                    className="p-4 bg-white text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm transition-all"
                  >
                    <X className="w-8 h-8" />
                  </button>
               </div>
               <div className="p-12 h-[60vh] overflow-y-auto bg-slate-100 flex items-center justify-center">
                  {selectedProof.toLowerCase().endsWith('.pdf') ? (
                    <iframe src={selectedProof} className="w-full h-full rounded-2xl shadow-2xl border-4 border-white" />
                  ) : (
                    <img src={selectedProof} alt="ID Card Proof" className="max-w-full max-h-full rounded-2xl shadow-2xl border-[12px] border-white object-contain" />
                  )}
               </div>
               <div className="p-10 bg-white border-t border-slate-50 flex justify-center gap-6">
                  <button onClick={() => setSelectedProof(null)} className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:scale-105 transition-transform shadow-2xl shadow-slate-200">Done Reviewing</button>
                  <a href={selectedProof} target="_blank" rel="noopener noreferrer" className="px-12 py-5 bg-indigo-50 text-indigo-600 rounded-[2rem] font-black text-xl flex items-center gap-3 hover:bg-indigo-100 transition-all">
                     <FileText className="w-6 h-6" /> Open Full Screen
                  </a>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectionModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl relative border border-red-50"
            >
              <div className="mb-10 text-center">
                 <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10" />
                 </div>
                 <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Reject Verification</h2>
                 <p className="text-slate-400 font-medium">Please provide a reason why this student's identity proof was not accepted.</p>
              </div>
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-4 italic">Rejection Reason</label>
                    <textarea 
                      placeholder="e.g. Uploaded document is unclear or expired ID card provided."
                      className="w-full p-8 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm min-h-[150px] resize-none"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                 </div>
                 <div className="flex flex-col gap-4">
                    <button 
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="w-full bg-red-500 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-red-600 transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-3"
                    >
                      {actionLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : 'Confirm Rejection'}
                    </button>
                    <button 
                      onClick={() => setRejectionModal({ isOpen: false, userId: null })}
                      className="w-full py-4 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-slate-900"
                    >
                      Cancel
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
