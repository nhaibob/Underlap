import React from 'react';
import { Avatar } from '@/components/ui/Avatar'; 
import { ReactionBar } from '@/components/core/ReactionBar';
import { TacticBoard } from '@/components/features/tactic-board/TacticBoard';
import type { Player, Arrow } from '@/components/features/tactic-board/TacticBoard';

// [ĐÃ SỬA] Thêm chữ "export" vào đây
export interface PostCardProps {
    author: {
        name: string;
        avatar?: string; 
        username: string;
    };
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
    tacticData?: {
        players: Player[];
        arrows: Arrow[];
    };
}

export const PostCard = ({ 
  author, 
  content, 
  timestamp, 
  likes, 
  comments,
  tacticData
}: PostCardProps) => {
  return (
    <div className="
      group relative p-4 rounded-xl bg-panel border border-white/5 
      hover:border-primary/30 transition-all duration-300 
      hover:shadow-lg hover:shadow-black/20
    ">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar component giờ đã chạy tốt */}
        <Avatar src={author.avatar} alt={author.name} size="md" />
        
        <div className="flex-1">
           <div className="flex items-center gap-2">
             <h3 className="font-headline font-bold text-text-primary hover:underline cursor-pointer">
               {author.name}
             </h3>
             <span className="text-xs text-text-secondary">• {timestamp}</span>
           </div>
           <p className="text-xs text-text-secondary">@{author.username}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-text-secondary mb-4 whitespace-pre-wrap text-sm leading-relaxed">
        {content}
      </p>

      {/* Thumbnail Tactic (Nếu có) */}
      {tacticData && (
        <div className="mb-4 rounded-lg overflow-hidden border border-white/10 aspect-video bg-background/50 relative">
           <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
             <TacticBoard variant="thumbnail" players={tacticData.players} arrows={tacticData.arrows} />
           </div>
           <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>
      )}

      {/* Footer Actions */}
      <ReactionBar likes={likes} comments={comments} />
    </div>
  );
};