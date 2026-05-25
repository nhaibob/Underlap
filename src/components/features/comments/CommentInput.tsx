"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Paperclip, Send, ClipboardPaste } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useCommentInput } from '@/lib/hooks/useCommentInput';
import { CommentAttachmentsPreview } from './CommentAttachmentsPreview';

const MOCK_MENTIONS = [
  { id: 'user_2', username: 'nhaibob' },
  { id: 'user_3', username: 'underlap' },
  { id: 'user_4', username: 'gemini' },
];

interface CommentInputProps {
  contextId: string;
  parentId?: string | null;
  autoFocus?: boolean;
  onCommentPosted?: () => void;
}

export const CommentInput: React.FC<CommentInputProps> = ({ 
  contextId, 
  parentId = null, 
  autoFocus = false,
  onCommentPosted 
}) => {
  const {
    content, attachments, pastedImage, isMentioning, mentionQuery, isSubmitting,
    textareaRef, currentUser, clipboardImage, clearClipboardImage, setPastedImage,
    handleContentChange, handlePaste, getRootProps, getInputProps, isDragActive,
    openFileDialog, onEmojiClick, handleMentionClick, handleSubmit, removeAttachment
  } = useCommentInput({ contextId, parentId, onCommentPosted });

  const filteredMentions = MOCK_MENTIONS.filter(user => 
    user.username.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} {...getRootProps()} className={`relative ${isDragActive ? 'outline-dashed outline-2 outline-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg' : ''}`}>
      <input {...getInputProps()} />
      
      <div className="flex space-x-3 p-3 border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
        <Avatar className="h-8 w-8">
          <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.username || 'User'} />
          <AvatarFallback>{currentUser?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
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
          <Button type="submit" size="sm" className="absolute right-2 bottom-2" disabled={isSubmitting || !currentUser || (!content.trim() && attachments.length === 0 && !pastedImage)}>
            <Send className="h-4 w-4" />
          </Button>
          
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
                      onMouseDown={(e) => e.preventDefault()}
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

          <AnimatePresence>
            <CommentAttachmentsPreview 
              pastedImage={pastedImage}
              setPastedImage={setPastedImage}
              attachments={attachments}
              removeAttachment={removeAttachment}
            />
          </AnimatePresence>
          
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