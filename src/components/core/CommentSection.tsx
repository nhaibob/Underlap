// src/components/core/CommentSection.tsx
import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Comment } from './Comment'; // Import component ở Bước 1

export const CommentSection = () => {
  return (
    <div className="mt-8">
      <h2 className="font-headline text-xl font-bold mb-4">
        Bình luận (3)
      </h2>

      {/* 1. Ô nhập bình luận (Composer) */}
      <div className="flex gap-3">
        <Avatar alt="My Avatar" src="" />
        <div className="flex-1">
          <textarea
            className="w-full rounded-lg border border-panel bg-background p-3 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="Viết bình luận của bạn..."
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <Button variant="primary">Gửi</Button>
          </div>
        </div>
      </div>

      {/* 2. Danh sách bình luận */}
      <div className="mt-6">
        <Comment />
        <Comment />
        <Comment />
      </div>
    </div>
  );
};