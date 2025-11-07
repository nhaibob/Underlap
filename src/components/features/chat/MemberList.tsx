// src/components/features/chat/MemberList.tsx
import React from 'react';
import { Avatar } from '@/components/ui/Avatar';

// Item thành viên (component con)
const MemberItem = ({ name, status }: { name: string, status: 'Online' | 'Offline' }) => (
  <div className="flex items-center gap-3 p-2 rounded-lg">
    <Avatar alt={name} src="" className="w-8 h-8" />
    <div>
      <p className="text-sm font-medium text-text-primary">{name}</p>
      <p className="text-xs text-green-400">{status}</p>
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