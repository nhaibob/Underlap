"use client";
import React from 'react';
import { PostCard, PostCardProps } from '@/components/core/PostCard';
import { CommentSection } from '@/components/core/CommentSection';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Mock Data chi tiết bài viết
const POST_DETAIL: PostCardProps = {
    author: {
        name: "Chiến Thuật Bóng Đá",
        username: "tactic_daily",
        avatar: "/assets/images/user-1.jpg" // Nếu không có ảnh thật thì sẽ hiện fallback
    },
    content: "**Phân tích Man City vs Arsenal**\n\nTrận đấu đỉnh cao của sự chặt chẽ. Cả hai đội đều chơi khối mid-block cực kỳ kỷ luật. \n\nĐiểm nhấn là cách Arsenal khóa chặt Rodri...",
    timestamp: "2 giờ trước",
    likes: 1540,
    comments: 342,
    tacticData: {
        players: [
            { id: '1', position: 'gk', label: 'GK', pos: { x: 300, y: 350 } },
            { id: '2', position: 'mid', label: 'Rodri', pos: { x: 300, y: 200 } },
            { id: '3', position: 'mid', label: 'Odegaard', pos: { x: 280, y: 180 } },
        ],
        arrows: []
    }
};

export default function PostDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-2xl mx-auto py-6">
      
      {/* Nút Back */}
      <Link href="/feed" className="inline-flex items-center text-text-secondary hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại Feed
      </Link>

      {/* Bài viết chính */}
      <div className="mb-6">
        <PostCard {...POST_DETAIL} />
      </div>

      {/* Phần bình luận */}
      <div className="bg-panel rounded-xl border border-white/5 p-4 md:p-6">
        <h3 className="font-headline font-bold text-lg mb-6">Bình luận</h3>
        <CommentSection postId={params.id} />
      </div>
      
    </div>
  );
}