// src/components/ui/TagButton.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Hash } from 'lucide-react'; // Tái sử dụng icon 'Hash'

interface TagButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const TagButton = React.forwardRef<
  HTMLButtonElement,
  TagButtonProps
>(({ className, children, ...props }, ref) => {
  return (
    <button
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm",
        "bg-panel border border-transparent text-text-secondary",
        "hover:bg-background hover:border-panel hover:text-text-primary",
        className
      )}
      ref={ref}
      {...props}
    >
      <Hash className="w-4 h-4" />
      <span>{children}</span>
    </button>
  );
});
TagButton.displayName = 'TagButton';