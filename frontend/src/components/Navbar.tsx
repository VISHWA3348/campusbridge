'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';

const navLinks = [
  { name: 'Home', href: '/' },
  { 
    name: 'About', 
    href: '/about',
    dropdown: [
      { name: 'About Platform', href: '/about' },
      { name: 'Team', href: '/team' },
      { name: 'Mission', href: '/about#mission' },
    ]
  },
  { 
    name: 'Features', 
    href: '/features',
    dropdown: [
      { name: 'Students', href: '/features#students' },
      { name: 'Alumni', href: '/features#alumni' },
      { name: 'Colleges', href: '/features#colleges' },
      { name: 'AI Features', href: '/features' },
    ]
  },
  { 
    name: 'Pricing', 
    href: '/pricing',
    dropdown: [
      { name: 'Free', href: '/pricing' },
      { name: 'Pro', href: '/pricing' },
      { name: 'Premium', href: '/pricing' },
    ]
  },
  { 
    name: 'Resources', 
    href: '/documentation',
    dropdown: [
      { name: 'Documentation', href: '/documentation' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'FAQ', href: '/faq' },
    ]
  },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setMobileExpanded(null);
  }, [pathname]);

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
      scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-100 py-4 shadow-sm' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <NextLink href="/" className="group">
          <BrandLogo size="md" />
        </NextLink>
        
        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <div 
              key={link.name}
              className="relative"
              onMouseEnter={() => setActiveDropdown(link.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className="flex items-center gap-1 cursor-pointer py-2">
                {link.dropdown ? (
                  <span className={`text-[13px] font-black uppercase tracking-widest transition-all hover:text-indigo-600 flex items-center gap-1 ${
                    activeDropdown === link.name ? 'text-indigo-600' : 'text-slate-500'
                  }`}>
                    {link.name}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />
                  </span>
                ) : (
                  <NextLink 
                    href={link.href}
                    className={`text-[13px] font-black uppercase tracking-widest transition-all hover:text-indigo-600 ${
                      pathname === link.href ? 'text-indigo-600' : 'text-slate-500'
                    }`}
                  >
                    {link.name}
                  </NextLink>
                )}
              </div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {link.dropdown && activeDropdown === link.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl p-3 mt-1"
                  >
                    <div className="flex flex-col gap-1">
                      {link.dropdown.map((subItem) => (
                        <NextLink
                          key={subItem.name}
                          href={subItem.href}
                          className="px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all flex items-center justify-between group"
                        >
                          {subItem.name}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </NextLink>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-6">
          <NextLink href="/login" className="text-[13px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 px-4">Log in</NextLink>
          <NextLink href="/signup" className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </NextLink>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 shadow-sm hover:bg-slate-100 transition-all"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 top-0 left-0 w-full h-screen bg-white z-[90] lg:hidden overflow-y-auto"
          >
            <div className="px-6 pt-32 pb-12 flex flex-col gap-4">
              {navLinks.map((link) => (
                <div key={link.name} className="flex flex-col border-b border-slate-50 pb-4">
                  {link.dropdown ? (
                    <>
                      <button 
                        onClick={() => setMobileExpanded(mobileExpanded === link.name ? null : link.name)}
                        className="flex items-center justify-between text-3xl font-black tracking-tighter text-slate-900 text-left py-2"
                      >
                        {link.name}
                        <ChevronDown className={`w-8 h-8 transition-transform duration-300 ${mobileExpanded === link.name ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {mobileExpanded === link.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden flex flex-col gap-3 pl-4 mt-2"
                          >
                            {link.dropdown.map((subItem) => (
                              <NextLink 
                                key={subItem.name} 
                                href={subItem.href}
                                className="text-xl font-bold text-slate-500 hover:text-indigo-600 transition-all"
                              >
                                {subItem.name}
                              </NextLink>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <NextLink 
                      href={link.href}
                      className={`text-3xl font-black tracking-tighter py-2 ${
                        pathname === link.href ? 'text-indigo-600' : 'text-slate-900'
                      }`}
                    >
                      {link.name}
                    </NextLink>
                  )}
                </div>
              ))}
              
              <div className="flex flex-col gap-4 mt-8">
                <NextLink href="/login" className="w-full py-5 text-center font-black text-slate-900 border-2 border-slate-100 rounded-3xl text-lg">Log in</NextLink>
                <NextLink href="/signup" className="w-full py-5 text-center font-black text-white bg-slate-900 rounded-3xl shadow-2xl text-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                  Get Started <ArrowRight className="w-5 h-5" />
                </NextLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
