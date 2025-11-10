// src/components/features/tactic-board/TacticEditorUI.tsx
"use client";
import React, { useState } from 'react';
import { TacticBoard, Player, Arrow } from './TacticBoard';
import { Button } from '@/components/ui/Button';
import { ToolsPalette } from './ToolsPalette';
import { MetaPanel, MetaPanelProps } from '@/components/features/tactic-board/MetaPanel'; 
import { useDndMonitor } from '@dnd-kit/core';
import { useUIStore } from '@/lib/store/uiStore';
import { Tool, ArrowColor, ArrowStyle, ArrowType } from './CreateTacticModal';
import { PlayerEditPanel } from './PlayerEditPanel';
import { PlayerTokenProps } from './PlayerToken'; 
import { cn } from '@/lib/utils'; 

// (Giao diện TacticEditorUIProps giữ nguyên)
interface TacticEditorUIProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  arrows: Arrow[];
  setArrows: React.Dispatch<React.SetStateAction<Arrow[]>>;
  setBoardRect: (rect: DOMRect | null) => void;
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  boardRect: DOMRect | null;
  selectedPlayerId: string | null;
  setSelectedPlayerId: React.Dispatch<React.SetStateAction<string | null>>;
  onPlayerDelete: (id: string) => void; 
  positionToPlace: PlayerTokenProps['position'] | null;
  setPositionToPlace: (pos: PlayerTokenProps['position'] | null) => void;
  onBoardClick: (pos: { x: number, y: number }) => void;
  
  arrowColor: ArrowColor;
  setArrowColor: React.Dispatch<React.SetStateAction<ArrowColor>>;
  arrowStyle: ArrowStyle;
  setArrowStyle: React.Dispatch<React.SetStateAction<ArrowStyle>>;
  arrowType: ArrowType;
  setArrowType: React.Dispatch<React.SetStateAction<ArrowType>>;
  onClearAll: () => void;

  metaProps: MetaPanelProps & { onPost: () => void, isPosting: boolean };
}

export const TacticEditorUI = ({ 
  players, 
  setPlayers,
  arrows,
  setArrows,
  setBoardRect, 
  activeTool, 
  setActiveTool,
  boardRect,
  selectedPlayerId,
  setSelectedPlayerId,
  onPlayerDelete,
  positionToPlace,
  setPositionToPlace,
  onBoardClick,
  
  arrowColor,
  setArrowColor,
  arrowStyle,
  setArrowStyle,
  arrowType,
  setArrowType,
  onClearAll,
  
  metaProps,
}: TacticEditorUIProps) => {
  const { closeCreateModal } = useUIStore();
  const [isPaletteVisible, setIsPaletteVisible] = useState(false); // State cho mobile palette

  useDndMonitor({
    onDragMove(event) {
      const boardNode = event.over?.rect;
      if (boardNode) {
        setBoardRect(boardNode as DOMRect);
      }
    }
  });
  
  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  const handlePlayerUpdate = (id: string, updates: Partial<Player>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };
  
  return (
    // CONTAINER CHÍNH: Cho phép cuộn và chiếm hết không gian Modal
    <div className="w-full flex flex-col h-full p-4 overflow-hidden"> 
        
      {/* HEADER (Bao gồm nút toggle cho mobile) */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="font-headline text-2xl font-bold">
              Tạo chiến thuật mới
          </h2>
          {/* NÚT TOGGLE PALETTE (Chỉ hiện trên mobile) */}
          <Button 
            variant="secondary" 
            size="default" // FIX LỖI #1: Đổi size="sm" thành size="default"
            className="lg:hidden" 
            onClick={() => setIsPaletteVisible(!isPaletteVisible)}
          >
            {isPaletteVisible ? 'Đóng Tools' : 'Mở Tools'}
          </Button>
      </div>
      
      {/* KHỐI 3 CỘT CHÍNH */}
      <div className="flex gap-4 flex-1 overflow-hidden">
        
        {/* CỘT 1: TOOLS PALETTE (Cố định & Responsive) */}
        <div className={cn(
            // Cố định cho Mobile Overlay
            "fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform",
            "w-36 flex-shrink-0 bg-background/95 backdrop-blur-md p-4",
            
            // Ẩn trên mobile, hiện khi isPaletteVisible=true
            isPaletteVisible ? "translate-x-0" : "-translate-x-full",
            
            // Luôn hiển thị và là Static trên Desktop (lg)
            "lg:relative lg:translate-x-0 lg:p-0 lg:w-36" 
        )}>
            {/* Nút đóng cho mobile (Nếu cần) */}
            {isPaletteVisible && <div className="absolute top-2 right-2 lg:hidden">
              <Button size="icon" variant="ghost" onClick={() => setIsPaletteVisible(false)}>X</Button>
            </div>}

            {/* Component ToolsPalette */}
            <ToolsPalette
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                positionToPlace={positionToPlace}
                setPositionToPlace={setPositionToPlace}
                
                arrowColor={arrowColor}
                setArrowColor={setArrowColor}
                arrowStyle={arrowStyle}
                setArrowStyle={setArrowStyle}
                arrowType={arrowType}
                setArrowType={setArrowType}
                onClearAll={onClearAll}
                selectedPlayerId={selectedPlayerId}
                onDeleteSelectedPlayer={onPlayerDelete}
            />
        </div>

        
        {/* CỘT 2: TACTIC BOARD (Sân bóng - CHIẾM HẾT MỌI LÚC) */}
        <div className="flex-1 min-w-[400px] flex items-center justify-center w-full"> 
            <TacticBoard 
              players={players} 
              setPlayers={setPlayers}
              arrows={arrows}
              setArrows={setArrows}
              activeTool={activeTool}
              boardRect={boardRect}
              selectedPlayerId={selectedPlayerId}
              setSelectedPlayerId={setSelectedPlayerId}
              onBoardClick={onBoardClick}
              positionToPlace={positionToPlace}
              
              currentArrowColor={arrowColor}
              currentArrowStyle={arrowStyle}
              currentArrowType={arrowType}
            />
        </div>
        
        {/* CỘT 3: META PANEL / PLAYER EDIT (Cố định width & Ẩn trên Mobile) */}
        <div className="w-72 flex-shrink-0 hidden lg:block overflow-y-auto">
            {selectedPlayer && activeTool === 'select' ? (
                <PlayerEditPanel 
                  player={selectedPlayer}
                  onUpdate={handlePlayerUpdate}
                  onDelete={onPlayerDelete}
                  setActiveTool={setActiveTool}
                />
            ) : (
                <MetaPanel 
                  title={metaProps.title}
                  setTitle={metaProps.setTitle}
                  description={metaProps.description}
                  setDescription={metaProps.setDescription}
                  tags={metaProps.tags}
                  setTags={metaProps.setTags}
                  players={metaProps.players}
                  arrows={metaProps.arrows}
                />
            )}
        </div>
      </div>
      
      {/* NÚT ACTION CUỐL CÙNG (DƯỚI CÙNG MODAL) */}
      <div className="flex justify-end gap-4 mt-4 border-t border-panel pt-3 flex-shrink-0">
        <Button variant="ghost" onClick={closeCreateModal}>Hủy</Button>
        <Button 
            variant="default" 
            onClick={metaProps.onPost} 
            disabled={metaProps.isPosting || metaProps.players.length === 0 || !metaProps.title.trim()}
        >
            {metaProps.isPosting ? 'Đang Đăng...' : 'Đăng Chiến Thuật'}
        </Button>
      </div>
    </div>
  );
};