// src/app/dm/[conversationId]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { TacticBoard } from '@/components/features/tactic-board/TacticBoard';
import { TacticPickerModal } from '@/components/features/messages/TacticPickerModal';
import { TacticViewModal } from '@/components/features/messages/TacticViewModal';
import { TacticCreatorModal } from '@/components/features/messages/TacticCreatorModal';
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
  Eye,
  Home,
  PlusCircle,
  Trash2,
  Reply
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  tactic_data: any;
  is_suggestion: boolean;
  original_message_id: string | null;
  reply_to_id: string | null;
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

export default function DMConversationPage({ params }: { params: { conversationId: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [showTacticPicker, setShowTacticPicker] = useState(false);
  const [showTacticCreator, setShowTacticCreator] = useState(false);
  const [viewingTactic, setViewingTactic] = useState<any>(null);
  const [selectedTactic, setSelectedTactic] = useState<any>(null);
  const [editingTactic, setEditingTactic] = useState<any>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
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
          originalMessageId,
          replyToId: originalMessageId // Using originalMessageId param for reply_to
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
    const replyId = replyToMessage?.id || undefined;
    
    if (selectedTactic) {
      sendMessage(newMessage || 'Chia sẻ một chiến thuật', selectedTactic, false, replyId);
    } else if (newMessage.trim()) {
      sendMessage(newMessage.trim(), undefined, false, replyId);
    }
    
    // Clear reply state after sending
    setReplyToMessage(null);
  };

  const handleFork = async (tacticData: any) => {
    if (!userId) {
      alert('Bạn cần đăng nhập để fork chiến thuật');
      return;
    }

    try {
      const res = await fetch('/api/tactic/fork', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          players: tacticData.players || [],
          arrows: tacticData.arrows || [],
          title: 'Chiến thuật đã fork',
          description: 'Fork từ tin nhắn trực tiếp'
        })
      });

      if (res.ok) {
        const result = await res.json();
        alert('✅ Đã fork chiến thuật về bộ sưu tập của bạn!');
        console.log('Forked tactic:', result);
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.error || 'Không thể fork chiến thuật'}`);
      }
    } catch (error) {
      console.error('Fork error:', error);
      alert('Có lỗi xảy ra khi fork chiến thuật');
    }
  };

  const handleSuggestEdit = (message: Message) => {
    setEditingTactic({
      data: message.tactic_data,
      originalMessageId: message.id
    });
    setShowTacticPicker(true);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!userId) return;
    
    if (!confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;
    
    try {
      const res = await fetch(`/api/messages/${params.conversationId}?messageId=${messageId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });
      
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      } else {
        const error = await res.json();
        alert(error.error || 'Không thể xóa tin nhắn');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Có lỗi xảy ra khi xóa tin nhắn');
    }
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-panel/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/dm">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Avatar 
            src={otherParticipant?.avatar_url} 
            alt={otherParticipant?.username || 'User'}
            size="sm"
          />
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">
              {otherParticipant?.username || 'Người dùng'}
            </h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <Link href="/feed">
            <Button variant="ghost" size="sm">
              <Home className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Swords className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Bắt đầu chia sẻ chiến thuật!</p>
              <p className="text-sm mt-2">Gửi tin nhắn hoặc chia sẻ chiến thuật với người này</p>
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
                  <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
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
                        <p className={`px-4 py-3 ${hasTactic ? 'pb-2' : ''}`}>
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
                          <div className="rounded-lg overflow-hidden border border-white/10 bg-[#1C3D2E]">
                            {/* Tactic preview with proper aspect ratio */}
                            <div className="w-full max-w-[300px]">
                              <TacticBoard
                                variant="thumbnail"
                                players={msg.tactic_data.players || []}
                                arrows={msg.tactic_data.arrows || []}
                                readOnly={true}
                              />
                            </div>
                          </div>

                          {/* Tactic Actions - View Details for everyone */}
                          <div className="flex gap-3 mt-2 px-2 flex-wrap">
                            <button
                              onClick={() => setViewingTactic(msg.tactic_data)}
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

                    {/* Message Actions Row */}
                    <div className={`flex items-center gap-3 mt-1 ${isMe ? 'justify-end' : ''}`}>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(msg.created_at)}
                      </span>
                      
                      {/* Reply button - for all messages */}
                      <button
                        onClick={() => setReplyToMessage(msg)}
                        className="text-muted-foreground/50 hover:text-primary transition-colors p-0.5"
                        title="Trả lời"
                      >
                        <Reply className="w-3 h-3" />
                      </button>
                      
                      {/* Delete button - only for own messages */}
                      {isMe && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-muted-foreground/50 hover:text-red-400 transition-colors p-0.5"
                          title="Xóa tin nhắn"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Selected Tactic Preview */}
      {selectedTactic && (
        <div className="border-t border-white/5 bg-panel">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Swords className="w-4 h-4 text-primary" />
                Chiến thuật đính kèm
              </span>
              <button onClick={() => setSelectedTactic(null)}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="rounded-lg overflow-hidden border border-white/10 h-24">
              <TacticBoard
                variant="thumbnail"
                players={selectedTactic.players || []}
                arrows={selectedTactic.arrows || []}
                readOnly={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reply Preview */}
      {replyToMessage && (
        <div className="border-t border-white/5 bg-panel/80">
          <div className="max-w-4xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between bg-primary/10 rounded-lg px-3 py-2 border-l-2 border-primary">
              <div className="flex-1 min-w-0">
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                  <Reply className="w-3 h-3" />
                  Trả lời {replyToMessage.profiles?.username || 'Người dùng'}
                </span>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {replyToMessage.tactic_data ? '🎯 Chiến thuật' : replyToMessage.content}
                </p>
              </div>
              <button 
                onClick={() => setReplyToMessage(null)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="border-t border-white/5 bg-panel">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTacticPicker(true)}
              className="p-2.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Đính kèm chiến thuật có sẵn"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowTacticCreator(true)}
              className="p-2.5 rounded-full text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-colors"
              title="Tạo chiến thuật mới"
            >
              <PlusCircle className="w-5 h-5" />
            </button>

            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-background border border-white/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            />

            <button
              onClick={handleSend}
              disabled={isSending || (!newMessage.trim() && !selectedTactic)}
              className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </footer>

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

      {/* Tactic View Modal */}
      <TacticViewModal
        isOpen={!!viewingTactic}
        onClose={() => setViewingTactic(null)}
        tacticData={viewingTactic}
        onFork={handleFork}
      />

      {/* Tactic Creator Modal */}
      <TacticCreatorModal
        isOpen={showTacticCreator}
        onClose={() => setShowTacticCreator(false)}
        onSend={(tacticData) => {
          sendMessage('', tacticData);
          setShowTacticCreator(false);
        }}
      />
    </div>
  );
}
