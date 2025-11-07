// src/app/(auth)/layout.tsx
import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Nền tối bao phủ toàn bộ màn hình
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      
      {/* Nút trở về trang chủ */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 text-text-secondary hover:text-primary transition-colors flex items-center gap-2"
      >
        <Home className="w-5 h-5" />
        <span className="hidden sm:inline">Trang chủ</span>
      </Link>

      {/* Container chính giữa */}
      <div className="w-full max-w-sm p-8 bg-panel rounded-2xl shadow-2xl border border-white/10">
        {children}
      </div>
      
    </div>
  );
}