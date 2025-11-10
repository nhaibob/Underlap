"use client";

import React, { useState } from 'react';
import { Comment, CommentAttachment } from '@/types/comment';
import { useCommentStore } from '@/lib/store/useCommentStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { CommentInput } from './CommentInput';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Edit2, Trash2, SmilePlus, X, FileText } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Textarea } from '@/components/ui/Textarea';

// Giả định current user - trong ứng dụng thật, bạn sẽ lấy từ session/context
const CURRENT_USER_ID = 'user_1';

interface CommentItemProps {
  comment: Comment;
  contextId: string; // (e.g., postId)
}

const renderAttachment = (attachment: CommentAttachment) => {
  if (attachment.type === 'image') {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
        <img 
          src={attachment.url} 
          alt={attachment.name} 
          className="max-w-xs max-h-60 rounded-lg border dark:border-gray-700" 
        />
      </a>
    );
  }
  
  if (attachment.type === 'file') {
    return (
      <a 
        href={attachment.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="mt-2 flex items-center space-x-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-xs hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        <FileText className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm truncate">{attachment.name}</span>
      </a>
    );
  }
  
  return null;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, contextId }) => {
  const { editComment, deleteComment, addReaction } = useCommentStore();
  
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const canEdit = comment.author.id === CURRENT_USER_ID;
  const canDelete = comment.author.id === CURRENT_USER_ID;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedContent.trim() && editedContent.trim() !== comment.content) {
      editComment(comment.id, editedContent.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteComment(comment.id);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
     addReaction(comment.id, emojiData.emoji, CURRENT_USER_ID);
  };
  
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col"
    >
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatarUrl} alt={comment.author.username} />
          <AvatarFallback>{comment.author.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {comment.author.username}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {timeAgo} {comment.updatedAt && '(đã chỉnh sửa)'}
              </span>
            </div>
            
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.form 
                  key="edit" 
                  onSubmit={handleEditSubmit} 
                  className="mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                        if(e.key === 'Escape') setIsEditing(false);
                    }}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Hủy</Button>
                    <Button type="submit" size="sm" disabled={!editedContent.trim()}>Lưu</Button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-sm dark:prose-invert max-w-none mt-1 text-gray-800 dark:text-gray-200"
                >
                  {/* Bọc ReactMarkdown trong div để tránh lỗi hydration của Next.js với prose */}
                  <div>
                    <ReactMarkdown>{comment.content}</ReactMarkdown>
                  </div>
                  
                  {/* Hiển thị Attachments */}
                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {comment.attachments.map(renderAttachment)}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Reactions Bar */}
          {comment.reactions.length > 0 && (
            <div className="px-3 pt-1">
                <div className="flex flex-wrap gap-2">
                    {comment.reactions.map(r => (
                        <Button 
                            key={r.emoji} 
                            variant="outline" 
                            size="sm"
                            className={`rounded-full h-7 px-2.5 ${r.users.includes(CURRENT_USER_ID) ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-50 dark:bg-gray-700'}`}
                            onClick={() => addReaction(comment.id, r.emoji, CURRENT_USER_ID)}
                        >
                            <span className="text-xs">{r.emoji}</span>
                            <span className="ml-1 text-xs font-medium">{r.count}</span>
                        </Button>
                    ))}
                </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex items-center space-x-3 text-xs font-medium text-gray-500 dark:text-gray-400">
              <button onClick={() => setIsReplying(!isReplying)} className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{isReplying ? 'Hủy' : 'Trả lời'}</span>
              </button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    <SmilePlus className="h-3.5 w-3.5" />
                    <span>React</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </PopoverContent>
              </Popover>

              {canEdit && (
                <button onClick={() => setIsEditing(true)} className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Chỉnh sửa</span>
                </button>
              )}
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center space-x-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Xóa</span>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Bình luận này sẽ bị xóa vĩnh viễn.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reply Input Box */}
      <AnimatePresence>
        {isReplying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-8 mt-3"
          >
            <CommentInput 
              contextId={contextId} 
              parentId={comment.id} 
              autoFocus={true} 
              onCommentPosted={() => setIsReplying(false)} // Tự động đóng sau khi reply
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-4 space-y-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} contextId={contextId} />
          ))}
        </div>
      )}
    </motion.div>
  );
};