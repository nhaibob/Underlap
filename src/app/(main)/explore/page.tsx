"use client";
import React from 'react';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';
import { PostCard, PostCardProps } from '@/components/core/PostCard'; // Import component và type

// Dữ liệu mẫu đã được cập nhật theo Interface mới của PostCard
const MOCK_POSTS: PostCardProps[] = [
  {
    author: {
      name: "Chiến Thuật Bóng Đá",
      username: "tactic_daily",
      // Không truyền avatar để test fallback (hiện chữ cái đầu)
    },
    content: "**4-3-3 Pressing Tầm Cao**\n\nPhân tích cách Man City sử dụng sơ đồ 4-3-3 để gây áp lực ngay từ phần sân đối phương. Các tiền vệ cánh bó vào trong để tạo số lượng áp đảo khu trung tuyến.",
    timestamp: "2 giờ trước",
    likes: 156,
    comments: 24,
    // Có thể thêm tacticData nếu muốn hiển thị sa bàn
    tacticData: {
        players: [
            { id: '1', position: 'gk', label: 'GK', pos: { x: 45, y: 200 } },
            { id: '2', position: 'def', label: 'LCB', pos: { x: 120, y: 150 } },
            { id: '3', position: 'def', label: 'RCB', pos: { x: 120, y: 250 } },
        ],
        arrows: []
    }
  },
  {
    author: {
      name: "Mourinho Fan Club",
      username: "the_special_one",
    },
    content: "**Phòng ngự phản công 5-4-1**\n\nSơ đồ khối thấp (Low Block) trứ danh. Chìa khóa nằm ở việc chuyển đổi trạng thái cực nhanh khi đoạt lại bóng.",
    timestamp: "5 giờ trước",
    likes: 892,
    comments: 130
  },
  {
    author: {
      name: "Jürgen Klopp",
      username: "heavy_metal_football",
    },
    content: "**Gegenpressing là gì?**\n\nKhông phải lúc nào cũng chạy. Đó là việc tổ chức vây ráp ngay lập tức khi mất bóng để đoạt lại quyền kiểm soát.",
    timestamp: "1 ngày trước",
    likes: 2400,
    comments: 342
  }
];

export default function ExplorePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header & Search */}
      <div className="space-y-4">
        <h1 className="text-3xl font-headline font-bold text-text-primary">Khám phá</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <Input 
            placeholder="Tìm kiếm chiến thuật, người dùng, bài viết..." 
            className="pl-10 bg-panel border-white/10 focus:border-primary"
          />
        </div>
      </div>

      {/* Tabs / Filter (Có thể thêm sau) */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['Thịnh hành', 'Mới nhất', 'Ngoại hạng Anh', 'La Liga'].map((tag) => (
          <button 
            key={tag}
            className="px-4 py-1.5 rounded-full bg-panel border border-white/10 text-sm text-text-secondary hover:text-primary hover:border-primary/50 transition-colors whitespace-nowrap"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {MOCK_POSTS.map((post, index) => (
          <PostCard 
            key={index} 
            {...post} // Truyền toàn bộ props đã chuẩn hóa
          />
        ))}
      </div>
      
    </div>
  );
}