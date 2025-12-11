"use client"; 
import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { PlayerToken } from './PlayerToken';
import { BallToken } from './BallToken';
import { useDroppable, useDraggable } from '@dnd-kit/core';
// [FIXED] Import Types từ useTacticLogic thay vì CreateTacticModal
import { Tool, ArrowColor, ArrowStyle, ArrowType } from '@/lib/hooks/useTacticLogic';
import { v4 as uuidv4 } from 'uuid';
import { PlayerTokenProps } from './PlayerToken'; 

// --- Constants ---
const AREA_COLORS: ArrowColor[] = ['#6C5CE7', '#FF7F50', '#00CED1', '#FF6B81', '#FDCB6E', '#54A0FF'];

// --- Interfaces ---
export type Team = 'home' | 'away';

export interface Player {
  id: string;
  position: PlayerTokenProps['position'];
  label: string;
  pos: { x: number; y: number };
  team?: Team; // defaults to 'home'
}

export interface Ball {
  id: string;
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
function DraggablePlayerToken({ 
    player, activeTool, selectedPlayerId, setSelectedPlayerId, onDelete 
}: { 
    player: Player, activeTool: Tool, 
    selectedPlayerId: string | null, setSelectedPlayerId: React.Dispatch<React.SetStateAction<string | null>>,
    onDelete: (id: string) => void
}) {
  const isDragDisabled = activeTool === 'draw' || activeTool === 'area' || activeTool === 'erase';
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    disabled: isDragDisabled,
  });
  
  const isSelected = selectedPlayerId === player.id; 
  const leftPercent = (player.pos.x / 600) * 100;
  const topPercent = (player.pos.y / 400) * 100;

  // Use left/top for position, and only use transform for drag movement
  // This avoids conflicts between CSS transform and dnd-kit transform
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `calc(${leftPercent}% - 2.75%)`, // Offset by half the width (5.5% / 2)
    top: `calc(${topPercent}% - 2.75%)`,   // Offset by half the height
    transform: transform 
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)` 
      : undefined,
    zIndex: isDragging ? 999 : (isSelected ? 50 : 30),
    cursor: activeTool === 'erase' ? 'no-drop' : 'grab',
    touchAction: 'none',
    pointerEvents: 'auto',
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
      className={cn(
        "w-[5.5%] aspect-square min-w-[20px] max-w-[38px]",
        activeTool === 'erase' && "hover:opacity-50"
      )}
    >
      <PlayerToken 
        position={player.position} 
        label={player.label} 
        team={player.team} 
        className={cn("w-full h-full", isSelected && "ring-2 ring-yellow-400")} 
        variant="responsive" 
      />
    </div>
  );
}

// --- Draggable Ball Token ---
function DraggableBallToken({ 
    ball, activeTool, setBall 
}: { 
    ball: Ball, 
    activeTool: Tool, 
    setBall: (ball: Ball | null) => void
}) {
  const isDragDisabled = activeTool === 'draw' || activeTool === 'area' || activeTool === 'erase';
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `ball-${ball.id}`,
    disabled: isDragDisabled,
  });
  
  const leftPercent = (ball.pos.x / 600) * 100;
  const topPercent = (ball.pos.y / 400) * 100;

  // Ball is about 24px, so offset by 12px
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `calc(${leftPercent}% - 12px)`,
    top: `calc(${topPercent}% - 12px)`,
    transform: transform 
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)` 
      : undefined,
    zIndex: isDragging ? 999 : 35,
    cursor: activeTool === 'erase' ? 'no-drop' : 'grab',
    touchAction: 'none',
    pointerEvents: 'auto',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTool === 'erase') {
      setBall(null);
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes} 
      onClick={handleClick}
      className={cn(activeTool === 'erase' && "hover:opacity-50")}
    >
      <BallToken />
    </div>
  );
}

// --- Tactical Layer (Arrow & Area Drawing) ---
const TacticalLayer = ({ 
  arrows, setArrows, areas, setAreas, activeTool,
  currentArrowColor, currentArrowStyle, currentArrowType,
  positionToPlace,
}: any) => {
  const [drawingArrow, setDrawingArrow] = useState<Arrow | null>(null);
  const [drawingAreaStart, setDrawingAreaStart] = useState<{x: number, y: number} | null>(null);
  const [drawingAreaCurrent, setDrawingAreaCurrent] = useState<{x: number, y: number} | null>(null);
  const [tempControlPoint, setTempControlPoint] = useState<{ id: string, x: number, y: number } | null>(null);
  const [draggingArrow, setDraggingArrow] = useState<{ id: string, startPos: { x: number, y: number }, currentPos: { x: number, y: number } } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getPos = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = Math.max(0, Math.min(600, ((e.clientX - rect.left) / rect.width) * 600));
    const y = Math.max(0, Math.min(400, ((e.clientY - rect.top) / rect.height) * 400));
    return { x, y };
  };

  const screenToSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 600;
    const y = ((clientY - rect.top) / rect.height) * 400;
    return { x, y };
  };

  // Global mouse event for control point editing
  useEffect(() => {
    if (!tempControlPoint) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const coords = screenToSvgCoords(e.clientX, e.clientY);
      setTempControlPoint(prev => prev ? { ...prev, x: coords.x, y: coords.y } : null);
    };
    
    const handleMouseUp = () => {
      if (tempControlPoint) {
        setArrows((prev: Arrow[]) => prev.map(a => 
          a.id === tempControlPoint.id 
            ? { ...a, controlPoint: { x: tempControlPoint.x, y: tempControlPoint.y } } 
            : a
        ));
        setTempControlPoint(null);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [tempControlPoint, setArrows]);

  // Global mouse event for arrow dragging
  useEffect(() => {
    if (!draggingArrow) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const coords = screenToSvgCoords(e.clientX, e.clientY);
      setDraggingArrow(prev => prev ? { ...prev, currentPos: coords } : null);
    };
    
    const handleMouseUp = () => {
      if (draggingArrow) {
        const dx = draggingArrow.currentPos.x - draggingArrow.startPos.x;
        const dy = draggingArrow.currentPos.y - draggingArrow.startPos.y;
        setArrows((prev: Arrow[]) => prev.map(a => {
          if (a.id !== draggingArrow.id) return a;
          return {
            ...a,
            from: { x: a.from.x + dx, y: a.from.y + dy },
            to: { x: a.to.x + dx, y: a.to.y + dy },
            controlPoint: a.controlPoint 
              ? { x: a.controlPoint.x + dx, y: a.controlPoint.y + dy }
              : undefined
          };
        }));
        setDraggingArrow(null);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingArrow, setArrows]);

  const handleStart = (e: React.MouseEvent<SVGSVGElement>) => {
    if (positionToPlace) return;
    const pos = getPos(e);
    if (activeTool === 'draw') {
      setDrawingArrow({ id: uuidv4(), from: pos, to: pos, color: currentArrowColor, style: currentArrowStyle, type: currentArrowType });
    } else if (activeTool === 'area') {
      setDrawingAreaStart(pos);
      setDrawingAreaCurrent(pos);
    }
  };

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const pos = getPos(e);
    if (drawingArrow) setDrawingArrow({ ...drawingArrow, to: pos });
    if (drawingAreaStart) setDrawingAreaCurrent(pos);
  };

  const handleEnd = () => {
    if (drawingArrow) {
      const dx = drawingArrow.to.x - drawingArrow.from.x;
      const dy = drawingArrow.to.y - drawingArrow.from.y;
      if (Math.sqrt(dx*dx + dy*dy) > 15) {
        setArrows((prev: Arrow[]) => [...prev, drawingArrow]);
      }
      setDrawingArrow(null);
    }
    if (drawingAreaStart && drawingAreaCurrent) {
      const x = Math.min(drawingAreaStart.x, drawingAreaCurrent.x);
      const y = Math.min(drawingAreaStart.y, drawingAreaCurrent.y);
      const w = Math.abs(drawingAreaCurrent.x - drawingAreaStart.x);
      const h = Math.abs(drawingAreaCurrent.y - drawingAreaStart.y);
      if (w > 10 && h > 10) {
        setAreas((prev: Area[]) => [...prev, { id: uuidv4(), x, y, w, h, color: currentArrowColor }]);
      }
      setDrawingAreaStart(null);
      setDrawingAreaCurrent(null);
    }
  };

  const handleObjectClick = (e: React.MouseEvent, id: string, type: 'arrow' | 'area') => {
    e.stopPropagation();
    if (activeTool === 'erase') {
      if (type === 'arrow') setArrows((prev: Arrow[]) => prev.filter(a => a.id !== id));
      if (type === 'area') setAreas((prev: Area[]) => prev.filter(a => a.id !== id));
    }
  };

  const handleArrowMouseDown = (e: React.MouseEvent, arrow: Arrow) => {
    e.stopPropagation();
    e.preventDefault();
    if (activeTool === 'erase') {
      setArrows((prev: Arrow[]) => prev.filter(a => a.id !== arrow.id));
      return;
    }
    // Start dragging the whole arrow or editing control point
    if (activeTool === 'select') {
      const coords = screenToSvgCoords(e.clientX, e.clientY);
      setDraggingArrow({ id: arrow.id, startPos: coords, currentPos: coords });
    } else {
      const cp = arrow.controlPoint || { x: (arrow.from.x + arrow.to.x) / 2, y: (arrow.from.y + arrow.to.y) / 2 };
      setTempControlPoint({ id: arrow.id, ...cp });
    }
  };

  const shouldAcceptPointerEvents = activeTool === 'draw' || activeTool === 'area';

  const getMarkerId = (color: string) => `arrowhead-${color.replace('#', '')}`;

  const getPathData = (arrow: Arrow) => {
    let from = arrow.from;
    let to = arrow.to;
    let cp = arrow.controlPoint || { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    
    if (draggingArrow && draggingArrow.id === arrow.id) {
      const dx = draggingArrow.currentPos.x - draggingArrow.startPos.x;
      const dy = draggingArrow.currentPos.y - draggingArrow.startPos.y;
      from = { x: from.x + dx, y: from.y + dy };
      to = { x: to.x + dx, y: to.y + dy };
      cp = { x: cp.x + dx, y: cp.y + dy };
    }
    
    if (tempControlPoint && tempControlPoint.id === arrow.id) {
      cp = { x: tempControlPoint.x, y: tempControlPoint.y };
    }
    
    return `M ${from.x} ${from.y} Q ${cp.x} ${cp.y}, ${to.x} ${to.y}`;
  };

  return (
    <svg ref={svgRef}
      className="absolute top-0 left-0 w-full h-full z-10"
      viewBox="0 0 600 400" preserveAspectRatio="none"
      style={{ pointerEvents: shouldAcceptPointerEvents ? 'auto' : 'none', overflow: 'visible' }}
      onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
    >
      <defs>
        {AREA_COLORS.map(color => (
          <marker key={color} id={getMarkerId(color)} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        ))}
      </defs>

      {/* Areas */}
      {areas.map((area: Area) => (
        <rect key={area.id} x={area.x} y={area.y} width={area.w} height={area.h}
          fill={area.color} fillOpacity="0.2" stroke={area.color} strokeWidth="2" rx="4"
          style={{ pointerEvents: 'auto', cursor: activeTool === 'erase' ? 'no-drop' : 'default' }}
          onClick={(e) => handleObjectClick(e, area.id, 'area')}
          className={activeTool === 'erase' ? 'hover:opacity-50 transition-opacity' : ''}
        />
      ))}

      {/* Drawing Area Preview */}
      {drawingAreaStart && drawingAreaCurrent && (
        <rect x={Math.min(drawingAreaStart.x, drawingAreaCurrent.x)} y={Math.min(drawingAreaStart.y, drawingAreaCurrent.y)}
          width={Math.abs(drawingAreaCurrent.x - drawingAreaStart.x)} height={Math.abs(drawingAreaCurrent.y - drawingAreaStart.y)}
          fill={currentArrowColor} fillOpacity="0.15" stroke={currentArrowColor} strokeWidth="2" strokeDasharray="5, 5" rx="4" />
      )}

      {/* Arrows */}
      {arrows.map((arrow: Arrow) => {
        const d = getPathData(arrow);
        const isBeingDragged = draggingArrow?.id === arrow.id;
        return (
          <g key={arrow.id} style={{ pointerEvents: 'auto' }} className="group">
            <path d={d} stroke="transparent" strokeWidth="20" fill="none" style={{ cursor: activeTool === 'erase' ? 'no-drop' : 'grab' }}
              onMouseDown={(e) => handleArrowMouseDown(e, arrow)} />
            <path d={d} stroke={arrow.color} strokeWidth="3" fill="none"
              markerEnd={`url(#${getMarkerId(arrow.color)})`}
              strokeDasharray={arrow.style === 'dashed' ? '8, 8' : undefined}
              strokeLinecap="round"
              style={{ opacity: isBeingDragged ? 0.7 : 1, filter: isBeingDragged ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none' }}
              className={activeTool === 'erase' ? 'hover:opacity-50 transition-opacity' : ''} />
            {!isBeingDragged && (
              <path d={d} stroke="white" strokeWidth="5" fill="none" opacity="0" className="group-hover:opacity-30 transition-opacity pointer-events-none" />
            )}
          </g>
        );
      })}
      
      {drawingArrow && (
        <path d={getPathData(drawingArrow)} stroke={drawingArrow.color} strokeWidth="3" fill="none" 
          markerEnd={`url(#${getMarkerId(drawingArrow.color)})`} 
          strokeDasharray={drawingArrow.style === 'dashed' ? '8, 8' : undefined} 
          strokeLinecap="round" className="opacity-60" />
      )}
    </svg>
  );
};


// --- Main Component ---
export const TacticBoard = ({ 
  variant = 'full', players = [], setPlayers, arrows = [], setArrows, areas = [], setAreas,
  activeTool = 'select', selectedPlayerId, setSelectedPlayerId, onBoardClick, positionToPlace,
  currentArrowColor, currentArrowStyle, currentArrowType, readOnly = false,
  // NEW: Ball and Layer props
  ball, setBall, layerVisibility, isPlacingBall, addBallAtPosition,
}: any) => {

  const { setNodeRef } = useDroppable({ id: 'tactic-board-droppable-area' });
  const boardRef = useRef<HTMLDivElement>(null);
  
  const handleDeletePlayer = (id: string) => { setPlayers?.((prev: any) => prev.filter((p: any) => p.id !== id)); };

  // Filter players by visibility
  const visiblePlayers = players.filter((p: any) => {
    const team = p.team || 'home';
    if (!layerVisibility) return true;
    return layerVisibility[team];
  });

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    if (activeTool === 'draw' || activeTool === 'area' || activeTool === 'erase') return;
    if (!positionToPlace && !isPlacingBall && selectedPlayerId && activeTool === 'select') { 
        setSelectedPlayerId?.(null); 
    }
    
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = 600 / rect.width;
    const scaleY = 400 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Handle ball placement
    if (isPlacingBall) {
        addBallAtPosition?.({ x, y });
        return;
    }
    
    // Handle player placement
    if (positionToPlace) {
        onBoardClick?.({ x, y });
    }
  };

  const isInteractive = variant === 'full' && !readOnly;
  const showContent = players.length > 0 || arrows.length > 0;

  return (
    <div 
      ref={(node) => { setNodeRef(node); (boardRef as any).current = node; }}
      data-board
      className={cn(
        "relative w-full aspect-[3/2] overflow-hidden shadow-2xl isolate",
        "bg-[#1C3D2E] rounded-xl ring-1 ring-white/10",
        variant === 'thumbnail' && "border-none ring-0 rounded-md shadow-none",
        positionToPlace && "cursor-crosshair ring-2 ring-primary/50"
      )}
      onClick={handleBoardClick}
    >
      <FootballPitchBackground />
      
      {/* Render tactical layer for interactive mode */}
      {isInteractive && setArrows && setAreas && (
        <TacticalLayer 
          arrows={arrows} 
          setArrows={setArrows} 
          areas={areas} 
          setAreas={setAreas} 
          activeTool={activeTool} 
          currentArrowColor={currentArrowColor} 
          currentArrowStyle={currentArrowStyle} 
          currentArrowType={currentArrowType} 
          positionToPlace={positionToPlace} 
        />
      )}
      
      {/* Render read-only arrows for thumbnail/view mode */}
      {(variant === 'thumbnail' || readOnly) && arrows.length > 0 && (
        <svg className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
          viewBox="0 0 600 400" preserveAspectRatio="none">
          <defs>
            {AREA_COLORS.map(color => (
              <marker key={color} id={`arrowhead-ro-${color.replace('#', '')}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
              </marker>
            ))}
          </defs>
          {arrows.map((arrow: Arrow) => {
            const cp = arrow.controlPoint || { x: (arrow.from.x + arrow.to.x) / 2, y: (arrow.from.y + arrow.to.y) / 2 };
            const d = `M ${arrow.from.x} ${arrow.from.y} Q ${cp.x} ${cp.y}, ${arrow.to.x} ${arrow.to.y}`;
            return (
              <path key={arrow.id} d={d} stroke={arrow.color} strokeWidth="3" fill="none" 
                markerEnd={`url(#arrowhead-ro-${arrow.color.replace('#', '')})`} 
                strokeDasharray={arrow.style === 'dashed' ? '8, 8' : undefined} 
                strokeLinecap="round" />
            );
          })}
        </svg>
      )}
      
      {/* Render players for all modes */}
      {visiblePlayers.length > 0 && (
        <div className="z-20 w-full h-full absolute top-0 left-0 pointer-events-none">
          {isInteractive ? (
            visiblePlayers.map((player: any) => (
              <DraggablePlayerToken 
                key={player.id} 
                player={player} 
                activeTool={activeTool} 
                selectedPlayerId={selectedPlayerId} 
                setSelectedPlayerId={setSelectedPlayerId} 
                onDelete={handleDeletePlayer} 
              />
            ))
          ) : (
            // Static player tokens for thumbnail/view mode
            visiblePlayers.map((player: any) => {
              const leftPercent = (player.pos.x / 600) * 100;
              const topPercent = (player.pos.y / 400) * 100;
              return (
                <div 
                  key={player.id}
                  className="absolute w-[5.5%] aspect-square min-w-[20px] max-w-[38px] -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                >
                  <PlayerToken position={player.position} label={player.label} team={player.team} className="w-full h-full" variant="responsive" />
                </div>
              );
            })
          )}
        </div>
      )}
      
      {/* Render Ball */}
      {ball && (!layerVisibility || layerVisibility.ball) && (
        isInteractive && setBall ? (
          <DraggableBallToken ball={ball} activeTool={activeTool} setBall={setBall} />
        ) : (
          <div 
            className="z-25 absolute pointer-events-none"
            style={{
              left: `${(ball.pos.x / 600) * 100}%`,
              top: `${(ball.pos.y / 400) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <BallToken />
          </div>
        )
      )}
      
      {/* Empty state for thumbnail */}
      {variant === 'thumbnail' && !showContent && (
        <div className="flex items-center justify-center h-full">
          <span className="text-white/40 text-[10px] font-medium bg-black/20 px-2 py-1 rounded backdrop-blur-sm">PREVIEW</span>
        </div>
      )}
    </div>
  );
};