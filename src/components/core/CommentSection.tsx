// src/components/core/CommentSection.tsx
"use client";
import React, { useEffect } from 'react';
import { useCommentStore } from '@/lib/store/useCommentStore';
import { supabaseAuth } from '@/lib/supabase';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { CommentItem } from './CommentItem';
import { Loader2 } from 'lucide-react';

export interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const { 
    comments, 
    isLoading, 
    error,
    currentUser,
    setCurrentUser,
    fetchComments, 
    addComment,
    getDraft,
    setDraft
  } = useCommentStore();

  const draftKey = `context_${postId}`;
  const newCommentText = getDraft(draftKey);

  useEffect(() => {
    // Initialize current user from Supabase Auth session
    const initUser = async () => {
      try {
        const user = await supabaseAuth.getUser();
        if (user) {
          setCurrentUser({
            id: user.id,
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
            avatarUrl: user.user_metadata?.avatar_url || '/assets/avatars/default.png'
          });
        }
      } catch (err) {
        console.error('Failed to get user:', err);
      }
    };
    
    initUser();
  }, [setCurrentUser]);

  useEffect(() => {
    if (postId) {
      fetchComments(postId);
    }
  }, [postId, fetchComments]);

  const handlePostComment = async () => {
    if (!newCommentText.trim()) return;
    
    await addComment(postId, newCommentText.trim(), null, []);
    setDraft(draftKey, '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handlePostComment();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-3">
        <Avatar 
          src={currentUser?.avatarUrl} 
          alt={currentUser?.username || 'User'} 
          size="md" 
        />
        <div className="flex-1 space-y-2">
          <textarea
            value={newCommentText}
            onChange={(e) => setDraft(draftKey, e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentUser ? "Viết bình luận của bạn... (Ctrl+Enter để gửi)" : "Đăng nhập để bình luận..."}
            disabled={!currentUser}
            className="w-full bg-background/50 border border-white/10 rounded-xl p-3 text-sm text-text-primary focus:border-primary focus:outline-none resize-none min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-end">
            <Button 
              variant="default" 
              onClick={handlePostComment}
              disabled={!newCommentText.trim() || !currentUser || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && comments.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-text-secondary">Đang tải bình luận...</span>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment}
              tacticId={postId}
              depth={0}
            />
          ))
        ) : !isLoading ? (
          <p className="text-center text-text-secondary text-sm py-4">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        ) : null}
      </div>

    </div>
  );
};