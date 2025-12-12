// src/app/dm/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NewConversationModal } from '@/components/features/messages/NewConversationModal';
import { supabaseAuth } from '@/lib/supabase';
import { 
  MessageSquare, 
  Search, 
  Loader2, 
  Plus,
  Swords,
  ChevronRight,
  ArrowLeft,
  Home
} from 'lucide-react';

interface Conversation {
  id: string;
  updatedAt: string;
  participants: Array<{
    id: string;
    username: string;
    avatar_url: string;
  }>;
  lastMessage: {
    id: string;
    content: string;
    tactic_data: any;
    created_at: string;
    sender_id: string;
  } | null;
  unreadCount: number;
}

export default function DMPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      const user = await supabaseAuth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    initUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/messages', {
          headers: { 'x-user-id': userId }
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [userId]);

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return conv.participants.some(p => 
      p.username?.toLowerCase().includes(query)
    );
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${Math.floor(diffHours)}h trước`;
    if (diffHours < 48) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN');
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Đăng nhập để xem tin nhắn</h2>
          <p className="text-muted-foreground mb-6">Bạn cần đăng nhập để sử dụng tính năng nhắn tin.</p>
          <Link href="/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-panel/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/feed">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Trang chủ
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-headline font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Tin nhắn
              </h1>
              <p className="text-xs text-muted-foreground">Chia sẻ chiến thuật với cộng đồng</p>
            </div>
          </div>
          <Button variant="default" size="sm" onClick={() => setShowNewConversation(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tin nhắn mới
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm cuộc trò chuyện..."
            className="pl-10 h-11 bg-panel border-white/10"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Conversation List */}
        {!isLoading && (
          <div className="space-y-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-16 bg-panel rounded-xl border border-white/5">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground text-lg mb-2">Chưa có tin nhắn</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Bắt đầu cuộc trò chuyện mới để chia sẻ chiến thuật
                </p>
                <Button variant="default" onClick={() => setShowNewConversation(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo cuộc trò chuyện
                </Button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherParticipant = conv.participants[0];
                const hasTactic = conv.lastMessage?.tactic_data;
                
                return (
                  <Link
                    key={conv.id}
                    href={`/dm/${conv.id}`}
                    className="flex items-center gap-4 p-4 bg-panel rounded-xl border border-white/5 hover:border-primary/30 transition-all group"
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar 
                        src={otherParticipant?.avatar_url} 
                        alt={otherParticipant?.username || 'User'}
                        size="md"
                      />
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {otherParticipant?.username || 'Người dùng'}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {conv.lastMessage ? formatTime(conv.lastMessage.created_at) : ''}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                        {hasTactic && (
                          <Swords className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        )}
                        {hasTactic 
                          ? 'Đã chia sẻ một chiến thuật'
                          : conv.lastMessage?.content || 'Bắt đầu cuộc trò chuyện'
                        }
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
      />
    </div>
  );
}
