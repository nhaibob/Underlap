// src/components/features/chat/ChannelList.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Hash, User } from 'lucide-react';

// Nút chọn kênh (component con)
const ChannelButton = ({ name, icon: Icon, active }: { name: string, icon: React.ElementType, active?: boolean }) => (
  <button className={cn(
    "flex items-center gap-2 w-full p-2 rounded-lg text-sm font-medium",
    active 
      ? "bg-primary text-white" 
      : "text-text-secondary hover:bg-panel hover:text-text-primary"
  )}>
    <Icon className="w-5 h-5" />
    <span>{name}</span>
  </button>
);

export const ChannelList = () => {
  return (
    <div className="w-60 flex-shrink-0 bg-panel h-full p-3">
      <h2 className="font-headline text-lg font-semibold px-2 mb-2">Channels</h2>
      <div className="space-y-1">
        <ChannelButton name="general" icon={Hash} active />
        <ChannelButton name="tactics-433" icon={Hash} />
        <ChannelButton name="random" icon={Hash} />
      </div>

      <h2 className="font-headline text-lg font-semibold px-2 mt-6 mb-2">Direct Messages</h2>
      <div className="space-y-1">
        <ChannelButton name="Huy Sơn" icon={User} />
        <ChannelButton name="TacticalFan" icon={User} />
      </div>
    </div>
  );
};