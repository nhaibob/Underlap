// src/components/ui/Modal.tsx
import React, { Fragment } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, children, className }: ModalProps) => {
  if (!isOpen) return null; // Nếu không mở, không render gì cả

  return (
    <Fragment>
      {/* Lớp mờ (Backdrop) */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Nội dung Modal */}
      <div
        className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "z-50 w-[90vw] max-w-4xl", // Giới hạn chiều rộng
          "bg-panel border border-white/10 rounded-lg shadow-lg",
          className
        )}
      >
        {/* Nút đóng (Close) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-text-secondary hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Nơi chứa nội dung (TacticBoard sẽ vào đây) */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </Fragment>
  );
};