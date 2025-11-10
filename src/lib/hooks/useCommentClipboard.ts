import { create } from 'zustand';

interface CommentClipboardState {
  clipboardImage: string | null;
  setClipboardImage: (image: string | null) => void;
  clearClipboardImage: () => void;
}

/**
 * Hook Zustand để lưu trữ ảnh chụp snapshot từ TacticBoard
 * và cho phép CommentInput truy cập vào nó.
 */
export const useCommentClipboard = create<CommentClipboardState>((set) => ({
  clipboardImage: null,
  setClipboardImage: (image) => set({ clipboardImage: image }),
  clearClipboardImage: () => set({ clipboardImage: null }),
}));