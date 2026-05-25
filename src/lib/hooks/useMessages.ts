import { useState, useEffect, useCallback } from 'react';
import { supabaseAuth } from '@/lib/supabase';

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
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

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
