'use client';

import React, { Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ChatSystem from '@/components/ChatSystem';

export default function AlumniChatPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Chat...</div>}>
          <ChatSystem />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
