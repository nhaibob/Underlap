// src/app/(main)/explore/page.tsx
import React from 'react';
import { PostCard } from '@/components/core/PostCard'; 
import { TagButton } from '@/components/ui/TagButton'; 
import { Input } from '@/components/ui/Input'; 
import { Search } from 'lucide-react';
import { PostCardProps } from '@/components/core/PostCard'; // Import type

// Dữ liệu mẫu (placeholder)
const MOCK_STATS = { likes: 12, comments: 3, forks: 1 };
const MOCK_POSTS: PostCardProps[] = [
    { 
        postTitle: "4-3-3 Pressing Sâu", 
        postDescription: "Phân tích cách Man City sử dụng 4-3-3 để ép sân từ phần sân nhà.", 
        authorUsername: "TacticianX", 
        stats: MOCK_STATS 
    },
    { 
        postTitle: "5-3-2: Phản công Cực đại", 
        postDescription: "Sơ đồ phòng ngự phản công hiệu quả cao với 3 CB và 2 tiền đạo cắm.", 
        authorUsername: "Coach_A", 
        stats: MOCK_STATS 
    },
    { 
        postTitle: "Chạy chỗ khu vực 14", 
        postDescription: "Bài tập di chuyển không bóng cho tiền vệ tấn công (AM).", 
        authorUsername: "HuySon", 
        stats: MOCK_STATS 
    },
    { 
        postTitle: "Cân bằng 3-4-3", 
        postDescription: "Sự linh hoạt trong tấn công và phòng ngự khi sử dụng 3 hậu vệ.", 
        authorUsername: "Tactic_Pro", 
        stats: MOCK_STATS 
    },
    { 
        postTitle: "Vẽ đường cong hiệu quả", 
        postDescription: "Hướng dẫn cách sử dụng công cụ vẽ mũi tên cong.", 
        authorUsername: "Design_User", 
        stats: MOCK_STATS 
    },
    { 
        postTitle: "Chiến thuật E-Sports FIFA", 
        postDescription: "Khác biệt giữa chiến thuật thực và ảo.", 
        authorUsername: "GamerZ", 
        stats: MOCK_STATS 
    },
];

export default function ExplorePage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="font-headline text-2xl font-bold mb-6">Khám phá</h1>

      {/* 1. Thanh tìm kiếm */}
      <div className="relative mb-8">
        <Input
          placeholder="Tìm chiến thuật theo tag, vị trí, đội hình..."
          className="pl-10 h-12 text-base"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
      </div>

      {/* 2. Các thẻ (Tags) thịnh hành */}
      <section className="mb-10">
        <h2 className="font-headline text-xl font-semibold mb-4">Thẻ thịnh hành</h2>
        <div className="flex flex-wrap gap-3">
          <TagButton>4-3-3</TagButton>
          <TagButton>pressing</TagButton>
          <TagButton>counter-attack</TagButton>
          <TagButton>low-block</TagButton>
          <TagButton>4-2-3-1</TagButton>
        </div>
      </section>

      {/* 3. Các chiến thuật gợi ý */}
      <section>
        <h2 className="font-headline text-xl font-semibold mb-4">Chiến thuật gợi ý</h2>
        
        {/* Tái sử dụng PostCard ở dạng lưới - FIX LỖI THIẾU PROPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_POSTS.map((post, index) => (
            <PostCard 
              key={index} 
              postTitle={post.postTitle}
              postDescription={post.postDescription}
              authorUsername={post.authorUsername}
              stats={post.stats}
            />
          ))}
        </div>
      </section>
      
    </div>
  );
}