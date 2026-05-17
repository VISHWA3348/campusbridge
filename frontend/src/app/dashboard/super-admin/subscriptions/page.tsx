'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  fetchSubscriptions, 
  fetchSubscriptionAnalytics, 
  fetchPlans, 
  createPlan, 
  updatePlan, 
  deletePlan,
  updateCollegeSubscription 
} from '@/lib/api';
import { 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Edit3, 
  Trash2, 
  Building2, 
  Clock, 
  ArrowUpRight, 
  Package, 
  Zap, 
  ShieldCheck, 
  DollarSign, 
  PieChart, 
  Users,
  Loader2,
  X,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planFormData, setPlanFormData] = useState({ name: '', price: 0, features: '', limits: '', status: 'active' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subsData, analyticsData, plansData] = await Promise.all([
        fetchSubscriptions(),
        fetchSubscriptionAnalytics(),
        fetchPlans()
      ]);
      setSubscriptions(Array.isArray(subsData) ? subsData : []);
      setAnalytics(analyticsData);
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selectedPlan) {
        await updatePlan(selectedPlan.id, planFormData);
      } else {
        await createPlan(planFormData);
      }
      setShowPlanModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleDeletePlan = async (id: number) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      await deletePlan(id);
      loadData();
    }
  };

  const handleUpdateSub = async (id: number, status: string) => {
    if (confirm(`Change subscription status to ${status}?`)) {
      await updateCollegeSubscription(id, { status });
      loadData();
    }
  };

  const stats = [
    { label: 'Total Revenue', value: `$${analytics?.totalRevenue || 0}`, icon: <DollarSign />, color: 'green', trend: '+12% this month' },
    { label: 'Active Subs', value: analytics?.activeSubscriptions || 0, icon: <ShieldCheck />, color: 'blue', trend: 'Growing ecosystem' },
    { label: 'Expired Plans', value: analytics?.expiredPlans || 0, icon: <AlertCircle />, color: 'amber', trend: 'Needs attention' },
    { label: 'Popular Plan', value: analytics?.mostPopularPlan || 'N/A', icon: <Package />, color: 'purple', trend: 'Top choice' },
  ];

  return (
    <DashboardLayout>
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Revenue & Subscriptions</h1>
          <p className="text-slate-500 font-medium italic">Monitor institutional billing, plan lifecycle, and platform revenue.</p>
        </div>
        <button 
          onClick={() => { setSelectedPlan(null); setPlanFormData({ name: '', price: 0, features: '', limits: '', status: 'active' }); setShowPlanModal(true); }}
          className="px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-sm flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200/50 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Create New Plan
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
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between h-full"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center text-xl`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{stat.value}</p>
              <p className={`text-[10px] font-bold ${stat.color === 'amber' ? 'text-amber-500' : 'text-slate-400'} uppercase tracking-tight`}>{stat.trend}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Plans Management */}
        <div className="lg:col-span-12 space-y-8">
           <div className="flex justify-between items-center px-4">
              <h3 className="font-black text-2xl text-slate-900 tracking-tight flex items-center gap-3">
                 <Package className="text-indigo-600" /> Subscription Tiers
              </h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, i) => (
                <motion.div 
                  key={plan.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative group hover:shadow-2xl transition-all border-b-8 border-b-indigo-500/10 hover:border-b-indigo-500"
                >
                   <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setSelectedPlan(plan); setPlanFormData({ ...plan }); setShowPlanModal(true); }} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeletePlan(plan.id)} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                   <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">{plan.name}</h4>
                   <div className="flex items-end gap-1 mb-8">
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">${plan.price}</span>
                      <span className="text-slate-400 font-bold text-sm pb-1">/ year</span>
                   </div>
                   <div className="space-y-4 mb-8">
                      {plan.features?.split(',').map((feat: string, j: number) => (
                        <div key={j} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                           <CheckCircle2 className="w-4 h-4 text-green-500" /> {feat.trim()}
                        </div>
                      ))}
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Limits</p>
                      <p className="text-xs font-bold text-slate-700 italic">{plan.limits || 'No strict limits defined'}</p>
                   </div>
                </motion.div>
              ))}
              {plans.length === 0 && (
                <div className="col-span-3 py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                   <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold italic">No active plans found. Create your first tier to begin.</p>
                </div>
              )}
           </div>
        </div>

        {/* College Subscriptions Table */}
        <div className="lg:col-span-12 space-y-8">
           <div className="flex justify-between items-center px-4">
              <h3 className="font-black text-2xl text-slate-900 tracking-tight flex items-center gap-3">
                 <Building2 className="text-indigo-600" /> College Enrollments
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Billing Data</span>
           </div>
           <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-50">
                       <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">College</th>
                       <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Plan</th>
                       <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Students</th>
                       <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Expiry Date</th>
                       <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                       <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-24 text-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" /></td>
                      </tr>
                    ) : subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:text-indigo-600 transition-colors">
                                 {sub.college.name[0]}
                              </div>
                              <div>
                                 <p className="font-black text-slate-900">{sub.college.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {sub.college.collegeCode}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                              {sub.plan}
                           </span>
                        </td>
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-slate-300" />
                              <span className="font-bold text-slate-600">{sub.college._count.users} Users</span>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-300" />
                              <span className={`font-bold text-sm ${new Date(sub.endDate) < new Date() ? 'text-red-500' : 'text-slate-600'}`}>
                                 {new Date(sub.endDate).toLocaleDateString()}
                              </span>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                 sub.status === 'active' ? 'bg-green-500' :
                                 sub.status === 'expired' ? 'bg-red-500' :
                                 'bg-amber-500'
                              } animate-pulse`}></div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">{sub.status}</span>
                           </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleUpdateSub(sub.id, 'active')} className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Activate">
                                 <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleUpdateSub(sub.id, 'expired')} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Expire Manually">
                                 <Zap className="w-5 h-5" />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
              {subscriptions.length === 0 && !loading && (
                <div className="py-24 text-center">
                   <CreditCard className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold italic">No institutional subscriptions found.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Plan Management Modal */}
      <AnimatePresence>
        {showPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowPlanModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedPlan ? 'Edit Tier' : 'New Tier'}</h2>
                <button onClick={() => setShowPlanModal(false)} className="p-4 hover:bg-white rounded-full transition-colors shadow-sm">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="p-10">
                <form onSubmit={handlePlanSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Plan Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Pro, Premium"
                      className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all"
                      value={planFormData.name}
                      onChange={(e) => setPlanFormData({...planFormData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Price ($)</label>
                      <input 
                        required
                        type="number" 
                        className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all"
                        value={isNaN(planFormData.price) ? '' : planFormData.price}
                        onChange={(e) => setPlanFormData({...planFormData, price: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Status</label>
                      <select 
                        className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all appearance-none"
                        value={planFormData.status}
                        onChange={(e) => setPlanFormData({...planFormData, status: e.target.value})}
                      >
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Features (Comma separated)</label>
                    <textarea 
                      placeholder="e.g. Unlimited Referrals, AI Mentorship, Career Tracker"
                      className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all h-32"
                      value={planFormData.features}
                      onChange={(e) => setPlanFormData({...planFormData, features: e.target.value})}
                    />
                  </div>
                  <button 
                    disabled={saving}
                    type="submit"
                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" /> : <Target className="w-6 h-6" />}
                    {selectedPlan ? 'Update Plan' : 'Deploy Tier'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
