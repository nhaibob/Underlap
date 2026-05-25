import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { TacticBoard } from '@/components/features/tactic-board/TacticBoard';
import { Eye, GitFork, Edit3 } from 'lucide-react';
import { Message } from '@/lib/hooks/useMessages';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onFork: (tacticData: any) => void;
  onSuggestEdit: (message: Message) => void;
}

export const MessageBubble = ({ message, isMe, onFork, onSuggestEdit }: MessageBubbleProps) => {
  const hasTactic = message.tactic_data;

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isMe ? 'order-2' : 'order-1'}`}>
        {!isMe && (
          <div className="flex items-center gap-2 mb-1">
            <Avatar 
              src={message.profiles?.avatar_url} 
              alt={message.profiles?.username}
              size="sm"
            />
            <span className="text-xs text-muted-foreground">
              {message.profiles?.username}
            </span>
          </div>
        )}

        <div className={`rounded-2xl ${
          isMe 
            ? 'bg-primary text-primary-foreground rounded-br-sm' 
            : 'bg-panel border border-white/5 rounded-bl-sm'
        }`}>
          {message.content && (
            <p className={`px-4 py-2 ${hasTactic ? 'pb-1' : ''}`}>
              {message.is_suggestion && (
                <span className="text-xs opacity-70 block mb-1">
                  💡 Đề xuất chỉnh sửa
                </span>
              )}
              {message.content}
            </p>
          )}

          {hasTactic && (
            <div className="p-2">
              <div className="rounded-lg overflow-hidden border border-white/10">
                <div className="aspect-video">
                  <TacticBoard
                    variant="thumbnail"
                    players={message.tactic_data.players || []}
                    arrows={message.tactic_data.arrows || []}
                    readOnly={true}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-2 px-2 flex-wrap">
                <button
                  onClick={() => {
                    const tacticJson = encodeURIComponent(JSON.stringify(message.tactic_data));
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
                      onClick={() => onFork(message.tactic_data)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <GitFork className="w-3.5 h-3.5" />
                      Fork
                    </button>
                    <button
                      onClick={() => onSuggestEdit(message)}
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
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
};
