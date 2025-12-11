"use client";
import React from 'react';
import { cn } from '@/lib/utils';

export interface BallTokenProps {
  className?: string;
}

export const BallToken = ({ className }: BallTokenProps) => {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg select-none",
        "bg-gradient-to-br from-white via-gray-100 to-gray-300",
        "border-2 border-gray-400",
        className
      )}
    >
      {/* Soccer ball pattern - Pentagon shapes */}
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base circle */}
        <circle cx="12" cy="12" r="11" fill="white" stroke="#555" strokeWidth="0.5"/>
        
        {/* Pentagon pattern - black patches */}
        <path
          d="M12 4 L14.5 8 L12 10 L9.5 8 Z"
          fill="#333"
        />
        <path
          d="M19 9 L18 13 L15 13 L14 10 L16.5 7.5 Z"
          fill="#333"
        />
        <path
          d="M5 9 L7.5 7.5 L10 10 L9 13 L6 13 Z"
          fill="#333"
        />
        <path
          d="M8 17 L9 14 L12 15 L15 14 L16 17 L12 20 Z"
          fill="#333"
        />
        
        {/* Highlight */}
        <circle cx="8" cy="6" r="2" fill="white" opacity="0.6"/>
      </svg>
      
      {/* Subtle shadow glow */}
      <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none" />
    </div>
  );
};
