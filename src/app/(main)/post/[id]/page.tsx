// src/app/(main)/post/[id]/page.tsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { ReactionBar } from '@/components/core/ReactionBar';
import { Player, Arrow } from '@/components/features/tactic-board/TacticBoard'; 
import { CommentSection } from '@/components/core/CommentSection';
import Link from 'next/link';

// === IMPORT COMPONENT WRAPPER MỚI (TẠO TRÊN) ===
import { TacticBoardDisplay } from '@/components/core/TacticBoardDisplay'; 

// Dữ liệu tĩnh (dummy data)
const DUMMY_PLAYERS: Player[] = [
    { id: 'p1', position: 'CB', label: 'CB', pos: { x: 250, y: 200 } },
    { id: 'p2', position: 'CM', label: 'CM', pos: { x: 150, y: 100 } },
];
const DUMMY_ARROWS: Arrow[] = [
    { id: 'a1', from: { x: 150, y: 100 }, to: { x: 300, y: 50 }, color: '#6C5CE7', style: 'solid', type: 'straight' },
];
const MOCK_POST_STATS = { likes: 75, comments: 12, forks: 9 };

// SỬA Ở ĐÂY: Thêm 'params' vào props để nhận 'id'
export default function PostDetailPage({ params }: { params: { id: string } }) {
  
  // SỬA Ở ĐÂY: Định nghĩa 'postId' từ 'params'
  const postId = params.id;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto"> 
      {/* 1. Header (Tên tác giả) */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar>
            <AvatarImage src="" alt="Huy Son" />
            <AvatarFallback>HS</AvatarFallback>
        </Avatar>
        <div>
          <Link href="/profile/huyson" className="font-headline font-semibold text-text-primary hover:text-primary">
            Huy Sơn
          </Link>
          <p className="text-xs text-text-secondary">@huyson • 2 giờ trước</p>
        </div>
      </div>

      {/* 2. Tiêu đề & Mô tả */}
      <h1 className="font-headline text-3xl font-bold mb-2">
        Tấn công cánh phải — 4-3-3 (Post ID: {postId})
      </h1>
      <p className="text-text-secondary mb-4">
        Đây là mô phỏng cách 4-3-3 của tôi pressing tầm cao và tận dụng 
        khoảng trống phía sau hậu vệ cánh đối phương. Tập trung vào việc 
        luân chuyển bóng nhanh...
      </p>

      {/* 3. Tactic Board (SỬ DỤNG COMPONENT WRAPPER MỚI) */}
      <TacticBoardDisplay 
        players={DUMMY_PLAYERS}
        arrows={DUMMY_ARROWS}
      /> 
      
      {/* 4. Thanh tương tác */}
      <div className="mt-4">
        <ReactionBar stats={MOCK_POST_STATS} /> 
      </div>

      {/* 5. Khu vực bình luận */}
      {/* SỬA Ở ĐÂY: Dòng này bây giờ đã hợp lệ vì 'postId' đã được định nghĩa */}
      <CommentSection contextId={postId} />
      
    </div>
  );
}