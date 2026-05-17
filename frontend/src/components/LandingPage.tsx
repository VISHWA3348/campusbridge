'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';
import ContactForm from './ContactForm';
import BackToTop from './BackToTop';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Target,
  MessageSquare,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Building2,
  TrendingUp,
  Zap,
  Award,
  Sparkles,
  ChevronRight,
  Star,
  CheckCircle2,
  Globe,
  Lock,
  PieChart,
  UserCheck,
  MapPin,
  Phone,
  Mail,
  HelpCircle,
  Plus,
  Minus,
  AlertCircle,
  Loader2
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const NewsletterForm = () => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("access_key", "62d7840c-9149-4b53-b55c-3eb7928c52fa");
    formData.append("email", email);
    formData.append("subject", "New Newsletter Subscription");
    formData.append("from_name", "CampusBridge Newsletter");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setStatus({
          type: 'success',
          text: 'Successfully subscribed to CampusBridge updates.'
        });
        setEmail('');
        setTimeout(() => setStatus(null), 5000);
      } else {
        throw new Error('Subscription failed');
      }
    } catch (err) {
      setStatus({
        type: 'error',
        text: 'Failed to subscribe. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-4">
        <input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
        />
        <button
          disabled={loading}
          className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-sm hover:bg-indigo-600 hover:text-white transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing...</>
          ) : (
            'Subscribe Now'
          )}
        </button>
      </form>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`mt-6 p-4 rounded-2xl flex items-center gap-3 text-left ${status.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="text-sm font-bold">{status.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function LandingPage() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      <Navbar />
      <BackToTop />

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" /> Empowering the Next Generation
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 text-slate-900"
          >
            The Ultimate Network for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient">Professional Success</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-14 font-medium leading-relaxed"
          >
            Join a verified community of students and alumni. Secure referrals, get personalized mentorship, and track institutional placements with ease.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <Link href="/signup" className="w-full md:w-auto bg-slate-900 text-white px-12 py-6 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 group">
              Get Started <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link href="/login" className="w-full md:w-auto px-12 py-6 border-2 border-slate-100 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center">
              Login to Portal
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-20 border-y border-slate-100 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-12">Trusted by leading institutions & companies</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            {['Tech University', 'Global Tech', 'Innovation Hub', 'Elite College', 'Future Soft', 'Vertex Labs'].map((name, i) => (
              <div key={i} className="flex items-center gap-2 font-black text-xl tracking-tighter text-slate-900">
                <Building2 className="w-6 h-6" /> {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { label: 'Students Registered', val: '25,000+', icon: <Users />, color: 'blue', desc: 'Active learners building their futures' },
            { label: 'Verified Alumni', val: '10,000+', icon: <UserCheck />, color: 'indigo', desc: 'Industry experts giving back' },
            { label: 'Placements Tracked', val: '5,000+', icon: <Award />, color: 'green', desc: 'Successful career transitions' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group p-12 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all"
            >
              <div className={`w-16 h-16 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                {stat.icon}
              </div>
              <h3 className="text-6xl font-black text-slate-900 mb-3 tracking-tighter">{stat.val}</h3>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{stat.label}</p>
              <p className="text-slate-500 font-medium text-sm">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-32 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] -mr-64 -mt-64"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-8 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> Why Choose Our Platform
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 leading-[0.9]">Built for the <br /><span className="text-indigo-500">Modern Institution.</span></h2>
              <div className="space-y-10">
                {[
                  { title: 'Verified Professional Network', desc: 'Every alumni is verified by their institution, ensuring real connections and authentic referrals.', icon: <Lock /> },
                  { title: 'Real-time Placement Tracking', desc: 'Institutions get a bird-eye view of every student career outcome with advanced analytics.', icon: <PieChart /> },
                  { title: 'Seamless Communication', desc: 'Secure 1:1 chat system for mentorship and direct referral requests.', icon: <MessageSquare /> }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-black mb-3">{item.title}</h4>
                      <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[4rem] p-1 shadow-2xl">
                <div className="w-full h-full bg-slate-900 rounded-[3.8rem] flex items-center justify-center p-12 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Users className="w-64 h-64 text-indigo-600/20 absolute -bottom-10 -right-10 group-hover:scale-110 transition-transform" />
                  <div className="relative z-10 space-y-6">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center font-black">JD</div>
                        <div>
                          <p className="font-black text-sm text-white">John Doe</p>
                          <p className="text-xs text-slate-400">Software Engineer @ Google</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 font-medium italic">"Just referred 3 students from my alma mater today!"</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm translate-x-12">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center font-black">AS</div>
                        <div>
                          <p className="font-black text-sm text-white">Alice Smith</p>
                          <p className="text-xs text-slate-400">Tech Recruiter</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 font-medium italic">"The placement tracking is a game changer for us."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 text-center">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Simple 4-Step Process</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg font-medium">Your journey from student to a verified professional starts here.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 hidden md:block"></div>
            {[
              { title: 'Easy Signup', desc: 'Register as a student or alumni and verify your institutional ID.', icon: '01' },
              { title: 'Connect', desc: 'Browse and connect with a verified network of alumni professionals.', icon: '02' },
              { title: 'Request Referral', desc: 'Request direct referrals or career guidance via 1:1 mentorship.', icon: '03' },
              { title: 'Get Placed', desc: 'Land your dream job and report your success to help others.', icon: '04' }
            ].map((step, i) => (
              <div key={i} className="relative z-10 group">
                <div className="w-16 h-16 bg-white border-4 border-slate-100 rounded-2xl flex items-center justify-center text-xl font-black text-slate-900 mb-8 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-100 shadow-xl shadow-slate-100">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 text-center">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Success Stories</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg font-medium">Hear from the people who have transformed their careers using our platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { name: 'Sarah Miller', role: 'Student @ Tech University', text: 'This platform helped me get referred into my dream company. The connection with alumni is invaluable.', rating: 5 },
              { name: 'David Chen', role: 'Alumni @ Google', text: 'I love giving back to my college. Being able to refer talented students directly is so rewarding.', rating: 5 },
              { name: 'Prof. Wilson', role: 'College Admin', text: 'The placement tracking analytics have given us insights we never had before. Highly recommended.', rating: 5 },
            ].map((t, i) => (
              <div key={i} className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all">
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-lg text-slate-700 font-medium leading-relaxed mb-8 italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="text-5xl font-black tracking-tighter mb-6">Frequently Asked Questions</h2>
            <p className="text-slate-500 font-medium">Everything you need to know about our platform and process.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Is the platform really free for students?', a: 'Yes, basic access for students is completely free. You can browse alumni and request referrals without any charge.' },
              { q: 'How do you verify alumni profiles?', a: 'We use a dual-verification process involving institutional ID checks and college admin approval to ensure every profile is authentic.' },
              { q: 'Can institutions track placements in real-time?', a: 'Absolutely. The College Admin dashboard provides real-time analytics and detailed reports on all student placements.' },
              { q: 'What kind of mentorship is available?', a: 'Students can request 1:1 chat sessions with alumni for career guidance, resume reviews, and industry insights.' }
            ].map((faq, i) => (
              <div key={i} className="border border-slate-100 rounded-3xl overflow-hidden bg-white hover:border-indigo-100 transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                >
                  <span className="font-black text-slate-900">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openFaq === i ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {openFaq === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-8 pb-6 animate-fade-in">
                    <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-8 shadow-sm">
                <Mail className="w-3.5 h-3.5" /> Get In Touch
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 leading-[0.9]">Let's build the <br /><span className="text-indigo-600">Future Together.</span></h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12 max-w-lg">
                Have questions or want to learn more about how we can help your institution? Our team is here to support you.
              </p>

              <div className="space-y-8">
                {[
                  { icon: <MapPin />, title: 'Our Office', content: '2/124, Nayandahalli, Bangalore, India' },
                  { icon: <Phone />, title: 'Phone Support', content: '+91 9113063448' },
                  { icon: <Mail />, title: 'Email Us', content: 'zinointech@gmail.com' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-center">
                    <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.title}</h4>
                      <p className="font-black text-slate-900">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-4xl font-black text-white mb-6">Stay updated with our newsletter</h3>
            <p className="text-slate-400 font-medium mb-10">Get the latest news on career trends, mentorship tips, and platform updates.</p>

            <NewsletterForm />

            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-6">No spam, just quality career insights. Ever.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
