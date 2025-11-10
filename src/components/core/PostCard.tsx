// src/components/core/PostCard.tsx
"use client";
import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { ReactionBar } from '@/components/core/ReactionBar'; // Import ReactionBar
import { TacticBoard } from '@/components/features/tactic-board/TacticBoard';
import { cn } from '@/lib/utils';

// Khai báo Prop Types cho PostCard
export interface PostCardProps {
  postTitle: string;
  postDescription: string;
  authorUsername: string;
  stats: { likes: number; comments: number; forks: number; }; // Stats object
  // Thêm các props khác nếu cần (ví dụ: avatarUrl)
}

export const PostCard = ({ postTitle, postDescription, authorUsername, stats }: PostCardProps) => {
  return (
    <Card className="mb-6">
      <CardContent>

        {/* 1. Header của Card (Avatar & Tên) */}
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="" alt={authorUsername} />
          <AvatarFallback>
             {authorUsername ? authorUsername.substring(0, 2).toUpperCase() : '??'}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link href={`/profile/${authorUsername}`} className="font-headline font-semibold text-text-primary hover:text-primary">
              {authorUsername}
            </Link>
            <p className="text-xs text-text-secondary">@user • vừa đăng</p>
          </div>
        </div>

        {/* 2. Nội dung text của Post */}
        <div className="mt-4 text-text-primary">
          <Link href="/post/123" className="hover:underline">
            <h3 className="font-headline text-xl font-semibold mb-2">
              {postTitle}
            </h3>
            <p className="text-sm text-text-secondary">
              {postDescription}
            </p>
          </Link>
        </div>

        {/* 3. Thumbnail Sơ đồ */}
        <div className="mt-4">
          <TacticBoard variant="thumbnail" />
        </div>

        {/* 4. Thanh tương tác (Sửa lỗi TS2322) */}
        {/* LỖI ĐÃ SỬA: ReactionBar cần được cập nhật để chấp nhận props */}
        <ReactionBar stats={stats} />

      </CardContent>
    </Card>
  );
};