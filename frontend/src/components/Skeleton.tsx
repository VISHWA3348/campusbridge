'use client';

import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({ 
  variant = 'rectangular', 
  className = '', 
  width, 
  height 
}: SkeletonProps) => {
  const baseClasses = "animate-pulse bg-slate-200";
  const variantClasses = {
    text: "h-3 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg"
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};
