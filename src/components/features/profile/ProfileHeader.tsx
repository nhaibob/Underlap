import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

// 1. Định nghĩa Props cho component
export interface ProfileHeaderProps {
  username: string;
  name?: string;     // Tên hiển thị (Optional)
  avatar?: string;   // URL ảnh đại diện (Optional)
  bio?: string;      // Tiểu sử (Optional)
  stats?: {
    followers: number;
    following: number;
    likes: number;
    tactics: number; // Số lượng chiến thuật/bài đăng
  };
  isOwnProfile?: boolean; // Cờ check xem có phải profile của mình không
}

const StatItem = ({ value, label }: { value: number, label: string }) => (
  <div className="text-center min-w-[80px]">
    <p className="text-xl font-bold text-text-primary">{value}</p>
    <p className="text-sm text-text-secondary">{label}</p>
  </div>
);

export const ProfileHeader = ({ 
  username, 
  name, 
  avatar, 
  bio, 
  stats,
  isOwnProfile = false 
}: ProfileHeaderProps) => {

  // Fallback values nếu không có props
  const displayName = name || username;
  const displayBio = bio || "Chưa có tiểu sử.";
  const displayStats = stats || { followers: 0, following: 0, likes: 0, tactics: 0 };

  return (
    <div className="relative mb-6">
      {/* 1. Banner (Ảnh bìa) */}
      <div className="h-48 w-full rounded-xl bg-panel border border-white/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
      </div>

      {/* 2. Phần thông tin chính */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 gap-4">
          
          {/* Avatar Area */}
          <div className="flex items-end">
             {/* ClassName w-32 h-32 sẽ đè lên size mặc định của Avatar */}
             <Avatar
               alt={displayName}
               src={avatar}
               className="w-32 h-32 border-4 border-background bg-panel shadow-xl"
               size="lg" 
             />
          </div>

          {/* Actions (Nút bấm) */}
          <div className="flex gap-3 mb-2 md:mb-6">
            {isOwnProfile ? (
              <Button variant="secondary" className="w-full md:w-auto">Chỉnh sửa hồ sơ</Button>
            ) : (
              <>
                <Button variant="default" className="w-full md:w-auto shadow-lg shadow-primary/20">Theo dõi</Button>
                <Button variant="secondary" className="w-full md:w-auto">Nhắn tin</Button>
              </>
            )}
          </div>
        </div>

        {/* 3. Tên & Bio */}
        <div className="mt-4 space-y-1">
          <h1 className="font-headline text-3xl font-bold text-text-primary">{displayName}</h1>
          <p className="text-text-secondary font-medium">@{username}</p>
          <p className="pt-2 max-w-2xl text-text-primary text-sm md:text-base leading-relaxed">
            {displayBio}
          </p>
        </div>

        {/* 4. Stats (Thống kê) */}
        <div className="flex gap-6 md:gap-12 mt-6 border-t border-white/10 pt-6 overflow-x-auto pb-2 scrollbar-hide">
          <StatItem value={displayStats.tactics} label="Chiến thuật" />
          <StatItem value={displayStats.followers} label="Người theo dõi" />
          <StatItem value={displayStats.following} label="Đang theo dõi" />
          <StatItem value={displayStats.likes} label="Thích" />
        </div>
      </div>
    </div>
  );
};