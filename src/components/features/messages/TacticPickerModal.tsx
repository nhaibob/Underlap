// src/components/features/messages/TacticPickerModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { TacticBoard } from '@/components/features/tactic-board/TacticBoard';
import { supabaseAuth } from '@/lib/supabase';
import { X, Loader2, Swords, Check } from 'lucide-react';

interface Tactic {
  id: string;
  title: string;
  formation: string;
  tacticData: {
    players: any[];
    arrows: any[];
  };
}

interface TacticPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tactic: { players: any[]; arrows: any[] }) => void;
  editingTactic?: { 
    data: { players: any[]; arrows: any[] }; 
    originalMessageId: string 
  } | null;
}

export function TacticPickerModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  editingTactic 
}: TacticPickerModalProps) {
  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchTactics = async () => {
      setIsLoading(true);
      try {
        const user = await supabaseAuth.getUser();
        if (!user) return;

        const res = await fetch(`/api/tactic?authorId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setTactics(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch tactics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTactics();
  }, [isOpen]);

  const handleConfirm = () => {
    const selected = tactics.find(t => t.id === selectedId);
    if (selected) {
      onSelect(selected.tacticData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-panel rounded-2xl border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="font-headline font-bold text-lg flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            {editingTactic ? 'Chỉnh sửa chiến thuật' : 'Chọn chiến thuật để chia sẻ'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tactics.length === 0 ? (
            <div className="text-center py-12">
              <Swords className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Bạn chưa có chiến thuật nào</p>
              <Button variant="outline" onClick={onClose}>
                Tạo chiến thuật mới
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {tactics.map(tactic => (
                <button
                  key={tactic.id}
                  onClick={() => setSelectedId(tactic.id)}
                  className={`relative rounded-xl border overflow-hidden transition-all ${
                    selectedId === tactic.id
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Selection Indicator */}
                  {selectedId === tactic.id && (
                    <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="aspect-video">
                    <TacticBoard
                      variant="thumbnail"
                      players={tactic.tacticData?.players || []}
                      arrows={tactic.tacticData?.arrows || []}
                      readOnly={true}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3 bg-background/50">
                    <h3 className="font-medium text-foreground text-sm truncate">
                      {tactic.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {tactic.formation}
                    </span>
                  </div>
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
            onClick={handleConfirm}
            disabled={!selectedId}
          >
            <Check className="w-4 h-4 mr-2" />
            Chọn
          </Button>
        </div>
      </div>
    </div>
  );
}
