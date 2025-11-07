// src/components/core/Comment.tsx
import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';

export const Comment = () => {
  return (
    <div className="flex gap-3 py-4 border-b border-panel">
      {/* 1. Avatar (nhỏ hơn) */}
      <Avatar alt="User" src="" className="w-8 h-8" /> 

      {/* 2. Nội dung comment */}
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <Link href="/profile/user" className="font-semibold text-sm text-text-primary hover:underline">
            Một người dùng
          </Link>
          <p className="text-xs text-text-secondary">@username • 5 phút trước</p>
        </div>
        <p className="text-sm text-text-primary mt-1">
          Một bình luận rất hay về chiến thuật này. Tôi nghĩ bạn nên thử...
        </p>
        <div className="flex gap-4 mt-2">
          <button className="text-xs font-medium text-text-secondary hover:text-text-primary">Thích</button>
          <button className="text-xs font-medium text-text-secondary hover:text-text-primary">Trả lời</button>
        </div>
      </div>
    </div>
  );
};