'use client';

import React from 'react';
import NextLink from 'next/link';
import {
  Globe,
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  Share2,
  Terminal
} from 'lucide-react';
import { Instagram, Linkedin, Github } from '@/components/BrandIcons';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const footerLinks = {
    platform: [
      { name: 'About Us', href: '/about' },
      { name: 'Features', href: '/features' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Documentation', href: '/documentation' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
    social: [
      { name: 'LinkedIn', href: 'https://www.linkedin.com/company/zinoin/', icon: <Linkedin className="w-5 h-5" /> },
      { name: 'Instagram', href: 'https://www.instagram.com/zinoingroup?igsh=MTJvNmR0azIwbmhhNw==', icon: <Instagram className="w-5 h-5" /> },
      { name: 'GitHub', href: 'https://github.com', icon: <Github className="w-5 h-5" /> },
    ]
  };

  return (
    <footer className="pt-32 pb-12 px-6 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="lg:col-span-1">
            <NextLink href="/" className="mb-8 block group">
              <BrandLogo size="md" />
            </NextLink>
            <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-xs">
              Revolutionizing the way students and alumni connect. Built for institutional success and individual career growth through a verified professional network.
            </p>
            <div className="flex items-center gap-4">
              {footerLinks.social.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-lg transition-all"
                  aria-label={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 mb-8">Platform</h4>
            <ul className="space-y-4">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <NextLink href={link.href} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2 group">
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 mb-8">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <NextLink href={link.href} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                    {link.name}
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 mb-8">Contact Info</h4>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Address</p>
                  <p className="text-sm font-bold text-slate-700">2/124, Nayandahalli, Bangalore, India</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Phone</p>
                  <p className="text-sm font-bold text-slate-700">+91 9113063448</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Email</p>
                  <p className="text-sm font-bold text-slate-700">zinointech@gmail.com</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-slate-400 text-xs font-bold tracking-tight">
            © 2026 <a 
              href="https://zinoingroup.in/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-900 hover:text-indigo-600 transition-all duration-300 relative group cursor-pointer"
            >
              CampusBridge
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
            </a> & Zinoin Tech. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-xs font-bold text-slate-400">
            <NextLink href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</NextLink>
            <NextLink href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</NextLink>
            <NextLink href="/cookies" className="hover:text-slate-900 transition-colors">Cookie Policy</NextLink>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Status: Optimal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
