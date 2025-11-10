// Đại diện cho người dùng (giả định)
export interface CommentUser {
  id: string;
  username: string;
  avatarUrl: string;
}

// Đại diện cho một phản ứng emoji
export interface CommentReaction {
  emoji: string;
  count: number;
  users: string[]; // Danh sách user IDs đã react
}

// Đại diện cho file đính kèm
export interface CommentAttachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: number; // (bytes)
}

// Cấu trúc comment chính
export interface Comment {
  id: string;
  author: CommentUser;
  content: string;
  createdAt: string; // ISO 8601 string
  updatedAt?: string; // ISO 8601 string
  parentId: string | null; // Dùng cho nested replies
  reactions: CommentReaction[];
  attachments: CommentAttachment[];
  mentions: string[]; // Danh sách username được @mention
  replies: Comment[]; // Danh sách các comment con
}