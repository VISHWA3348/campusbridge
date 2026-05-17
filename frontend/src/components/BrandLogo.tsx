'use client';

import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  textColor?: string;
  iconOnly?: boolean;
}

export default function BrandLogo({ 
  className = "", 
  size = 'md', 
  withText = true, 
  textColor = "text-slate-900",
  iconOnly = false
}: BrandLogoProps) {
  const sizes = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
    xl: "h-14"
  };

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${iconSizes[size]} bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 flex-shrink-0 transition-transform hover:scale-105 active:scale-95`}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-2/3 h-2/3 text-white"
        >
          {/* Bridge Arch */}
          <path 
            d="M4 16C4 16 6 10 12 10C18 10 20 16 20 16" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round"
          />
          {/* Connection Lines/Suspension */}
          <path d="M8 12V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 10V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 12V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Bridge Deck */}
          <path d="M3 16H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Network Dots */}
          <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
          <circle cx="6" cy="11" r="1" fill="currentColor" fillOpacity="0.6"/>
          <circle cx="18" cy="11" r="1" fill="currentColor" fillOpacity="0.6"/>
        </svg>
      </div>
      
      {!iconOnly && withText && (
        <span className={`${textSizes[size]} font-black tracking-tight uppercase ${textColor}`}>
          Campus<span className="text-indigo-600">Bridge</span>
        </span>
      )}
    </div>
  );
}
