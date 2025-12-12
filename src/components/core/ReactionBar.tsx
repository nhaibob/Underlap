// src/components/core/ReactionBar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, GitFork, Loader2, Share2, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabaseAuth } from '@/lib/supabase';

export interface ReactionBarProps {
    tacticId?: string;
    likes: number;
    comments: number;
    forks?: number;
    className?: string;
    onCommentClick?: () => void;
    showLabels?: boolean; // Show text labels
    variant?: 'compact' | 'full'; // Layout variant
}

export const ReactionBar = ({ 
  tacticId,
  likes: initialLikes, 
  comments, 
  forks = 0, 
  className,
  onCommentClick,
  showLabels = false,
  variant = 'compact'
}: ReactionBarProps) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [forksCount, setForksCount] = useState(forks);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy link:', url);
    }
  };

  const handleFork = async () => {
    if (!userId || !tacticId) {
      alert('Vui lòng đăng nhập để fork chiến thuật');
      return;
    }
    
    try {
      const res = await fetch('/api/tactic/fork', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ tacticId })
      });
      
      if (res.ok) {
        setForksCount(prev => prev + 1);
        alert('✅ Đã fork chiến thuật! Xem trong tab "Đã fork" trên trang cá nhân.');
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.error || 'Không thể fork'}`);
      }
    } catch (error) {
      console.error('Fork error:', error);
      alert('Có lỗi xảy ra khi fork');
    }
  };

  if (variant === 'full') {
    return (
      <div className={cn(
        "flex items-center justify-between py-4 px-6 bg-panel/50 rounded-xl border border-white/5",
        className
      )}>
        {/* Left Group - Engagement */}
        <div className="flex items-center gap-6">
          {/* Like Button */}
          <button 
            onClick={handleLike}
            disabled={isLoading || !userId}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-all duration-200 group",
              liked 
                ? "text-red-500" 
                : "text-muted-foreground hover:text-red-500",
              isLoading && "opacity-50"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Heart className={cn("w-5 h-5 transition-transform group-hover:scale-110", liked && "fill-current")} />
            )}
            <span>{likesCount}</span>
            {showLabels && <span className="hidden sm:inline">{liked ? 'Đã thích' : 'Thích'}</span>}
          </button>

          {/* Comment Button */}
          <button 
            onClick={onCommentClick}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
          >
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>{comments}</span>
            {showLabels && <span className="hidden sm:inline">Bình luận</span>}
          </button>

          {/* Fork Button */}
          <button 
            onClick={handleFork}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
          >
            <GitFork className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>{forksCount}</span>
            {showLabels && <span className="hidden sm:inline">Fork</span>}
          </button>
        </div>

        {/* Right Group - Actions */}
        <div className="flex items-center gap-4">
          {/* Share Button */}
          <button 
            onClick={handleShare}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-all duration-200 group",
              copied ? "text-green-500" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {copied ? (
              <Check className="w-5 h-5" />
            ) : (
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            {showLabels && <span className="hidden sm:inline">{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>}
          </button>

          {/* Save Button */}
          <button 
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-all duration-200 group",
              saved 
                ? "text-secondary" 
                : "text-muted-foreground hover:text-secondary"
            )}
          >
            <Bookmark className={cn("w-5 h-5 group-hover:scale-110 transition-transform", saved && "fill-current")} />
            {showLabels && <span className="hidden sm:inline">{saved ? 'Đã lưu' : 'Lưu'}</span>}
          </button>
        </div>
      </div>
    );
  }

  // Compact variant (original)
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

      {/* Share Button */}
      <button 
        onClick={handleShare}
        className={cn(
          "flex items-center gap-2 text-sm transition-all duration-200 group",
          copied ? "text-green-500" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        )}
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
      <button 
        onClick={handleFork}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
      >
        <GitFork className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>{forksCount}</span>
      </button>
    </div>
  );
};