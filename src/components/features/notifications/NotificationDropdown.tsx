// src/components/features/notifications/NotificationDropdown.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Check, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NotificationItem, Notification } from "./NotificationItem";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dùng NextAuth session
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && isLoggedIn) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications/unread-count");
      const data = await response.json();
      setUnreadCount(data.count || 0);
      setUnreadMessageCount(data.messageCount || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications?limit=15");
      const data = await response.json();
      const activityNotifications = (data.notifications || []).filter(
        (n: Notification) => n.type !== "message",
      );
      setNotifications(activityNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const activityUnreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card rounded-xl shadow-xl border border-white/10 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
            <h3 className="font-semibold text-text-primary">Thông báo</h3>
            {activityUnreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Check className="w-3 h-3" />
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* Messages Link */}
          <Link
            href="/messages"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 bg-cyan-500/5 border-b border-white/10 hover:bg-cyan-500/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">Tin nhắn</p>
              <p className="text-xs text-text-secondary">
                Xem tin nhắn riêng của bạn
              </p>
            </div>
            {unreadMessageCount > 0 && (
              <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs font-bold rounded-full">
                {unreadMessageCount}
              </span>
            )}
          </Link>

          {/* Activity Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-text-secondary">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Không có thông báo hoạt động</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    compact
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-white/10 p-2">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="block w-full py-2 text-center text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                Xem tất cả thông báo
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
