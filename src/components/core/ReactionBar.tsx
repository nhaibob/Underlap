// src/components/core/ReactionBar.tsx
import React from 'react';
import { Heart, MessageCircle, Bookmark, GitFork } from 'lucide-react';
import { cn } from '@/lib/utils';

// Khai báo ReactionBarProps để fix lỗi TS2322
export interface ReactionBarProps {
    stats: { likes: number; comments: number; forks: number; };
}

// Component con cho nút phản ứng
const ReactionButton = ({ 
  icon: Icon, 
  count,
  className 
}: { 
  icon: React.ElementType, 
  count: number,
  className?: string
}) => {
  return (
    <button className={cn(
      "flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors",
      className
    )}>
      <Icon className="w-4 h-4" />
      <span>{count}</span>
    </button>
  );
};

// Sửa lỗi TS2322: ReactionBar phải nhận props được định nghĩa
export const ReactionBar = ({ stats }: ReactionBarProps) => {
  return (
    <div className="flex items-center gap-6 pt-4 mt-4 border-t border-panel">
      <ReactionButton icon={Heart} count={stats.likes} className="hover:text-danger" />
      <ReactionButton icon={MessageCircle} count={stats.comments} />
      {/* Giả lập Save/Fork count */}
      <ReactionButton icon={Bookmark} count={stats.likes + 2} className="hover:text-secondary" /> 
      <ReactionButton icon={GitFork} count={stats.forks} className="hover:text-primary" />
    </div>
  );
};