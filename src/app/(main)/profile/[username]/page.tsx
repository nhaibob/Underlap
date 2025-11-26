"use client";
import React from 'react';
import { ProfileHeader } from '@/components/features/profile/ProfileHeader';
import { PostCard, PostCardProps } from '@/components/core/PostCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

// Mock Data đã chuẩn hóa theo Interface mới
const USER_POSTS: PostCardProps[] = [
  {
    author: {
      name: "Huy Sơn",
      username: "HuySon",
      // avatar: để trống để test fallback
    },
    content: "**Sơ đồ 3-5-2 (Cá nhân hóa)**\n\nPhân tích vai trò của LWB và RWB trong hệ thống 3 hậu vệ. Yêu cầu thể lực cực cao để lên công về thủ liên tục.",
    timestamp: "1 ngày trước",
    likes: 45,
    comments: 12,
    tacticData: {
        players: [
            { id: '1', position: 'gk', label: 'GK', pos: { x: 45, y: 200 } },
            { id: '2', position: 'def', label: 'LCB', pos: { x: 100, y: 150 } },
            { id: '3', position: 'def', label: 'CB', pos: { x: 100, y: 200 } },
            { id: '4', position: 'def', label: 'RCB', pos: { x: 100, y: 250 } },
        ],
        arrows: []
    }
  },
  {
    author: {
      name: "Huy Sơn",
      username: "HuySon",
    },
    content: "**Pressing Trap ở biên**\n\nCách dụ đối phương chuyền bóng ra biên rồi tổ chức vây ráp số đông để đoạt bóng.",
    timestamp: "3 ngày trước",
    likes: 128,
    comments: 34
  }
];

export default function ProfilePage({ params }: { params: { username: string } }) {
  // Decode username (ví dụ: "Nguyen%20A" -> "Nguyen A")
  const decodedUsername = decodeURIComponent(params.username);

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      {/* 1. Header Profile */}
      <ProfileHeader 
        username={decodedUsername} 
        // Mock stats truyền vào header
        stats={{
            followers: 120,
            following: 45,
            likes: 890,
            tactics: 12
        }}
      />

      {/* 2. Tabs Content */}
      <div className="mt-6">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b border-white/10 bg-transparent p-0">
            <TabsTrigger 
              value="posts" 
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Bài đăng
            </TabsTrigger>
            <TabsTrigger 
              value="tactics" 
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Chiến thuật
            </TabsTrigger>
            <TabsTrigger 
              value="saved" 
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Đã lưu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6 space-y-6">
            {USER_POSTS.map((post, index) => (
              <PostCard key={index} {...post} />
            ))}
          </TabsContent>
          
          <TabsContent value="tactics" className="mt-6 text-center text-text-secondary py-10">
            <p>Danh sách chiến thuật (Đang phát triển)</p>
          </TabsContent>
          
          <TabsContent value="saved" className="mt-6 text-center text-text-secondary py-10">
            <p>Bài viết đã lưu (Đang phát triển)</p>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}