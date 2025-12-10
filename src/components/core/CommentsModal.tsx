// src/components/core/CommentsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Loader2, MessageCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { supabaseAuth } from '@/lib/supabase';

interface Comment {
  id: string;
  user_username: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tacticId: string;
  tacticTitle?: string;
}

export const CommentsModal = ({ isOpen, onClose, tacticId, tacticTitle }: CommentsModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const currentUser = await supabaseAuth.getUser();
      setUser(currentUser);
    };
    getUser();
  }, []);

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && tacticId) {
      fetchComments();
    }
  }, [isOpen, tacticId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tactic/${tacticId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error('Fetch comments error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/tactic/${tacticId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0],
          name: user.user_metadata?.name || user.user_metadata?.username || 'User',
          avatar: user.user_metadata?.avatar_url,
          content: newComment.trim()
        })
      });
      
      const data = await res.json();
      if (data.success) {
        // Add new comment to list
        setComments(prev => [data.data, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Send comment error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg max-h-[80vh] bg-card rounded-2xl border border-white/10 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Bình luận</h3>
            <span className="text-sm text-muted-foreground">({comments.length})</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có bình luận nào</p>
              <p className="text-sm">Hãy là người đầu tiên bình luận!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar 
                  src={comment.user_avatar} 
                  alt={comment.user_name} 
                  size="sm" 
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-white/5 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">
                        {comment.user_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        @{comment.user_username}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 ml-2">
                    {formatTime(comment.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        {user ? (
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
            <div className="flex gap-3">
              <Avatar 
                src={user.user_metadata?.avatar_url}
                alt="You" 
                size="sm" 
              />
              <div className="flex-1 flex gap-2">
                <input 
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="flex-1 bg-white/5 rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim() || isSending}
                  className="p-2 bg-primary rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/80 transition-colors"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-4 border-t border-white/10 text-center text-muted-foreground text-sm">
            Đăng nhập để bình luận
          </div>
        )}
      </div>
    </div>
  );
};
