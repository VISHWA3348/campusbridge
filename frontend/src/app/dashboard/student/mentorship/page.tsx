'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  searchAlumni, 
  fetchAlumniSlots, 
  requestMentorship, 
  fetchStudentMentorshipRequests,
  submitMentorshipFeedback,
  getFileUrl
} from '@/lib/api';
import { 
  Users, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Search, 
  CheckCircle2, 
  ChevronRight,
  UserCheck,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Target,
  TrendingUp,
  Star,
  Video,
  ExternalLink,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function MentorshipPage() {
  const [alumni, setAlumni] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('browse'); // browse, my-requests
  const [bookingData, setBookingData] = useState({
    message: '',
    sessionType: 'Career Guidance',
    scheduledAt: '',
    notes: ''
  });
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [alumniData, reqsData] = await Promise.all([
        searchAlumni(searchTerm),
        fetchStudentMentorshipRequests()
      ]);
      setAlumni(Array.isArray(alumniData) ? alumniData : []);
      setMyRequests(Array.isArray(reqsData) ? reqsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = async (person: any) => {
    setSelectedAlumni(person);
    setShowModal(true);
    setLoadingSlots(true);
    setSuccess(false);
    try {
      const data = await fetchAlumniSlots(person.id);
      setSlots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!bookingData.scheduledAt) return alert("Please select a slot");
    setBooking(true);
    try {
      await requestMentorship({
        alumniId: selectedAlumni.id,
        ...bookingData
      });
      setSuccess(true);
      loadData();
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      alert("Booking failed");
    } finally {
      setBooking(false);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      await submitMentorshipFeedback(feedbackModal.id, rating, review);
      setFeedbackModal(null);
      loadData();
      alert("Feedback submitted!");
    } catch (err) {
      alert("Failed to submit feedback");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase">
              Mentorship <span className="text-indigo-600">Hub</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2 max-w-lg">Get guidance from alumni who have already paved the way. Career advice, mock interviews, and more.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'browse' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4" /> Find Mentors
            </button>
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'my-requests' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> My Sessions
            </button>
          </div>
        </div>

        {activeTab === 'browse' ? (
          <>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-12 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search by name, role, company or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadData()}
                  className="w-full pl-16 pr-6 py-5 bg-slate-50 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-500 outline-none font-bold transition-all"
                />
              </div>
              <button 
                onClick={loadData}
                className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
              >
                Search
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {alumni.map((a: any) => (
                <div key={a.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group flex flex-col h-full">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-slate-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all overflow-hidden">
                      {a.user?.profilePhoto ? (
                        <img src={getFileUrl(a.user.profilePhoto) || ''} className="w-full h-full object-cover" />
                      ) : (a.user?.name?.[0] || '?')}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-xl leading-tight mb-1">{a.user?.name || 'Unknown Mentor'}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-widest">{a.currentCompany || 'Expert'}</span>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
                          <Star className="w-3 h-3 fill-current" /> {a.mentorshipImpactScore > 100 ? '4.9+' : 'New'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-widest">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span>{a.role || 'Pro'} at {a.currentCompany || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                      <GraduationCap className="w-4 h-4" />
                      <span>{a.department} • Class of {a.passoutYear}</span>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <Target className="w-3 h-3" /> Expertise
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(a.mentorshipExpertise ? JSON.parse(a.mentorshipExpertise) : (a.skills?.split(',') || [])).slice(0, 4).map((s: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-tight">{s.trim()}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link 
                      href={`/dashboard/profile/${a.user?.id}`}
                      className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={() => handleBookClick(a)}
                      className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                    >
                      Request Mentorship <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {alumni.length === 0 && !loading && (
                <div className="col-span-full py-32 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mx-auto mb-8">
                    <Users className="w-12 h-12" />
                  </div>
                  <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">No mentors found</p>
                  <p className="text-slate-500 font-medium mt-2">Try searching for skills or company names.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight uppercase">Session History</h3>
              <div className="space-y-6">
                {myRequests.map((req: any) => (
                  <div key={req.id} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 group hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all overflow-hidden">
                          {req.alumni.user.profilePhoto ? (
                            <img src={getFileUrl(req.alumni.user.profilePhoto) || ''} className="w-full h-full object-cover" />
                          ) : (req.alumni.user.name[0])}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-lg leading-tight mb-1">{req.alumni.user.name}</h4>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{req.alumni.role} • {req.alumni.currentCompany}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                          req.status === 'accepted' ? 'bg-indigo-100 text-indigo-600' :
                          req.status === 'completed' ? 'bg-green-100 text-green-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="p-5 bg-white rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Session</p>
                        <p className="text-sm font-bold text-slate-900">{req.sessionType || 'Guidance'}</p>
                      </div>
                      <div className="p-5 bg-white rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Scheduled</p>
                        <p className="text-sm font-bold text-slate-900">{req.scheduledAt ? new Date(req.scheduledAt).toLocaleString() : 'Pending Confirmation'}</p>
                      </div>
                    </div>

                    {req.meetingLink && req.status === 'accepted' && (
                      <div className="mb-8 p-6 bg-indigo-600 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Video className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Meeting Link Ready</p>
                            <p className="font-bold">Join via {req.meetingPlatform || 'Google Meet'}</p>
                          </div>
                        </div>
                        <a 
                          href={req.meetingLink} 
                          target="_blank" 
                          className="w-full md:w-auto px-10 py-4 bg-white text-indigo-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                        >
                          Join Now <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {req.status === 'completed' && !req.rating && (
                      <button 
                        onClick={() => setFeedbackModal(req)}
                        className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-200"
                      >
                        <Star className="w-4 h-4" /> Rate Session & Provide Feedback
                      </button>
                    )}

                    {req.status === 'completed' && req.rating && (
                      <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < req.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        <p className="text-xs font-medium text-slate-600 italic">"{req.review}"</p>
                      </div>
                    )}
                  </div>
                ))}
                {myRequests.length === 0 && (
                  <div className="py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-6">
                      <Clock className="w-10 h-10" />
                    </div>
                    <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">No Sessions Found</p>
                    <p className="text-slate-500 font-medium mt-2">Request mentorship from alumni to start your journey.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            {success ? (
              <div className="p-20 text-center">
                <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Request Sent!</h3>
                <p className="text-slate-500 font-medium">Your mentor will review and confirm the session soon.</p>
              </div>
            ) : (
              <div className="p-12">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Request Mentorship</h2>
                    <p className="text-slate-500 font-medium mt-1">Booking with {selectedAlumni?.user?.name || 'Mentor'}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 px-2">Session Goal</label>
                      <select 
                        value={bookingData.sessionType}
                        onChange={(e) => setBookingData({...bookingData, sessionType: e.target.value})}
                        className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold"
                      >
                        <option>Career Guidance</option>
                        <option>Resume Review</option>
                        <option>Interview Prep</option>
                        <option>Technical Mentorship</option>
                        <option>Placement Guidance</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 px-2">Message for Mentor</label>
                      <textarea 
                        rows={4}
                        placeholder="What specific goals do you have for this session?"
                        value={bookingData.notes}
                        onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                        className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold"
                      ></textarea>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 px-2">Choose Time Slot</label>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
                      {slots.map((slot: any) => (
                        <button 
                          key={slot.id}
                          onClick={() => setBookingData({...bookingData, scheduledAt: `${slot.dayOfWeek} ${slot.startTime}`})}
                          className={`w-full p-5 rounded-[1.8rem] border-2 transition-all flex items-center justify-between group ${
                            bookingData.scheduledAt === `${slot.dayOfWeek} ${slot.startTime}` 
                              ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' 
                              : 'border-slate-100 bg-slate-50 hover:border-indigo-200'
                          }`}
                        >
                          <div className="text-left">
                            <p className="text-sm font-black text-slate-900">{slot.dayOfWeek}</p>
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                              <Clock className="w-3 h-3" /> {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            bookingData.scheduledAt === `${slot.dayOfWeek} ${slot.startTime}` 
                              ? 'border-indigo-600 bg-indigo-600 shadow-inner' 
                              : 'border-slate-200'
                          }`}>
                            {bookingData.scheduledAt === `${slot.dayOfWeek} ${slot.startTime}` && <CheckCircle2 className="w-5 h-5 text-white" />}
                          </div>
                        </button>
                      ))}
                      {slots.length === 0 && !loadingSlots && (
                        <div className="p-10 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                          <Info className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                          <p className="text-slate-400 font-bold text-xs uppercase tracking-tight">No slots available</p>
                        </div>
                      )}
                      {loadingSlots && <div className="p-10 text-center text-slate-400 animate-pulse font-black text-xs uppercase">Fetching Slots...</div>}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleBooking}
                  disabled={booking}
                  className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50"
                >
                  {booking ? 'Sending Request...' : 'Confirm Mentorship Request'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-xl rounded-[4rem] p-12 shadow-2xl relative"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-4">How was the session?</h3>
            <p className="text-slate-500 font-medium mb-10">Your feedback helps {feedbackModal.alumni.user.name} improve and helps other students find great mentors.</p>
            
            <div className="space-y-10">
              <div className="flex justify-center gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-125"
                  >
                    <Star className={`w-12 h-12 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 px-2">Write a short review</label>
                <textarea 
                  rows={4}
                  placeholder="What was the most helpful part of the session?"
                  className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-amber-500 transition-all outline-none font-bold"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={handleSubmitFeedback}
                  className="flex-1 py-5 bg-amber-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-amber-600 shadow-xl shadow-amber-200 transition-all"
                >
                  Submit Review
                </button>
                <button 
                  onClick={() => setFeedbackModal(null)}
                  className="px-8 py-5 bg-slate-50 text-slate-500 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Skip
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
  </DashboardLayout>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
