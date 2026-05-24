// src/app/(main)/notifications/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { NotificationItem, Notification } from '@/components/features/notifications';
import { Button } from '@/components/ui/Button';
import { supabaseAuth } from '@/lib/supabase';
import { Bell, Check, Trash2, Loader2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'follow' | 'like' | 'comment';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'follow', label: 'Theo dõi' },
  { value: 'like', label: 'Lượt thích' },
  { value: 'comment', label: 'Bình luận' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    fetchNotifications(true);
  }, [filter]);

  const fetchNotifications = async (reset = false) => {
    setIsLoading(true);
    try {
      const user = await supabaseAuth.getUser();
      if (!user) return;

      const currentOffset = reset ? 0 : offset;
      const response = await fetch(`/api/notifications?limit=${LIMIT}&offset=${currentOffset}`, {
        headers: { }
      });
      const data = await response.json();
      
      let filtered = data.notifications || [];
      
      // Client-side filtering (could be done server-side for better performance)
      if (filter !== 'all') {
        if (filter === 'comment') {
          filtered = filtered.filter((n: Notification) => 
            ['comment', 'reply', 'mention'].includes(n.type)
          );
        } else {
          filtered = filtered.filter((n: Notification) => n.type === filter);
        }
      }

      if (reset) {
        setNotifications(filtered);
        setOffset(LIMIT);
      } else {
        setNotifications(prev => [...prev, ...filtered]);
        setOffset(prev => prev + LIMIT);
      }
      
      setHasMore((data.notifications || []).length === LIMIT);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const user = await supabaseAuth.getUser();
      if (!user) return;

      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = await supabaseAuth.getUser();
      if (!user) return;

      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm('Bạn có chắc muốn xóa tất cả thông báo?')) return;
    
    try {
      const user = await supabaseAuth.getUser();
      if (!user) return;

      await fetch('/api/notifications?all=true', {
        method: 'DELETE',
        headers: { }
      });

      setNotifications([]);
    } catch (error) {
      console.error('Failed to delete all:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Thông báo</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-text-secondary">{unreadCount} chưa đọc</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="gap-1">
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Đánh dấu đã đọc</span>
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={deleteAllNotifications} className="gap-1 text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Xóa tất cả</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-text-secondary flex-shrink-0" />
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
              filter === option.value
                ? "bg-primary text-white"
                : "bg-panel text-text-secondary hover:bg-panel/80"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-card rounded-xl border border-white/10 overflow-hidden">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-text-secondary/30" />
            <p className="text-text-secondary">Không có thông báo nào</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-white/5">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="p-4 text-center border-t border-white/5">
                <Button
                  variant="ghost"
                  onClick={() => fetchNotifications()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Tải thêm
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
