'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { CreditCard, QrCode, Smartphone, Loader2, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

function PaymentContent() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan') || 'free';
  const router = useRouter();
  
  const [method, setMethod] = useState<'upi' | 'qr' | 'card'>('upi');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Payment Form State
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const plans = {
    free: { name: 'Free', price: 0, amount: 0 },
    pro: { name: 'Pro', price: 999, amount: 999 },
    premium: { name: 'Premium', price: 1999, amount: 1999 }
  };

  const selectedPlan = plans[planParam as keyof typeof plans] || plans.free;

  useEffect(() => {
    if (selectedPlan.amount === 0) {
      handlePaymentSuccess();
    }
  }, []);

  const handlePaymentSuccess = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api') + '/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ plan: planParam, amount: selectedPlan.amount, method })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/student'); // Or redirect based on user role
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === 'upi' && !upiId) return setError('Please enter a valid UPI ID');
    if (method === 'card' && (!cardNumber || !expiry || !cvv)) return setError('Please fill all card details');
    
    // Simulate payment delay
    setLoading(true);
    setTimeout(() => {
      handlePaymentSuccess();
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-16 rounded-[3rem] shadow-2xl text-center max-w-md w-full border border-slate-100">
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Payment Successful!</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8">Your {selectedPlan.name} Plan has been activated.</p>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest animate-pulse">Redirecting to Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
        
        {/* Order Summary */}
        <div className="md:w-1/3">
          <Link href="/#pricing" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Plans
          </Link>
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/20 rounded-full blur-[50px] -mr-20 -mt-20"></div>
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-8">Order Summary</h2>
            <div className="mb-8">
              <h3 className="text-3xl font-black mb-2">{selectedPlan.name} Plan</h3>
              <p className="text-slate-400 font-medium">Billed automatically every month.</p>
            </div>
            <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-6">
              <span className="text-slate-400 font-medium">Subtotal</span>
              <span className="text-xl font-black">₹{selectedPlan.amount}</span>
            </div>
            <div className="flex justify-between items-end mb-8">
              <span className="text-slate-400 font-medium">Total (incl. GST)</span>
              <span className="text-4xl font-black">₹{selectedPlan.amount}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-400/10 p-4 rounded-2xl">
              <ShieldCheck className="w-4 h-4" /> Secure 256-bit SSL Encryption
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="md:w-2/3 bg-white p-10 md:p-12 rounded-[3rem] shadow-sm border border-slate-100">
          <h2 className="text-3xl font-black tracking-tight mb-8">Select Payment Method</h2>
          
          <div className="flex gap-4 mb-10 overflow-x-auto pb-4">
            <button 
              onClick={() => setMethod('upi')}
              className={`flex-1 min-w-[120px] p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${method === 'upi' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}
            >
              <Smartphone className={`w-8 h-8 ${method === 'upi' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="font-black text-xs uppercase tracking-widest">UPI</span>
            </button>
            <button 
              onClick={() => setMethod('card')}
              className={`flex-1 min-w-[120px] p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${method === 'card' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}
            >
              <CreditCard className={`w-8 h-8 ${method === 'card' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="font-black text-xs uppercase tracking-widest">Card</span>
            </button>
            <button 
              onClick={() => setMethod('qr')}
              className={`flex-1 min-w-[120px] p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${method === 'qr' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}
            >
              <QrCode className={`w-8 h-8 ${method === 'qr' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="font-black text-xs uppercase tracking-widest">QR Code</span>
            </button>
          </div>

          <form onSubmit={processPayment} className="space-y-8">
            {method === 'upi' && (
              <div className="space-y-4 animate-fade-in">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">UPI ID (GPay / PhonePe / Paytm)</label>
                <input 
                  type="text" 
                  placeholder="name@okaxis"
                  className="w-full px-8 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 mb-3">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-8 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold tracking-widest"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 mb-3">Expiry (MM/YY)</label>
                    <input 
                      type="text" 
                      placeholder="12/26"
                      className="w-full px-8 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 mb-3">CVV</label>
                    <input 
                      type="password" 
                      placeholder="•••"
                      maxLength={3}
                      className="w-full px-8 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold tracking-widest"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'qr' && (
              <div className="flex flex-col items-center justify-center py-8 animate-fade-in text-center space-y-6">
                <div className="p-4 bg-white border border-slate-100 shadow-xl rounded-[2rem]">
                  {/* Mock QR Code Image */}
                  <div className="w-48 h-48 bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white p-4">
                     <QrCode className="w-24 h-24 mb-2" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-center">Scan with any UPI App</p>
                  </div>
                </div>
                <p className="text-slate-500 font-medium">Scan the QR code to pay ₹{selectedPlan.amount}</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div> {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-50 mt-8"
            >
              {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : `Pay ₹${selectedPlan.amount} Securely`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 text-indigo-600 animate-spin" /></div>}>
      <PaymentContent />
    </React.Suspense>
  );
}
