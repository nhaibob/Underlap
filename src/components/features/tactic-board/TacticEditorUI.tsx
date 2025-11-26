// src/components/features/tactic-board/TacticEditorUI.tsx
"use client";
import React, { useState } from 'react';
import { TacticBoard, Player, Arrow, Area } from './TacticBoard';
import { Button } from '@/components/ui/Button';
import { ToolsPalette } from './ToolsPalette';
import { MetaPanel, MetaPanelProps } from '@/components/features/tactic-board/MetaPanel'; 
import { useDndMonitor } from '@dnd-kit/core';
import { useUIStore } from '@/lib/store/uiStore';
import { Tool, ArrowColor, ArrowStyle, ArrowType } from './CreateTacticModal';
import { PlayerEditPanel } from './PlayerEditPanel';
import { PlayerTokenProps } from './PlayerToken'; 
import { cn } from '@/lib/utils'; 
import { Settings2, X, ChevronLeft, Save, Undo2, Redo2 } from 'lucide-react'; // Import Icon

interface TacticEditorUIProps {
  players: Player[]; setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  arrows: Arrow[]; setArrows: React.Dispatch<React.SetStateAction<Arrow[]>>;
  areas: Area[]; setAreas: React.Dispatch<React.SetStateAction<Area[]>>; // Thêm Areas
  setBoardRect: (rect: DOMRect | null) => void;
  activeTool: Tool; setActiveTool: (tool: Tool) => void;
  boardRect: DOMRect | null;
  selectedPlayerId: string | null; setSelectedPlayerId: React.Dispatch<React.SetStateAction<string | null>>;
  onPlayerDelete: (id: string) => void; 
  positionToPlace: PlayerTokenProps['position'] | null; setPositionToPlace: (pos: PlayerTokenProps['position'] | null) => void;
  onBoardClick: (pos: { x: number, y: number }) => void;
  arrowColor: ArrowColor; setArrowColor: React.Dispatch<React.SetStateAction<ArrowColor>>;
  arrowStyle: ArrowStyle; setArrowStyle: React.Dispatch<React.SetStateAction<ArrowStyle>>;
  arrowType: ArrowType; setArrowType: React.Dispatch<React.SetStateAction<ArrowType>>;
  onClearAll: () => void;
  metaProps: MetaPanelProps & { onPost: () => void, isPosting: boolean };
  
  // [NEW] Props cho Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const TacticEditorUI = ({ 
  players, setPlayers, arrows, setArrows, areas, setAreas, setBoardRect, 
  activeTool, setActiveTool, boardRect, 
  selectedPlayerId, setSelectedPlayerId, onPlayerDelete,
  positionToPlace, setPositionToPlace, onBoardClick,
  arrowColor, setArrowColor, arrowStyle, setArrowStyle, arrowType, setArrowType, onClearAll,
  metaProps,
  undo, redo, canUndo, canRedo // Nhận props
}: TacticEditorUIProps) => {
    
  const { closeCreateModal } = useUIStore();
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

  useDndMonitor({
    onDragMove(event) {
      const boardNode = event.over?.rect;
      if (boardNode) setBoardRect(boardNode as DOMRect);
    }
  });
  
  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  const handlePlayerUpdate = (id: string, updates: Partial<Player>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };
  
  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card/80 backdrop-blur-sm z-50 shrink-0">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={closeCreateModal} className="lg:hidden text-muted-foreground"><ChevronLeft className="w-6 h-6" /></Button>
             <h2 className="text-lg font-bold font-headline tracking-tight">Tạo Chiến Thuật</h2>
             
             {/* [NEW] Nút Undo/Redo trên Header cho dễ truy cập (Desktop) */}
             <div className="hidden lg:flex items-center gap-1 ml-4 border-l border-white/10 pl-4">
                <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} title="Hoàn tác (Ctrl+Z)">
                    <Undo2 className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} title="Làm lại (Ctrl+Y)">
                    <Redo2 className="w-5 h-5" />
                </Button>
             </div>
          </div>

          <div className="flex items-center gap-2">
               <Button variant="secondary" size="sm" className="lg:hidden h-9 px-3" onClick={() => setIsMobilePaletteOpen(!isMobilePaletteOpen)}>
                    {isMobilePaletteOpen ? <X size={18}/> : <Settings2 size={18}/>}
                    <span className="ml-2 text-xs">Công cụ</span>
                </Button>
                <div className="hidden lg:flex gap-2">
                    <Button variant="ghost" onClick={closeCreateModal} size="sm">Hủy</Button>
                    <Button variant="default" onClick={metaProps.onPost} disabled={metaProps.isPosting || metaProps.players.length === 0 || !metaProps.title.trim()} className="gap-2 min-w-[120px]" size="sm">
                        {metaProps.isPosting ? 'Đang lưu...' : <><Save size={16}/> Đăng bài</>}
                    </Button>
                </div>
                <Button variant="default" size="icon" className="lg:hidden h-9 w-9" onClick={metaProps.onPost} disabled={metaProps.isPosting || metaProps.players.length === 0}><Save size={18}/></Button>
          </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden relative">
        <aside className={cn("absolute inset-y-0 left-0 z-40 w-64 lg:w-auto bg-background/95 backdrop-blur-xl border-r border-border transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:bg-transparent lg:border-none", isMobilePaletteOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full")}>
            <ToolsPalette
                activeTool={activeTool}
                setActiveTool={(t: any) => { setActiveTool(t); setIsMobilePaletteOpen(false); }}
                positionToPlace={positionToPlace} setPositionToPlace={setPositionToPlace}
                arrowColor={arrowColor} setArrowColor={setArrowColor}
                arrowStyle={arrowStyle} setArrowStyle={setArrowStyle}
                arrowType={arrowType} setArrowType={setArrowType}
                onClearAll={onClearAll}
                
                // [NEW] Truyền xuống ToolsPalette cho mobile
                undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
            />
        </aside>
        <main className="flex-1 bg-neutral-900/50 relative overflow-hidden flex flex-col items-center justify-center p-4 lg:p-8 select-none">
            <div className="absolute inset-0 bg-[url('/assets/images/grid-pattern.png')] opacity-[0.03] pointer-events-none" />
            <div className="w-full max-w-5xl transition-all duration-300">
                <TacticBoard 
                  players={players} setPlayers={setPlayers}
                  arrows={arrows} setArrows={setArrows}
                  areas={areas} setAreas={setAreas}
                  activeTool={activeTool}
                  boardRect={boardRect}
                  selectedPlayerId={selectedPlayerId} setSelectedPlayerId={setSelectedPlayerId}
                  onBoardClick={onBoardClick}
                  positionToPlace={positionToPlace}
                  currentArrowColor={arrowColor} currentArrowStyle={arrowStyle} currentArrowType={arrowType}
                />
            </div>
            <div className="mt-4 text-xs text-muted-foreground hidden lg:block">
                Mẹo: Dùng Ctrl+Z để hoàn tác, Click vào điểm trắng để bẻ cong mũi tên.
            </div>
        </main>
        <aside className="hidden lg:block w-80 bg-card/30 backdrop-blur-sm border-l border-border p-0 overflow-y-auto">
            {selectedPlayer && activeTool === 'select' ? (
                <div className="h-full p-4 animate-in slide-in-from-right-4 fade-in duration-200">
                    <PlayerEditPanel player={selectedPlayer} onUpdate={handlePlayerUpdate} onDelete={onPlayerDelete} setActiveTool={setActiveTool} />
                </div>
            ) : (
                <div className="h-full p-4">
                    <MetaPanel title={metaProps.title} setTitle={metaProps.setTitle} description={metaProps.description} setDescription={metaProps.setDescription} tags={metaProps.tags} setTags={metaProps.setTags} players={metaProps.players} arrows={metaProps.arrows} />
                </div>
            )}
        </aside>
      </div>
      {isMobilePaletteOpen && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-[1px] lg:hidden animate-in fade-in duration-200" onClick={() => setIsMobilePaletteOpen(false)} />}
    </div>
  );
};