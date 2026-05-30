'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  fetchUsers,
  fetchColleges,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  fetchUserFullProfile
} from '@/lib/api';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Eye,
  X,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Briefcase,
  Loader2,
  ChevronDown,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Award,
  Zap,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [collegeFilter, setCollegeFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    name: '', email: '', role: 'STUDENT', collegeId: '', department: '', rollNumber: '', phoneNumber: '', company: '', passoutYear: ''
  });
  const [saving, setSaving] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [students, setStudents] = useState(0);
  const [alumni, setAlumni] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, collegesData] = await Promise.all([
        fetchUsers(),
        fetchColleges()
      ]);
      // Handle both paginated {users: [], total} and plain array responses
      const usersList = Array.isArray(usersData) ? usersData : (usersData?.users || []);
      setUsers(usersList);
      if (usersData && !Array.isArray(usersData)) {
        setTotalUsers(usersData.totalUsers || 0);
        setStudents(usersData.students || 0);
        setAlumni(usersData.alumni || 0);
      } else {
        setTotalUsers(usersList.length);
        setStudents(usersList.filter((u: any) => u.role === 'STUDENT').length);
        setAlumni(usersList.filter((u: any) => u.role === 'ALUMNI').length);
      }
      const collegesList = Array.isArray(collegesData) ? collegesData : (collegesData?.colleges || []);
      setColleges(collegesList);
    } catch (err) {
      console.error('Failed to load users/colleges:', err);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (id: number) => {
    if (confirm('Are you sure you want to change this user\'s access status?')) {
      await toggleUserStatus(id);
      loadData();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('CRITICAL: Are you sure you want to delete this user? This action cannot be undone.')) {
      await deleteUser(id);
      loadData();
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, formData);
      } else {
        await createUser(formData);
      }
      setShowAddModal(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', role: 'STUDENT', collegeId: '', department: '', rollNumber: '', phoneNumber: '', company: '', passoutYear: '' });
      loadData();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const openProfile = async (id: number) => {
    setLoading(true);
    const data = await fetchUserFullProfile(id);
    setSelectedUser(data);
    setShowProfileModal(true);
    setLoading(false);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesCollege = collegeFilter === 'ALL' || (u.collegeId && u.collegeId.toString() === collegeFilter);
    return matchesSearch && matchesRole && matchesCollege;
  });

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: <Users />, color: 'blue' },
    { label: 'Verified', value: users.filter(u => u.isVerified).length, icon: <ShieldCheck />, color: 'green' },
    { label: 'Students', value: students, icon: <GraduationCap />, color: 'purple' },
    { label: 'Alumni', value: alumni, icon: <Briefcase />, color: 'amber' },
  ];

  return (
    <DashboardLayout>
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Users Management</h1>
          <p className="text-slate-500 font-medium italic">Full administrative control over students, alumni, and institutional admins.</p>
        </div>
        <button
          onClick={() => { setSelectedUser(null); setShowAddModal(true); }}
          className="px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-sm flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200/50 group"
        >
          <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Add New User
        </button>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6"
          >
            <div className={`w-16 h-16 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls Section */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm mb-8 flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-[2rem] outline-none focus:ring-2 ring-indigo-500/20 border border-transparent focus:border-indigo-500 transition-all font-bold text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <select
            className="px-6 py-4 bg-slate-50 rounded-[2rem] font-bold text-slate-600 outline-none border border-transparent focus:border-indigo-500 transition-all cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="ALUMNI">Alumni</option>
            <option value="COLLEGE_ADMIN">College Admins</option>
            <option value="SUPER_ADMIN">Super Admins</option>
          </select>
          <select
            className="px-6 py-4 bg-slate-50 rounded-[2rem] font-bold text-slate-600 outline-none border border-transparent focus:border-indigo-500 transition-all cursor-pointer max-w-[200px]"
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
          >
            <option value="ALL">All Colleges</option>
            {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">User Details</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role & Institution</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-600 text-lg group-hover:scale-110 transition-transform shadow-sm">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name}</p>
                        <p className="text-xs text-slate-400 font-bold flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${user.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-600' :
                        user.role === 'COLLEGE_ADMIN' ? 'bg-amber-50 text-amber-600' :
                          user.role === 'ALUMNI' ? 'bg-purple-50 text-purple-600' :
                            'bg-indigo-50 text-indigo-600'
                        }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                      <p className="text-sm font-bold text-slate-600 mt-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-300" /> {user.college?.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-green-500' : 'bg-slate-300'} animate-pulse`}></div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openProfile(user.id)}
                        className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="View Profile"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => { setSelectedUser(user); setFormData({ ...user, ...user.student, ...user.alumni }); setShowAddModal(true); }}
                        className="p-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-all" title="Edit"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className="p-3 text-amber-600 hover:bg-amber-50 rounded-xl transition-all" title="Toggle Access"
                      >
                        {user.isVerified ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && !loading && (
            <div className="py-24 text-center">
              <Users className="w-16 h-16 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-bold italic">No users matching your criteria were found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedUser ? 'Edit User' : 'Add New User'}</h2>
                  <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest">Platform Administration</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-4 hover:bg-white rounded-full transition-colors shadow-sm">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="p-10 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleAddSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. John Doe"
                        className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                      <input
                        required
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">System Role</label>
                      <select
                        className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all appearance-none"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="ALUMNI">Alumni</option>
                        <option value="COLLEGE_ADMIN">College Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Assigned College</label>
                      <select
                        required
                        className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all appearance-none"
                        value={formData.collegeId}
                        onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                      >
                        <option value="">Select College</option>
                        {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {(formData.role === 'STUDENT' || formData.role === 'ALUMNI') && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Department</label>
                        <input
                          type="text"
                          placeholder="e.g. Computer Science"
                          className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{formData.role === 'STUDENT' ? 'Roll Number' : 'Current Company'}</label>
                        <input
                          type="text"
                          placeholder={formData.role === 'STUDENT' ? "Roll No" : "Company Name"}
                          className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all"
                          value={formData.role === 'STUDENT' ? formData.rollNumber : formData.company}
                          onChange={(e) => setFormData({ ...formData, [formData.role === 'STUDENT' ? 'rollNumber' : 'company']: e.target.value })}
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-6">
                    <button
                      disabled={saving}
                      type="submit"
                      className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                      {selectedUser ? 'Save Changes' : 'Create User Account'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile View Modal */}
      <AnimatePresence>
        {showProfileModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowProfileModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-4xl bg-white rounded-[4rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
            >
              {/* Profile Header */}
              <div className="relative h-64 bg-slate-900 flex items-end p-12">
                <div className="absolute top-0 right-0 p-10">
                  <button onClick={() => setShowProfileModal(false)} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-xl transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex items-center gap-8 relative z-10 translate-y-16">
                  <div className="w-40 h-40 bg-white rounded-[3rem] border-[8px] border-white shadow-2xl flex items-center justify-center text-6xl font-black text-slate-300">
                    {selectedUser.name[0]}
                  </div>
                  <div className="pb-4">
                    <h2 className="text-5xl font-black text-white tracking-tighter mb-2">{selectedUser.name}</h2>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-4 py-1.5 bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">{selectedUser.role}</span>
                      <span className="px-4 py-1.5 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">{selectedUser.college?.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="mt-24 p-12 overflow-y-auto custom-scrollbar grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 space-y-12">
                  <section>
                    <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                      <TrendingUp className="text-indigo-600" /> Platform Activity
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        { label: 'Referrals', val: selectedUser.student?.referrals?.length || selectedUser.alumni?.referrals?.length || 0, icon: <Zap /> },
                        { label: 'Webinars', val: selectedUser.student?.registrations?.length || selectedUser.alumni?.webinars?.length || 0, icon: <Video /> },
                        { label: 'Jobs', val: selectedUser.alumni?.jobs?.length || 0, icon: <Briefcase /> }
                      ].map((item, i) => (
                        <div key={i} className="bg-slate-50 p-6 rounded-[2rem] text-center group hover:bg-indigo-600 transition-all cursor-default">
                          <p className="text-3xl font-black text-slate-900 group-hover:text-white transition-colors">{item.val}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 group-hover:text-indigo-100 transition-colors">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                      <GraduationCap className="text-indigo-600" /> Academic & Professional
                    </h3>
                    <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 space-y-6">
                      <div className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Department</span>
                        <span className="font-black text-slate-900">{selectedUser.student?.department || selectedUser.alumni?.department || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Email</span>
                        <span className="font-black text-slate-900">{selectedUser.email}</span>
                      </div>
                      {selectedUser.alumni && (
                        <div className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Current Company</span>
                          <span className="font-black text-indigo-600">{selectedUser.alumni.company || 'Not Specified'}</span>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <div className="lg:col-span-5 space-y-8">
                  <div className="p-8 bg-slate-900 rounded-[3rem] text-white">
                    <h4 className="text-xl font-black mb-6 flex items-center gap-3"><Award className="text-amber-400" /> Skills & Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedUser.student?.skills || selectedUser.alumni?.skills || 'No skills listed').split(',').map((s: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold">{s.trim()}</span>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 bg-indigo-50 rounded-[3rem]">
                    <h4 className="text-xl font-black text-slate-900 mb-4">Placement Status</h4>
                    {selectedUser.student?.placements?.length > 0 ? (
                      <div className="space-y-4">
                        {selectedUser.student.placements.map((p: any, i: number) => (
                          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                            <p className="font-black text-slate-900">{p.company}</p>
                            <p className="text-xs text-indigo-600 font-bold">{p.role} • {p.salary}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 font-bold italic text-sm">No placement data recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </DashboardLayout>
  );
}
