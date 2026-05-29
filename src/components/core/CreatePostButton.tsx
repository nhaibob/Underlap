// src/components/core/CreatePostButton.tsx
'use client';

import React from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { PenSquare, Plus } from 'lucide-react';

export const CreatePostButton = () => {
  const { openCreateModal } = useUIStore();

  return (
    <button 
      onClick={openCreateModal}
      className="w-full p-5 rounded-2xl bg-gradient-to-br from-[#1a1a1a]/80 to-[#050505]/80 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-500 group cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:-translate-y-1 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors shadow-inner">
          <Plus className="w-6 h-6 text-copper" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-muted-foreground group-hover:text-white font-medium transition-colors">
            Tạo chiến thuật mới...
          </p>
          <p className="text-xs text-muted-foreground/60">
            Nhấn để mở bảng chiến thuật
          </p>
        </div>
        <PenSquare className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
};
