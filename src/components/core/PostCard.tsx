// src/components/core/PostCard.tsx
'use client';

import React, { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar'; 
import { ReactionBar } from '@/components/core/ReactionBar';
import { CommentsModal } from '@/components/core/CommentsModal';
import { TacticBoard } from '@/components/features/tactic-board/TacticBoard';
import type { Player, Arrow } from '@/components/features/tactic-board/TacticBoard';
import { X, Maximize2, Swords, Users } from 'lucide-react';

export interface PostCardProps {
    id?: string;
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
    formation?: string;
    tags?: string[];
}

// Parse content to extract title (first line with **) and description
const parseContent = (content: string) => {
  const lines = content.split('\n');
  let title = '';
  let description = '';
  
  for (const line of lines) {
    const titleMatch = line.match(/^\*\*(.+)\*\*$/);
    if (titleMatch && !title) {
      title = titleMatch[1];
    } else if (line.trim()) {
      description += (description ? '\n' : '') + line;
    }
  }
  
  return { title, description };
};

export const PostCard = ({ 
  id,
  author, 
  content, 
  timestamp, 
  likes, 
  comments,
  tacticData,
  formation = "4-3-3",
  tags = ["pressing", "phản công"]
}: PostCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState({ home: true, away: true, ball: true });
  const { title, description } = parseContent(content);
  const playerCount = tacticData?.players?.length || 0;

  return (
    <>
      <div className="
        group relative rounded-2xl bg-gradient-to-br from-panel via-panel to-panel/80
        border border-white/5 hover:border-primary/40 
        transition-all duration-500 overflow-hidden
        hover:shadow-xl hover:shadow-primary/5
      ">
        {/* Main Content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="relative">
              <Avatar src={author.avatar} alt={author.name} size="md" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-panel" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-headline font-bold text-foreground hover:text-primary cursor-pointer transition-colors">
                  {author.name}
                </h3>
                <span className="text-xs text-muted-foreground">@{author.username}</span>
                <span className="text-xs text-muted-foreground/60">• {timestamp}</span>
              </div>
              
              {/* Formation Badge */}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/20">
                  <Swords className="w-3 h-3" />
                  {formation}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary/15 text-secondary border border-secondary/20">
                  <Users className="w-3 h-3" />
                  {playerCount} cầu thủ
                </span>
              </div>
            </div>
          </div>

          {/* Title - Gradient Text */}
          {title && (
            <h2 className="text-lg font-headline font-bold mb-2 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              {title}
            </h2>
          )}
          
          {/* Description */}
          {description && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
              {description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map((tag, i) => (
              <span 
                key={i} 
                className="px-2 py-0.5 rounded-md text-xs font-medium bg-white/5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Thumbnail Tactic - Clickable */}
        {tacticData && (
          <div 
            className="relative cursor-pointer group/tactic mx-4 mb-4 rounded-xl overflow-hidden border border-white/10"
            onClick={() => setIsExpanded(true)}
          >
            <div className="aspect-video">
              <TacticBoard variant="thumbnail" players={tacticData.players} arrows={tacticData.arrows} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/tactic:opacity-100 transition-opacity flex items-end justify-center pb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/90 rounded-full text-white text-sm font-medium shadow-lg">
                <Maximize2 className="w-4 h-4" />
                Xem chi tiết
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-5 pb-4">
          <ReactionBar 
            tacticId={id}
            likes={likes} 
            comments={comments}
            onCommentClick={() => setCommentsOpen(true)}
          />
        </div>
      </div>

      {/* Expanded Tactic Modal */}
      {isExpanded && tacticData && (
        <div 
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
          onClick={() => setIsExpanded(false)}
          style={{ margin: 0, top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div 
            className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-card rounded-2xl border border-white/10 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Avatar src={author.avatar} alt={author.name} size="sm" />
                <div>
                  <h3 className="font-semibold text-foreground">{author.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">@{author.username}</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary">
                      {formation}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Layer Toggle Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLayerVisibility(prev => ({ ...prev, home: !prev.home }))}
                  className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    layerVisibility.home 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'bg-gray-700/50 text-gray-500 border border-gray-600/30'
                  }`}
                  title="Toggle home team visibility"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Đội nhà
                </button>
                <button
                  onClick={() => setLayerVisibility(prev => ({ ...prev, away: !prev.away }))}
                  className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    layerVisibility.away 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-gray-700/50 text-gray-500 border border-gray-600/30'
                  }`}
                  title="Toggle away team visibility"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Đội khách
                </button>
                <button
                  onClick={() => setLayerVisibility(prev => ({ ...prev, ball: !prev.ball }))}
                  className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    layerVisibility.ball 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-gray-700/50 text-gray-500 border border-gray-600/30'
                  }`}
                  title="Toggle ball visibility"
                >
                  ⚽
                </button>
                
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors ml-2"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Tactic Board */}
            <div className="flex-1 min-h-0 p-4 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full max-w-[calc(100vh*1.5)] max-h-full flex items-center justify-center">
                <div className="w-full max-w-full max-h-full aspect-[3/2]">
                  <TacticBoard 
                    variant="full" 
                    players={tacticData.players} 
                    arrows={tacticData.arrows}
                    areas={[]}
                    readOnly={true}
                    layerVisibility={layerVisibility}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 flex-shrink-0">
              {title && (
                <h2 className="text-lg font-bold text-foreground mb-1">{title}</h2>
              )}
              <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3 line-clamp-3">
                {description}
              </p>
              <ReactionBar 
                tacticId={id}
                likes={likes} 
                comments={comments}
                onCommentClick={() => { setIsExpanded(false); setCommentsOpen(true); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {id && (
        <CommentsModal 
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
          tacticId={id}
          tacticTitle={title}
        />
      )}
    </>
  );
};