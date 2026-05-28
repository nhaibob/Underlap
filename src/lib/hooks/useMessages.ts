import { useState, useEffect, useCallback } from 'react';
import { supabaseAuth, supabase } from '@/lib/supabase';

export interface Message {
  id: string;
  content: string;
  tactic_data: any;
  is_suggestion: boolean;
  original_message_id: string | null;
  created_at: string;
  sender_id: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

export interface Participant {
  id: string;
  username: string;
  avatar_url: string;
}

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initUser = async () => {
      const user = await supabaseAuth.getUser();
      if (user) setUserId(user.id);
    };
    initUser();
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setParticipants(data.participants);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, userId]);

  useEffect(() => {
    fetchMessages();

    if (!supabase || !conversationId) return;

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Khi có tin nhắn mới, ta gọi lại fetchMessages để lấy cả thông tin profile (join)
          // Thay vì tự ghép dữ liệu thủ công
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [conversationId, fetchMessages]);

  const sendMessage = async (content?: string, tacticData?: any, isSuggestion = false, originalMessageId?: string) => {
    if (!userId || (!content && !tacticData)) return null;

    setIsSending(true);
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          content,
          tacticData,
          isSuggestion,
          originalMessageId
        })
      });

      if (res.ok) {
        const message = await res.json();
        setMessages(prev => [...prev, message]);
        return message;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
    return null;
  };

  return {
    messages,
    participants,
    isLoading,
    isSending,
    userId,
    sendMessage
  };
};
