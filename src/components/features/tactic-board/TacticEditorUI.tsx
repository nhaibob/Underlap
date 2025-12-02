"use client";
import React, { useState, useEffect } from 'react';
import { TacticBoard, Player, Arrow, Area } from './TacticBoard';
import { Button } from '@/components/ui/Button';
import { PlayerBench } from './PlayerBench';
import { FloatingToolbar } from './FloatingToolbar';
import { MetaPanel, MetaPanelProps } from '@/components/features/tactic-board/MetaPanel'; 
import { useDndMonitor } from '@dnd-kit/core';
import { useUIStore } from '@/lib/store/uiStore';
import { Tool, ArrowColor, ArrowStyle, ArrowType } from './CreateTacticModal';
import { PlayerEditPanel } from './PlayerEditPanel';
import { PlayerTokenProps } from './PlayerToken'; 
import { cn } from '@/lib/utils'; 
import { ChevronLeft, Save, Menu, X, Layout, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Maximize2 } from 'lucide-react'; 

interface TacticEditorUIProps {
  players: Player[]; setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  arrows: Arrow[]; setArrows: React.Dispatch<React.SetStateAction<Arrow[]>>;
  areas: Area[]; setAreas: React.Dispatch<React.SetStateAction<Area[]>>;
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
  undo, redo, canUndo, canRedo
}: TacticEditorUIProps) => {
    
  const { closeCreateModal } = useUIStore();
  
  // State quản lý hiển thị Sidebar trên Desktop
  // Mặc định: Trái hiện trên XL, Phải hiện trên LG
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  
  // State cho Mobile Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-collapse logic dựa trên kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setShowLeftSidebar(false); // Tự động ẩn sidebar trái trên laptop nhỏ
      } else {
        setShowLeftSidebar(true);
      }
    };
    
    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      
      {/* --- HEADER --- */}
      <header className="h-14 lg:h-16 flex items-center justify-between px-4 border-b border-border bg-card/80 backdrop-blur-md z-50 shrink-0 transition-all">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={closeCreateModal} className="text-muted-foreground hover:bg-muted/50 rounded-full h-8 w-8 lg:h-10 lg:w-10">
                <ChevronLeft className="w-5 h-5" />
             </Button>
             
             {/* Desktop Toggle Buttons */}
             <div className="hidden lg:flex items-center gap-1 mr-2 border-r border-border pr-2">
                <Button 
                    variant="ghost" size="icon" 
                    onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                    className={cn("h-8 w-8", !showLeftSidebar && "text-muted-foreground")}
                    title={showLeftSidebar ? "Thu gọn danh sách" : "Mở danh sách cầu thủ"}
                >
                    {showLeftSidebar ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                </Button>
             </div>

             <div className="flex flex-col">
                <h2 className="text-sm font-bold font-headline tracking-tight leading-none text-foreground truncate max-w-[150px] lg:max-w-xs">
                    {metaProps.title || "Chiến thuật mới"}
                </h2>
                <span className="text-[10px] text-muted-foreground hidden lg:flex items-center gap-1.5 mt-0.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> 
                   Chế độ chỉnh sửa
                </span>
             </div>
          </div>

          <div className="flex items-center gap-2">
                {/* Right Sidebar Toggle (Desktop) */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hidden lg:flex text-muted-foreground"
                    onClick={() => setShowRightSidebar(!showRightSidebar)}
                    title={showRightSidebar ? "Ẩn thông tin" : "Hiện thông tin"}
                >
                    {showRightSidebar ? <PanelRightOpen size={18}/> : <PanelRightClose size={18}/>}
                </Button>
                
                <div className="w-px h-6 bg-border mx-1 hidden lg:block" />

                <Button variant="outline" size="sm" onClick={closeCreateModal} className="hidden sm:flex border-border/50 hover:bg-muted h-9 text-xs">
                    Hủy bỏ
                </Button>
                <Button 
                    variant="default" 
                    onClick={metaProps.onPost} 
                    disabled={metaProps.isPosting || players.length === 0} 
                    className="gap-2 px-4 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 h-9 text-xs font-semibold" 
                    size="sm"
                >
                    {metaProps.isPosting ? 'Đang lưu...' : <><Save size={16}/> Lưu</>}
                </Button>
                
                {/* Mobile Menu Button */}
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={20}/> : <Menu size={20}/>}
                </Button>
          </div>
      </header>
      
      {/* --- MAIN LAYOUT CONTAINER --- */}
      <div className="flex flex-1 overflow-hidden relative group/canvas">
        
        {/* --- LEFT SIDEBAR (Collapsible on Desktop) --- */}
        <div 
            className={cn(
                "fixed inset-y-0 left-0 z-30 w-64 bg-card/95 backdrop-blur-xl border-r border-border transition-all duration-300 ease-in-out lg:static lg:bg-card/50",
                // Logic Mobile: Dựa vào isMobileMenuOpen
                // Logic Desktop: Dựa vào showLeftSidebar
                "transform lg:transform-none", // Reset transform on desktop container
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0", // Mobile slide
                // Desktop Collapse logic:
                !showLeftSidebar && "lg:w-0 lg:border-r-0 lg:overflow-hidden lg:opacity-0"
            )}
        >
            <div className="w-64 h-full"> {/* Inner wrapper to prevent content squishing */}
                <PlayerBench 
                    positionToPlace={positionToPlace} 
                    setPositionToPlace={setPositionToPlace}
                    onClearAll={onClearAll}
                />
            </div>
        </div>
        
        {/* --- MAIN PITCH AREA --- */}
        <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center bg-accent/5 select-none p-2 lg:p-4">
            
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
                 style={{ backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`, backgroundSize: '24px 24px' }} 
            />

            {/* Board Container - Tự động scale */}
            <div className="relative z-10 w-full h-full max-w-[1400px] flex items-center justify-center transition-all duration-500 ease-out pb-20 lg:pb-0"> 
                {/* pb-20 để tránh toolbar trên mobile/tablet đè vào sân */}
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
            
            {/* --- FLOATING TOOLBAR --- */}
            {/* Vị trí trên Desktop và Mobile được tối ưu */}
            <FloatingToolbar 
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                arrowColor={arrowColor} setArrowColor={setArrowColor}
                arrowStyle={arrowStyle} setArrowStyle={setArrowStyle}
                undo={undo} redo={redo}
                canUndo={canUndo} canRedo={canRedo}
            />

            {/* Nút mở lại Sidebar trái khi đang đóng (Floating Hint) */}
            {!showLeftSidebar && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:block animate-in fade-in zoom-in duration-300">
                    <Button 
                        variant="secondary" size="icon" 
                        className="rounded-full shadow-lg border border-border bg-card/80 backdrop-blur hover:scale-110 transition-transform"
                        onClick={() => setShowLeftSidebar(true)}
                        title="Mở danh sách cầu thủ"
                    >
                        <PanelLeftOpen size={20} />
                    </Button>
                </div>
            )}

        </main>

        {/* --- RIGHT SIDEBAR (Collapsible) --- */}
        <aside 
            className={cn(
                "hidden lg:flex flex-col bg-card/50 backdrop-blur-sm border-l border-border transition-all duration-300 ease-in-out overflow-hidden",
                showRightSidebar ? "w-80 opacity-100" : "w-0 opacity-0 border-l-0"
            )}
        >
            <div className="w-80 h-full flex flex-col"> {/* Inner wrapper */}
                {selectedPlayer && activeTool === 'select' ? (
                    <div className="h-full animate-in slide-in-from-right-4 fade-in duration-300">
                        {/* Header Panel */}
                        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-accent/10">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Chỉnh sửa</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-500" onClick={() => setSelectedPlayerId(null)}><X size={14}/></Button>
                        </div>
                        <div className="p-4">
                            <PlayerEditPanel 
                                player={selectedPlayer} 
                                onUpdate={handlePlayerUpdate} 
                                onDelete={onPlayerDelete} 
                                setActiveTool={setActiveTool} 
                            />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col animate-in fade-in duration-300">
                         <div className="p-4 border-b border-border/50 bg-accent/10 flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Thông tin</span>
                            {/* Nút đóng panel nhanh */}
                            <Button variant="ghost" size="icon" className="h-5 w-5 opacity-50 hover:opacity-100" onClick={() => setShowRightSidebar(false)}>
                                <Layout size={14} />
                            </Button>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                            <MetaPanel 
                                title={metaProps.title} setTitle={metaProps.setTitle} 
                                description={metaProps.description} setDescription={metaProps.setDescription} 
                                tags={metaProps.tags} setTags={metaProps.setTags} 
                                players={metaProps.players} arrows={metaProps.arrows} 
                            />
                        </div>
                    </div>
                )}
            </div>
        </aside>

        {/* --- MOBILE BACKDROP --- */}
        {isMobileMenuOpen && (
            <div 
                className="fixed inset-0 z-20 bg-black/60 backdrop-blur-[2px] lg:hidden animate-in fade-in" 
                onClick={() => setIsMobileMenuOpen(false)} 
            />
        )}
      </div>
    </div>
  );
};