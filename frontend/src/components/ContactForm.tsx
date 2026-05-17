'use client';

import React, { useState, useEffect } from 'react';
import { Send, Phone, Mail, User, BookOpen, Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactFormProps {
  dark?: boolean;
}

export default function ContactForm({ dark = false }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    institutionName: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const data = new FormData();
    data.append("access_key", "62d7840c-9149-4b53-b55c-3eb7928c52fa");
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phoneNumber);
    data.append("institution", formData.institutionName);
    data.append("subject", formData.subject);
    data.append("message", formData.message);
    data.append("from_name", "CampusBridge Contact Form");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data
      });

      const result = await res.json();

      if (result.success) {
        setStatus({ 
          type: 'success', 
          text: 'Thank you for contacting CampusBridge. Our team will reach you as soon as possible.' 
        });
        setFormData({ 
          name: '', 
          email: '', 
          phoneNumber: '', 
          institutionName: '',
          subject: '', 
          message: '' 
        });
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setStatus(null), 5000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err: any) {
      setStatus({ 
        type: 'error', 
        text: 'Failed to send message. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${dark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} p-8 md:p-12 rounded-[2.5rem] border shadow-2xl relative overflow-hidden`}>
      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-6 left-6 right-6 z-20 p-6 rounded-3xl border shadow-xl flex items-center gap-4 ${
              status.type === 'success' 
                ? 'bg-green-50 border-green-100 text-green-800' 
                : 'bg-red-50 border-red-100 text-red-800'
            }`}
          >
            {status.type === 'success' ? (
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0 animate-bounce">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
            )}
            <div>
              <p className="font-black text-sm">{status.type === 'success' ? 'Success!' : 'Error'}</p>
              <p className="text-xs font-bold opacity-80">{status.text}</p>
            </div>
            <button 
              onClick={() => setStatus(null)}
              className="ml-auto text-current opacity-50 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest ${dark ? 'text-slate-400' : 'text-slate-400'} mb-3 ml-1`}>Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input
                type="text" required
                className={`w-full pl-11 pr-4 py-4 ${dark ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-transparent focus:border-indigo-500 focus:bg-white'} rounded-2xl border-2 outline-none transition-all font-bold text-sm`}
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest ${dark ? 'text-slate-400' : 'text-slate-400'} mb-3 ml-1`}>Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input
                type="email" required
                className={`w-full pl-11 pr-4 py-4 ${dark ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-transparent focus:border-indigo-500 focus:bg-white'} rounded-2xl border-2 outline-none transition-all font-bold text-sm`}
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest ${dark ? 'text-slate-400' : 'text-slate-400'} mb-3 ml-1`}>Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input
                type="text" required
                className={`w-full pl-11 pr-4 py-4 ${dark ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-transparent focus:border-indigo-500 focus:bg-white'} rounded-2xl border-2 outline-none transition-all font-bold text-sm`}
                placeholder="+91 XXXXX XXXXX"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest ${dark ? 'text-slate-400' : 'text-slate-400'} mb-3 ml-1`}>Institution Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input
                type="text" required
                className={`w-full pl-11 pr-4 py-4 ${dark ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-transparent focus:border-indigo-500 focus:bg-white'} rounded-2xl border-2 outline-none transition-all font-bold text-sm`}
                placeholder="University / College"
                value={formData.institutionName}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div>
          <label className={`block text-[10px] font-black uppercase tracking-widest ${dark ? 'text-slate-400' : 'text-slate-400'} mb-3 ml-1`}>Subject</label>
          <div className="relative">
            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input
              type="text" required
              className={`w-full pl-11 pr-4 py-4 ${dark ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-transparent focus:border-indigo-500 focus:bg-white'} rounded-2xl border-2 outline-none transition-all font-bold text-sm`}
              placeholder="How can we help?"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={`block text-[10px] font-black uppercase tracking-widest ${dark ? 'text-slate-400' : 'text-slate-400'} mb-3 ml-1`}>Message</label>
          <textarea
            required
            className={`w-full px-6 py-4 ${dark ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-transparent focus:border-indigo-500 focus:bg-white'} rounded-2xl border-2 outline-none transition-all font-bold text-sm min-h-[150px]`}
            placeholder="Tell us more about your inquiry..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
          ) : (
            <><Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Send Message</>
          )}
        </button>
      </form>
    </div>
  );
}
