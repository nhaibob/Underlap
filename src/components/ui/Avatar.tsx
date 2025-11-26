"use client"; // [QUAN TRỌNG NHẤT] Dòng này bắt buộc phải có ở đầu file

import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
}

export const Avatar = ({ 
  src, 
  alt = "User", 
  className = "", 
  size = 'md', 
  children 
}: AvatarProps) => {
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-32 h-32"
  };

  const baseClasses = "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10 border border-white/10";
  const sizeClass = sizeClasses[size as keyof typeof sizeClasses] || "";

  if (src) {
     return (
        <div className={cn(baseClasses, sizeClass, className)}>
           <img 
             src={src} 
             alt={alt} 
             className="aspect-square h-full w-full object-cover" 
             onError={(e) => {
               (e.target as HTMLElement).style.display = 'none';
             }}
           />
           {/* Fallback text hiển thị khi ảnh lỗi/ẩn */}
           <div className="absolute inset-0 flex items-center justify-center bg-panel text-text-secondary font-bold select-none -z-10">
              {alt.charAt(0).toUpperCase()}
           </div>
        </div>
     )
  }

  return (
    <div className={cn(baseClasses, sizeClass, className)}>
      {children}
    </div>
  );
};

export const AvatarImage = ({ src, alt, className }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={cn("aspect-square h-full w-full object-cover", className)} 
        onError={(e) => (e.target as HTMLElement).style.display = 'none'}
      />
    );
}

export const AvatarFallback = ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-panel text-xs font-medium text-text-secondary", className)}>
            {children}
        </div>
    )
}