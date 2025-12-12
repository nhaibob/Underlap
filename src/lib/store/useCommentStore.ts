// src/lib/store/useCommentStore.ts
import { create } from 'zustand';
import { produce } from 'immer';
import { Comment, CommentUser, CommentAttachment } from '@/types/comment';

interface CommentStoreState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  currentUser: CommentUser | null;
  drafts: Record<string, string>;
  
  // Actions
  setCurrentUser: (user: CommentUser | null) => void;
  fetchComments: (tacticId: string) => Promise<void>;
  addComment: (tacticId: string, content: string, parentId: string | null, attachments: CommentAttachment[]) => Promise<void>;
  editComment: (tacticId: string, commentId: string, newContent: string) => Promise<void>;
  deleteComment: (tacticId: string, commentId: string) => Promise<void>;
  addReaction: (commentId: string, emoji: string, userId: string) => Promise<void>;
  getDraft: (draftKey: string) => string;
  setDraft: (draftKey: string, content: string) => void;
}

// Helper to find and update nested comments
const findCommentAndUpdate = (comments: Comment[], commentId: string, updateFn: (comment: Comment) => void): boolean => {
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    if (comment.id === commentId) {
      updateFn(comment);
      return true;
    }
    if (comment.replies && comment.replies.length > 0) {
      if (findCommentAndUpdate(comment.replies, commentId, updateFn)) {
        return true;
      }
    }
  }
  return false;
};

// Helper to find and delete nested comments
const findCommentAndDelete = (comments: Comment[], commentId: string): boolean => {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].id === commentId) {
      comments.splice(i, 1);
      return true;
    }
    if (comments[i].replies && comments[i].replies.length > 0) {
      if (findCommentAndDelete(comments[i].replies, commentId)) {
        return true;
      }
    }
  }
  return false;
};

// Helper to add reply to nested comment
const findCommentAndAddReply = (comments: Comment[], parentId: string, newComment: Comment): boolean => {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].id === parentId) {
      comments[i].replies.unshift(newComment);
      return true;
    }
    if (comments[i].replies && comments[i].replies.length > 0) {
      if (findCommentAndAddReply(comments[i].replies, parentId, newComment)) {
        return true;
      }
    }
  }
  return false;
};

// Transform database comment to frontend format
const transformComment = (dbComment: any): Comment => ({
  id: dbComment.id,
  author: {
    id: dbComment.user_id,
    username: dbComment.user_username,
    avatarUrl: dbComment.user_avatar || '/assets/avatars/default.png'
  },
  content: dbComment.content,
  createdAt: dbComment.created_at,
  updatedAt: dbComment.updated_at,
  parentId: dbComment.parent_id || null,
  reactions: [],
  attachments: dbComment.attachments || [],
  mentions: [],
  replies: []
});

export const useCommentStore = create<CommentStoreState>((set, get) => ({
  comments: [],
  isLoading: false,
  error: null,
  currentUser: null,
  drafts: {},

  setCurrentUser: (user) => set({ currentUser: user }),

  fetchComments: async (tacticId) => {
    set({ isLoading: true, error: null });
    
    try {
      const res = await fetch(`/api/tactic/${tacticId}/comments`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await res.json();
      
      // Transform and organize comments (flat -> nested)
      const commentsMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];
      
      // First pass: create all comments
      for (const dbComment of data) {
        commentsMap.set(dbComment.id, transformComment(dbComment));
      }
      
      // Second pass: organize into tree
      for (const dbComment of data) {
        const comment = commentsMap.get(dbComment.id)!;
        if (dbComment.parent_id && commentsMap.has(dbComment.parent_id)) {
          commentsMap.get(dbComment.parent_id)!.replies.push(comment);
        } else {
          rootComments.push(comment);
        }
      }
      
      set({ comments: rootComments, isLoading: false });
    } catch (error: any) {
      console.error('Fetch comments error:', error);
      set({ error: error.message, isLoading: false, comments: [] });
    }
  },

  addComment: async (tacticId, content, parentId, attachments) => {
    const { currentUser } = get();
    
    if (!currentUser) {
      set({ error: 'Bạn cần đăng nhập để bình luận' });
      return;
    }

    try {
      const res = await fetch(`/api/tactic/${tacticId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          username: currentUser.username,
          name: currentUser.username,
          avatar: currentUser.avatarUrl,
          content,
          parentId,
          attachments
        })
      });

      const result = await res.json();
      
      if (result.error) {
        set({ error: result.error });
        return;
      }

      const newComment: Comment = {
        id: result.data.id,
        author: currentUser,
        content,
        createdAt: result.data.created_at || new Date().toISOString(),
        parentId,
        attachments,
        reactions: [],
        mentions: [],
        replies: [],
      };

      set(produce((draft: CommentStoreState) => {
        if (parentId) {
          findCommentAndAddReply(draft.comments, parentId, newComment);
        } else {
          draft.comments.unshift(newComment);
        }
      }));
    } catch (error: any) {
      console.error('Add comment error:', error);
      set({ error: error.message });
    }
  },

  editComment: async (tacticId, commentId, newContent) => {
    const { currentUser } = get();
    
    if (!currentUser) {
      set({ error: 'Bạn cần đăng nhập' });
      return;
    }

    try {
      const res = await fetch(`/api/tactic/${tacticId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newContent,
          userId: currentUser.id
        })
      });

      const result = await res.json();
      
      if (result.error) {
        set({ error: result.error });
        return;
      }

      set(produce((draft: CommentStoreState) => {
        findCommentAndUpdate(draft.comments, commentId, (comment) => {
          comment.content = newContent;
          comment.updatedAt = new Date().toISOString();
        });
      }));
    } catch (error: any) {
      console.error('Edit comment error:', error);
      set({ error: error.message });
    }
  },

  deleteComment: async (tacticId, commentId) => {
    const { currentUser } = get();
    
    if (!currentUser) {
      set({ error: 'Bạn cần đăng nhập' });
      return;
    }

    try {
      const res = await fetch(`/api/tactic/${tacticId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });

      const result = await res.json();
      
      if (result.error) {
        set({ error: result.error });
        return;
      }

      set(produce((draft: CommentStoreState) => {
        findCommentAndDelete(draft.comments, commentId);
      }));
    } catch (error: any) {
      console.error('Delete comment error:', error);
      set({ error: error.message });
    }
  },

  addReaction: async (commentId, emoji, userId) => {
    // Toggle reaction optimistically (no API yet, just local state)
    set(produce((draft: CommentStoreState) => {
      findCommentAndUpdate(draft.comments, commentId, (comment) => {
        const reactionIndex = comment.reactions.findIndex(r => r.emoji === emoji);
        if (reactionIndex > -1) {
          const reaction = comment.reactions[reactionIndex];
          const userIndex = reaction.users.indexOf(userId);
          if (userIndex > -1) {
            reaction.count--;
            reaction.users.splice(userIndex, 1);
            if (reaction.count === 0) {
              comment.reactions.splice(reactionIndex, 1);
            }
          } else {
            reaction.count++;
            reaction.users.push(userId);
          }
        } else {
          comment.reactions.push({ emoji, count: 1, users: [userId] });
        }
      });
    }));
  },

  getDraft: (draftKey) => get().drafts[draftKey] || '',

  setDraft: (draftKey, content) => {
    set(produce((draft: CommentStoreState) => {
      draft.drafts[draftKey] = content;
    }));
  },
}));