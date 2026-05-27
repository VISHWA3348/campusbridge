'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Sliders, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchFeatures as fetchFeaturesApi, toggleFeature as toggleFeatureApi } from '@/lib/api';

export default function FeaturesPage() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatures = async () => {
    try {
      const data = await fetchFeaturesApi();
      setFeatures(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching features:', error);
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleToggleFeature = async (id: number) => {
    try {
      await toggleFeatureApi(id);
      fetchFeatures();
    } catch (error) {
      console.error('Error toggling feature:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black tracking-tight mb-4 text-slate-900">Platform Feature Control</h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">
            Centrally manage the availability of core platform modules across all institutional deployments.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Modules...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={feature.id} 
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${feature.enabled ? 'bg-emerald-50' : 'bg-red-50'} rounded-full blur-[60px] -mr-16 -mt-16 transition-colors`}></div>
                
                <div className="flex flex-col h-full relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${feature.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      <Sliders className="w-8 h-8" />
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${feature.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {feature.enabled ? 'Active' : 'Disabled'}
                    </div>
                  </div>
                  
                  <div className="flex-1 mb-8">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{feature.featureName}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      Global toggle for the {feature.featureName}. When disabled, all related UI components and API endpoints will be restricted.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleToggleFeature(feature.id)}
                    className={`w-full py-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg ${
                      feature.enabled 
                        ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' 
                        : 'bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm'
                    }`}
                  >
                    {feature.enabled ? (
                      <><XCircle className="w-5 h-5" /> Deactivate Module</>
                    ) : (
                      <><CheckCircle2 className="w-5 h-5" /> Activate Module</>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
