// src/components/features/chat/MemberList.tsx
import React from 'react';
// SỬA Ở ĐÂY: Thêm AvatarFallback và AvatarImage
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

// Item thành viên (component con)
const MemberItem = ({ name, status }: { name: string, status: 'Online' | 'Offline' }) => (
  <div className="flex items-center gap-3 p-2 rounded-lg">
    {/* SỬA Ở ĐÂY: Dùng cú pháp Avatar mới */}
    <Avatar className="w-8 h-8">
      <AvatarImage src="" alt={name} />
      <AvatarFallback>{name ? name.substring(0, 2).toUpperCase() : '??'}</AvatarFallback>
    </Avatar>
    <div>
      <p className="text-sm font-medium text-text-primary">{name}</p>
      {/* SỬA Ở ĐÂY: Dùng cn() để đổi màu status */}
      <p className={cn(
        "text-xs",
        status === 'Online' ? "text-green-400" : "text-text-secondary"
      )}>
        {status}
      </p> 
    </div>
  </div>
);

export const MemberList = () => {
  return (
    <div className="w-60 flex-shrink-0 bg-panel h-full p-3">
      <h2 className="font-headline text-lg font-semibold px-2 mb-2">
        Thành viên (3)
      </h2>
      <div className="space-y-1">
        <MemberItem name="Huy Sơn" status="Online" />
        <MemberItem name="TacticalFan" status="Online" />
        <MemberItem name="Bạn" status="Online" /> 
        {/* (Cần sửa lại chút) */}
      </div>
    </div>
  );
};