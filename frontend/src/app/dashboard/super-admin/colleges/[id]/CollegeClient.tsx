'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchCollegeById } from '@/lib/api';
import {
  ArrowLeft, Building2, Globe, MapPin, Phone, Mail,
  GraduationCap, Users, Briefcase, Calendar,
  ShieldCheck, Layout, ExternalLink, Activity
} from 'lucide-react';

export default function CollegeClient() {
  const { id } = useParams();
  const router = useRouter();
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCollegeById(parseInt(id as string));
        setCollege(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Analyzing Institution...</p>
      </div>
    </DashboardLayout>
  );

  if (!college) return (
    <DashboardLayout>
      <div className="text-center py-20">
        <h1 className="text-2xl font-black text-slate-900 mb-4">Institution Not Found</h1>
        <button onClick={() => router.back()} className="text-blue-600 font-bold flex items-center gap-2 mx-auto">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900 group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex gap-3">
          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${college.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
            {college.status}
          </span>
        </div>
      </div>

      <div className="relative mb-12">
        <div className="h-64 w-full bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200">
          {college.banner ? (
            <img src={college.banner} alt="Banner" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-20 h-20 text-slate-800" />
            </div>
          )}
        </div>
        <div className="absolute -bottom-10 left-12 flex items-end gap-6">
          <div className="w-32 h-32 bg-white rounded-[2rem] p-1 shadow-2xl border-4 border-white overflow-hidden">
            <div className="w-full h-full bg-slate-50 rounded-[1.75rem] flex items-center justify-center overflow-hidden">
              {college.logo ? (
                <img src={college.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-slate-200" />
              )}
            </div>
          </div>
          <div className="pb-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{college.name}</h1>
            <p className="text-slate-500 font-bold flex items-center gap-2 mt-1 uppercase tracking-widest text-[10px]">
              <Globe className="w-3 h-3" /> {college.collegeCode} • {college.institutionType}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Left Column: Stats & Meta */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard icon={<Users />} label="Total Users" value={college._count?.users || 0} color="blue" />
            <StatCard icon={<GraduationCap />} label="Students" value={college.stats?.studentsCount || 0} color="purple" />
            <StatCard icon={<Briefcase />} label="Alumni" value={college.stats?.alumniCount || 0} color="orange" />
            <StatCard icon={<Activity />} label="Departments" value={college.totalDepartments || 0} color="green" />
          </div>

          {/* Details Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600" /> Institutional Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <InfoItem label="University" value={college.universityName || 'Private'} icon={<GraduationCap />} />
              <InfoItem label="Establishment" value={college.establishmentYear || 'N/A'} icon={<Calendar />} />
              <InfoItem label="Type" value={college.isAutonomous ? 'Autonomous' : 'Affiliated'} icon={<Layout />} />
              <InfoItem label="Placement Cell" value={college.placementCellAvailable ? 'Active' : 'Not Established'} icon={<ShieldCheck />} />
            </div>

            <div className="mt-12 pt-12 border-t border-slate-50">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Location & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{college.address || 'Address not provided'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{college.city}, {college.state} - {college.pincode}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <ContactLink icon={<Globe />} label="Website" value={college.websiteUrl} link={college.websiteUrl} />
                  <ContactLink icon={<Mail />} label="Email" value={college.officialEmail} link={`mailto:${college.officialEmail}`} />
                  <ContactLink icon={<Phone />} label="Phone" value={college.officialPhone} />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Info */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200">
            <h2 className="text-xl font-black mb-8 flex items-center gap-3">
              <Users className="w-6 h-6 text-slate-400" /> Administrative Access
            </h2>
            <div className="space-y-6">
              {college.users?.map((admin: any) => (
                <div key={admin.id} className="flex items-center justify-between p-6 bg-slate-800 rounded-3xl border border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                      {admin.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-sm">{admin.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{admin.email}</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all">
                    Reset Password
                  </button>
                </div>
              ))}
              {(!college.users || college.users.length === 0) && (
                <p className="text-slate-500 font-bold text-center py-4">No active administrators found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Limits & Status */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-8">System Limits</h2>
            <div className="space-y-8">
              <LimitBar label="Student Limit" current={college.stats?.studentsCount || 0} max={college.studentLimit || 1000} color="blue" />
              <LimitBar label="Alumni Limit" current={college.stats?.alumniCount || 0} max={college.alumniLimit || 1000} color="purple" />
              <LimitBar label="Student Capacity" current={0} max={college.studentCapacity || 0} color="green" />
            </div>
          </div>

          <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-blue-100">
            <h2 className="text-lg font-black mb-4">Subscription Plan</h2>
            <div className="bg-white/10 rounded-2xl p-6 mb-8">
              <p className="text-xs font-bold text-blue-200 uppercase tracking-[0.2em] mb-2">Current Tier</p>
              <p className="text-2xl font-black uppercase tracking-tight">Enterprise</p>
            </div>
            <button className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all shadow-lg shadow-blue-700/20">
              Update Subscription
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600'
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
      <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center mb-4`}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function InfoItem({ label, value, icon }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function ContactLink({ icon, label, value, link }: any) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="text-slate-300 group-hover:text-blue-500 transition-colors">{React.cloneElement(icon, { size: 14 })}</div>
        <span className="text-xs font-bold text-slate-600">{value}</span>
      </div>
      {link && (
        <a href={link} target="_blank" className="text-blue-600 p-1.5 bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

function LimitBar({ label, current, max, color }: any) {
  const colors: any = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600'
  };
  const percentage = Math.min((current / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-xs font-black text-slate-900">{current} / {max}</p>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
