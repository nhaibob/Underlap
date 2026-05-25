import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { X, FileText } from 'lucide-react';

interface CommentAttachmentsPreviewProps {
  pastedImage: string | null;
  setPastedImage: (img: string | null) => void;
  attachments: File[];
  removeAttachment: (index: number) => void;
}

export const CommentAttachmentsPreview = ({
  pastedImage,
  setPastedImage,
  attachments,
  removeAttachment
}: CommentAttachmentsPreviewProps) => {
  if (!pastedImage && attachments.length === 0) return null;

  return (
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
  );
};
