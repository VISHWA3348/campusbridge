'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Zap, ShieldCheck, Building2 } from 'lucide-react';
import Link from 'next/link';

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for students starting their journey.',
    features: [
      { name: 'Access to Alumni Directory', included: true },
      { name: 'Basic Resume Analysis', included: true },
      { name: 'Community Forum Access', included: true },
      { name: 'Direct Referral Requests', included: false },
      { name: '1:1 Mentorship Booking', included: false },
      { name: 'Premium Webinar Access', included: false },
    ],
    buttonText: 'Get Started',
    buttonHref: '/signup',
    highlight: false,
    icon: <Zap className="w-6 h-6" />
  },
  {
    name: 'Pro',
    price: '$19',
    description: 'Ideal for serious career seekers and graduates.',
    features: [
      { name: 'Everything in Free', included: true },
      { name: 'Unlimited Referral Requests', included: true },
      { name: '1:1 Mentorship Booking', included: true },
      { name: 'Advanced Resume Insights', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Premium Webinar Access', included: false },
    ],
    buttonText: 'Upgrade to Pro',
    buttonHref: '/signup',
    highlight: true,
    icon: <ShieldCheck className="w-6 h-6" />
  },
  {
    name: 'Premium',
    price: '$49',
    description: 'The ultimate professional network for institutions.',
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Full Institutional Analytics', included: true },
      { name: 'Advanced Placement Tracking', included: true },
      { name: 'Custom Branding', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: 'API Integration', included: true },
    ],
    buttonText: 'Contact Sales',
    buttonHref: '/contact',
    highlight: false,
    icon: <Building2 className="w-6 h-6" />
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      <Navbar />
      
      <main className="pt-48 pb-24 px-6 relative overflow-hidden">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px]"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Simple & Transparent Pricing
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 text-slate-900"
            >
              The Right Plan for <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-600">Your Future</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 max-w-2xl mx-auto mb-14 font-medium leading-relaxed"
            >
              Choose the perfect plan to accelerate your career growth and connect with a verified professional network.
            </motion.p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-1 rounded-[3.5rem] ${plan.highlight ? 'bg-gradient-to-br from-indigo-600 to-indigo-600 shadow-2xl shadow-indigo-200' : 'bg-slate-100'}`}
              >
                <div className="bg-white h-full rounded-[3.3rem] p-12 flex flex-col">
                  {plan.highlight && (
                    <div className="absolute top-8 right-8 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                      Most Popular
                    </div>
                  )}
                  
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${plan.highlight ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                    {plan.icon}
                  </div>
                  
                  <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-5xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-slate-400 font-bold">/mo</span>
                  </div>
                  <p className="text-slate-500 font-medium text-sm mb-10 leading-relaxed">
                    {plan.description}
                  </p>
                  
                  <ul className="space-y-6 mb-12 flex-1">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-4 text-sm font-bold text-slate-600">
                        {feature.included ? (
                          <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center flex-shrink-0">
                            <X className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        <span className={feature.included ? 'text-slate-700' : 'text-slate-300 line-through'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href={plan.buttonHref}
                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-center transition-all ${
                      plan.highlight 
                        ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl' 
                        : 'bg-slate-50 text-slate-900 border-2 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Comparison Table Section Preview */}
          <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
             <div className="text-center mb-20 relative z-10">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Frequently Asked Billing Questions</h2>
                <p className="text-slate-400 font-medium max-w-xl mx-auto">Get answers to common questions about our plans and payments.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                {[
                  { q: 'Can I change plans at any time?', a: 'Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes will be reflected in your next billing cycle.' },
                  { q: 'Is there a free trial for Pro?', a: 'We offer a 14-day free trial for students to explore all Pro features before committing to a monthly subscription.' },
                  { q: 'Do you offer annual discounts?', a: 'Yes! Save 20% when you choose our annual billing option for any paid plan.' },
                  { q: 'How secure is my payment?', a: 'We use industry-standard encryption and partner with leading payment processors like Stripe to ensure your data is always safe.' }
                ].map((faq, i) => (
                  <div key={i} className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <h4 className="text-xl font-black mb-4">{faq.q}</h4>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
