'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  fetchColleges, 
  createCollege, 
  deleteCollege, 
  toggleCollegeStatus,
  updateCollege 
} from '@/lib/api';
import { 
  Plus, Trash2, Building2, Globe, CheckCircle2, AlertCircle, 
  Search, Edit3, Eye, MoreVertical, X, Save, 
  MapPin, Phone, Mail, GraduationCap, Briefcase, 
  ShieldCheck, Layout, Image as ImageIcon, Key, RefreshCw, Hash
} from 'lucide-react';

export default function CollegesPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCollege, setSelectedCollege] = useState<any>(null);
  
  // Signup Codes Management
  const [showCodesModal, setShowCodesModal] = useState(false);
  const [signupCodes, setSignupCodes] = useState<any[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  
  const [formData, setFormData] = useState({
    // Basic Details
    name: '',
    collegeCode: '',
    institutionType: 'Engineering',
    universityName: '',
    isAutonomous: false,
    establishmentYear: '',
    
    // Location
    country: 'India',
    state: '',
    city: '',
    address: '',
    pincode: '',
    
    // Contact
    officialEmail: '',
    officialPhone: '',
    websiteUrl: '',
    
    // Academic
    departments: '',
    totalDepartments: 0,
    studentCapacity: 0,
    placementCellAvailable: true,
    
    // Admin Details (Only for Add)
    adminName: '',
    adminEmail: '',
    adminMobile: '',
    adminPassword: '',
    
    // Branding
    logo: '',
    banner: '',
    
    // Departments (Dynamic)
    departmentsData: [{ name: '', code: '' }],
    
    // Status
    status: 'active',
    studentLimit: 1000,
    alumniLimit: 1000
  });

  const loadColleges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchColleges();
      setColleges(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to load colleges right now.');
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColleges();
  }, []);

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({
      name: '', collegeCode: '', institutionType: 'Engineering', universityName: '', isAutonomous: false, establishmentYear: '',
      country: 'India', state: '', city: '', address: '', pincode: '',
      officialEmail: '', officialPhone: '', websiteUrl: '',
      departments: '', totalDepartments: 0, studentCapacity: 0, placementCellAvailable: true,
      adminName: '', adminEmail: '', adminMobile: '', adminPassword: '',
      logo: '', banner: '', status: 'active', studentLimit: 1000, alumniLimit: 1000,
      departmentsData: [{ name: '', code: '' }]
    });
    setShowModal(true);
  };

  const addDeptField = () => {
    setFormData({
      ...formData,
      departmentsData: [...formData.departmentsData, { name: '', code: '' }]
    });
  };

  const removeDeptField = (index: number) => {
    const newDepts = formData.departmentsData.filter((_, i) => i !== index);
    setFormData({ ...formData, departmentsData: newDepts });
  };

  const handleDeptChange = (index: number, field: string, value: string) => {
    const newDepts = [...formData.departmentsData];
    newDepts[index] = { ...newDepts[index], [field]: value };
    setFormData({ ...formData, departmentsData: newDepts });
  };

  const handleOpenEdit = (college: any) => {
    setModalMode('edit');
    setSelectedCollege(college);
    setFormData({
      ...college,
      // Ensure booleans are correct
      isAutonomous: college.isAutonomous === true,
      placementCellAvailable: college.placementCellAvailable === true,
      // Clear admin details as they aren't part of college update
      adminName: '', adminEmail: '', adminMobile: '', adminPassword: '',
      // Initialize departmentsData for editing
      departmentsData: Array.isArray(college.departmentsList) 
        ? college.departmentsList.map((d: any) => ({ name: d.name, code: d.code }))
        : [{ name: '', code: '' }]
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        const res = await createCollege(formData);
        if (res && res.error) {
          throw new Error(res.error);
        }
      } else {
        const res = await updateCollege(selectedCollege.id, formData);
        if (res && res.error) {
          throw new Error(res.error);
        }
      }
      setShowModal(false);
      loadColleges();
    } catch (err: any) {
      alert(err.message || 'Failed to save college');
    }
  };

  const handleToggleStatus = async (id: number) => {
    await toggleCollegeStatus(id);
    loadColleges();
  };

  const handleToggleInviteCode = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api'))}/admin/colleges/${id}/toggle-invite-code`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadColleges();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerateInviteCode = async (id: number) => {
    if (!confirm('Are you sure you want to regenerate the invite code? The old code will no longer work.')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api'))}/admin/colleges/${id}/regenerate-invite-code`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadColleges();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenManageCodes = async (college: any) => {
    setSelectedCollege(college);
    setShowCodesModal(true);
    setLoadingCodes(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api'))}/admin/signup-codes?collegeId=${college.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSignupCodes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCodes(false);
    }
  };

  const handleToggleCodeStatus = async (codeId: number, currentStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      await fetch(`${(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api'))}/admin/signup-codes/${codeId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      // Refresh codes
      handleOpenManageCodes(selectedCollege);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('CRITICAL: Are you sure you want to delete this institution? This will delete all associated data.')) return;
    try {
      await deleteCollege(id);
      loadColleges();
    } catch (err: any) {
      alert(err.message || 'Failed to delete institution');
    }
  };

  const filteredColleges = colleges.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.collegeCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Institutional Network</h1>
          <p className="text-slate-500 font-medium">Manage universities and colleges across the platform.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search institutions..."
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Add College
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Institution</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Location</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Info</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Access</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center">
                  <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Network...</p>
                </td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center">
                  <div className="text-red-600 text-center">
                    <p className="font-bold mb-2">Unable to load colleges right now.</p>
                    <p className="text-sm opacity-80 mb-4">{error}</p>
                    <button 
                      onClick={loadColleges} 
                      className="px-6 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-bold"
                    >
                      Try Again
                    </button>
                  </div>
                </td></tr>
              ) : filteredColleges.map((college) => (
                <tr key={college.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 overflow-hidden">
                        {college.logo ? (
                          <img src={college.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm leading-tight">{college.name}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Code: {college.collegeCode || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-300" />
                      <span className="text-xs font-bold">{college.city}, {college.state}</span>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">{college.country}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <GraduationCap className="w-4 h-4 text-slate-300" />
                      <span className="text-xs font-bold">{college.totalDepartments || 0} Departments</span>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">{college.studentCapacity || 0} Cap. • {college._count?.users || 0} Users</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl border flex flex-col ${college.inviteCodeStatus === 'ACTIVE' ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                         <div className="flex items-center gap-2 mb-1">
                            <Key className={`w-3 h-3 ${college.inviteCodeStatus === 'ACTIVE' ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className={`text-[10px] font-black tracking-widest ${college.inviteCodeStatus === 'ACTIVE' ? 'text-indigo-600' : 'text-slate-400'}`}>
                               {college.inviteCode || 'N/A'}
                            </span>
                         </div>
                         <span className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
                            Invite Code: {college.inviteCodeStatus}
                         </span>
                      </div>
                      <div className="flex flex-col gap-1">
                         <button 
                           onClick={() => handleOpenManageCodes(college)}
                           className="text-[9px] font-black uppercase text-indigo-600 hover:underline flex items-center gap-1"
                         >
                           <Key className="w-3 h-3" /> Manage Codes
                         </button>
                         <button 
                           onClick={() => handleRegenerateInviteCode(college.id)}
                           className="text-[9px] font-black uppercase text-slate-400 hover:text-slate-900"
                         >
                           Regenerate Legacy
                         </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => handleToggleStatus(college.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        college.status === 'active' 
                        ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${college.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {college.status}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(college)}
                        className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-100 shadow-sm transition-all"
                        title="Edit Institution"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(college.id)}
                        className="p-2.5 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-100 shadow-sm transition-all"
                        title="Delete Institution"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredColleges.length === 0 && (
                <tr><td colSpan={5} className="px-8 py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No institutions found matching search.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {modalMode === 'add' ? 'Register New Institution' : 'Update Institution Details'}
                </h2>
                <p className="text-slate-500 font-medium text-sm">Fill in the comprehensive details below.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10">
              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Basic Details */}
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-8 flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4" /> Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Field label="College Name" icon={<Building2 />}>
                      <input 
                        type="text" required
                        className="field-input"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </Field>
                    <Field label="College Code (Unique)" icon={<Hash />}>
                      <input 
                        type="text" required
                        className="field-input"
                        value={formData.collegeCode}
                        onChange={(e) => setFormData({...formData, collegeCode: e.target.value})}
                      />
                    </Field>
                    <Field label="Institution Type" icon={<Layout />}>
                      <select 
                        className="field-input"
                        value={formData.institutionType || ''}
                        onChange={(e) => setFormData({...formData, institutionType: e.target.value})}
                      >
                        <option value="">Select Type</option>
                        <option>Engineering</option>
                        <option>Arts</option>
                        <option>Medical</option>
                        <option>Polytechnic</option>
                        <option>Other</option>
                      </select>
                    </Field>
                    <Field label="University Name" icon={<GraduationCap />}>
                      <input 
                        type="text"
                        className="field-input"
                        value={formData.universityName}
                        onChange={(e) => setFormData({...formData, universityName: e.target.value})}
                      />
                    </Field>
                  </div>
                </section>

                {/* Location Details */}
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-8 flex items-center gap-3">
                    <MapPin className="w-4 h-4" /> Location Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Field label="City">
                      <input 
                        type="text" required
                        className="field-input"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </Field>
                    <Field label="State">
                      <input 
                        type="text" required
                        className="field-input"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                      />
                    </Field>
                    <Field label="Pincode">
                      <input 
                        type="text" required
                        className="field-input"
                        value={formData.pincode}
                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      />
                    </Field>
                  </div>
                  <div className="mt-8">
                    <Field label="Full Address">
                      <textarea 
                        className="field-input min-h-[80px]"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </Field>
                  </div>
                </section>

                {/* Contact Details */}
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-8 flex items-center gap-3">
                    <Phone className="w-4 h-4" /> Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Field label="Official Email" icon={<Mail />}>
                      <input 
                        type="email" required
                        className="field-input"
                        value={formData.officialEmail}
                        onChange={(e) => setFormData({...formData, officialEmail: e.target.value})}
                      />
                    </Field>
                    <Field label="Official Phone" icon={<Phone />}>
                      <input 
                        type="text" required
                        className="field-input"
                        value={formData.officialPhone}
                        onChange={(e) => setFormData({...formData, officialPhone: e.target.value})}
                      />
                    </Field>
                    <Field label="Website URL" icon={<Globe />}>
                      <input 
                        type="text"
                        className="field-input"
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                      />
                    </Field>
                  </div>
                </section>

                {/* Academic & Admin (Only for Add) */}
                {modalMode === 'add' && (
                  <section className="bg-slate-900 p-10 rounded-[2rem] text-white">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4" /> Initial Administrator Setup
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Field label="Admin Name" dark>
                        <input 
                          type="text" required
                          className="field-input bg-slate-800 border-transparent text-white"
                          value={formData.adminName}
                          onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                        />
                      </Field>
                      <Field label="Admin Email" dark>
                        <input 
                          type="email" required
                          className="field-input bg-slate-800 border-transparent text-white"
                          value={formData.adminEmail}
                          onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                        />
                      </Field>
                      <Field label="Mobile Number" dark>
                        <input 
                          type="text" required
                          className="field-input bg-slate-800 border-transparent text-white"
                          value={formData.adminMobile}
                          onChange={(e) => setFormData({...formData, adminMobile: e.target.value})}
                        />
                      </Field>
                      <Field label="Temporary Password" dark>
                        <input 
                          type="password" required
                          className="field-input bg-slate-800 border-transparent text-white"
                          value={formData.adminPassword}
                          onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                        />
                      </Field>
                    </div>
                  </section>
                )}

                {/* Academic Details */}
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-8 flex items-center gap-3">
                    <Briefcase className="w-4 h-4" /> Academic Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <Field label="Student Capacity">
                      <input 
                        type="number" required
                        className="field-input"
                        value={isNaN(formData.studentCapacity) ? '' : formData.studentCapacity}
                        onChange={(e) => setFormData({...formData, studentCapacity: parseInt(e.target.value) || 0})}
                      />
                    </Field>
                    <Field label="Placement Cell">
                      <select 
                        className="field-input"
                        value={formData.placementCellAvailable === true ? 'true' : 'false'}
                        onChange={(e) => setFormData({...formData, placementCellAvailable: e.target.value === 'true'})}
                      >
                        <option value="true">Available</option>
                        <option value="false">Not Available</option>
                      </select>
                    </Field>
                  </div>

                  <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200/50">
                    <div className="flex justify-between items-center mb-8">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Institutional Departments</h4>
                      <button 
                        type="button"
                        onClick={addDeptField}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-3 h-3" /> Add Department
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {(formData.departmentsData || []).map((dept, index) => (
                        <div key={index} className="flex gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1 block">Dept Name</label>
                            <input 
                              type="text" required
                              className="field-input py-3"
                              placeholder="e.g. Computer Science"
                              value={dept.name}
                              onChange={(e) => handleDeptChange(index, 'name', e.target.value)}
                            />
                          </div>
                          <div className="w-32">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1 block">Code</label>
                            <input 
                              type="text" required
                              className="field-input py-3"
                              placeholder="CSE"
                              value={dept.code}
                              onChange={(e) => handleDeptChange(index, 'code', e.target.value)}
                            />
                          </div>
                          {formData.departmentsData.length > 1 && (
                            <button 
                              type="button"
                              onClick={() => removeDeptField(index)}
                              className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="autonomous" 
                        className="w-5 h-5 accent-slate-900"
                        checked={formData.isAutonomous}
                        onChange={(e) => setFormData({...formData, isAutonomous: e.target.checked})}
                      />
                      <label htmlFor="autonomous" className="text-xs font-bold text-slate-700 select-none cursor-pointer">Autonomous Institution</label>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-sm hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95"
                  >
                    <Save className="w-5 h-5" /> {modalMode === 'add' ? 'Complete Registration' : 'Update Institution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Signup Codes Modal */}
      {showCodesModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <ShieldCheck className="text-indigo-600 w-7 h-7" /> Invite Codes: {selectedCollege?.name}
                </h2>
                <p className="text-slate-500 font-medium text-sm mt-1">Manage institutional access and department-specific codes.</p>
              </div>
              <button onClick={() => setShowCodesModal(false)} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
              {loadingCodes ? (
                <div className="py-20 text-center">
                   <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Secure Codes...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {signupCodes.map((code) => (
                    <div key={code.id} className={`p-6 rounded-[2rem] border-2 transition-all ${code.status === 'ACTIVE' ? 'bg-white border-slate-100 shadow-sm hover:border-indigo-200' : 'bg-slate-100 border-transparent opacity-60'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${code.role === 'STUDENT' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                          {code.role}
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${code.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{code.status}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center justify-between group">
                          <p className="text-lg font-black text-slate-900 tracking-wider font-mono">{code.code}</p>
                          <button 
                            onClick={() => {
                               navigator.clipboard.writeText(code.code);
                               alert('Code copied to clipboard!');
                            }}
                            className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                          >
                             <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                          {code.departmentName ? `Department: ${code.departmentName}` : 'General Institutional Access'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Usage</p>
                          <p className="text-sm font-black text-slate-900">{code.usedCount} / {code.usageLimit || '∞'}</p>
                        </div>
                        <div className="text-right">
                          <button 
                            onClick={() => handleToggleCodeStatus(code.id, code.status)}
                            className={`text-xs font-black uppercase tracking-widest transition-colors ${code.status === 'ACTIVE' ? 'text-red-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'}`}
                          >
                            {code.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {signupCodes.length === 0 && (
                    <div className="col-span-2 py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No invite codes generated for this college yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-8 border-t border-slate-100 bg-white flex justify-end">
               <button 
                 onClick={() => setShowCodesModal(false)}
                 className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100"
               >
                 Close Manager
               </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .field-input {
          width: 100%;
          padding: 1rem 1.25rem;
          background: #f8fafc;
          border-radius: 1.25rem;
          border: 2px solid transparent;
          font-weight: 700;
          font-size: 0.875rem;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
        }
        .field-input:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 10px 15px -3px rgb(59 130 246 / 0.1);
        }
      `}</style>
    </DashboardLayout>
  );
}

function Field({ label, children, icon, dark = false }: any) {
  return (
    <div className="flex flex-col gap-3">
      <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
            {React.cloneElement(icon, { size: 16 })}
          </div>
        )}
        <div className={icon ? 'pl-2' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
}

function HashIcon() {
  return <span className="font-bold">#</span>;
}
