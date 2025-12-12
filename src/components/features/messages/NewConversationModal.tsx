// src/components/features/messages/NewConversationModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { supabaseAuth } from '@/lib/supabase';
import { X, Loader2, Search, MessageSquare, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  username: string;
  avatar_url: string;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewConversationModal({ isOpen, onClose }: NewConversationModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const initUser = async () => {
      const user = await supabaseAuth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    initUser();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .limit(15);

        // If there's a search query, filter by it
        if (searchQuery.trim()) {
          query = query.ilike('username', `%${searchQuery}%`);
        }

        // Exclude current user if we have their ID
        if (currentUserId) {
          query = query.neq('id', currentUserId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Search error:', error);
        }

        console.log('User search results:', data);
        setUsers(data || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, isOpen, currentUserId]);

  const handleStartConversation = async () => {
    console.log('Starting conversation', { selectedUserId, currentUserId });
    
    if (!selectedUserId || !currentUserId) {
      console.error('Missing IDs', { selectedUserId, currentUserId });
      alert('Không thể bắt đầu cuộc trò chuyện. Vui lòng đăng nhập lại.');
      return;
    }

    setIsCreating(true);
    try {
      console.log('Creating conversation...');
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify({ participantId: selectedUserId })
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok) {
        onClose();
        router.push(`/messages/${data.conversationId}`);
      } else {
        alert(`Lỗi: ${data.error || 'Không thể tạo cuộc trò chuyện'}`);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Đã xảy ra lỗi khi tạo cuộc trò chuyện');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-panel rounded-2xl border border-white/10 w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="font-headline font-bold text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Tin nhắn mới
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm người dùng..."
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {searchQuery ? 'Không tìm thấy người dùng' : 'Nhập tên để tìm kiếm'}
            </div>
          ) : (
            <div className="space-y-2">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedUserId === user.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-background/50 border border-transparent hover:bg-background'
                  }`}
                >
                  <Avatar src={user.avatar_url} alt={user.username} size="sm" />
                  <span className="font-medium text-foreground">{user.username}</span>
                  {selectedUserId === user.id && (
                    <Check className="w-4 h-4 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-white/5">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleStartConversation}
            disabled={!selectedUserId || isCreating}
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4 mr-2" />
            )}
            Bắt đầu trò chuyện
          </Button>
        </div>
      </div>
    </div>
  );
}
