'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  fetchDepartments, 
  fetchColleges, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment, 
  toggleDepartmentStatus 
} from '@/lib/api';
import { 
  Plus, Trash2, GraduationCap, Building2, 
  Search, Edit3, X, Save, 
  User, Mail, Phone, Briefcase, 
  ShieldCheck, Layout, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedDept, setSelectedDept] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    collegeId: '',
    hodName: '',
    hodEmail: '',
    phoneNumber: '',
    studentCapacity: 60,
    placementCoordinatorName: '',
    placementCoordinatorEmail: '',
    placementCoordinatorPhone: '',
    category: 'CSE',
    status: 'active'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptsData, collegesData] = await Promise.all([
        fetchDepartments(),
        fetchColleges()
      ]);
      setDepartments(Array.isArray(deptsData) ? deptsData : []);
      setColleges(Array.isArray(collegesData) ? collegesData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({
      name: '', code: '', collegeId: colleges[0]?.id || '',
      hodName: '', hodEmail: '', phoneNumber: '',
      studentCapacity: 60,
      placementCoordinatorName: '', placementCoordinatorEmail: '', placementCoordinatorPhone: '',
      category: 'CSE', status: 'active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (dept: any) => {
    setModalMode('edit');
    setSelectedDept(dept);
    setFormData({ ...dept });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await createDepartment(formData);
      } else {
        await updateDepartment(selectedDept.id, formData);
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save department');
    }
  };

  const handleToggleStatus = async (id: number) => {
    await toggleDepartmentStatus(id);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this department?')) {
      await deleteDepartment(id);
      loadData();
    }
  };

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.college?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Department Matrix</h1>
          <p className="text-slate-500 font-medium">Manage academic branches and their coordinators.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search departments..."
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Add Department
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Department</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Institution</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Leadership</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Matrix...</p>
                </td></tr>
              ) : filteredDepts.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm">
                        {dept.code}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm leading-tight">{dept.name}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">{dept.category} • {dept.studentCapacity} Capacity</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="w-4 h-4 text-slate-300" />
                      <span className="text-xs font-bold">{dept.college?.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-slate-300" />
                      <span className="text-xs font-bold">{dept.hodName || 'No HOD Assigned'}</span>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">{dept.hodEmail || 'N/A'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => handleToggleStatus(dept.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        dept.status === 'active' 
                        ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${dept.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {dept.status}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(dept)}
                        className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-100 shadow-sm transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(dept.id)}
                        className="p-2.5 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-100 shadow-sm transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredDepts.length === 0 && (
                <tr><td colSpan={5} className="px-8 py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layout className="w-8 h-8" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No departments found.</p>
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
                  {modalMode === 'add' ? 'Add New Department' : 'Update Department'}
                </h2>
                <p className="text-slate-500 font-medium text-sm">Configure academic and coordination details.</p>
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
                    <ShieldCheck className="w-4 h-4" /> Core Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Field label="Target Institution" icon={<Building2 />}>
                      <select 
                        required
                        className="field-input"
                        value={formData.collegeId}
                        onChange={(e) => setFormData({...formData, collegeId: e.target.value})}
                      >
                        <option value="">Select College</option>
                        {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Department Category" icon={<Layout />}>
                      <select 
                        className="field-input"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option>CSE</option><option>IT</option><option>ECE</option><option>EEE</option>
                        <option>Mechanical</option><option>Civil</option><option>MBA</option><option>Other</option>
                      </select>
                    </Field>
                    <Field label="Department Name">
                      <input 
                        type="text" required
                        className="field-input"
                        placeholder="Computer Science & Engineering"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </Field>
                    <Field label="Department Code">
                      <input 
                        type="text" required
                        className="field-input"
                        placeholder="CSE"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                      />
                    </Field>
                  </div>
                </section>

                {/* HOD Details */}
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-8 flex items-center gap-3">
                    <User className="w-4 h-4" /> Leadership (HOD)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Field label="HOD Name" icon={<User />}>
                      <input 
                        type="text"
                        className="field-input"
                        value={formData.hodName}
                        onChange={(e) => setFormData({...formData, hodName: e.target.value})}
                      />
                    </Field>
                    <Field label="HOD Email" icon={<Mail />}>
                      <input 
                        type="email"
                        className="field-input"
                        value={formData.hodEmail}
                        onChange={(e) => setFormData({...formData, hodEmail: e.target.value})}
                      />
                    </Field>
                    <Field label="Contact Phone" icon={<Phone />}>
                      <input 
                        type="text"
                        className="field-input"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      />
                    </Field>
                  </div>
                </section>

                {/* Placement Details */}
                <section className="bg-slate-900 p-10 rounded-[2.5rem] text-white">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                    <Briefcase className="w-4 h-4" /> Placement Coordination
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Field label="Coordinator Name" dark>
                      <input 
                        type="text"
                        className="field-input bg-slate-800 border-transparent text-white"
                        value={formData.placementCoordinatorName}
                        onChange={(e) => setFormData({...formData, placementCoordinatorName: e.target.value})}
                      />
                    </Field>
                    <Field label="Coordinator Email" dark>
                      <input 
                        type="email"
                        className="field-input bg-slate-800 border-transparent text-white"
                        value={formData.placementCoordinatorEmail}
                        onChange={(e) => setFormData({...formData, placementCoordinatorEmail: e.target.value})}
                      />
                    </Field>
                    <Field label="Coordinator Phone" dark>
                      <input 
                        type="text"
                        className="field-input bg-slate-800 border-transparent text-white"
                        value={formData.placementCoordinatorPhone}
                        onChange={(e) => setFormData({...formData, placementCoordinatorPhone: e.target.value})}
                      />
                    </Field>
                  </div>
                </section>

                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                  <Field label="Student Capacity">
                    <input 
                      type="number"
                      className="field-input w-32"
                      value={isNaN(formData.studentCapacity) ? '' : formData.studentCapacity}
                      onChange={(e) => setFormData({...formData, studentCapacity: parseInt(e.target.value) || 0})}
                    />
                  </Field>
                  <button 
                    type="submit"
                    className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-sm hover:bg-blue-700 hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95"
                  >
                    <Save className="w-5 h-5" /> {modalMode === 'add' ? 'Establish Department' : 'Update Configuration'}
                  </button>
                </div>
              </form>
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
