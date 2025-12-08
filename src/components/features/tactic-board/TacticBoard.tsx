"use client"; 
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { PlayerToken } from './PlayerToken';
import { useDroppable, useDraggable } from '@dnd-kit/core';
// [FIXED] Import Types từ useTacticLogic thay vì CreateTacticModal
import { Tool, ArrowColor, ArrowStyle, ArrowType } from '@/lib/hooks/useTacticLogic';
import { v4 as uuidv4 } from 'uuid';
import { PlayerTokenProps } from './PlayerToken'; 

// --- Constants ---
const AREA_COLORS: ArrowColor[] = ['#6C5CE7', '#FF7F50', '#00CED1', '#FF6B81', '#FDCB6E', '#54A0FF'];

// --- Interfaces ---
export interface Player {
  id: string;
  position: PlayerTokenProps['position'];
  label: string;
  pos: { x: number; y: number }; 
}

export interface Arrow {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: ArrowColor; 
  style: ArrowStyle;
  type: ArrowType;
  controlPoint?: { x: number; y: number }; 
}

export interface Area {
    id: string;
    x: number; y: number; w: number; h: number; color: string;
}

// --- Background ---
const FootballPitchBackground = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
    {/* Enhanced grass background - more vibrant and realistic */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#2E7D47] via-[#25683D] to-[#1D5432]" />
    
    {/* Grass stripes pattern - more pronounced */}
    <div className="absolute inset-0 opacity-[0.15]" 
         style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.2) 0px, transparent 40px, transparent 80px, rgba(0,0,0,0.2) 80px, rgba(0,0,0,0.2) 120px)' }} />
    
    {/* Subtle noise texture for realism */}
    <div className="absolute inset-0 opacity-[0.03]"
         style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
    
    {/* Field markings - clearer and more visible */}
    <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 600 400" fill="none" preserveAspectRatio="none">
        {/* Outer boundary */}
        <rect x="5" y="5" width="590" height="390" rx="18" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
        
        {/* Center line */}
        <line x1="300" y1="5" x2="300" y2="395" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
        
        {/* Center circle */}
        <circle cx="300" cy="200" r="50" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
        <circle cx="300" cy="200" r="4" fill="#FFFFFF" opacity="0.95" />
        
        {/* Left penalty area */}
        <rect x="5" y="80" width="80" height="240" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
        {/* Left goal area */}
        <rect x="5" y="140" width="30" height="120" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
        {/* Left penalty spot */}
        <circle cx="60" cy="200" r="3" fill="#FFFFFF" opacity="0.95" />
        {/* Left penalty arc */}
        <path d="M 85 160 Q 110 200 85 240" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.95"/>
        
        {/* Right penalty area */}
        <rect x="515" y="80" width="80" height="240" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
        {/* Right goal area */}
        <rect x="565" y="140" width="30" height="120" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
        {/* Right penalty spot */}
        <circle cx="540" cy="200" r="3" fill="#FFFFFF" opacity="0.95" />
        {/* Right penalty arc */}
        <path d="M 515 160 Q 490 200 515 240" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.95"/>
        
        {/* Corner arcs */}
        <path d="M 5 25 A 20 20 0 0 1 25 5" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.95"/>
        <path d="M 595 25 A 20 20 0 0 0 575 5" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.95"/>
        <path d="M 5 375 A 20 20 0 0 0 25 395" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.95"/>
        <path d="M 595 375 A 20 20 0 0 1 575 395" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.95"/>
    </svg>
  </div>
);

// --- Draggable Token ---
import { motion } from 'framer-motion';

function DraggablePlayerToken({ 
    player, activeTool, selectedPlayerId, setSelectedPlayerId, onDelete 
}: { 
    player: Player, activeTool: Tool, 
    selectedPlayerId: string | null, setSelectedPlayerId: React.Dispatch<React.SetStateAction<string | null>>,
    onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    disabled: activeTool !== 'move',
  });
  
  const isSelected = selectedPlayerId === player.id; 
  const leftPercent = (player.pos.x / 600) * 100;
  const topPercent = (player.pos.y / 400) * 100;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${leftPercent}%`,
    top: `${topPercent}%`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 999 : (isSelected ? 50 : 30),
    cursor: activeTool === 'move' ? (isDragging ? 'grabbing' : 'grab') : (activeTool === 'erase' ? 'no-drop' : 'pointer'),
    touchAction: 'none',
    pointerEvents: 'auto',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTool === 'erase') {
        // Animation out before delete could be handled by parent AnimatePresence, but simple callback is fast
        onDelete(player.id);
    } else {
        setSelectedPlayerId?.(player.id);
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} onClick={handleClick}
      className="origin-center w-[7.5%] aspect-square min-w-[24px] max-w-[50px] -translate-x-1/2 -translate-y-1/2"
    >
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
            scale: isDragging ? 1.2 : 1, 
            opacity: 1,
            rotate: isDragging ? 5 : 0 // Tilt effect when dragging
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
            "w-full h-full rounded-full transition-all duration-200 ease-out", 
            isDragging ? "drop-shadow-2xl" : "",
            activeTool === 'erase' && "hover:opacity-50 hover:scale-95"
        )}
      >
        <PlayerToken position={player.position} label={player.label} className={cn("w-full h-full", isSelected && "ring-2 ring-yellow-400 border-yellow-200")} variant="responsive" />
      </motion.div>
    </div>
  );
}

// --- Tactical Layer ---
const TacticalLayer = ({ 
  arrows, setArrows, areas, setAreas, activeTool,
  currentArrowColor, currentArrowStyle, currentArrowType,
  positionToPlace, // NEW: for click-through when placing player
}: any) => {
  const [drawingArrow, setDrawingArrow] = useState<Arrow | null>(null);
  const [drawingAreaStart, setDrawingAreaStart] = useState<{x: number, y: number} | null>(null);
  const [drawingAreaCurrent, setDrawingAreaCurrent] = useState<{x: number, y: number} | null>(null);
  const [tempControlPoint, setTempControlPoint] = useState<{ id: string, x: number, y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    const scaleX = 600 / rect.width;
    const scaleY = 400 / rect.height;
    return { x: relX * scaleX, y: relY * scaleY };
  };

  const getControlPoint = (arrow: Arrow) => {
    if (tempControlPoint && tempControlPoint.id === arrow.id) {
        return { x: tempControlPoint.x, y: tempControlPoint.y };
    }
    if (arrow.controlPoint) return arrow.controlPoint;
    const midX = (arrow.from.x + arrow.to.x) / 2;
    const midY = (arrow.from.y + arrow.to.y) / 2;
    return { x: midX, y: midY };
  };

  const getPathData = (arrow: Arrow) => {
    const cp = getControlPoint(arrow);
    return `M ${arrow.from.x} ${arrow.from.y} Q ${cp.x} ${cp.y}, ${arrow.to.x} ${arrow.to.y}`;
  };

  // --- Handlers ---

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (tempControlPoint) return;
    const pos = getPos(e);
    if (activeTool === 'draw') {
        setDrawingArrow({ id: 'preview', from: pos, to: pos, color: currentArrowColor, style: currentArrowStyle, type: currentArrowType });
    } else if (activeTool === 'area') {
        setDrawingAreaStart(pos); setDrawingAreaCurrent(pos);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    if (tempControlPoint) {
        setTempControlPoint({ ...tempControlPoint, x: pos.x, y: pos.y });
        return;
    }
    if (activeTool === 'draw' && drawingArrow) setDrawingArrow(prev => ({ ...prev!, to: pos }));
    else if (activeTool === 'area' && drawingAreaStart) setDrawingAreaCurrent(pos);
  };

  const handleEnd = () => {
    if (tempControlPoint) {
        setArrows((prev: Arrow[]) => prev.map((a) => {
            if (a.id === tempControlPoint.id) {
                return { ...a, controlPoint: { x: tempControlPoint.x, y: tempControlPoint.y }, type: 'curved' };
            }
            return a;
        }));
        setTempControlPoint(null);
        return;
    }

    if (activeTool === 'draw' && drawingArrow) {
        if (Math.hypot(drawingArrow.to.x - drawingArrow.from.x, drawingArrow.to.y - drawingArrow.from.y) > 15) {
            setArrows((prev: any) => [...prev, { ...drawingArrow, id: uuidv4() }]);
        }
        setDrawingArrow(null);
    } else if (activeTool === 'area' && drawingAreaStart && drawingAreaCurrent) {
        const x = Math.min(drawingAreaStart.x, drawingAreaCurrent.x);
        const y = Math.min(drawingAreaStart.y, drawingAreaCurrent.y);
        const w = Math.abs(drawingAreaCurrent.x - drawingAreaStart.x);
        const h = Math.abs(drawingAreaCurrent.y - drawingAreaStart.y);
        if (w > 10 && h > 10) setAreas((prev: any) => [...prev, { id: uuidv4(), x, y, w, h, color: currentArrowColor }]);
        setDrawingAreaStart(null); setDrawingAreaCurrent(null);
    }
  };

  const handleObjectClick = (e: React.MouseEvent, id: string, type: 'arrow' | 'area') => {
    e.stopPropagation();
    if (activeTool === 'erase') {
      if (type === 'arrow') setArrows((prev: any) => prev.filter((a: any) => a.id !== id));
      if (type === 'area') setAreas((prev: any) => prev.filter((a: any) => a.id !== id));
    }
  };

  const handleArrowMouseDown = (e: React.MouseEvent | React.TouchEvent, arrowId: string) => {
      if (activeTool === 'erase') return; 
      e.stopPropagation(); 
      const pos = getPos(e); 
      setTempControlPoint({ id: arrowId, x: pos.x, y: pos.y });
  };

  const getMarkerId = (color: string) => `arrowhead-${color.replace('#', '')}`;

  return (
    <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full z-10"
      viewBox="0 0 600 400" preserveAspectRatio="none"
      style={{ 
        cursor: (activeTool === 'draw' || activeTool === 'area') ? 'crosshair' : (activeTool === 'erase' ? 'cell' : 'default'), 
        // Disable pointer events when placing player to allow click-through to board
        pointerEvents: positionToPlace ? 'none' : (['draw', 'area', 'erase'].includes(activeTool) ? 'auto' : 'none') 
      }}
      onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
      onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
    >
      <defs>
        {AREA_COLORS.map(color => (
            <marker key={color} id={getMarkerId(color)} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
            </marker>
        ))}
      </defs>

      {/* AREAS */}
      {areas.map((area: any) => (
        <rect key={area.id} x={area.x} y={area.y} width={area.w} height={area.h} fill={area.color} fillOpacity="0.3" stroke={area.color} strokeWidth={activeTool === 'erase' ? 4 : 2} strokeDasharray="5,5" onClick={(e) => handleObjectClick(e, area.id, 'area')} className={cn("transition-all", activeTool === 'erase' ? "cursor-cell hover:stroke-red-500 hover:fill-red-500/20" : "")} />
      ))}
      
      {drawingAreaStart && drawingAreaCurrent && (
        <rect x={Math.min(drawingAreaStart.x, drawingAreaCurrent.x)} y={Math.min(drawingAreaStart.y, drawingAreaCurrent.y)} width={Math.abs(drawingAreaCurrent.x - drawingAreaStart.x)} height={Math.abs(drawingAreaCurrent.y - drawingAreaStart.y)} fill={currentArrowColor} fillOpacity="0.2" stroke={currentArrowColor} strokeWidth="2" strokeDasharray="5,5" />
      )}

      {/* ARROWS */}
      {arrows.map((arrow: Arrow) => {
        const d = getPathData(arrow);
        return (
            <g key={arrow.id} 
               onMouseDown={(e) => handleArrowMouseDown(e, arrow.id)}
               onTouchStart={(e) => handleArrowMouseDown(e, arrow.id)}
               onClick={(e) => handleObjectClick(e, arrow.id, 'arrow')} 
               className={cn("transition-all group", activeTool === 'erase' ? "cursor-cell hover:opacity-50" : "cursor-move")}
            >
                <path d={d} stroke="transparent" strokeWidth="60" fill="none" className="pointer-events-auto" />
                <path d={d} stroke={arrow.color} strokeWidth="3" fill="none" markerEnd={`url(#${getMarkerId(arrow.color)})`} strokeDasharray={arrow.style === 'dashed' ? '8, 8' : undefined} strokeLinecap="round" className="pointer-events-none" />
                {activeTool === 'erase' && <path d={d} stroke="red" strokeWidth="4" fill="none" opacity="0" className="group-hover:opacity-60 transition-opacity pointer-events-none" />}
            </g>
        );
      })}
      
      {drawingArrow && (
        <path d={getPathData(drawingArrow)} stroke={drawingArrow.color} strokeWidth="3" fill="none" markerEnd={`url(#${getMarkerId(drawingArrow.color)})`} strokeDasharray={drawingArrow.style === 'dashed' ? '8, 8' : undefined} strokeLinecap="round" className="opacity-60" />
      )}
    </svg>
  );
};

// --- Main Component ---
export const TacticBoard = ({ 
  variant = 'full', players, setPlayers, arrows, setArrows, areas, setAreas,
  activeTool, selectedPlayerId, setSelectedPlayerId, onBoardClick, positionToPlace,
  currentArrowColor, currentArrowStyle, currentArrowType, 
}: any) => {

  const { setNodeRef } = useDroppable({ id: 'tactic-board-droppable-area' });
  const boardRef = useRef<HTMLDivElement>(null);
  
  const handleDeletePlayer = (id: string) => { setPlayers?.((prev: any) => prev.filter((p: any) => p.id !== id)); };

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'draw' || activeTool === 'area' || activeTool === 'erase') return;
    if (!positionToPlace && selectedPlayerId && (activeTool === 'select' || activeTool === 'move')) { 
        setSelectedPlayerId?.(null); 
    }
    if (positionToPlace && boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        const scaleX = 600 / rect.width;
        const scaleY = 400 / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        onBoardClick?.({ x, y });
    }
  };

  return (
    <div ref={(node) => { setNodeRef(node); (boardRef as any).current = node; }}
      className={cn(
        "relative w-full aspect-[3/2] overflow-hidden shadow-2xl isolate",
        "bg-[#1C3D2E] rounded-xl ring-1 ring-white/10",
        variant === 'thumbnail' && "border-none ring-0 rounded-md shadow-none cursor-pointer hover:opacity-90",
        positionToPlace && "cursor-crosshair ring-2 ring-primary/50"
      )}
      onClick={handleBoardClick}
    >
      <FootballPitchBackground />
      
      {variant === 'full' && players && arrows && areas && activeTool && (
        <>
            <TacticalLayer arrows={arrows} setArrows={setArrows!} areas={areas} setAreas={setAreas!} activeTool={activeTool} currentArrowColor={currentArrowColor!} currentArrowStyle={currentArrowStyle!} currentArrowType={currentArrowType!} positionToPlace={positionToPlace} />
            <div className="z-20 w-full h-full absolute top-0 left-0 pointer-events-none">
                {players.map((player: any) => (
                    <DraggablePlayerToken key={player.id} player={player} activeTool={activeTool} selectedPlayerId={selectedPlayerId!} setSelectedPlayerId={setSelectedPlayerId!} onDelete={handleDeletePlayer} />
                ))}
            </div>
        </>
      )}
      {variant === 'thumbnail' && <div className="flex items-center justify-center h-full"><span className="text-white/40 text-[10px] font-medium bg-black/20 px-2 py-1 rounded backdrop-blur-sm">PREVIEW</span></div>}
    </div>
  );
};