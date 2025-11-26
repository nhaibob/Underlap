"use client";
import React, { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar'; // Đảm bảo import Avatar mới đã sửa
import { Button } from '@/components/ui/Button';
import { Comment } from './Comment'; // Import component con Comment (nếu có)

// 1. [QUAN TRỌNG] Export Interface để file khác dùng được (nếu cần)
export interface CommentSectionProps {
  postId?: string; // Thêm postId (dấu ? để không bắt buộc nếu dùng ở chỗ khác)
  initialComments?: any[]; // Dữ liệu comment ban đầu (nếu có)
}

export const CommentSection = ({ postId, initialComments = [] }: CommentSectionProps) => {
  const [comments, setComments] = useState(initialComments);
  const [newCommentText, setNewCommentText] = useState('');

  // Mock user hiện tại (người đang gõ comment)
  const currentUser = {
    name: "Bạn",
    avatar: undefined, // Để trống để test fallback avatar
    username: "me"
  };

  const handlePostComment = () => {
    if (!newCommentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      author: currentUser,
      content: newCommentText,
      timestamp: "Vừa xong",
      likes: 0,
      replies: []
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
    
    // TODO: Gọi API để lưu comment với postId
    console.log(`Posting comment to post ${postId}:`, newCommentText);
  };

  return (
    <div className="space-y-6">
      
      {/* Input Area */}
      <div className="flex gap-3">
        <Avatar src={currentUser.avatar} alt={currentUser.name} size="md" />
        <div className="flex-1 space-y-2">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            className="w-full bg-background/50 border border-white/10 rounded-xl p-3 text-sm text-text-primary focus:border-primary focus:outline-none resize-none min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button 
              variant="default" 
              onClick={handlePostComment}
              disabled={!newCommentText.trim()}
            >
              Gửi
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            // Render từng comment (Giả sử bạn đã có component Comment)
            // Nếu chưa có component Comment riêng, bạn có thể render trực tiếp div ở đây
            <Comment key={comment.id} {...comment} />
          ))
        ) : (
          <p className="text-center text-text-secondary text-sm py-4">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        )}
      </div>

    </div>
  );
};