'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Trash2, Settings, ExternalLink, Mail, Smartphone, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const fetchNotifications = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/notifications?page=${pageNum}&limit=10&unreadOnly=${activeTab === 'unread'}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      
      const newNotifications = data.notifications || [];
      if (reset) {
        setNotifications(newNotifications);
        setPage(1);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
        setPage(pageNum);
      }
      
      setUnreadCount(data.unreadCount || 0);
      setHasMore(data.pagination ? pageNum < data.pagination.totalPages : false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1, true);
  }, [activeTab]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  const markAllRead = async () => {
    await fetch('http://localhost:5000/api/notifications/read', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    fetchNotifications(1, true);
  };

  const deleteNotification = async (id: number) => {
    await fetch(`http://localhost:5000/api/notifications/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    fetchNotifications(1, true);
  };

  const clearAll = async () => {
    if (confirm('Clear all notifications?')) {
      await fetch('http://localhost:5000/api/notifications', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchNotifications(1, true);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Notification Center</h1>
          <p className="text-slate-500 font-medium">Manage your alerts and staying updated with recent activities.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={markAllRead}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark all read
          </button>
          <button 
            onClick={clearAll}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 rounded-2xl font-black text-xs uppercase tracking-widest text-red-600 hover:bg-red-100 transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="flex border-b border-slate-50">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-8 py-5 font-black text-xs uppercase tracking-widest transition-all relative ${
              activeTab === 'all' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            All Notifications
            {activeTab === 'all' && <span className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full mx-8"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('unread')}
            className={`px-8 py-5 font-black text-xs uppercase tracking-widest transition-all relative ${
              activeTab === 'unread' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-[10px] rounded-full">
                {unreadCount}
              </span>
            )}
            {activeTab === 'unread' && <span className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full mx-8"></span>}
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {notifications.length > 0 ? (
            <>
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-6 md:p-8 flex items-start gap-6 transition-all group ${!n.read ? 'bg-indigo-50/20' : 'hover:bg-slate-50/50'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                    n.priority === 'URGENT' ? 'bg-red-500 text-white shadow-red-200' : 
                    n.priority === 'IMPORTANT' ? 'bg-orange-500 text-white shadow-orange-200' : 
                    'bg-slate-900 text-white shadow-slate-200'
                  }`}>
                    <Bell className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 px-3 py-1 bg-indigo-50 rounded-full">
                        {n.type?.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                      {n.priority === 'URGENT' && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-600 px-3 py-1 bg-red-50 rounded-full animate-pulse">
                          Urgent
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xl leading-snug mb-2 ${!n.read ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                      {n.title || 'System Update'}
                    </h3>
                    <p className={`text-base leading-relaxed mb-4 ${!n.read ? 'text-slate-600' : 'text-slate-500'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-4">
                      {n.link && (
                        <button 
                          onClick={() => router.push(n.link)}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-blue-700 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open Link
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(n.id)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  {!n.read && (
                    <div className="w-3 h-3 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200 animate-pulse"></div>
                  )}
                </div>
              ))}
              
              {hasMore && (
                <div className="p-8 flex justify-center border-t border-slate-50">
                  <button 
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-10 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More Notifications'}
                  </button>
                </div>
              )}
            </>
          ) : loading ? (
            <div className="p-20 text-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading alerts...</p>
            </div>
          ) : (
            <div className="py-24 px-6 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner">
                <Bell className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">All caught up!</h3>
              <p className="text-slate-400 font-medium">You don't have any notifications {activeTab === 'unread' ? 'unread' : 'at the moment'}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
