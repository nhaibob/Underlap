"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TacticBoard, Player, Arrow, Area } from './TacticBoard';
import { Button } from '@/components/ui/Button';
import { CompactToolbar } from './CompactToolbar';
import { MetaPanel, MetaPanelProps } from '@/components/features/tactic-board/MetaPanel'; 
import { useDndMonitor } from '@dnd-kit/core';
import { useUIStore } from '@/lib/store/uiStore';
import { Team, Ball } from './TacticBoard';
import { Tool, ArrowColor, ArrowStyle, ArrowType, LayerVisibility } from '@/lib/hooks/useTacticLogic';
import { PlayerEditPanel } from './PlayerEditPanel';
import { PlayerTokenProps } from './PlayerToken'; 
import { cn } from '@/lib/utils'; 
import { X, Save, PanelRightClose, PanelRight } from 'lucide-react';
import { FloatingToolbar } from './FloatingToolbar';
import { toPng } from 'html-to-image';

interface TacticEditorUIProps {
  players: Player[]; setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  arrows: Arrow[]; setArrows: React.Dispatch<React.SetStateAction<Arrow[]>>;
  areas: Area[]; setAreas: React.Dispatch<React.SetStateAction<Area[]>>;
  setBoardRect: (rect: DOMRect | null) => void;
  activeTool: Tool; setActiveTool: React.Dispatch<React.SetStateAction<Tool>>;
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
  
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // NEW: Team, Ball, Layer props
  selectedTeam: Team;
  setSelectedTeam: (team: Team) => void;
  ball: Ball | null;
  setBall: (ball: Ball | null) => void;
  isPlacingBall: boolean;
  setIsPlacingBall: (placing: boolean) => void;
  layerVisibility: LayerVisibility;
  toggleLayerVisibility: (layer: keyof LayerVisibility) => void;
  addBallAtPosition: (pos: { x: number, y: number }) => void;
  // NEW: Formation
  loadFormation?: (formationKey: string, team?: Team) => void;
}

export const TacticEditorUI = ({ 
  players, setPlayers, arrows, setArrows, areas, setAreas, setBoardRect, 
  activeTool, setActiveTool, boardRect, 
  selectedPlayerId, setSelectedPlayerId, onPlayerDelete,
  positionToPlace, setPositionToPlace, onBoardClick,
  arrowColor, setArrowColor, arrowStyle, setArrowStyle, arrowType, setArrowType, onClearAll,
  metaProps,
  undo, redo, canUndo, canRedo,
  selectedTeam, setSelectedTeam,
  ball, setBall,
  isPlacingBall, setIsPlacingBall,
  layerVisibility, toggleLayerVisibility,
  addBallAtPosition,
  loadFormation
}: TacticEditorUIProps) => {
    
  const { closeCreateModal } = useUIStore();
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'v': setActiveTool('select'); break;
          case 'd': case 'p': setActiveTool('draw'); break;
          case 'a': setActiveTool('area'); break;
          case 'e': setActiveTool('erase'); break;
          case 'escape': 
            setSelectedPlayerId(null); 
            setPositionToPlace(null);
            setIsPlacingBall(false);
            break;
          case 'delete': case 'backspace':
            if (selectedPlayerId) {
              e.preventDefault();
              onPlayerDelete(selectedPlayerId);
            }
            break;
        }
      }
      
      // Ctrl shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, selectedPlayerId, onPlayerDelete, undo, redo, setSelectedPlayerId, setPositionToPlace, setIsPlacingBall]);

  // Export as PNG
  const handleExport = useCallback(async () => {
    const boardEl = boardContainerRef.current?.querySelector('[data-board]') as HTMLElement;
    if (!boardEl) return;
    
    try {
      const dataUrl = await toPng(boardEl, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#1C3D2E'
      });
      
      const link = document.createElement('a');
      link.download = `tactic-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, []);

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

  const canPost = metaProps.players.length > 0 && metaProps.title.trim().length > 0;
  
  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      {/* === HEADER === */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border/50 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent backdrop-blur-md z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={closeCreateModal} 
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="border-l border-border/50 h-8 hidden sm:block" />
          <div>
            <h2 className="text-lg font-bold font-headline tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Tạo Chiến Thuật
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                {players.length} cầu thủ
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                {arrows.length} mũi tên
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Panel Button (Desktop) */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className="hidden xl:flex text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
            title={isPanelCollapsed ? "Mở panel" : "Đóng panel"}
          >
            {isPanelCollapsed ? <PanelRight className="w-5 h-5" /> : <PanelRightClose className="w-5 h-5" />}
          </Button>
          
          <Button 
            variant="default" 
            onClick={metaProps.onPost} 
            disabled={metaProps.isPosting || !canPost} 
            className="gap-2 min-w-[100px] bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20" 
            size="sm"
          >
            {metaProps.isPosting ? (
              <span className="animate-pulse">Đang lưu...</span>
            ) : (
              <>
                <Save size={16} />
                <span className="hidden sm:inline">Đăng bài</span>
                <span className="sm:hidden">Lưu</span>
              </>
            )}
          </Button>
        </div>
      </header>
      
      {/* === MAIN CONTENT === */}
      <div className="flex flex-1 overflow-hidden">
        {/* Board Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Compact Toolbar (Desktop) */}
          <div className="hidden xl:block z-50">
            <CompactToolbar
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              arrowColor={arrowColor}
              setArrowColor={setArrowColor}
              arrowStyle={arrowStyle}
              setArrowStyle={setArrowStyle}
              positionToPlace={positionToPlace}
              setPositionToPlace={setPositionToPlace}
              undo={undo}
              redo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              onClearAll={onClearAll}
              selectedTeam={selectedTeam}
              setSelectedTeam={setSelectedTeam}
              isPlacingBall={isPlacingBall}
              setIsPlacingBall={setIsPlacingBall}
              layerVisibility={layerVisibility}
              toggleLayerVisibility={toggleLayerVisibility}
              loadFormation={loadFormation}
              onExport={handleExport}
            />
          </div>

          {/* Board Container */}
          <div 
            ref={boardContainerRef}
            className={cn(
              "flex-1 relative overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6 select-none",
              "bg-gradient-to-br from-neutral-800/40 to-neutral-900/30",
              positionToPlace && "cursor-crosshair"
            )}>
            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                 style={{ 
                   backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                   backgroundSize: '24px 24px'
                 }} 
            />
            
            {/* Tactic Board - constrained by height to prevent overflow */}
            <div 
              className="w-full transition-all duration-300"
              style={{ 
                // Use CSS calc to properly size based on available height
                // The board has 3:2 aspect ratio, so width = height * 1.5
                // 230px offset = header(64px) + toolbar(~50px) + padding + bottom margin
                maxWidth: 'min(calc((100vh - 230px) * 1.5), 100%)',
                maxHeight: 'calc(100vh - 230px)'
              }}
            >
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
                ball={ball}
                setBall={setBall}
                layerVisibility={layerVisibility}
                isPlacingBall={isPlacingBall}
                addBallAtPosition={addBallAtPosition}
              />
            </div>
            
            {/* Hint when placing player */}
            {positionToPlace && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary/90 text-primary-foreground text-sm font-medium rounded-full shadow-lg animate-pulse z-30">
                👆 Click vào sân để đặt {positionToPlace}
              </div>
            )}
            
            {/* Help Text */}
            <div className="mt-3 text-[10px] text-muted-foreground/60 hidden lg:flex items-center gap-4">
              <span>💡 Ctrl+Z hoàn tác</span>
              <span>•</span>
              <span>Kéo mũi tên để bẻ cong</span>
              <span>•</span>
              <span>Click vào cầu thủ để chỉnh sửa</span>
            </div>

            {/* Floating Toolbar (Mobile) */}
            <div className="xl:hidden">
              <FloatingToolbar 
                activeTool={activeTool} setActiveTool={setActiveTool}
                arrowColor={arrowColor} setArrowColor={setArrowColor}
                arrowStyle={arrowStyle} setArrowStyle={setArrowStyle}
                undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
              />
            </div>
          </div>
        </main>

        {/* === RIGHT PANEL (Collapsible) === */}
        <aside className={cn(
          "hidden xl:flex flex-col bg-card/50 backdrop-blur-sm border-l border-border transition-all duration-300 overflow-hidden",
          isPanelCollapsed ? "w-0 border-l-0" : "w-80"
        )}>
          <div className={cn(
            "h-full p-4 overflow-y-auto transition-opacity duration-200",
            isPanelCollapsed ? "opacity-0" : "opacity-100"
          )}>
            {selectedPlayer && activeTool === 'select' ? (
              <div className="animate-in slide-in-from-right-4 fade-in duration-200">
                <PlayerEditPanel 
                  player={selectedPlayer} 
                  onUpdate={handlePlayerUpdate} 
                  onDelete={onPlayerDelete} 
                  setActiveTool={setActiveTool} 
                />
              </div>
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
        </aside>
      </div>
    </div>
  );
};