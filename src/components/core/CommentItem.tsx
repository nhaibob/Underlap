// src/components/core/CommentItem.tsx
"use client";
import React, { useState } from 'react';
import { useCommentStore } from '@/lib/store/useCommentStore';
import { Comment } from '@/types/comment';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface CommentItemProps {
  comment: Comment;
  tacticId: string;
  depth: number;
}

export const CommentItem = ({ comment, tacticId, depth }: CommentItemProps) => {
  const { currentUser, addComment, editComment, deleteComment, addReaction, getDraft, setDraft } = useCommentStore();
  
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const replyDraftKey = `reply_${comment.id}`;
  const replyText = getDraft(replyDraftKey);

  const isOwner = currentUser?.id === comment.author.id;
  const maxDepth = 3;

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi });
    } catch {
      return 'Vừa xong';
    }
  })();

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await addComment(tacticId, replyText.trim(), comment.id, []);
    setDraft(replyDraftKey, '');
    setIsReplying(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }
    await editComment(tacticId, comment.id, editContent.trim());
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;
    setIsDeleting(true);
    await deleteComment(tacticId, comment.id);
    setIsDeleting(false);
  };

  const handleReaction = (emoji: string) => {
    if (!currentUser) return;
    addReaction(comment.id, emoji, currentUser.id);
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-white/5 pl-4' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar 
          src={comment.author.avatarUrl} 
          alt={comment.author.username}
          size="sm"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground text-sm">
              @{comment.author.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeAgo}
            </span>
            {comment.updatedAt && (
              <span className="text-xs text-muted-foreground">(đã sửa)</span>
            )}
          </div>

          {/* Body */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-background/50 border border-white/10 rounded-lg p-2 text-sm resize-none min-h-[60px] focus:outline-none focus:border-primary"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
                <Button size="sm" onClick={handleEdit}>
                  Lưu
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none text-foreground/90">
              <ReactMarkdown>{comment.content}</ReactMarkdown>
            </div>
          )}

          {/* Reactions */}
          {comment.reactions.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {comment.reactions.map((reaction, idx) => (
                <button
                  key={idx}
                  onClick={() => handleReaction(reaction.emoji)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                    reaction.users.includes(currentUser?.id || '')
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-3 mt-2">
              <button 
                onClick={() => handleReaction('❤️')}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Heart className="w-3.5 h-3.5" />
              </button>
              
              {depth < maxDepth && currentUser && (
                <button 
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Trả lời
                </button>
              )}

              {isOwner && (
                <div className="relative">
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute left-0 top-full mt-1 bg-card rounded-lg border border-white/10 shadow-xl z-10 py-1 min-w-[120px]">
                      <button
                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => { handleDelete(); setShowMenu(false); }}
                        disabled={isDeleting}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reply Input */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setDraft(replyDraftKey, e.target.value)}
                placeholder={`Trả lời @${comment.author.username}...`}
                className="w-full bg-background/50 border border-white/10 rounded-lg p-2 text-sm resize-none min-h-[60px] focus:outline-none focus:border-primary"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>
                  Hủy
                </Button>
                <Button size="sm" onClick={handleReply} disabled={!replyText.trim()}>
                  Trả lời
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              tacticId={tacticId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
