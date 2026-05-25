"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { TacticBoard } from '@/components/features/tactic-board/TacticBoard';
import { TacticPickerModal } from '@/components/features/messages/TacticPickerModal';
import { MessageBubble } from '@/components/features/messages/MessageBubble';
import { useMessages, Message } from '@/lib/hooks/useMessages';
import { ArrowLeft, Send, Loader2, Swords, X, Paperclip } from 'lucide-react';

export default function ConversationPage({ params }: { params: { conversationId: string } }) {
  const { messages, participants, isLoading, isSending, userId, sendMessage } = useMessages(params.conversationId);
  const [newMessage, setNewMessage] = useState('');
  const [showTacticPicker, setShowTacticPicker] = useState(false);
  const [selectedTactic, setSelectedTactic] = useState<any>(null);
  const [editingTactic, setEditingTactic] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (selectedTactic) {
      await sendMessage(newMessage || 'Chia sẻ một chiến thuật', selectedTactic);
      setSelectedTactic(null);
    } else if (newMessage.trim()) {
      await sendMessage(newMessage.trim());
    }
    setNewMessage('');
  };

  const handleFork = (tacticData: any) => {
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
        <Avatar src={otherParticipant?.avatar_url} alt={otherParticipant?.username || 'User'} size="sm" />
        <div>
          <h2 className="font-semibold text-foreground">{otherParticipant?.username || 'Người dùng'}</h2>
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
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMe={msg.sender_id === userId}
              onFork={handleFork}
              onSuggestEdit={handleSuggestEdit}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Tactic Preview */}
      {selectedTactic && (
        <div className="p-3 bg-panel border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Swords className="w-4 h-4 text-primary" /> Chiến thuật đính kèm
            </span>
            <button onClick={() => setSelectedTactic(null)}>
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <div className="rounded-lg overflow-hidden border border-white/10 h-32">
            <TacticBoard variant="thumbnail" players={selectedTactic.players || []} arrows={selectedTactic.arrows || []} readOnly={true} />
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
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
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
