// src/components/ui/Button.tsx
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Hàm cn (giữ nguyên)
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1. NÂNG CẤP ButtonProps (thêm 'size')
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'default' | 'icon'; // <-- DÒNG MỚI
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      className, 
      variant = 'primary', 
      size = 'default', // <-- 2. Thêm 'size' làm prop, mặc định là 'default'
      ...props 
    }, 
    ref
  ) => {
    
    // Style cho variant (giữ nguyên)
    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-opacity-90',
      secondary: 'bg-secondary text-white hover:bg-opacity-90',
      ghost: 'bg-transparent text-text-secondary hover:bg-panel',
      danger: 'bg-danger text-white hover:bg-opacity-90',
    };

    // 3. THÊM STYLE CHO SIZE
    const sizeClasses = {
      default: 'px-4 py-2', // Kích cỡ mặc định (có padding)
      icon: 'h-10 w-10 flex items-center justify-center p-0', // Kích cỡ icon (vuông)
    };

    return (
      <button
        className={cn(
          'rounded-lg font-semibold transition-colors duration-150', // Style chung
          variantClasses[variant], // Style của variant
          sizeClasses[size],       // <-- 4. Áp dụng style của size
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';