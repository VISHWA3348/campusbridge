'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ChatSystem from '@/components/ChatSystem';

export default function StudentChatPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <ChatSystem />
      </div>
    </DashboardLayout>
  );
}
