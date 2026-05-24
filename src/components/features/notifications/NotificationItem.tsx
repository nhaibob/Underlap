// src/components/features/notifications/NotificationItem.tsx
"use client";
import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { 
  UserPlus, 
  Heart, 
  MessageCircle, 
  Reply, 
  AtSign, 
  Mail, 
  GitFork, 
  Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: 'follow' | 'like' | 'comment' | 'reply' | 'mention' | 'message' | 'fork' | 'welcome';
  tactic_id: string | null;
  comment_id: string | null;
  conversation_id: string | null;
  content: string | null;
  is_read: boolean;
  created_at: string;
  actor?: {
    id: string;
    username: string;
    name: string;
    avatar_url: string;
  };
  tactic?: {
    id: string;
    title: string;
  };
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  compact?: boolean;
}

const NOTIFICATION_CONFIG = {
  follow: {
    icon: UserPlus,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    getMessage: (n: Notification) => 'đã follow bạn',
    getLink: (n: Notification) => `/profile/${n.actor?.username}`,
  },
  like: {
    icon: Heart,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    getMessage: (n: Notification) => `đã thích tactic "${n.tactic?.title || 'của bạn'}"`,
    getLink: (n: Notification) => n.tactic_id ? `/tactic/${n.tactic_id}` : '#',
  },
  comment: {
    icon: MessageCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    getMessage: (n: Notification) => `đã bình luận về tactic "${n.tactic?.title || 'của bạn'}"`,
    getLink: (n: Notification) => n.tactic_id ? `/tactic/${n.tactic_id}` : '#',
  },
  reply: {
    icon: Reply,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    getMessage: (n: Notification) => 'đã trả lời bình luận của bạn',
    getLink: (n: Notification) => n.tactic_id ? `/tactic/${n.tactic_id}` : '#',
  },
  mention: {
    icon: AtSign,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    getMessage: (n: Notification) => 'đã nhắc đến bạn trong bình luận',
    getLink: (n: Notification) => n.tactic_id ? `/tactic/${n.tactic_id}` : '#',
  },
  message: {
    icon: Mail,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    getMessage: (n: Notification) => 'đã gửi tin nhắn cho bạn',
    getLink: (n: Notification) => n.conversation_id ? `/messages/${n.conversation_id}` : '/messages',
  },
  fork: {
    icon: GitFork,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    getMessage: (n: Notification) => `đã fork tactic "${n.tactic?.title || 'của bạn'}"`,
    getLink: (n: Notification) => n.tactic_id ? `/tactic/${n.tactic_id}` : '#',
  },
  welcome: {
    icon: Sparkles,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    getMessage: (n: Notification) => 'Chào mừng bạn đến với Underlap!',
    getLink: (n: Notification) => '/feed',
  },
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead,
  compact = false 
}) => {
  const config = NOTIFICATION_CONFIG[notification.type];
  const Icon = config.icon;
  const message = config.getMessage(notification);
  const link = config.getLink(notification);

  const handleClick = () => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { 
    addSuffix: true,
    locale: vi 
  });

  return (
    <Link
      href={link}
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors",
        "hover:bg-white/5",
        !notification.is_read && "bg-primary/5 border-l-2 border-primary"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {notification.actor ? (
          <Avatar className={cn("w-10 h-10", compact && "w-8 h-8")}>
            <AvatarImage src={notification.actor.avatar_url} alt={notification.actor.name} />
            <AvatarFallback>{notification.actor.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        ) : (
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            config.bgColor,
            compact && "w-8 h-8"
          )}>
            <Icon className={cn("w-5 h-5", config.color, compact && "w-4 h-4")} />
          </div>
        )}
        
        {/* Icon badge */}
        {notification.actor && (
          <div className={cn(
            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
            config.bgColor,
            "border-2 border-background"
          )}>
            <Icon className={cn("w-2.5 h-2.5", config.color)} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm text-text-primary", compact && "text-xs")}>
          {notification.actor ? (
            <>
              <span className="font-semibold">{notification.actor.name || notification.actor.username}</span>
              {' '}{message}
            </>
          ) : (
            message
          )}
        </p>
        <p className={cn("text-xs text-text-secondary mt-0.5", compact && "text-[10px]")}>
          {timeAgo}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.is_read && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </Link>
  );
};
