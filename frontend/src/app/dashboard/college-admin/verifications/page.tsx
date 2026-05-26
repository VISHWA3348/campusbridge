'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getFileUrl } from '@/lib/api';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  User, 
  Mail, 
  Hash, 
  Calendar, 
  FileText, 
  Loader2, 
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerificationsPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'https://campusbridge-e4cv.onrender.com/api'))) + '/college-admin/verifications/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPendingUsers(data);
    } catch (err) {
      console.error('Failed to fetch pending verifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (userId: number) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'https://campusbridge-e4cv.onrender.com/api'))}/college-admin/verifications/approve/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingUsers(pendingUsers.filter(u => u.id !== userId));
        setSelectedUser(null);
      }
    } catch (err) {
      console.error('Approval failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectionReason) return;
    setActionLoading(selectedUser.id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'https://campusbridge-e4cv.onrender.com/api'))}/college-admin/verifications/reject/${selectedUser.id}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });
      if (res.ok) {
        setPendingUsers(pendingUsers.filter(u => u.id !== selectedUser.id));
        setSelectedUser(null);
        setShowRejectModal(false);
        setRejectionReason('');
      }
    } catch (err) {
      console.error('Rejection failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Verification Requests</h1>
        <p className="text-slate-500 font-medium italic">Review and approve Student and Alumni access to your institution's private ecosystem.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* List of Requests */}
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading requests...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center px-10">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">All Caught Up!</h3>
              <p className="text-slate-400 font-medium">There are no pending verification requests at the moment.</p>
            </div>
          ) : (
            pendingUsers.map((user) => (
              <motion.div 
                layoutId={`user-${user.id}`}
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${
                  selectedUser?.id === user.id ? 'bg-indigo-600 border-indigo-600 shadow-2xl shadow-indigo-200' : 'bg-white border-transparent hover:border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl transition-colors ${
                    selectedUser?.id === user.id ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className={`text-lg font-black tracking-tight ${selectedUser?.id === user.id ? 'text-white' : 'text-slate-900'}`}>{user.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                        selectedUser?.id === user.id ? 'bg-white/10 text-indigo-100' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`text-xs font-medium ${selectedUser?.id === user.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {user.role === 'STUDENT' ? user.student?.rollNumber : user.email}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className={`w-6 h-6 transition-transform group-hover:translate-x-2 ${
                  selectedUser?.id === user.id ? 'text-white' : 'text-slate-200'
                }`} />
              </motion.div>
            ))
          )}
        </div>

        {/* Details View */}
        <div className="xl:col-span-1">
          <AnimatePresence mode="wait">
            {selectedUser ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden sticky top-8"
              >
                <div className="p-10">
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 font-black text-4xl">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Status</span>
                      <span className="flex items-center gap-2 text-xs font-black text-amber-600 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                        <Clock className="w-3 h-3" /> PENDING
                      </span>
                    </div>
                  </div>

                  <div className="space-y-8 mb-12">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{selectedUser.name}</h2>
                      <p className="text-slate-500 font-bold flex items-center gap-2"><Mail className="w-4 h-4" /> {selectedUser.email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <Detail label="Role" value={selectedUser.role} icon={<User />} />
                      <Detail label="Joined" value={new Date(selectedUser.createdAt).toLocaleDateString()} icon={<Calendar />} />
                      <Detail label="Invite Code" value={selectedUser.inviteCodeUsed?.code || 'N/A'} icon={<ShieldCheck />} />
                      <Detail label="College ID" value={selectedUser.collegeIdNumber || 'N/A'} icon={<Hash />} />
                      {selectedUser.role === 'STUDENT' && (
                        <Detail label="Roll Number" value={selectedUser.student?.rollNumber} icon={<Hash />} />
                      )}
                      {selectedUser.role === 'ALUMNI' && (
                        <>
                          <Detail label="Department" value={selectedUser.alumni?.department} icon={<Hash />} />
                          <Detail label="Passout Year" value={selectedUser.alumni?.passoutYear} icon={<Calendar />} />
                          <Detail label="Company" value={selectedUser.alumni?.currentCompany || selectedUser.alumni?.company} icon={<User />} />
                          <Detail label="Job Role" value={selectedUser.alumni?.jobRole || selectedUser.alumni?.role} icon={<User />} />
                        </>
                      )}
                    </div>

                    {/* Proof Document */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Verification Proof</label>
                      <div className="relative group rounded-3xl overflow-hidden bg-slate-50 border-2 border-slate-100 aspect-video flex items-center justify-center">
                        {selectedUser.idProofUrl || selectedUser.alumni?.alumniProofUrl ? (
                          <>
                            <img 
                              src={getFileUrl(selectedUser.idProofUrl || selectedUser.alumni?.alumniProofUrl) || ''} 
                              alt="Verification Proof" 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              onError={(e: any) => {
                                e.target.style.display = 'none';
                                (e.target.nextSibling as HTMLElement).style.display = 'flex';
                              }}
                            />
                            <div className="hidden absolute inset-0 bg-slate-50 flex-col items-center justify-center p-8 text-center">
                              <FileText className="w-12 h-12 text-slate-200 mb-4" />
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Document View (PDF/File)</p>
                            </div>
                            <a 
                              href={getFileUrl(selectedUser.idProofUrl || selectedUser.alumni?.alumniProofUrl) || '#'}
                              target="_blank"
                              className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                              <div className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-2xl">
                                <Eye className="w-4 h-4" /> View Full Document
                              </div>
                            </a>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-300 gap-4">
                            <AlertCircle className="w-12 h-12" />
                            <p className="text-xs font-black uppercase tracking-widest">No proof uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleApprove(selectedUser.id)}
                      disabled={actionLoading !== null}
                      className="flex-1 bg-green-600 text-white py-5 rounded-2xl font-black text-sm hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {actionLoading === selectedUser.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Approve</>}
                    </button>
                    <button 
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading !== null}
                      className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" /> Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full bg-slate-50/50 rounded-[3.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-400 italic">
                <User className="w-16 h-16 mb-6 opacity-20" />
                <p>Select a verification request to view details and proof documents.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl relative z-10"
          >
            <h3 className="text-2xl font-black text-slate-900 mb-2">Reject Verification</h3>
            <p className="text-slate-500 font-medium mb-8">Please provide a reason for rejection. This will be shown to the user.</p>
            
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., ID proof is blurry, Roll number doesn't match records..."
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

function Detail({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black text-slate-900 tracking-tight">{value || 'N/A'}</p>
      </div>
    </div>
  );
}
