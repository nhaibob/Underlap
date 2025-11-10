// src/components/features/profile/ProfileHeader.tsx
import React from 'react';
// SỬA Ở ĐÂY: Thêm AvatarFallback và AvatarImage
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

// Component con cho Stats (Thống kê)
const StatItem = ({ value, label }: { value: number, label: string }) => (
  <div className="text-center">
    <p className="text-xl font-bold text-text-primary">{value}</p>
    <p className="text-sm text-text-secondary">{label}</p>
  </div>
);

export const ProfileHeader = () => {
  return (
    <div>
      {/* 1. Banner (Ảnh bìa) - Placeholder */}
      <div className="h-48 w-full rounded-lg bg-panel border border-white/10" />

      {/* 2. Phần thông tin chính */}
      <div className="container mx-auto px-4 -mt-16">
        <div className="flex items-end justify-between">
          
          {/* SỬA Ở ĐÂY: Dùng cú pháp Avatar mới (lỗi ở dòng này) */}
          <Avatar className="w-32 h-32 border-4 border-background">
            <AvatarImage src="" alt="Huy Son" />
            <AvatarFallback>HS</AvatarFallback> 
          </Avatar>

          {/* Nút Edit (variant="default" đã đúng) */}
          <Button variant="default">Chỉnh sửa hồ sơ</Button>
        </div>

        {/* 3. Tên & Bio */}
        <div className="mt-4">
          <h1 className="font-headline text-3xl font-bold">Huy Sơn</h1>
          <p className="text-text-secondary">@huyson</p>
          <p className="mt-2 max-w-lg text-text-primary">
            HLV tại Underlap FC. Tập trung vào pressing tầm cao và 4-3-3.
          </p>
        </div>

        {/* 4. Stats (Thống kê) */}
        <div className="flex gap-8 mt-6 border-t border-panel pt-6">
          <StatItem value={42} label="Bài đăng" />
          <StatItem value={120} label="Đã lưu" />
          <StatItem value={15} label="Forks" />
        </div>
      </div>
    </div>
  );
};
