'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Search,
  MoreVertical,
  Circle,
  FileText,
  Image as ImageIcon,
  Download,
  Loader2,
  Check,
  CheckCheck,
  User,
  ArrowLeft,
  Smile
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getFileUrl } from '@/lib/api';

const socket = io((((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'https://campusbridge-e4cv.onrender.com/api'))).replace(/\/api$/, '')));

export default function ChatSystem() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get('userId');

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);
  const [showUserList, setShowUserList] = useState(true); // For mobile responsiveness

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      socket.emit('join', user.id);
      fetchConversations().then((convs) => {
        if (initialUserId && parseInt(initialUserId) > 0) {
          const uid = parseInt(initialUserId);
          const existingConv = convs.find((c: any) => c.user.id === uid);
          if (existingConv) {
            setSelectedUser(existingConv.user);
          } else {
            // Fetch user info for a new conversation
            fetchUserInfo(uid);
          }
        }
      });

      socket.on('receive_message', (message) => {
        if (selectedUser && message.senderId === selectedUser.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === message.id)) return prev;
            return [...prev, message];
          });
        }
        fetchConversations();
      });

      socket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      socket.on('typing_status', (data) => {
        if (selectedUser && data.senderId === selectedUser.id) {
          setOtherUserTyping(data.isTyping);
        }
      });
    }

    return () => {
      socket.off('receive_message');
      socket.off('online_users');
      socket.off('typing_status');
    };
  }, [user, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      if (window.innerWidth < 1024) setShowUserList(false);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'https://campusbridge-e4cv.onrender.com/api'))) + '/messages/conversations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      const conversationsList = Array.isArray(data) ? data : [];
      setConversations(conversationsList);
      return conversationsList;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async (id: number) => {
    if (!id || id <= 0) return;
    try {
      const res = await fetch(`${(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'https://campusbridge-e4cv.onrender.com/api'))}/profile/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data && !data.error) {
        setSelectedUser(data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = async (otherUserId: number, pageNum = 1, prepend = false) => {
    if (!otherUserId || otherUserId <= 0) {
      setMessages([]);
      return;
    }
    try {
      const res = await fetch(`${(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'https://campusbridge-e4cv.onrender.com/api'))}/messages/${otherUserId}?page=${pageNum}&limit=50`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      const newMessages = data.messages || [];
      
      if (prepend) {
        setMessages(prev => [...newMessages, ...prev]);
        setPage(pageNum);
      } else {
        setMessages(newMessages);
        setPage(1);
      }
      
      setHasMoreMessages(data.pagination ? pageNum < data.pagination.totalPages : false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasMoreMessages && !loading && selectedUser) {
      // Save height to maintain scroll position after loading
      const currentHeight = e.currentTarget.scrollHeight;
      fetchMessages(selectedUser.id, page + 1, true).then(() => {
        // Maintain scroll position logic could go here if needed
      });
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      receiverId: selectedUser.id,
      content: newMessage,
    };

    setSending(true);
    try {
      const res = await fetch(((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'https://campusbridge-e4cv.onrender.com/api'))) + '/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageData)
      });
      const data = await res.json();
      setMessages(prev => {
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setNewMessage('');
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!user || !selectedUser) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { receiverId: selectedUser.id, senderId: user.id, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (user && selectedUser) {
        socket.emit('typing', { receiverId: selectedUser.id, senderId: user.id, isTyping: false });
      }
    }, 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'https://campusbridge-e4cv.onrender.com/api'))) + '/messages/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const fileData = await res.json();

      const messageData = {
        receiverId: selectedUser.id,
        content: `Sent a file: ${fileData.fileName}`,
        fileUrl: fileData.fileUrl,
        fileName: fileData.fileName,
        fileType: fileData.fileType
      };

      const msgRes = await fetch(((typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'https://campusbridge-e4cv.onrender.com/api'))) + '/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageData)
      });
      const finalMsg = await msgRes.json();
      setMessages(prev => {
        if (prev.some(m => m.id === finalMsg.id)) return prev;
        return [...prev, finalMsg];
      });
      fetchConversations();
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length > 2) {
        try {
          const res = await fetch(`${(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://campusbridge-e4cv.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api' ? process.env.NEXT_PUBLIC_API_URL : 'https://campusbridge-e4cv.onrender.com/api'))}/global/search?q=${searchQuery}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const data = await res.json();
          setGlobalSearchResults(data.users || []);
        } catch (error) {
          console.error('Search error:', error);
        }
      } else {
        setGlobalSearchResults([]);
      }
    };
    const timer = setTimeout(searchUsers, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredConversations = Array.isArray(conversations) ? conversations.filter(conv =>
    conv.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex overflow-hidden relative">
      {/* Sidebar - User List */}
      <div className={`${showUserList ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-96 border-r border-slate-100 bg-slate-50/30`}>
        <div className="p-8 pb-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-8">Messages</h2>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-transparent rounded-2xl focus:border-indigo-500 shadow-sm outline-none text-sm font-bold transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" /></div>
          ) : (
            <>
              {/* Existing Conversations */}
              {filteredConversations.map((conv) => (
                <button
                  key={`conv-${conv.user.id}`}
                  onClick={() => {
                    setSelectedUser(conv.user);
                    setSearchQuery('');
                  }}
                  className={`w-full p-4 rounded-[1.5rem] flex items-center gap-4 transition-all group ${selectedUser?.id === conv.user.id ? 'bg-white shadow-xl shadow-slate-200 border border-slate-100' : 'hover:bg-white/50'
                    }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 flex items-center justify-center font-black text-lg shadow-sm">
                      {conv.user?.profilePhoto ? (
                        <img src={getFileUrl(conv.user.profilePhoto) || ''} alt={conv.user?.name} className="w-full h-full object-cover" />
                      ) : (conv.user?.name?.[0] || '?')}
                    </div>
                    {onlineUsers.includes(conv.user.id) && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-slate-50 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-black text-slate-900 truncate">{conv.user?.name || 'Unknown User'}</p>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-indigo-600 font-black' : 'text-slate-500 font-medium'}`}>
                        {conv.lastMessage.senderId === user?.id ? 'You: ' : ''}
                        {conv.lastMessage.content || 'Shared a file'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-indigo-200">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}

              {/* Global Search Results (New People) */}
              {searchQuery.length > 2 && globalSearchResults.length > 0 && (
                <div className="pt-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-4">Start New Chat</h4>
                  {globalSearchResults.filter(u => !conversations.some(c => c.user.id === u.id) && u.id !== user?.id).map((u) => (
                    <button
                      key={`search-${u.id}`}
                      onClick={() => {
                        setSelectedUser(u);
                        setSearchQuery('');
                      }}
                      className="w-full p-4 rounded-[1.5rem] flex items-center gap-4 transition-all hover:bg-white shadow-sm hover:shadow-xl hover:shadow-slate-200/50 group"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                        {u.profilePhoto ? <img src={getFileUrl(u.profilePhoto) || ''} className="w-full h-full object-cover" /> : (u.name?.[0] || '?')}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-black text-slate-900 text-sm">{u.name || 'Unknown User'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {filteredConversations.length === 0 && searchQuery.length <= 2 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs font-black uppercase tracking-widest">No recent chats</p>
                  <p className="text-[10px] mt-2 font-medium">Search for people to start chatting.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`${!showUserList ? 'flex' : 'hidden'} lg:flex flex-1 flex-col bg-white relative`}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowUserList(true)}
                  className="lg:hidden p-2 text-slate-400"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 flex items-center justify-center font-black shadow-sm">
                    {selectedUser.profilePhoto ? (
                      <img src={getFileUrl(selectedUser.profilePhoto) || ''} alt={selectedUser.name} className="w-full h-full object-cover" />
                    ) : (selectedUser.name?.[0] || '?')}
                  </div>
                  {onlineUsers.includes(selectedUser.id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 leading-none mb-1">{selectedUser.name || 'Unknown User'}</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                      {otherUserTyping ? 'Typing...' : (onlineUsers.includes(selectedUser.id) ? 'Online' : 'Offline')}
                    </p>
                    <span className="text-slate-300">•</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {selectedUser.role} {selectedUser.alumni?.currentCompany ? `at ${selectedUser.alumni.currentCompany}` : (selectedUser.student?.department ? `• ${selectedUser.student.department}` : '')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link 
                  href={`/dashboard/profile/${selectedUser.id}`}
                  className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-100"
                >
                  View Profile
                </Link>
                <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/20"
              onScroll={handleScroll}
              ref={scrollContainerRef}
            >
              {loading && page > 1 && (
                <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
              )}
              
              {Array.isArray(messages) && messages.map((msg, i) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <motion.div
                    initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={`msg-${msg.id || i}`}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] group ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`p-5 rounded-[2rem] shadow-sm relative ${isMe
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none'
                        }`}>
                        {msg.fileUrl ? (
                          <div className="flex items-center gap-4 p-2">
                            {msg.fileType?.includes('image') ? (
                              <img src={getFileUrl(msg.fileUrl) || ''} alt="Attached" className="max-w-full rounded-xl" />
                            ) : (
                              <>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMe ? 'bg-white/10' : 'bg-indigo-50 text-indigo-600'}`}>
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-black truncate mb-1">{msg.fileName}</p>
                                  <a
                                    href={getFileUrl(msg.fileUrl) || '#'}
                                    download
                                    className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline ${isMe ? 'text-indigo-300' : 'text-indigo-600'}`}
                                  >
                                    <Download className="w-3 h-3" /> Download
                                  </a>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2 px-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && (
                          msg.isRead ? <CheckCheck className="w-3 h-3 text-indigo-500" /> : <Check className="w-3 h-3 text-slate-300" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-50 flex items-center gap-4">
              <label className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer shadow-sm">
                <Paperclip className="w-5 h-5" />
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
              <div className="flex-1 relative group">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full pl-6 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  value={newMessage}
                  onChange={handleTyping}
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600">
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] opacity-50"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center text-slate-200 mx-auto mb-8 border border-slate-50">
                <MessageSquareIcon className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Your Private Space</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                Select a conversation to start messaging. Your chats are encrypted and completely private.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
