// src/components/features/messages/TacticCreatorModal.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { TacticBoard, Player, Arrow, Area, Team, Ball } from '@/components/features/tactic-board/TacticBoard';
import { CompactToolbar } from '@/components/features/tactic-board/CompactToolbar';
import { FloatingToolbar } from '@/components/features/tactic-board/FloatingToolbar';
import { useTacticLogic } from '@/lib/hooks/useTacticLogic';
import { 
  DndContext, 
  DragEndEvent, 
  MeasuringStrategy,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  useDndMonitor,
} from '@dnd-kit/core';
import { X, Send, Trash2, Undo2, Redo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TacticCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (tacticData: { players: any[]; arrows: any[] }) => void;
}

export function TacticCreatorModal({ 
  isOpen, 
  onClose, 
  onSend 
}: TacticCreatorModalProps) {
  const logic = useTacticLogic();
  const [isSending, setIsSending] = useState(false);
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // Sensors with distance constraint
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } })
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (!e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'v': logic.setActiveTool('select'); break;
          case 'd': case 'p': logic.setActiveTool('draw'); break;
          case 'a': logic.setActiveTool('area'); break;
          case 'e': logic.setActiveTool('erase'); break;
          case 'escape': 
            logic.setSelectedPlayerId(null); 
            logic.setPositionToPlace(null);
            logic.setIsPlacingBall(false);
            break;
        }
      }
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) logic.redo();
            else logic.undo();
            break;
          case 'y':
            e.preventDefault();
            logic.redo();
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, logic]);

  // Handle drag end
  function handleDragEnd(event: DragEndEvent) {
    const { activeTool, players, setPlayers, deletePlayer, boardRect, ball, setBall } = logic;
    
    if (activeTool === 'draw' || activeTool === 'area' || activeTool === 'erase') return; 
    
    const { active, over, delta } = event;
    if (!over) return; 
    
    if (over.id === 'delete-zone') {
      if (!active.data.current?.isPaletteToken) {
        if ((active.id as string).startsWith('ball-')) {
          setBall(null);
        } else {
          deletePlayer(active.id as string);
        }
      }
      return; 
    }

    if (!boardRect) {
      // Fallback: get board rect from DOM if not set
      const boardEl = boardContainerRef.current?.querySelector('[data-board]');
      if (boardEl) {
        const rect = boardEl.getBoundingClientRect();
        const scaleX = 600 / rect.width;
        const scaleY = 400 / rect.height;
        
        if ((active.id as string).startsWith('ball-') && ball) {
          setBall({
            ...ball,
            pos: {
              x: Math.max(0, Math.min(600, ball.pos.x + delta.x * scaleX)),
              y: Math.max(0, Math.min(400, ball.pos.y + delta.y * scaleY))
            }
          });
          return;
        }
        
        const newPlayers = players.map((player) => {
          if (player.id === active.id) {
            return { 
              ...player, 
              pos: { 
                x: Math.max(0, Math.min(600, player.pos.x + delta.x * scaleX)), 
                y: Math.max(0, Math.min(400, player.pos.y + delta.y * scaleY)) 
              } 
            };
          }
          return player;
        });
        setPlayers(newPlayers);
        return;
      }
      return;
    }
    const scaleX = 600 / boardRect.width;
    const scaleY = 400 / boardRect.height;
    
    if ((active.id as string).startsWith('ball-') && ball) {
      setBall({
        ...ball,
        pos: {
          x: ball.pos.x + (delta.x / scaleX),
          y: ball.pos.y + (delta.y / scaleY)
        }
      });
      return;
    }
    
    const newPlayers = players.map((player) => {
      if (player.id === active.id) {
        return { 
          ...player, 
          pos: { 
            x: player.pos.x + (delta.x / scaleX), 
            y: player.pos.y + (delta.y / scaleY) 
          } 
        };
      }
      return player;
    });
    setPlayers(newPlayers);
  }

  const handleSend = () => {
    if (logic.players.length === 0) {
      alert('Vui lòng thêm ít nhất một cầu thủ trước khi gửi');
      return;
    }
    
    setIsSending(true);
    onSend({ 
      players: logic.players, 
      arrows: logic.arrows 
    });
    
    logic.reset({ players: [], arrows: [], areas: [] });
    setIsSending(false);
    onClose();
  };

  const handleClose = () => {
    logic.reset({ players: [], arrows: [], areas: [] });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-4xl h-[85vh] max-h-[700px] bg-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <DndContext 
          sensors={sensors}
          onDragEnd={handleDragEnd} 
          measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
        >
          {/* Header - Compact for chat */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-background/50">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleClose} 
                className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h2 className="font-headline font-bold text-foreground">Tạo chiến thuật</h2>
                <p className="text-xs text-muted-foreground">
                  {logic.players.length} cầu thủ • {logic.arrows.length} mũi tên
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSend}
                disabled={logic.players.length === 0 || isSending}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Gửi
              </Button>
            </div>
          </header>

          {/* Toolbar - Simplified */}
          <div className="border-b border-white/5 bg-background/30 relative z-50">
            <CompactToolbar
              activeTool={logic.activeTool}
              setActiveTool={logic.setActiveTool}
              arrowColor={logic.arrowColor}
              setArrowColor={logic.setArrowColor}
              arrowStyle={logic.arrowStyle}
              setArrowStyle={logic.setArrowStyle}
              positionToPlace={logic.positionToPlace}
              setPositionToPlace={logic.setPositionToPlace}
              undo={logic.undo}
              redo={logic.redo}
              canUndo={logic.canUndo}
              canRedo={logic.canRedo}
              onClearAll={logic.clearAll}
              selectedTeam={logic.selectedTeam}
              setSelectedTeam={logic.setSelectedTeam}
              isPlacingBall={logic.isPlacingBall}
              setIsPlacingBall={logic.setIsPlacingBall}
              layerVisibility={logic.layerVisibility}
              toggleLayerVisibility={logic.toggleLayerVisibility}
              loadFormation={logic.loadFormation}
            />
          </div>

          {/* Board Area */}
          <div 
            ref={boardContainerRef}
            className={cn(
              "flex-1 relative overflow-hidden flex items-center justify-center p-4",
              "bg-gradient-to-br from-neutral-800/40 to-neutral-900/30",
              logic.positionToPlace && "cursor-crosshair"
            )}
          >
            {/* Tactic Board */}
            <div className="w-full max-w-3xl">
              <TacticBoard 
                players={logic.players} 
                setPlayers={logic.setPlayers}
                arrows={logic.arrows} 
                setArrows={logic.setArrows}
                areas={logic.areas} 
                setAreas={logic.setAreas}
                activeTool={logic.activeTool}
                boardRect={logic.boardRect}
                selectedPlayerId={logic.selectedPlayerId} 
                setSelectedPlayerId={logic.setSelectedPlayerId}
                onBoardClick={logic.addPlayerAtPosition}
                positionToPlace={logic.positionToPlace}
                currentArrowColor={logic.arrowColor} 
                currentArrowStyle={logic.arrowStyle} 
                currentArrowType={logic.arrowType}
                ball={logic.ball}
                setBall={logic.setBall}
                layerVisibility={logic.layerVisibility}
                isPlacingBall={logic.isPlacingBall}
                addBallAtPosition={logic.addBallAtPosition}
              />
            </div>
            
            {/* Hint when placing player */}
            {logic.positionToPlace && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary/90 text-primary-foreground text-sm font-medium rounded-full shadow-lg animate-pulse">
                👆 Click vào sân để đặt {logic.positionToPlace}
              </div>
            )}

            {/* Mobile Floating Toolbar */}
            <div className="xl:hidden">
              <FloatingToolbar 
                activeTool={logic.activeTool} 
                setActiveTool={logic.setActiveTool}
                arrowColor={logic.arrowColor} 
                setArrowColor={logic.setArrowColor}
                arrowStyle={logic.arrowStyle} 
                setArrowStyle={logic.setArrowStyle}
                undo={logic.undo} 
                redo={logic.redo} 
                canUndo={logic.canUndo} 
                canRedo={logic.canRedo}
                positionToPlace={logic.positionToPlace}
                setPositionToPlace={logic.setPositionToPlace}
              />
            </div>
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-white/5 bg-background/50">
            <p className="text-xs text-muted-foreground text-center">
              💡 Chọn vị trí từ thanh công cụ, click vào sân để thêm cầu thủ • Kéo để di chuyển
            </p>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
