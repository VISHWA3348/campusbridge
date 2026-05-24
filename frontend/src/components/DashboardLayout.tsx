'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { io } from 'socket.io-client';
import { getFileUrl } from '@/lib/api';
import {
  LayoutDashboard,
  Users,
  Target,
  MessageSquare,
  Briefcase,
  Video,
  Bell,
  Settings,
  LogOut,
  Search,
  Trophy,
  ShieldCheck,
  Building2,
  Menu,
  X,
  User,
  CreditCard,
  Sliders,
  BarChart,
  GraduationCap,
  Award,
  Megaphone,
  ToggleLeft,
  Activity,
  FileText,
  Map as MapIcon,
  Sparkles
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')) + '/notifications', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setNotifications(Array.isArray(data) ? data : []);
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')) + '/messages/conversations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      const count = data.reduce((acc: number, conv: any) => acc + conv.unreadCount, 0);
      setUnreadChatCount(count);
    } catch (e) { }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    fetchUnreadCount();

    const socket = io(((process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api').replace(/\/api$/, '')));
    socket.emit('join', user.id);

    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      // Play a subtle notification sound or show a toast if needed
    });

    socket.on('receive_message', (data) => {
      fetchUnreadCount();
    });

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 60000); // Fallback polling every minute

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [user]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  // Handle window resize to adjust sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')}/global/search?q=${searchQuery}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setSearchResults(data);
        setIsSearching(false);
      } else {
        setSearchResults(null);
      }
    };
    const timer = setTimeout(search, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleNotifications = async () => {
    if (!showNotifications) {
      setShowNotifications(true);
      // Mark all as read
      await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')) + '/notifications/read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchNotifications();
    } else {
      setShowNotifications(false);
    }
  };

  const [features, setFeatures] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')) + '/admin/features', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setFeatures(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch features:', e);
      }
    };
    fetchFeatures();
  }, []);

  const isFeatureEnabled = (name: string) => {
    if (features.length === 0) return true; // Default to true if not loaded
    const feature = features.find(f => f.featureName === name);
    return feature ? feature.enabled : true;
  };

  const navItems = [
    // Common Dashboard
    { label: 'Dashboard', icon: <LayoutDashboard />, href: `/dashboard/${user?.role?.toLowerCase()?.replace('_', '-')}` },

    // Super Admin
    { label: 'Colleges', icon: <Building2 />, href: '/dashboard/super-admin/colleges', roles: ['SUPER_ADMIN'] },
    { label: 'Users', icon: <Users />, href: '/dashboard/super-admin/users', roles: ['SUPER_ADMIN'] },
    { label: 'Subscriptions', icon: <CreditCard />, href: '/dashboard/super-admin/subscriptions', roles: ['SUPER_ADMIN'] },
    { label: 'Feature Control', icon: <ToggleLeft />, href: '/dashboard/super-admin/features', roles: ['SUPER_ADMIN'] },
    { label: 'System Health', icon: <Activity />, href: '/dashboard/super-admin/system-health', roles: ['SUPER_ADMIN'] },
    { label: 'Global Placements', icon: <Award />, href: '/dashboard/super-admin/placements', roles: ['SUPER_ADMIN'] },
    { label: 'Profile', icon: <User />, href: '/dashboard/super-admin/profile', roles: ['SUPER_ADMIN'] },
    { label: 'Honor Board', icon: <Trophy />, href: '/dashboard/leaderboard', roles: ['SUPER_ADMIN'] },

    // College Admin
    { label: 'Students', icon: <Users />, href: '/dashboard/college-admin/students', roles: ['COLLEGE_ADMIN'] },
    { label: 'Alumni', icon: <GraduationCap />, href: '/dashboard/college-admin/alumni', roles: ['COLLEGE_ADMIN'] },
    { label: 'Referrals', icon: <Target />, href: '/dashboard/college-admin/referrals', roles: ['COLLEGE_ADMIN'], feature: 'Referral System' },
    { label: 'Placements', icon: <Award />, href: '/dashboard/college-admin/placements', roles: ['COLLEGE_ADMIN'], feature: 'Placement Tracker' },
    { label: 'Announcements', icon: <Megaphone />, href: '/dashboard/college-admin/announcements', roles: ['COLLEGE_ADMIN'] },
    { label: 'Webinars', icon: <Video />, href: '/dashboard/college-admin/webinars', roles: ['COLLEGE_ADMIN'], feature: 'Webinar Module' },
    { label: 'Profile', icon: <User />, href: '/dashboard/college-admin/profile', roles: ['COLLEGE_ADMIN'] },
    { label: 'Honor Board', icon: <Trophy />, href: '/dashboard/leaderboard', roles: ['COLLEGE_ADMIN'] },

    // Student
    { label: 'Profile', icon: <User />, href: '/dashboard/student/profile', roles: ['STUDENT'] },
    { label: 'Alumni Search', icon: <Search />, href: '/dashboard/student/alumni-search', roles: ['STUDENT'] },
    { label: 'Referrals', icon: <Target />, href: '/dashboard/student/referrals', roles: ['STUDENT'], feature: 'Referral System' },
    { label: 'Jobs', icon: <Briefcase />, href: '/dashboard/student/jobs', roles: ['STUDENT'], feature: 'Job Portal' },
    { label: 'Chat', icon: <MessageSquare />, href: '/dashboard/student/chat', roles: ['STUDENT'], feature: 'Chat System' },
    { label: 'Webinars', icon: <Video />, href: '/dashboard/student/webinars', roles: ['STUDENT'], feature: 'Webinar Module' },
    { label: 'Library', icon: <Video />, href: '/dashboard/student/webinar-library', roles: ['STUDENT'], feature: 'Webinar Module' },
    { label: 'Resume', icon: <FileText />, href: '/dashboard/student/resume-builder', roles: ['STUDENT'] },
    { label: 'Mentorship', icon: <Users />, href: '/dashboard/student/mentorship', roles: ['STUDENT'], feature: 'Mentorship System' },
    { label: 'Career Roadmap', icon: <MapIcon />, href: '/dashboard/student/career-roadmap', roles: ['STUDENT'], feature: 'Career Roadmap' },
    { label: 'Resume Analyzer', icon: <Sparkles />, href: '/dashboard/student/resume-analyzer', roles: ['STUDENT'], feature: 'Resume Analyzer' },
    { label: 'Placement Tracker', icon: <Target />, href: '/dashboard/student/placement-tracker', roles: ['STUDENT'], feature: 'Placement Tracker' },
    { label: 'Honor Board', icon: <Trophy />, href: '/dashboard/leaderboard', roles: ['STUDENT'] },
    { label: 'My Placements', icon: <Award />, href: '/dashboard/student/placements', roles: ['STUDENT'] },
    { label: 'Notifications', icon: <Bell />, href: '/dashboard/student/notifications', roles: ['STUDENT'], feature: 'Notifications' },

    // Alumni
    { label: 'Profile', icon: <User />, href: '/dashboard/alumni/profile', roles: ['ALUMNI'] },
    { label: 'Students', icon: <Search />, href: '/dashboard/alumni/students', roles: ['ALUMNI'] },
    { label: 'Referrals', icon: <Target />, href: '/dashboard/alumni/referrals', roles: ['ALUMNI'], feature: 'Referral System' },
    { label: 'Jobs', icon: <Briefcase />, href: '/dashboard/alumni/jobs', roles: ['ALUMNI'], feature: 'Job Portal' },
    { label: 'Chat', icon: <MessageSquare />, href: '/dashboard/alumni/chat', roles: ['ALUMNI'], feature: 'Chat System' },
    { label: 'Webinars', icon: <Video />, href: '/dashboard/alumni/webinars', roles: ['ALUMNI'], feature: 'Webinar Module' },
    { label: 'Mentorship Requests', icon: <Users />, href: '/dashboard/alumni/mentorship', roles: ['ALUMNI'], feature: 'Mentorship System' },
    { label: 'Placements', icon: <Award />, href: '/dashboard/alumni/placements', roles: ['ALUMNI'] },
    { label: 'Honor Board', icon: <Trophy />, href: '/dashboard/leaderboard', roles: ['ALUMNI'] },

    // Settings
    { label: 'Settings', icon: <Settings />, href: `/dashboard/${user?.role?.toLowerCase()?.replace('_', '-')}/settings` },
  ].filter(item => {
    const roleMatch = !item.roles || item.roles.includes(user?.role || '');
    const featureMatch = !item.feature || isFeatureEnabled(item.feature);
    return roleMatch && featureMatch;
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 transition-all duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10 px-2">
            <Link href="/" className="group">
              <BrandLogo size="md" />
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all relative ${pathname === item.href
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                {React.isValidElement(item.icon) ? React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-5 h-5' }) : item.icon}
                <span className="flex-1">{item.label}</span>
                {item.label === 'Chat' && unreadChatCount > 0 && (
                  <span className="absolute right-4 w-5 h-5 bg-indigo-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white shadow-sm font-black">
                    {unreadChatCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-50 space-y-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative max-w-md w-full hidden sm:block min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Global search users, jobs..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-500 outline-none text-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl border border-slate-100 shadow-2xl p-4 z-50">
                  <div className="space-y-6">
                    {searchResults.users?.length > 0 && (
                      <div>
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-3 px-4">People</h4>
                        <div className="space-y-1">
                          {searchResults.users.map((u: any) => (
                            <div
                              key={`user-${u.id}`}
                              onClick={() => {
                                router.push(`/dashboard/profile/${u.id}`);
                                setSearchQuery('');
                                setSearchResults(null);
                              }}
                              className="p-3 hover:bg-slate-50 rounded-2xl flex items-center gap-3 cursor-pointer transition-all active:scale-[0.98]"
                            >
                              <div className="w-8 h-8 bg-slate-900 text-white rounded-lg overflow-hidden flex items-center justify-center font-black text-xs">
                                {u.profilePhoto ? (
                                  <img src={getFileUrl(u.profilePhoto) || ''} alt={u.name} className="w-full h-full object-cover" />
                                ) : (
                                  u.name[0]
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-bold">{u.name}</p>
                                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{u.role?.replace('_', ' ')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {searchResults.jobs?.length > 0 && (
                      <div>
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-3 px-4">Jobs</h4>
                        <div className="space-y-1">
                          {searchResults.jobs.map((j: any) => (
                            <div key={`job-${j.id}`} className="p-3 hover:bg-slate-50 rounded-2xl flex items-center gap-3 cursor-pointer">
                              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><Briefcase className="w-4 h-4" /></div>
                              <div>
                                <p className="text-sm font-bold">{j.title}</p>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{j.company}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all relative"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-indigo-600 border-2 border-white rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-96 bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden z-50">
                  <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-900">Notifications</h4>
                    <Link
                      href={`/dashboard/${user?.role?.toLowerCase()?.replace('_', '-')}/notifications`}
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] font-black uppercase text-indigo-600 hover:text-blue-700 tracking-widest"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.map((n, i) => (
                      <div
                        key={`notif-${n.id || i}`}
                        onClick={() => {
                          if (n.link) router.push(n.link);
                          setShowNotifications(false);
                        }}
                        className={`p-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-all cursor-pointer flex gap-4 ${!n.read ? 'bg-indigo-50/30' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${n.priority === 'URGENT' ? 'bg-red-100 text-red-600' :
                            n.priority === 'IMPORTANT' ? 'bg-orange-100 text-orange-600' :
                              'bg-slate-100 text-slate-600'
                          }`}>
                          <Bell className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm leading-tight mb-1 ${!n.read ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                            {n.title && <span className="block text-[10px] uppercase tracking-widest text-indigo-600 mb-0.5">{n.title}</span>}
                            {n.message}
                          </p>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            {new Date(n.createdAt).toLocaleDateString()}
                            {n.priority === 'URGENT' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}
                          </p>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="py-12 px-6 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                          <Bell className="w-6 h-6" />
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No new alerts.</p>
                      </div>
                    )}
                  </div>
                  {!notifications.every(n => n.read) && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await fetch((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')) + '/notifications/read', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });
                        fetchNotifications();
                      }}
                      className="w-full py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 bg-slate-50/30 hover:bg-slate-50 transition-all"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="h-10 w-px bg-slate-100 mx-2"></div>

            <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
              <div className="text-right hidden xl:block">
                <p className="text-sm font-black text-slate-900 leading-none mb-1 truncate max-w-[120px]">{user?.name}</p>
                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{user?.role?.replace('_', ' ')}</p>
              </div>
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl overflow-hidden flex items-center justify-center font-black border-2 border-white shadow-sm shrink-0">
                {user?.profilePhoto ? (
                  <img src={getFileUrl(user.profilePhoto) || ''} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0]
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {user?.role === 'STUDENT' && user?.verificationStatus === 'PENDING_APPROVAL' ? (
            <div className="min-h-[70vh] bg-white rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-center items-center justify-center p-12 text-center">
              <div className="max-w-xl">
                <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                  <ShieldCheck className="w-12 h-12" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Account Verification Pending</h1>
                <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8">
                  Your account is currently waiting for college verification. 
                  Once your admin approves your uploaded ID card, you will have full access to chat, alumni search, jobs, and mentorship.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Status</p>
                      <p className="font-bold text-amber-600">Under Review</p>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Estimated Time</p>
                      <p className="font-bold text-slate-700">24-48 Hours</p>
                   </div>
                </div>
                <div className="mt-12 flex justify-center gap-4">
                   <button onClick={() => window.location.reload()} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200">Check Status</button>
                   <button onClick={logout} className="px-8 py-4 bg-white text-red-500 border border-red-50 rounded-2xl font-black text-sm uppercase tracking-widest">Sign Out</button>
                </div>
              </div>
            </div>
          ) : user?.role === 'STUDENT' && user?.verificationStatus === 'REJECTED' ? (
            <div className="min-h-[70vh] bg-white rounded-[3.5rem] border border-red-100 shadow-sm flex flex-center items-center justify-center p-12 text-center">
              <div className="max-w-xl">
                <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <X className="w-12 h-12" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Verification Rejected</h1>
                <p className="text-slate-500 font-medium text-lg leading-relaxed mb-4">
                  Unfortunately, your verification request was rejected by the college administrator.
                </p>
                <div className="p-6 bg-red-50 rounded-2xl border border-red-100 mb-8">
                   <p className="text-[10px] font-black uppercase text-red-400 tracking-widest mb-1 text-left">Reason for rejection</p>
                   <p className="font-bold text-red-700 text-left">{user?.rejectionReason || 'Documents provided were unclear or invalid.'}</p>
                </div>
                 <div className="flex justify-center gap-4">
                    <Link href="/dashboard/student/settings" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200">Re-upload Documents</Link>
                    <button onClick={logout} className="px-8 py-4 bg-white text-slate-500 border border-slate-100 rounded-2xl font-black text-sm uppercase tracking-widest">Sign Out</button>
                 </div>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
