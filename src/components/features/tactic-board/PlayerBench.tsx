"use client";
import React from 'react';
import { PlayerTokenProps } from './PlayerToken';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { POSITION_OPTIONS } from '@/lib/constants';
import { Trash2, Users } from 'lucide-react';

interface PlayerBenchProps {
  positionToPlace: PlayerTokenProps['position'] | null;
  setPositionToPlace: (pos: PlayerTokenProps['position'] | null) => void;
  onClearAll: () => void;
}

export const PlayerBench = ({ positionToPlace, setPositionToPlace, onClearAll }: PlayerBenchProps) => {
  const { setNodeRef } = useDroppable({ id: 'delete-zone' });

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-r border-border/40">
      <div className="p-4 border-b border-border/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Users size={14} />
            Đội hình
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {POSITION_OPTIONS.map((p) => {
                const isSelected = positionToPlace === p.value;
                return (
                    <button
                        key={p.value}
                        onClick={() => setPositionToPlace(isSelected ? null : p.value)}
                        className={cn(
                            "group relative flex items-center gap-3 p-2 rounded-xl border transition-all duration-200 text-left",
                            isSelected 
                                ? "bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(var(--primary))] ring-1 ring-primary/20" 
                                : "bg-card border-border hover:border-primary/50 hover:bg-accent/50"
                        )}
                    >
                        {/* Token Visual Simulation */}
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold border-2 shadow-sm transition-transform group-hover:scale-110",
                            isSelected ? "bg-primary text-primary-foreground border-transparent" : "bg-background border-border text-muted-foreground"
                        )}>
                            {p.value}
                        </div>
                        
                        <div className="flex flex-col">
                            <span className={cn("text-sm font-bold", isSelected ? "text-primary" : "text-foreground")}>
                                {p.label || p.value}
                            </span>
                            <span className="text-[10px] text-muted-foreground">Kéo vào sân</span>
                        </div>
                    </button>
                );
            })}
        </div>
      </div>

      <div className="p-4 border-t border-border/40 bg-muted/20">
         <div ref={setNodeRef} className="hidden" /> {/* Drop zone for deletion */}
         <button 
            onClick={onClearAll}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg border border-destructive/20 transition-colors"
         >
            <Trash2 size={14} />
            Xóa bàn cờ
         </button>
      </div>
    </div>
  );
};