"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCommentStore } from '@/lib/store/useCommentStore';
import { useCommentClipboard } from '@/lib/hooks/useCommentClipboard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, AtSign, Paperclip, Send, X, Image as ImageIcon, FileText, ClipboardPaste } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { CommentAttachment } from '@/types/comment';
import { useDebouncedCallback } from 'use-debounce';

// --- Dữ liệu giả lập (thay thế bằng API/dữ liệu thật của bạn) ---
const MOCK_USER = {
  id: 'user_1',
  username: 'saban_dev',
  avatarUrl: 'https://i.pravatar.cc/150?u=saban_dev',
};
const MOCK_MENTIONS = [
  { id: 'user_2', username: 'nhaibob' },
  { id: 'user_3', username: 'underlap' },
  { id: 'user_4', username: 'gemini' },
];
// --- Kết thúc dữ liệu giả lập ---

interface CommentInputProps {
  contextId: string; // postId hoặc tacticId
  parentId?: string | null;
  autoFocus?: boolean;
  onCommentPosted?: () => void; // Callback để đóng input (ví dụ: khi reply)
}

export const CommentInput: React.FC<CommentInputProps> = ({ 
  contextId, 
  parentId = null, 
  autoFocus = false,
  onCommentPosted 
}) => {
  const draftKey = parentId ? `reply_${parentId}` : `context_${contextId}`;
  const { addComment, getDraft, setDraft } = useCommentStore();
  const { clipboardImage, clearClipboardImage } = useCommentClipboard();

  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [isMentioning, setIsMentioning] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Tải Draft hoặc Clipboard Image
  useEffect(() => {
    // Ưu tiên clipboard image nếu có
    if (clipboardImage && !parentId) { // Chỉ dán vào comment gốc
      setPastedImage(clipboardImage);
      clearClipboardImage();
    } else {
      const draft = getDraft(draftKey);
      if (draft) {
        setContent(draft);
      }
    }
  }, [clipboardImage, clearClipboardImage, draftKey, getDraft, parentId]);

  // 2. Auto-save Draft
  const debouncedSetDraft = useDebouncedCallback((value: string) => {
    setDraft(draftKey, value);
  }, 500);

  // 3. Xử lý thay đổi nội dung
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedSetDraft(newContent);

    // Xử lý @mention
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newContent.substring(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (atMatch) {
      setIsMentioning(true);
      setMentionQuery(atMatch[1]);
    } else {
      setIsMentioning(false);
    }
  };
  
  // 4. Xử lý dán (Paste)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'));
    if (item) {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPastedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // 5. Xử lý Drag/Drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Lọc file (PNG, JPG, PDF)
    const filteredFiles = acceptedFiles.filter(file => 
      ['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)
    );
    setAttachments(prev => [...prev, ...filteredFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    }
  });

  // 6. Xử lý Emoji
  const onEmojiClick = (emojiData: EmojiClickData) => {
    if (!textareaRef.current) return;
    
    const { selectionStart, selectionEnd } = textareaRef.current;
    const newContent = 
      content.substring(0, selectionStart) + 
      emojiData.emoji + 
      content.substring(selectionEnd);
      
    setContent(newContent);
    debouncedSetDraft(newContent);
    textareaRef.current.focus();
    // Cập nhật vị trí con trỏ sau khi chèn
    const newCursorPos = selectionStart + emojiData.emoji.length;
    setTimeout(() => textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos), 0);
  };
  
  // 7. Xử lý @mention select
  const handleMentionClick = (username: string) => {
    if (!textareaRef.current) return;
    
    const { selectionStart } = textareaRef.current;
    const textBeforeCursor = content.substring(0, selectionStart);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex === -1) return;

    const newContent = 
      content.substring(0, atIndex) +
      `@${username} ` +
      content.substring(selectionStart);

    setContent(newContent);
    debouncedSetDraft(newContent);
    setIsMentioning(false);
    textareaRef.current.focus();
     // Cập nhật vị trí con trỏ
    const newCursorPos = atIndex + username.length + 2; // +2 cho '@' và ' '
    setTimeout(() => textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos), 0);
  };

  // 8. Gửi Comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0 && !pastedImage) return;

    // TODO: Upload files và pastedImage lên storage (ví dụ: S3, Firebase)
    // và lấy về URL. Đây là phần QUAN TRỌNG cần làm ở backend.
    
    // Giả lập attachments đã upload
    const uploadedAttachments: CommentAttachment[] = [];
    if (pastedImage) {
        uploadedAttachments.push({
            id: `file_${Math.random()}`,
            type: 'image',
            url: pastedImage, // TRONG THỰC TẾ: đây sẽ là URL sau khi upload
            name: 'pasted-image.png',
        });
    }
    
    // Giả lập upload file (bạn cần thay thế bằng logic upload thật)
    for (const file of attachments) {
        // const fileUrl = await uploadFileToServer(file); // Hàm upload của bạn
        uploadedAttachments.push({
            id: `file_${Math.random()}`,
            type: file.type.startsWith('image') ? 'image' : 'file',
            url: URL.createObjectURL(file), // URL giả lập, thay bằng fileUrl
            name: file.name,
            size: file.size,
        });
    }

    await addComment(contextId, content.trim(), parentId, uploadedAttachments);
    
    // Reset state
    setContent('');
    setAttachments([]);
    setPastedImage(null);
    setDraft(draftKey, '');
    if (onCommentPosted) {
      onCommentPosted();
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const filteredMentions = MOCK_MENTIONS.filter(user => 
    user.username.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} {...getRootProps()} className={`relative ${isDragActive ? 'outline-dashed outline-2 outline-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg' : ''}`}>
      <input {...getInputProps()} />
      
      <div className="flex space-x-3 p-3 border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
        <Avatar className="h-8 w-8">
          <AvatarImage src={MOCK_USER.avatarUrl} alt={MOCK_USER.username} />
          <AvatarFallback>{MOCK_USER.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onPaste={handlePaste}
            placeholder={parentId ? "Viết câu trả lời của bạn..." : "Thêm bình luận (hỗ trợ Markdown, @mention, kéo thả file)..."}
            className="pr-24 min-h-[60px] text-sm"
            autoFocus={autoFocus}
          />
          <Button type="submit" size="sm" className="absolute right-2 bottom-2" disabled={!content.trim() && attachments.length === 0 && !pastedImage}>
            <Send className="h-4 w-4" />
          </Button>
          
          {/* @mention Popover */}
          <AnimatePresence>
            {isMentioning && filteredMentions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full mb-1 left-0 w-48 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl z-10"
              >
                <div className="p-1">
                  {filteredMentions.map(user => (
                    <div 
                      key={user.id} 
                      onMouseDown={(e) => e.preventDefault()} // Ngăn textarea mất focus
                      onClick={() => handleMentionClick(user.username)}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${user.username}`} />
                        <AvatarFallback>{user.username[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.username}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Previews (Pasted Image & Files) */}
          <AnimatePresence>
            {(pastedImage || attachments.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2"
              >
                {pastedImage && (
                  <div className="relative group">
                    <img src={pastedImage} alt="Pasted preview" className="rounded-md object-cover h-24 w-full" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => setPastedImage(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {attachments.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type.startsWith('image') ? (
                      <img src={URL.createObjectURL(file)} alt={file.name} className="rounded-md object-cover h-24 w-full" />
                    ) : (
                      <div className="h-24 w-full bg-gray-100 dark:bg-gray-800 rounded-md flex flex-col items-center justify-center p-2">
                        <FileText className="h-8 w-8 text-gray-500" />
                        <span className="text-xs text-center truncate w-full mt-1">{file.name}</span>
                      </div>
                    )}
                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => removeAttachment(index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Toolbar */}
          <div className="flex items-center space-x-1 mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                  <Smile className="h-4.5 w-4.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </PopoverContent>
            </Popover>
            
            <Button type="button" variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100" onClick={openFileDialog}>
              <Paperclip className="h-4.5 w-4.5" />
            </Button>
            
            {/* Nút dán snapshot, chỉ hiện khi có ảnh trong clipboard store VÀ chưa dán */}
            {clipboardImage && !pastedImage && (
                 <Button type="button" variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100" onClick={() => { setPastedImage(clipboardImage); clearClipboardImage(); }}>
                    <ClipboardPaste className="h-4.5 w-4.5 mr-1" />
                    Dán Snapshot
                </Button>
            )}
          </div>
          
          {isDragActive && (
            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-500 pointer-events-none">
              <span className="font-semibold text-blue-600 dark:text-blue-300">Thả file (PNG, JPG, PDF) để tải lên</span>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};