// src/app/(main)/profile/[username]/page.tsx
"use client";

import React, { useState } from 'react';
import { ProfileHeader } from '@/components/features/profile/ProfileHeader';
import { PostCard, PostCardProps } from '@/components/core/PostCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { 
  Grid3X3, 
  FileText, 
  Bookmark, 
  Heart,
  Plus,
  TrendingUp,
  Eye
} from 'lucide-react';

// Mock Data
const USER_POSTS: PostCardProps[] = [
  {
    author: {
      name: "Huy Sơn",
      username: "HuySon",
      avatar: "/assets/avatars/huyson.png"
    },
    content: "**Sơ đồ 3-5-2 (Cá nhân hóa)**\n\nPhân tích vai trò của LWB và RWB trong hệ thống 3 hậu vệ. Yêu cầu thể lực cực cao để lên công về thủ liên tục.",
    timestamp: "1 ngày trước",
    likes: 45,
    comments: 12,
    tacticData: {
      players: [
        { id: '1', position: 'GK', label: 'GK', pos: { x: 45, y: 200 } },
        { id: '2', position: 'CB', label: 'LCB', pos: { x: 100, y: 150 } },
        { id: '3', position: 'CB', label: 'CB', pos: { x: 100, y: 200 } },
        { id: '4', position: 'CB', label: 'RCB', pos: { x: 100, y: 250 } },
      ],
      arrows: []
    }
  },
  {
    author: {
      name: "Huy Sơn",
      username: "HuySon",
      avatar: "/assets/avatars/huyson.png"
    },
    content: "**Pressing Trap ở biên**\n\nCách dụ đối phương chuyền bóng ra biên rồi tổ chức vây ráp số đông để đoạt bóng.",
    timestamp: "3 ngày trước",
    likes: 128,
    comments: 34
  },
  {
    author: {
      name: "Huy Sơn",
      username: "HuySon",
      avatar: "/assets/avatars/huyson.png"
    },
    content: "**Build-up từ GK (4-3-3)**\n\nHướng dẫn chi tiết cách triển khai bóng từ thủ môn với đội hình 4-3-3. Phù hợp cho các đội muốn kiểm soát bóng.",
    timestamp: "1 tuần trước",
    likes: 256,
    comments: 67
  }
];

// Tactic Card for Grid View
const TacticGridCard = ({ 
  title, 
  formation, 
  views, 
  likes 
}: { 
  title: string; 
  formation: string; 
  views: number; 
  likes: number;
}) => (
  <div className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-card border border-white/10 hover:border-primary/50 transition-all cursor-pointer">
    {/* Tactic Preview Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Simplified pitch pattern */}
      <div className="absolute inset-4 border border-white/20 rounded-lg">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-white/20 rounded-full" />
      </div>
    </div>
    
    {/* Hover Overlay */}
    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
      <Button variant="default" size="sm" className="gap-2">
        <Eye className="w-4 h-4" />
        Xem chi tiết
      </Button>
    </div>
    
    {/* Info Bar */}
    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background to-transparent">
      <p className="font-medium text-sm text-foreground truncate">{title}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-primary font-medium">{formation}</span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {views}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {likes}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-card border border-white/10 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="font-headline text-lg font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
    {actionLabel && onAction && (
      <Button variant="default" onClick={onAction} className="gap-2">
        <Plus className="w-4 h-4" />
        {actionLabel}
      </Button>
    )}
  </div>
);

export default function ProfilePage({ params }: { params: { username: string } }) {
  const decodedUsername = decodeURIComponent(params.username);
  const [activeTab, setActiveTab] = useState('posts');
  
  // Check if viewing own profile (mock - replace with real auth check)
  const isOwnProfile = decodedUsername.toLowerCase() === 'huyson';

  // Mock tactics data for grid view
  const userTactics = [
    { title: "Phản công cánh phải", formation: "4-3-3", views: 1240, likes: 89 },
    { title: "Pressing cao", formation: "4-2-3-1", views: 856, likes: 67 },
    { title: "Build-up chậm", formation: "3-5-2", views: 2100, likes: 156 },
    { title: "Tấn công biên", formation: "4-4-2", views: 743, likes: 45 },
    { title: "Phòng ngự phản công", formation: "5-3-2", views: 1890, likes: 112 },
    { title: "Kiểm soát bóng", formation: "4-3-3", views: 567, likes: 34 },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      {/* Profile Header */}
      <ProfileHeader 
        username={decodedUsername}
        name="Huy Sơn"
        avatar="/assets/avatars/huyson.png"
        bio="⚽ Chiến thuật gia đam mê bóng đá | Đang khám phá các hệ thống chiến thuật hiện đại | Chia sẻ kiến thức cùng cộng đồng"
        location="Hà Nội, Việt Nam"
        website="https://underlap.com"
        joinedDate="Tháng 12, 2024"
        isVerified={true}
        isOwnProfile={isOwnProfile}
        stats={{
          followers: 1250,
          following: 89,
          likes: 3420,
          tactics: 24
        }}
      />

      {/* Tabs */}
      <div className="mt-8 px-4 md:px-0">
        <Tabs 
          defaultValue="posts" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full justify-start bg-card/50 border border-white/10 rounded-xl p-1 gap-1">
            <TabsTrigger 
              value="posts" 
              className="flex-1 md:flex-none gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Bài đăng</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tactics" 
              className="flex-1 md:flex-none gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">Chiến thuật</span>
            </TabsTrigger>
            <TabsTrigger 
              value="liked" 
              className="flex-1 md:flex-none gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Đã thích</span>
            </TabsTrigger>
            <TabsTrigger 
              value="saved" 
              className="flex-1 md:flex-none gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Đã lưu</span>
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-6 space-y-6">
            {USER_POSTS.length > 0 ? (
              USER_POSTS.map((post, index) => (
                <PostCard key={index} {...post} />
              ))
            ) : (
              <EmptyState 
                icon={FileText}
                title="Chưa có bài đăng"
                description="Bạn chưa đăng bài viết nào. Hãy chia sẻ chiến thuật đầu tiên của bạn!"
                actionLabel="Tạo bài đăng"
                onAction={() => {}}
              />
            )}
          </TabsContent>

          {/* Tactics Grid Tab */}
          <TabsContent value="tactics" className="mt-6">
            {userTactics.length > 0 ? (
              <>
                {/* Stats Bar */}
                <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-card/50 border border-white/10">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">6</span> chiến thuật
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-secondary" />
                      <span className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">7.4K</span> lượt xem
                      </span>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <Button variant="default" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Tạo mới
                    </Button>
                  )}
                </div>
                
                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {userTactics.map((tactic, index) => (
                    <TacticGridCard key={index} {...tactic} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState 
                icon={Grid3X3}
                title="Chưa có chiến thuật"
                description="Bạn chưa tạo chiến thuật nào. Hãy bắt đầu thiết kế ngay!"
                actionLabel="Tạo chiến thuật"
                onAction={() => {}}
              />
            )}
          </TabsContent>

          {/* Liked Tab */}
          <TabsContent value="liked" className="mt-6">
            <EmptyState 
              icon={Heart}
              title="Chưa thích bài viết nào"
              description="Các bài viết bạn thích sẽ hiển thị ở đây."
            />
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved" className="mt-6">
            <EmptyState 
              icon={Bookmark}
              title="Chưa lưu bài viết nào"
              description="Lưu các chiến thuật hay để xem lại sau."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}