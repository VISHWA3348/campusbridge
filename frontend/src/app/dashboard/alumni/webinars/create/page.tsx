'use client';

import React, { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Video, 
  ArrowLeft, 
  Save, 
  Building2, 
  MapPin, 
  Clock, 
  AlignLeft, 
  Link as LinkIcon, 
  Calendar,
  Sparkles,
  Loader2,
  User,
  Monitor,
  Hash,
  Image as ImageIcon
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CreateWebinarPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speakerName: '',
    companyName: '',
    date: '',
    time: '',
    duration: '',
    type: 'ONLINE',
    location: '',
    posterImage: '',
    domain: 'AI'
  });

  useEffect(() => {
    if (editId) fetchWebinarDetails();
  }, [editId]);

  const fetchWebinarDetails = async () => {
    setFetching(true);
    try {
      const res = await fetch(`http://localhost:5000/api/webinars/alumni`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const webinars = await res.json();
      const webinar = webinars.find((w: any) => w.id === parseInt(editId as string));
      if (webinar) {
        const dt = new Date(webinar.date);
        setFormData({
          title: webinar.title || '',
          description: webinar.description || '',
          speakerName: webinar.speakerName || '',
          companyName: webinar.companyName || '',
          date: dt.toISOString().split('T')[0],
          time: dt.toTimeString().split(' ')[0].substring(0, 5),
          duration: webinar.duration || '',
          type: webinar.type || 'ONLINE',
          location: webinar.location || '',
          posterImage: webinar.posterImage || '',
          domain: webinar.domain || 'AI'
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fullDate = new Date(`${formData.date}T${formData.time}`);

    try {
      const url = editId 
        ? `http://localhost:5000/api/webinars/${editId}` 
        : 'http://localhost:5000/api/webinars';
      
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...formData, date: fullDate })
      });

      if (res.ok) {
        router.push('/dashboard/alumni/webinars');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save webinar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <Link 
          href="/dashboard/alumni/webinars" 
          className="inline-flex items-center gap-2 text-slate-500 font-black uppercase tracking-widest text-[10px] mb-8 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to My Sessions
        </Link>

        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="relative z-10 mb-12">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              {editId ? 'Edit Webinar' : 'Schedule a Webinar'}
            </h1>
            <p className="text-slate-500 font-medium">Create an impactful session for the student community.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <Video className="w-3 h-3" /> Webinar Title
              </label>
              <input 
                type="text" required
                placeholder="Mastering Full-Stack Development in 2024"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <User className="w-3 h-3" /> Speaker Name
                </label>
                <input 
                  type="text" required
                  placeholder="Your Name / Guest Speaker"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  value={formData.speakerName}
                  onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> Host Company
                </label>
                <input 
                  type="text" required
                  placeholder="Google / Amazon / etc."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Session Description
              </label>
              <textarea 
                required
                rows={4}
                placeholder="What will students learn in this session?"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Date
                </label>
                <input 
                  type="date" required
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Start Time
                </label>
                <input 
                  type="time" required
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Duration
                </label>
                <input 
                  type="text" required
                  placeholder="e.g. 1.5 Hours"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Monitor className="w-3 h-3" /> Session Type
                </label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm appearance-none cursor-pointer"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="ONLINE">Online / Virtual</option>
                  <option value="OFFLINE">In-Person / Offline</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  {formData.type === 'ONLINE' ? <LinkIcon className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                  {formData.type === 'ONLINE' ? 'Meeting Link' : 'Physical Location'}
                </label>
                <input 
                  type="text" required
                  placeholder={formData.type === 'ONLINE' ? "https://zoom.us/j/..." : "Main Auditorium, Block B"}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Domain / Topic
                </label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm appearance-none cursor-pointer"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                >
                  <option value="AI">Artificial Intelligence</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Placement Training">Placement Training</option>
                  <option value="Career Guidance">Career Guidance</option>
                  <option value="Entrepreneurship">Entrepreneurship</option>
                  <option value="Soft Skills">Soft Skills</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Poster URL (Optional)
                </label>
                <input 
                  type="text"
                  placeholder="https://imgur.com/poster.jpg"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  value={formData.posterImage}
                  onChange={(e) => setFormData({ ...formData, posterImage: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" /> {editId ? 'Updating...' : 'Scheduling...'}
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" /> {editId ? 'Update Session' : 'Go Live Now'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function CreateWebinarPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    }>
      <CreateWebinarPageContent />
    </Suspense>
  );
}
