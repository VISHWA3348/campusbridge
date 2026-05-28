'use client';
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, Trash2, Edit2, 
  CheckCircle, XCircle, Clock, Users, Copy, Check, 
  QrCode, Download, Loader2, AlertCircle, Building2,
  GraduationCap, Calendar, Hash, ShieldCheck
} from 'lucide-react';

export default function SignupCodesPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    collegeId: '',
    departmentName: '',
    batch: '',
    role: 'STUDENT',
    usageLimit: 1,
    expiryDate: '',
    count: 1,
    prefix: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [codesRes, collegesRes] = await Promise.all([
        fetch((process.env.NEXT_PUBLIC_API_URL ? (process.env.NEXT_PUBLIC_API_URL.endsWith('/api') ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL + '/api') : 'https://campusbridge-e4cv.onrender.com/api') + '/admin/signup-codes', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch((process.env.NEXT_PUBLIC_API_URL ? (process.env.NEXT_PUBLIC_API_URL.endsWith('/api') ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL + '/api') : 'https://campusbridge-e4cv.onrender.com/api') + '/auth/colleges')
      ]);
      const codesData = await codesRes.json();
      const collegesData = await collegesRes.json();
      setCodes(Array.isArray(codesData) ? codesData : []);
      setColleges(collegesData);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL ? (process.env.NEXT_PUBLIC_API_URL.endsWith('/api') ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL + '/api') : 'https://campusbridge-e4cv.onrender.com/api') + '/admin/signup-codes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
        setFormData({
          collegeId: '', departmentName: '', batch: '',
          role: 'STUDENT', usageLimit: 1, expiryDate: '',
          count: 1, prefix: ''
        });
      }
    } catch (err) {
      console.error('Failed to create code', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this code?')) return;
    try {
      await fetch(`${(process.env.NEXT_PUBLIC_API_URL ? (process.env.NEXT_PUBLIC_API_URL.endsWith('/api') ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL + '/api') : 'https://campusbridge-e4cv.onrender.com/api')}/admin/signup-codes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err) {
      console.error('Failed to delete code', err);
    }
  };

  const toggleStatus = async (code: any) => {
    const newStatus = code.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await fetch(`${(process.env.NEXT_PUBLIC_API_URL ? (process.env.NEXT_PUBLIC_API_URL.endsWith('/api') ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL + '/api') : 'https://campusbridge-e4cv.onrender.com/api')}/admin/signup-codes/${code.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCodes = codes.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.college.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">SIGNUP ACCESS CODES</h1>
          <p className="text-slate-500 font-medium">Manage secure invite codes for multi-college onboarding.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-6 h-6" /> Generate Codes
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<ShieldCheck className="text-emerald-600" />} label="Active Codes" value={codes.filter(c => c.status === 'ACTIVE').length} color="bg-emerald-50" />
        <StatCard icon={<Users className="text-blue-600" />} label="Total Uses" value={codes.reduce((acc, c) => acc + c.usedCount, 0)} color="bg-blue-50" />
        <StatCard icon={<AlertCircle className="text-amber-600" />} label="Limited Reach" value={codes.filter(c => c.usageLimit && c.usedCount >= c.usageLimit).length} color="bg-amber-50" />
        <StatCard icon={<Clock className="text-purple-600" />} label="Expired" value={codes.filter(c => c.expiryDate && new Date(c.expiryDate) < new Date()).length} color="bg-purple-50" />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by code or college..." 
            className="w-full pl-16 pr-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-colors">
            <Filter className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Code Details</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Target</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Usage</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-600 mb-4" />
                  <p className="font-bold text-slate-400">Loading secure codes...</p>
                </td>
              </tr>
            ) : filteredCodes.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center text-slate-400 font-bold">No invite codes found.</td>
              </tr>
            ) : (
              filteredCodes.map((code) => (
                <tr key={code.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl font-mono font-black text-sm">
                        {code.code}
                      </div>
                      <button 
                        onClick={() => copyToClipboard(code.code, code.id)}
                        className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                      >
                        {copiedId === code.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Created: {new Date(code.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                        <Building2 className="w-4 h-4 text-slate-300" /> {code.college.name}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                        <GraduationCap className="w-4 h-4 text-slate-300" /> {code.departmentName || 'All Depts'} • {code.batch || 'Any Batch'}
                      </div>
                      <div className="mt-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-tighter">
                          {code.role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-[100px]">
                        <div 
                          className={`h-full ${code.usedCount >= code.usageLimit ? 'bg-amber-500' : 'bg-indigo-500'} transition-all`}
                          style={{ width: `${Math.min((code.usedCount / code.usageLimit) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-black text-slate-600">
                        {code.usedCount} / {code.usageLimit} USED
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={code.status} expiryDate={code.expiryDate} usedCount={code.usedCount} limit={code.usageLimit} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleStatus(code)}
                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl hover:shadow-md transition-all"
                        title={code.status === 'ACTIVE' ? 'Disable Code' : 'Enable Code'}
                      >
                        {code.status === 'ACTIVE' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => { setSelectedCode(code); setShowQrModal(true); }}
                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 rounded-xl hover:shadow-md transition-all"
                        title="View QR Code"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(code.id)}
                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-600 rounded-xl hover:shadow-md transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1 uppercase">Generate Access Codes</h2>
                <p className="text-slate-500 font-medium italic">Create secure tokens for student/alumni onboarding.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-colors">
                <XCircle className="w-8 h-8" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-4">College</label>
                  <select 
                    required
                    className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm appearance-none"
                    value={formData.collegeId}
                    onChange={(e) => setFormData({...formData, collegeId: e.target.value})}
                  >
                    <option value="">Select College</option>
                    {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-4">Role</label>
                  <select 
                    required
                    className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm appearance-none"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="ALUMNI">Alumni</option>
                    <option value="STAFF">Staff</option>
                    <option value="HOD">HOD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-4">Department (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CSE"
                    className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.departmentName}
                    onChange={(e) => setFormData({...formData, departmentName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-4">Batch / Year (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2026"
                    className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.batch}
                    onChange={(e) => setFormData({...formData, batch: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-4">Usage Limit</label>
                  <input 
                    type="number" 
                    required min="1"
                    className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-4">Expiry Date (Optional)</label>
                  <input 
                    type="date" 
                    className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-4">Number of Codes</label>
                  <input 
                    type="number" 
                    required min="1" max="500"
                    className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.count}
                    onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-4">Code Prefix (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ABC"
                    className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={formData.prefix}
                    onChange={(e) => setFormData({...formData, prefix: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><ShieldCheck className="w-6 h-6" /> Generate Secure Codes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && selectedCode && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden p-10 text-center animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">QR Signup Link</h2>
            <p className="text-slate-500 text-sm font-medium mb-8 italic">Students can scan this to open the signup page with the code auto-filled.</p>
            
            <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 mb-8 inline-block mx-auto">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://campusbridge.zinoingroup.in')}/signup/${selectedCode.role.toLowerCase()}?code=${selectedCode.code}`)}`} 
                alt="QR Code" 
                className="w-48 h-48 mx-auto"
              />
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-2xl mb-8">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Signup URL</p>
              <p className="text-xs font-bold text-indigo-700 break-all">
                {`${(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://campusbridge.zinoingroup.in')}/signup/${selectedCode.role.toLowerCase()}?code=${selectedCode.code}`}
              </p>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowQrModal(false)}
                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-100"
              >
                Close
              </button>
              <a 
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://campusbridge.zinoingroup.in')}/signup/${selectedCode.role.toLowerCase()}?code=${selectedCode.code}`)}`}
                download={`QR_${selectedCode.code}.png`}
                target="_blank"
                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Save
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] ${color} border border-white/50 flex flex-col gap-4`}>
      <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status, expiryDate, usedCount, limit }: any) {
  const isExpired = expiryDate && new Date(expiryDate) < new Date();
  const isLimitReached = limit && usedCount >= limit;

  if (status !== 'ACTIVE') return <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase">Disabled</span>;
  if (isExpired) return <span className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase">Expired</span>;
  if (isLimitReached) return <span className="px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase">Maxed Out</span>;
  
  return <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">Active</span>;
}
