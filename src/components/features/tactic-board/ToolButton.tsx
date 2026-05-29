import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const ToolButton = ({ 
  icon: Icon, 
  isActive, 
  onClick, 
  title, 
  disabled,
  variant = 'default'
}: { 
  icon: React.ElementType;
  isActive?: boolean;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "h-9 w-9 rounded-full transition-colors duration-200 flex items-center justify-center relative z-10",
      isActive 
        ? "text-primary-foreground" 
        : "text-muted-foreground hover:text-foreground hover:bg-muted",
      variant === 'danger' && "text-red-400 hover:text-red-500 hover:bg-red-500/10",
      disabled && "opacity-40 cursor-not-allowed"
    )}
    title={title}
  >
    <Icon className={cn("w-4 h-4", isActive && "stroke-[2.5]")} />
    {isActive && (
      <motion.div
        layoutId="active-indicator"
        className="absolute inset-0 rounded-full bg-primary shadow-md -z-10"
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </motion.button>
);

export const Divider = () => <div className="w-px h-6 bg-border/50 mx-1" />;
