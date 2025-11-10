"use client"; // Cần client component để dùng hooks

import React, { useEffect, useState } from 'react';
import { useCommentStore } from '@/lib/store/useCommentStore';
import { CommentInput } from '@/components/features/comments/CommentInput';
import { CommentItem } from '@/components/features/comments/CommentItem';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface CommentSectionProps {
  // contextId có thể là postId, tacticId, v.v.
  contextId: string;
}

/**
 * Component chính để hiển thị toàn bộ hệ thống bình luận cho một context cụ thể (ví dụ: một bài post).
 */
export const CommentSection: React.FC<CommentSectionProps> = ({ contextId }) => {
  const { comments, fetchComments } = useCommentStore();
  const [isLoading, setIsLoading] = useState(true);

  // Lấy dữ liệu comments khi component được mount
  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true);
      await fetchComments(contextId);
      setIsLoading(false);
    };
    loadComments();
    
    // Cleanup store khi component unmount (tùy chọn)
    // return () => {
    //   useCommentStore.setState({ comments: [] });
    // };
  }, [contextId, fetchComments]);

  // Lọc chỉ lấy các comment gốc (không có parentId)
  const topLevelComments = comments.filter(comment => comment.parentId === null);

  return (
    <div className="w-full max-w-2xl mx-auto py-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Bình luận ({comments.length})
      </h2>
      
      {/* Input cho comment gốc */}
      <CommentInput contextId={contextId} />
      
      {/* Danh sách bình luận */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
            <span className="ml-2">Đang tải bình luận...</span>
          </div>
        ) : (
          <AnimatePresence>
            {topLevelComments.length > 0 ? (
              topLevelComments.map(comment => (
                <CommentItem key={comment.id} comment={comment} contextId={contextId} />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500 dark:text-gray-400 py-6"
              >
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};