// src/components/features/tactic-board/ToolsPalette.tsx
"use client";
import React from 'react';
import { PlayerTokenProps } from './PlayerToken';
import { MousePointer, Move, Pen, Eraser, Square, Trash2, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Tool, ArrowColor, ArrowStyle } from './CreateTacticModal';
import { POSITION_OPTIONS, ALL_ARROW_COLOR_VALUES } from '@/lib/constants';

const ARROW_STYLES: ArrowStyle[] = ['solid', 'dashed'];

const ToolButton = ({ icon: Icon, label, tool, activeTool, onClick, variant = 'default', disabled }: any) => {
  const isActive = activeTool === tool;
  return (
    <Button variant="ghost" onClick={() => (tool === 'clear' ? onClick() : onClick(tool))}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center h-14 w-full p-0 gap-1 rounded-lg transition-all duration-200",
        isActive ? "bg-primary text-primary-foreground shadow-md ring-1 ring-white/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
        variant === 'danger' && "text-red-400 hover:bg-red-500/10 hover:text-red-500",
        disabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
      )} title={label}
    >
      <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
      <span className="text-[9px] font-medium uppercase tracking-tight">{label}</span>
    </Button>
  );
};

const ColorDot = ({ color, active, onClick }: { color: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={cn("w-5 h-5 rounded-full border-2 transition-all", active ? "border-white scale-125 shadow ring-2 ring-white/20" : "border-transparent hover:scale-110 opacity-70 hover:opacity-100")} style={{ backgroundColor: color }} />
);

export const ToolsPalette = ({ 
    activeTool, setActiveTool, positionToPlace, setPositionToPlace, 
    arrowColor, setArrowColor, arrowStyle, setArrowStyle, onClearAll, 
    undo, redo, canUndo, canRedo 
}: any) => {

  const handlePositionSelect = (pos: PlayerTokenProps['position']) => {
    if (positionToPlace === pos) { setPositionToPlace(null); setActiveTool('move'); } 
    else { setPositionToPlace(pos); setActiveTool('select'); }
  };
  const { setNodeRef } = useDroppable({ id: 'delete-zone' });

  return (
    <div className="w-full lg:w-[260px] bg-card/50 backdrop-blur-md border-r border-border/40 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
        
        {/* GROUP 1: CHẾ ĐỘ */}
        <section>
             <h3 className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest mb-2 px-1">Chế độ</h3>
             <div className="grid grid-cols-2 gap-2">
                <ToolButton icon={MousePointer} label="Chọn" tool="select" activeTool={activeTool} onClick={setActiveTool} />
                <ToolButton icon={Move} label="Di chuyển" tool="move" activeTool={activeTool} onClick={setActiveTool} />
             </div>
             <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
                <ToolButton icon={Undo2} label="Hoàn tác" tool="clear" onClick={undo} disabled={!canUndo} />
                <ToolButton icon={Redo2} label="Làm lại" tool="clear" onClick={redo} disabled={!canRedo} />
             </div>
        </section>

        {/* GROUP 2: MINH HỌA */}
        <section className={cn("rounded-xl transition-all duration-300", (activeTool === 'draw' || activeTool === 'area') ? "bg-accent/30 p-2 -mx-2 ring-1 ring-white/5" : "")}>
            <h3 className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest mb-2 px-1">Minh họa</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
                <ToolButton icon={Pen} label="Mũi tên" tool="draw" activeTool={activeTool} onClick={setActiveTool} />
                <ToolButton icon={Square} label="Tô vùng" tool="area" activeTool={activeTool} onClick={setActiveTool} />
                <ToolButton icon={Eraser} label="Tẩy" tool="erase" activeTool={activeTool} onClick={setActiveTool} />
            </div>
            {(activeTool === 'draw' || activeTool === 'area') && (
                <div className="space-y-3 pt-2 border-t border-white/5 animate-in fade-in">
                    
                    {/* Chọn màu (Dùng chung cho cả Arrow và Area) */}
                    <div className="flex flex-wrap gap-2 px-1 py-1 bg-black/20 rounded-lg justify-between">
                        {ALL_ARROW_COLOR_VALUES.map((c) => (
                            <ColorDot key={c} color={c} active={arrowColor === c} onClick={() => setArrowColor(c as ArrowColor)} />
                        ))}
                    </div>

                    {/* [UPDATED] Chọn kiểu nét - CHỈ HIỆN KHI VẼ MŨI TÊN (DRAW) */}
                    {activeTool === 'draw' && (
                        <div className="flex bg-black/20 p-1 rounded-lg gap-1">
                            {ARROW_STYLES.map(s => (
                                <button 
                                    key={s} 
                                    onClick={() => setArrowStyle(s)} 
                                    className={cn(
                                        "flex-1 text-[10px] py-1.5 rounded-md capitalize transition-all font-medium",
                                        arrowStyle === s 
                                            ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-white/10" 
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    )}
                                >
                                    {s === 'solid' ? 'Nét liền' : 'Nét đứt'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>

        {/* GROUP 3: CẦU THỦ */}
        <section>
            <h3 className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest mb-2 px-1">Cầu thủ</h3>
            <div className="grid grid-cols-4 gap-1.5">
                {POSITION_OPTIONS.map(p => (
                    <button key={p.value} onClick={() => handlePositionSelect(p.value)} className={cn("aspect-square rounded-md text-[10px] font-bold border flex items-center justify-center", positionToPlace === p.value ? "bg-primary text-primary-foreground border-primary scale-105" : "bg-card border-border hover:bg-accent")}>
                        {p.value}
                    </button>
                ))}
            </div>
        </section>
      </div>

      <div className="p-3 border-t border-border/40 bg-background/50">
          <div ref={setNodeRef} className="hidden" />
          <Button 
            variant="ghost" 
            onClick={onClearAll} 
            className="w-full text-red-400 hover:text-red-500 hover:bg-red-500/10 h-10 gap-2 border border-dashed border-red-500/20 group"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
            <span>Xóa tất cả</span>
          </Button>
      </div>
    </div>
  );
};