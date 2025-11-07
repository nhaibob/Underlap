// src/app/(main)/community/page.tsx
import React from 'react';
import { ChannelList } from '@/components/features/chat/ChannelList';
import { MemberList } from '@/components/features/chat/MemberList';
import { ChatMessage } from '@/components/features/chat/ChatMessage';
import { Input } from '@/components/ui/Input'; // Tái sử dụng Input

export default function CommunityPage() {
  return (
    // Chúng ta KHÔNG dùng padding (p-4) của layout feed
    // mà dùng layout full-height
    <div className="flex h-[calc(100vh-4rem)]"> {/* 100% chiều cao trừ Header */}
      
      {/* Cột 1: Channel List */}
      <ChannelList />

      {/* Cột 2: Cửa sổ Chat (chính) */}
      <div className="flex-1 flex flex-col bg-background border-x border-panel">
        
        {/* Header của Chat (tạm thời) */}
        <div className="p-4 border-b border-panel">
          <h2 className="font-headline text-xl font-bold"># general</h2>
        </div>

        {/* Danh sách tin nhắn (Cho phép cuộn) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <ChatMessage />
          <ChatMessage />
          <ChatMessage />
        </div>

        {/* Ô nhập liệu (Composer) */}
        <div className="p-4 border-t border-panel">
          <Input placeholder="Nhắn tin trong #general..." />
        </div>
      </div>

      {/* Cột 3: Member List */}
      <MemberList />

    </div>
  );
}