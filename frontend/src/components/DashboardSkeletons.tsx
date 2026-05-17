'use client';

import React from 'react';
import { Skeleton } from './Skeleton';

export const StatCardSkeleton = () => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
    <Skeleton variant="circular" className="w-12 h-12 mb-4" />
    <Skeleton variant="text" className="w-20 mb-2" />
    <Skeleton variant="text" className="w-32 h-8" />
  </div>
);

export const DashboardHeaderSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-8 mb-10">
    <div className="flex-1 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8">
      <Skeleton variant="rectangular" className="w-24 h-24 rounded-[2rem]" />
      <div className="flex-1">
        <Skeleton variant="text" className="w-48 h-10 mb-2" />
        <Skeleton variant="text" className="w-64 h-4" />
      </div>
    </div>
    <div className="lg:w-96 bg-slate-900/5 p-8 rounded-[3rem] border border-slate-100">
      <Skeleton variant="text" className="w-32 mb-4" />
      <Skeleton variant="rectangular" className="h-3 w-full mb-6 rounded-full" />
      <Skeleton variant="text" className="w-48" />
    </div>
  </div>
);

export const CardGridSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-slate-100">
        <Skeleton variant="circular" className="w-16 h-16 mx-auto mb-4" />
        <Skeleton variant="text" className="w-24 mx-auto mb-2" />
        <Skeleton variant="text" className="w-32 mx-auto mb-6" />
        <Skeleton variant="rectangular" className="w-full h-10 rounded-xl" />
      </div>
    ))}
  </div>
);

export const ActivityFeedSkeleton = () => (
  <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
    <div className="p-8 border-b border-slate-50">
      <Skeleton variant="text" className="w-32 h-6" />
    </div>
    <div className="p-6 space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-2/3" />
          <Skeleton variant="text" className="w-1/4 h-3" />
        </div>
      ))}
    </div>
  </div>
);

export const JobCardSkeleton = () => (
  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
    <div className="flex items-start gap-8">
      <Skeleton variant="rectangular" className="w-24 h-24 rounded-[2rem] shrink-0" />
      <div className="flex-1 space-y-4">
        <Skeleton variant="text" className="w-1/2 h-8" />
        <Skeleton variant="text" className="w-1/3 h-4" />
        <div className="flex gap-4">
          <Skeleton variant="rectangular" className="w-32 h-8 rounded-xl" />
          <Skeleton variant="rectangular" className="w-32 h-8 rounded-xl" />
        </div>
      </div>
    </div>
    <div className="flex gap-4 pt-4 border-t border-slate-50">
      <Skeleton variant="rectangular" className="flex-1 h-12 rounded-2xl" />
      <Skeleton variant="rectangular" className="w-24 h-12 rounded-2xl" />
    </div>
  </div>
);

export const AlumniCardSkeleton = () => (
  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
    <Skeleton variant="circular" className="w-24 h-24 rounded-[2rem]" />
    <div className="space-y-4">
      <Skeleton variant="text" className="w-3/4 h-6" />
      <Skeleton variant="text" className="w-1/2 h-4" />
    </div>
    <div className="flex gap-2">
      <Skeleton variant="rectangular" className="w-16 h-6 rounded-lg" />
      <Skeleton variant="rectangular" className="w-16 h-6 rounded-lg" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Skeleton variant="rectangular" className="h-12 rounded-2xl" />
      <Skeleton variant="rectangular" className="h-12 rounded-2xl" />
    </div>
  </div>
);
