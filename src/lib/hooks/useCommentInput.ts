import { useState, useRef, useEffect, useCallback } from 'react';
import { useCommentStore } from '@/lib/store/useCommentStore';
import { useCommentClipboard } from '@/lib/hooks/useCommentClipboard';
import { useDebouncedCallback } from 'use-debounce';
import { CommentAttachment } from '@/types/comment';
import { EmojiClickData } from 'emoji-picker-react';
import { useDropzone } from 'react-dropzone';

export interface UseCommentInputProps {
  contextId: string;
  parentId: string | null;
  onCommentPosted?: () => void;
}

export const useCommentInput = ({ contextId, parentId, onCommentPosted }: UseCommentInputProps) => {
  const draftKey = parentId ? `reply_${parentId}` : `context_${contextId}`;
  const { addComment, getDraft, setDraft, currentUser } = useCommentStore();
  const { clipboardImage, clearClipboardImage } = useCommentClipboard();

  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [isMentioning, setIsMentioning] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load Draft or Clipboard Image
  useEffect(() => {
    if (clipboardImage && !parentId) {
      setPastedImage(clipboardImage);
      clearClipboardImage();
    } else {
      const draft = getDraft(draftKey);
      if (draft) {
        setContent(draft);
      }
    }
  }, [clipboardImage, clearClipboardImage, draftKey, getDraft, parentId]);

  const debouncedSetDraft = useDebouncedCallback((value: string) => {
    setDraft(draftKey, value);
  }, 500);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedSetDraft(newContent);

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
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
    const newCursorPos = selectionStart + emojiData.emoji.length;
    setTimeout(() => textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos), 0);
  };

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
    const newCursorPos = atIndex + username.length + 2;
    setTimeout(() => textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos), 0);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'comments');
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      return data.url || null;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!content.trim() && attachments.length === 0 && !pastedImage) return;

    setIsSubmitting(true);
    
    try {
      const uploadedAttachments: CommentAttachment[] = [];
      
      if (pastedImage) {
        const res = await fetch(pastedImage);
        const blob = await res.blob();
        const file = new File([blob], 'pasted-image.png', { type: 'image/png' });
        const url = await uploadFile(file);
        if (url) {
          uploadedAttachments.push({
            id: `file_${Math.random()}`,
            type: 'image',
            url,
            name: 'pasted-image.png',
          });
        }
      }
      
      for (const file of attachments) {
        const url = await uploadFile(file);
        if (url) {
          uploadedAttachments.push({
            id: `file_${Math.random()}`,
            type: file.type.startsWith('image') ? 'image' : 'file',
            url,
            name: file.name,
            size: file.size,
          });
        }
      }

      await addComment(contextId, content.trim(), parentId, uploadedAttachments);
      
      setContent('');
      setAttachments([]);
      setPastedImage(null);
      setDraft(draftKey, '');
      if (onCommentPosted) {
        onCommentPosted();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return {
    content,
    attachments,
    pastedImage,
    isMentioning,
    mentionQuery,
    isSubmitting,
    textareaRef,
    currentUser,
    clipboardImage,
    clearClipboardImage,
    setPastedImage,
    handleContentChange,
    handlePaste,
    getRootProps,
    getInputProps,
    isDragActive,
    openFileDialog,
    onEmojiClick,
    handleMentionClick,
    handleSubmit,
    removeAttachment
  };
};
