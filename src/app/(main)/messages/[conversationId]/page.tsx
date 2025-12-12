// src/app/(main)/messages/[conversationId]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { TacticBoard } from '@/components/features/tactic-board/TacticBoard';
import { TacticPickerModal } from '@/components/features/messages/TacticPickerModal';
import { supabaseAuth } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  Swords,
  GitFork,
  Edit3,
  X,
  Paperclip,
  Eye
} from 'lucide-react';

interface Message {
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

interface Participant {
  id: string;
  username: string;
  avatar_url: string;
}

export default function ConversationPage({ params }: { params: { conversationId: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [showTacticPicker, setShowTacticPicker] = useState(false);
  const [selectedTactic, setSelectedTactic] = useState<any>(null);
  const [editingTactic, setEditingTactic] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initUser = async () => {
      const user = await supabaseAuth.getUser();
      if (user) setUserId(user.id);
    };
    initUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${params.conversationId}`, {
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
    };

    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [userId, params.conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content?: string, tacticData?: any, isSuggestion = false, originalMessageId?: string) => {
    if (!userId || (!content && !tacticData)) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/messages/${params.conversationId}`, {
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
        setNewMessage('');
        setSelectedTactic(null);
        setEditingTactic(null);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = () => {
    if (selectedTactic) {
      sendMessage(newMessage || 'Chia sẻ một chiến thuật', selectedTactic);
    } else if (newMessage.trim()) {
      sendMessage(newMessage.trim());
    }
  };

  const handleFork = (tacticData: any) => {
    // TODO: Fork tactic to user's collection
    alert('Tính năng fork sắp ra mắt!');
  };

  const handleSuggestEdit = (message: Message) => {
    setEditingTactic({
      data: message.tactic_data,
      originalMessageId: message.id
    });
    setShowTacticPicker(true);
  };

  const otherParticipant = participants.find(p => p.id !== userId);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/5 bg-panel rounded-t-xl">
        <Link href="/messages">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <Avatar 
          src={otherParticipant?.avatar_url} 
          alt={otherParticipant?.username || 'User'}
          size="sm"
        />
        <div>
          <h2 className="font-semibold text-foreground">
            {otherParticipant?.username || 'Người dùng'}
          </h2>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Bắt đầu chia sẻ chiến thuật!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === userId;
            const hasTactic = msg.tactic_data;

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${isMe ? 'order-2' : 'order-1'}`}>
                  {!isMe && (
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar 
                        src={msg.profiles?.avatar_url} 
                        alt={msg.profiles?.username}
                        size="sm"
                      />
                      <span className="text-xs text-muted-foreground">
                        {msg.profiles?.username}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`rounded-2xl ${
                    isMe 
                      ? 'bg-primary text-primary-foreground rounded-br-sm' 
                      : 'bg-panel border border-white/5 rounded-bl-sm'
                  }`}>
                    {/* Text Content */}
                    {msg.content && (
                      <p className={`px-4 py-2 ${hasTactic ? 'pb-1' : ''}`}>
                        {msg.is_suggestion && (
                          <span className="text-xs opacity-70 block mb-1">
                            💡 Đề xuất chỉnh sửa
                          </span>
                        )}
                        {msg.content}
                      </p>
                    )}

                    {/* Tactic Board */}
                    {hasTactic && (
                      <div className="p-2">
                        <div className="rounded-lg overflow-hidden border border-white/10">
                          <div className="aspect-video">
                            <TacticBoard
                              variant="thumbnail"
                              players={msg.tactic_data.players || []}
                              arrows={msg.tactic_data.arrows || []}
                              readOnly={true}
                            />
                          </div>
                        </div>

                        {/* Tactic Actions - View Details for everyone */}
                        <div className="flex gap-2 mt-2 px-2 flex-wrap">
                          <button
                            onClick={() => {
                              // Open tactic modal or navigate to view
                              const tacticJson = encodeURIComponent(JSON.stringify(msg.tactic_data));
                              window.open(`/tactic/view?data=${tacticJson}`, '_blank');
                            }}
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Xem chi tiết
                          </button>
                          {!isMe && (
                            <>
                              <button
                                onClick={() => handleFork(msg.tactic_data)}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                              >
                                <GitFork className="w-3.5 h-3.5" />
                                Fork
                              </button>
                              <button
                                onClick={() => handleSuggestEdit(msg)}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-secondary transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Đề xuất sửa
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <span className={`text-[10px] text-muted-foreground mt-1 block ${isMe ? 'text-right' : ''}`}>
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Tactic Preview */}
      {selectedTactic && (
        <div className="p-3 bg-panel border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Swords className="w-4 h-4 text-primary" />
              Chiến thuật đính kèm
            </span>
            <button onClick={() => setSelectedTactic(null)}>
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <div className="rounded-lg overflow-hidden border border-white/10 h-32">
            <TacticBoard
              variant="thumbnail"
              players={selectedTactic.players || []}
              arrows={selectedTactic.arrows || []}
              readOnly={true}
            />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-panel border-t border-white/5 rounded-b-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTacticPicker(true)}
            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Đính kèm chiến thuật"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-background/50 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
          />

          <button
            onClick={handleSend}
            disabled={isSending || (!newMessage.trim() && !selectedTactic)}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      {/* Tactic Picker Modal */}
      <TacticPickerModal
        isOpen={showTacticPicker}
        onClose={() => {
          setShowTacticPicker(false);
          setEditingTactic(null);
        }}
        onSelect={(tactic) => {
          if (editingTactic) {
            sendMessage('Đề xuất chỉnh sửa chiến thuật', tactic, true, editingTactic.originalMessageId);
          } else {
            setSelectedTactic(tactic);
          }
          setShowTacticPicker(false);
          setEditingTactic(null);
        }}
        editingTactic={editingTactic}
      />
    </div>
  );
}
