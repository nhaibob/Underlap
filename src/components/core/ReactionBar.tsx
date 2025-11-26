import React from 'react';
import { Heart, MessageCircle, Bookmark, GitFork } from 'lucide-react';
import { cn } from '@/lib/utils';

// [ĐÃ SỬA] Chuyển đổi props sang dạng phẳng để khớp với PostCard
export interface ReactionBarProps {
    likes: number;
    comments: number;
    forks?: number; // Optional (có thể không có)
    className?: string;
}

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

// [ĐÃ SỬA] Destructuring trực tiếp likes, comments, forks
export const ReactionBar = ({ likes, comments, forks = 0, className }: ReactionBarProps) => {
  return (
    <div className={cn("flex items-center gap-6 pt-4 mt-4 border-t border-panel", className)}>
      <ReactionButton icon={Heart} count={likes} className="hover:text-danger" />
      <ReactionButton icon={MessageCircle} count={comments} />
      
      {/* Giả lập Save count (Demo: likes + 2) */}
      <ReactionButton icon={Bookmark} count={likes + 2} className="hover:text-secondary" /> 
      
      {/* Forks có giá trị mặc định là 0 nếu không được truyền */}
      <ReactionButton icon={GitFork} count={forks} className="hover:text-primary" />
    </div>
  );
};