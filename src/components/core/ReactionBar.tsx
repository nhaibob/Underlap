// src/components/core/ReactionBar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, GitFork, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabaseAuth } from '@/lib/supabase';

export interface ReactionBarProps {
    tacticId?: string;
    likes: number;
    comments: number;
    forks?: number;
    className?: string;
    onCommentClick?: () => void;
}

export const ReactionBar = ({ 
  tacticId,
  likes: initialLikes, 
  comments, 
  forks = 0, 
  className,
  onCommentClick
}: ReactionBarProps) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      const user = await supabaseAuth.getUser();
      if (user) {
        setUserId(user.id);
        setUsername(user.user_metadata?.username || user.email?.split('@')[0]);
      }
    };
    getUser();
  }, []);

  // Check if already liked
  useEffect(() => {
    if (tacticId && userId) {
      fetch(`/api/tactic/${tacticId}/like?userId=${userId}`)
        .then(res => res.json())
        .then(data => setLiked(data.liked))
        .catch(() => {});
    }
  }, [tacticId, userId]);

  const handleLike = async () => {
    if (!tacticId || !userId || isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (liked) {
        // Unlike
        await fetch(`/api/tactic/${tacticId}/like`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        setLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        // Like
        await fetch(`/api/tactic/${tacticId}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, username })
        });
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  return (
    <div className={cn("flex items-center gap-6 pt-4 mt-4 border-t border-white/5", className)}>
      {/* Like Button */}
      <button 
        onClick={handleLike}
        disabled={isLoading || !userId}
        className={cn(
          "flex items-center gap-2 text-sm transition-all duration-200 group",
          liked 
            ? "text-red-500" 
            : "text-muted-foreground hover:text-red-500",
          isLoading && "opacity-50"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart className={cn("w-4 h-4 transition-transform group-hover:scale-110", liked && "fill-current")} />
        )}
        <span>{likesCount}</span>
      </button>

      {/* Comment Button */}
      <button 
        onClick={onCommentClick}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>{comments}</span>
      </button>

      {/* Save Button */}
      <button 
        onClick={handleSave}
        className={cn(
          "flex items-center gap-2 text-sm transition-all duration-200 group",
          saved 
            ? "text-secondary" 
            : "text-muted-foreground hover:text-secondary"
        )}
      >
        <Bookmark className={cn("w-4 h-4 group-hover:scale-110 transition-transform", saved && "fill-current")} />
        <span>{saved ? 'Đã lưu' : 'Lưu'}</span>
      </button>

      {/* Fork Button */}
      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
        <GitFork className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>{forks}</span>
      </button>
    </div>
  );
};