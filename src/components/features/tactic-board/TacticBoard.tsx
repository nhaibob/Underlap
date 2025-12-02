// src/components/features/tactic-board/TacticBoard.tsx
"use client"; 
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { PlayerToken } from './PlayerToken';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Tool, ArrowColor, ArrowStyle, ArrowType } from './CreateTacticModal';
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
    {/* Nền cỏ */}
    <div className="absolute inset-0 bg-[#1C3D2E] bg-gradient-to-br from-[#1e4533] to-[#11291e]" />
    
    {/* Họa tiết sọc cỏ */}
    <div className="absolute inset-0 opacity-[0.07]" 
         style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, #000 50px, #000 100px)' }} />
    
    {/* SVG Đường kẻ sân - Đã tinh chỉnh khớp góc */}
    <svg className="absolute top-0 left-0 w-full h-full opacity-70" viewBox="0 0 600 400" fill="none" preserveAspectRatio="none">
        {/* [FIXED] Tăng rx lên 18 để khớp với rounded-xl của khung ngoài */}
        <rect x="5" y="5" width="590" height="390" rx="18" stroke="#A7CCB7" strokeWidth="2" />
        
        <line x1="300" y1="5" x2="300" y2="395" stroke="#A7CCB7" strokeWidth="2" />
        <circle cx="300" cy="200" r="50" stroke="#A7CCB7" strokeWidth="2" />
        <circle cx="300" cy="200" r="3" fill="#A7CCB7" />
        <rect x="5" y="80" width="80" height="240" stroke="#A7CCB7" strokeWidth="2" />
        <rect x="5" y="140" width="30" height="120" stroke="#A7CCB7" strokeWidth="2" />
        <circle cx="60" cy="200" r="2" fill="#A7CCB7" />
        <path d="M 85 160 Q 110 200 85 240" stroke="#A7CCB7" strokeWidth="2" fill="none"/>
        <rect x="515" y="80" width="80" height="240" stroke="#A7CCB7" strokeWidth="2" />
        <rect x="565" y="140" width="30" height="120" stroke="#A7CCB7" strokeWidth="2" />
        <circle cx="540" cy="200" r="2" fill="#A7CCB7" />
        <path d="M 515 160 Q 490 200 515 240" stroke="#A7CCB7" strokeWidth="2" fill="none"/>
        
        {/* Phạt góc - điều chỉnh lại cho khớp với bo góc lớn */}
        <path d="M 5 25 A 20 20 0 0 1 25 5" stroke="#A7CCB7" strokeWidth="2" fill="none"/>
        <path d="M 595 25 A 20 20 0 0 0 575 5" stroke="#A7CCB7" strokeWidth="2" fill="none"/>
        <path d="M 5 375 A 20 20 0 0 0 25 395" stroke="#A7CCB7" strokeWidth="2" fill="none"/>
        <path d="M 595 375 A 20 20 0 0 1 575 395" stroke="#A7CCB7" strokeWidth="2" fill="none"/>
    </svg>
  </div>
);

// --- Draggable Token ---
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
    transition: 'none', 
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTool === 'erase') {
        onDelete(player.id);
    } else {
        setSelectedPlayerId?.(player.id);
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} onClick={handleClick}
      className="origin-center w-[7.5%] aspect-square min-w-[24px] max-w-[50px] -translate-x-1/2 -translate-y-1/2"
    >
      <div 
        className={cn(
            "w-full h-full rounded-full transition-all duration-200 ease-out", 
            isDragging ? "scale-125 drop-shadow-2xl" : "scale-100",
            activeTool === 'erase' && "hover:opacity-50 hover:scale-95"
        )}
      >
        <PlayerToken position={player.position} label={player.label} className={cn("w-full h-full", isSelected && "ring-2 ring-yellow-400 border-yellow-200")} variant="responsive" />
      </div>
    </div>
  );
}

// --- Tactical Layer ---
const TacticalLayer = ({ 
  arrows, setArrows, areas, setAreas, activeTool,
  currentArrowColor, currentArrowStyle, currentArrowType, 
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
      style={{ cursor: (activeTool === 'draw' || activeTool === 'area') ? 'crosshair' : (activeTool === 'erase' ? 'cell' : 'default'), pointerEvents: ['draw', 'area', 'erase', 'select', 'move'].includes(activeTool) ? 'auto' : 'none' }}
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
                <path d={d} stroke="transparent" strokeWidth="30" fill="none" className="pointer-events-auto" />
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
  currentArrowColor, currentArrowStyle, currentArrowType, className // Thêm className
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
        "relative overflow-hidden shadow-2xl isolate",
        // [FIXED] 
        // 1. Loại bỏ aspect-[3/2] mặc định nếu ở chế độ 'full' (để parent quyết định)
        // 2. Thêm w-full h-full để điền đầy container
        "bg-[#1C3D2E] rounded-xl ring-1 ring-white/10",
        
        variant === 'full' && "w-full h-full", 
        variant === 'thumbnail' && "aspect-[3/2] border-none ring-0 rounded-md shadow-none cursor-pointer hover:opacity-90",
        
        className
      )}
      onClick={handleBoardClick}
    >
      <FootballPitchBackground />
      
      {variant === 'full' && players && arrows && areas && activeTool && (
        <>
            <TacticalLayer arrows={arrows} setArrows={setArrows!} areas={areas} setAreas={setAreas!} activeTool={activeTool} currentArrowColor={currentArrowColor!} currentArrowStyle={currentArrowStyle!} currentArrowType={currentArrowType!} />
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