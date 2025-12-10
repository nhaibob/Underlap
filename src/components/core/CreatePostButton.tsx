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
      className="w-full p-4 rounded-xl bg-panel border border-white/10 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
          <Plus className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-muted-foreground group-hover:text-foreground transition-colors">
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
