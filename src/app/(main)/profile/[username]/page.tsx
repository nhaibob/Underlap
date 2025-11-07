// src/app/(main)/profile/[username]/page.tsx
import React from 'react';
import { ProfileHeader } from '@/components/features/profile/ProfileHeader';
import { PostCard } from '@/components/core/PostCard'; 
import { PostCardProps } from '@/components/core/PostCard'; // Import type
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/Tabs'; 

// Dữ liệu mẫu (placeholder)
const USER_MOCK_STATS = { likes: 50, comments: 5, forks: 8 };
const USER_POSTS: PostCardProps[] = [
    { 
        postTitle: "Sơ đồ 3-5-2 (Cá nhân hóa)", 
        postDescription: "Phân tích vai trò của LWB và RWB trong hệ thống 3 hậu vệ.", 
        authorUsername: "HuySon", 
        stats: USER_MOCK_STATS 
    },
    { 
        postTitle: "Bài tập chuyền ngắn", 
        postDescription: "Bài tập rèn luyện cho các tiền vệ trung tâm (CM).", 
        authorUsername: "HuySon", 
        stats: USER_MOCK_STATS 
    },
    { 
        postTitle: "Phân tích Real Madrid", 
        postDescription: "Cách họ kiểm soát tuyến giữa bằng việc chuyển đổi vai trò.", 
        authorUsername: "HuySon", 
        stats: USER_MOCK_STATS 
    },
    { 
        postTitle: "Tuyển chọn DM hoàn hảo", 
        postDescription: "Những tiêu chí quan trọng khi lựa chọn tiền vệ phòng ngự.", 
        authorUsername: "HuySon", 
        stats: USER_MOCK_STATS 
    },
];

export default function ProfilePage() {
  return (
    <div>
      {/* 1. Header của Profile */}
      <ProfileHeader />

      {/* 2. Phần Tab nội dung */}
      <div className="container mx-auto px-4 mt-8">
        <Tabs defaultValue="posts">
          
          <TabsList>
            <TabsTrigger value="posts">Bài đăng</TabsTrigger>
            <TabsTrigger value="saved">Đã lưu</TabsTrigger>
            <TabsTrigger value="forks">Forks</TabsTrigger>
          </TabsList>

          {/* Tab Content 1: Các bài đăng - LỖI ĐÃ SỬA */}
          <TabsContent value="posts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* === FIX LỖI: CHỈ DÙNG MAP (KHÔNG DÙNG POSTCARD TĨNH) === */}
              {USER_POSTS.map((post, index) => (
                <PostCard 
                  key={index} 
                  postTitle={post.postTitle}
                  postDescription={post.postDescription}
                  authorUsername={post.authorUsername}
                  stats={post.stats}
                />
              ))}
              {/* ĐÃ XÓA 4 DÒNG <PostCard /> TĨNH GÂY LỖI */}
            </div>
          </TabsContent>

          {/* Tab Content 2: Đã lưu (Placeholder) */}
          <TabsContent value="saved">
            <p className="mt-6 text-text-secondary">Chưa có bài đăng nào được lưu.</p>
          </TabsContent>

          {/* Tab Content 3: Forks (Placeholder) */}
          <TabsContent value="forks">
            <p className="mt-6 text-text-secondary">Chưa có forks nào.</p>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}