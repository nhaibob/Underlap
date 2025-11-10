import { create } from 'zustand';
import { produce } from 'immer'; // Zustand đã tích hợp sẵn immer
import { Comment, CommentUser, CommentAttachment } from '@/types/comment';

// --- Dữ liệu giả lập cho store ---
// (Trong ứng dụng thật, bạn sẽ lấy current user từ context/session)
const mockCurrentUser: CommentUser = {
  id: 'user_1',
  username: 'saban_dev',
  avatarUrl: 'https://i.pravatar.cc/150?u=saban_dev',
};

// (Trong ứng dụng thật, bạn sẽ fetch_comments từ API)
const mockComments: Comment[] = [
  {
    id: 'c1',
    author: { id: 'user_2', username: 'nhaibob', avatarUrl: 'https://i.pravatar.cc/150?u=nhaibob' },
    content: 'Đây là comment đầu tiên! Hỗ trợ **bold** và *italic*. \n```js\nconsole.log("Hello world");\n```',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 phút trước
    parentId: null,
    reactions: [{ emoji: '🔥', count: 3, users: ['user_1', 'user_3', 'user_4'] }],
    attachments: [],
    mentions: [],
    replies: [
      {
        id: 'c2',
        author: mockCurrentUser,
        content: 'Trả lời đây @nhaibob!',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 phút trước
        parentId: 'c1',
        reactions: [{ emoji: '👍', count: 1, users: ['user_2'] }],
        attachments: [],
        mentions: ['nhaibob'],
        replies: [],
      },
    ],
  },
  {
    id: 'c3',
    author: { id: 'user_3', username: 'underlap', avatarUrl: 'https://i.pravatar.cc/150?u=underlap' },
    content: 'Hệ thống comment này tuyệt vời quá.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 giờ trước
    parentId: null,
    reactions: [],
    attachments: [],
    mentions: [],
    replies: [],
  },
];
// --- Kết thúc dữ liệu giả lập ---


interface CommentStoreState {
  comments: Comment[];
  drafts: Record<string, string>; // key: contextId (postId) | "new_c1" (reply_to_c1)
  fetchComments: (contextId: string) => Promise<void>; // contextId: postId, tacticId...
  addComment: (contextId: string, content: string, parentId: string | null, attachments: CommentAttachment[]) => Promise<void>;
  editComment: (commentId: string, newContent: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  addReaction: (commentId: string, emoji: string, userId: string) => Promise<void>;
  getDraft: (draftKey: string) => string;
  setDraft: (draftKey: string, content: string) => void;
}

// Hàm trợ giúp (utility) để tìm và cập nhật comment lồng nhau
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

// Hàm trợ giúp (utility) để tìm và xóa comment lồng nhau
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

// Hàm trợ giúp (utility) để tìm và thêm reply
const findCommentAndAddReply = (comments: Comment[], parentId: string, newComment: Comment): boolean => {
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === parentId) {
            comments[i].replies.unshift(newComment); // Thêm vào đầu danh sách replies
            return true;
        }
        if (comments[i].replies && comments[i].replies.length > 0) {
            if (findCommentAndAddReply(comments[i].replies, parentId, newComment)) {
                return true;
            }
        }
    }
    return false;
}

export const useCommentStore = create<CommentStoreState>((set, get) => ({
  comments: [],
  drafts: {},

  fetchComments: async (contextId) => {
    // TODO: Thay thế bằng API call thật
    // Ví dụ: const fetchedComments = await api.get(`/posts/${contextId}/comments`);
    console.log(`Fetching comments for context: ${contextId}`);
    // Giả lập độ trễ mạng
    await new Promise(res => setTimeout(res, 500));
    set({ comments: mockComments });
  },

  addComment: async (contextId, content, parentId, attachments) => {
    // TODO: Thay thế bằng API call thật
    // Ví dụ: const newComment = await api.post(`/comments`, { contextId, content, parentId, attachments });
    
    // Giả lập API call
    const newComment: Comment = {
      id: `c_${Math.random().toString(36).substr(2, 9)}`,
      author: mockCurrentUser,
      content,
      createdAt: new Date().toISOString(),
      parentId,
      attachments,
      reactions: [],
      mentions: [], // (API nên xử lý việc trích xuất @mentions)
      replies: [],
    };
    
    set(produce((draft: CommentStoreState) => {
        if (parentId) {
            // Đây là một reply
            findCommentAndAddReply(draft.comments, parentId, newComment);
        } else {
            // Đây là comment gốc
            draft.comments.unshift(newComment); // Thêm vào đầu danh sách
        }
    }));
  },

  editComment: async (commentId, newContent) => {
    // TODO: API call để edit
    set(produce((draft: CommentStoreState) => {
        findCommentAndUpdate(draft.comments, commentId, (comment) => {
            comment.content = newContent;
            comment.updatedAt = new Date().toISOString();
        });
    }));
  },

  deleteComment: async (commentId) => {
    // TODO: API call để delete
    set(produce((draft: CommentStoreState) => {
        findCommentAndDelete(draft.comments, commentId);
    }));
  },

  addReaction: async (commentId, emoji, userId) => {
    // TODO: API call để toggle reaction
    set(produce((draft: CommentStoreState) => {
        findCommentAndUpdate(draft.comments, commentId, (comment) => {
            const reactionIndex = comment.reactions.findIndex(r => r.emoji === emoji);
            if (reactionIndex > -1) {
                // Reaction đã tồn tại
                const reaction = comment.reactions[reactionIndex];
                const userIndex = reaction.users.indexOf(userId);
                if (userIndex > -1) {
                    // User bỏ react
                    reaction.count--;
                    reaction.users.splice(userIndex, 1);
                    if (reaction.count === 0) {
                        comment.reactions.splice(reactionIndex, 1);
                    }
                } else {
                    // User thêm react
                    reaction.count++;
                    reaction.users.push(userId);
                }
            } else {
                // Reaction mới
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