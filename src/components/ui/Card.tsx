// src/components/ui/Card.tsx
import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils'; // Import hàm cn từ Bước 1

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

// Component Card cha (khung viền)
export const Card = ({ className, children }: CardProps) => (
  <div
    className={cn(
      "bg-panel border border-white/10 rounded-lg overflow-hidden",
      className
    )}
  >
    {children}
  </div>
);

// Component Header (cho ảnh)
export const CardHeader = ({ className, children }: CardProps) => (
  <div className={cn("overflow-hidden", className)}>
    {children}
  </div>
);

// Component Content (cho text)
export const CardContent = ({ className, children }: CardProps) => (
  <div className={cn("p-4 md:p-6", className)}>
    {children}
  </div>
);

// Component Title
export const CardTitle = ({ className, children }: CardProps) => (
  <h3 className={cn("font-headline text-lg font-semibold", className)}>
    {children}
  </h3>
);

// Component Description
export const CardDescription = ({ className, children }: CardProps) => (
  <p className={cn("text-sm text-text-secondary mt-1", className)}>
    {children}
  </p>
);