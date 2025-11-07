// src/components/features/chat/ChatMessage.tsx
import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const ChatMessage = () => {
  return (
    <div className="flex gap-3 py-3 px-4 hover:bg-panel">
      {/* 1. Avatar */}
      <Avatar alt="User" src="" className="w-10 h-10" />

      {/* 2. Nội dung (Tên + Tin nhắn) */}
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <Link href="/profile/user" className="font-semibold text-sm text-text-primary hover:underline">
            Một người dùng
          </Link>
          <p className="text-xs text-text-secondary">Hôm nay lúc 6:30 PM</p>
        </div>
        <p className="text-sm text-text-primary mt-1">
          Tin nhắn chat mẫu. Chiến thuật 4-3-3 hôm qua rất tuyệt!
        </p>
      </div>
    </div>
  );
};