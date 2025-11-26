"use client"; 
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { PlayerToken } from './PlayerToken';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Tool, ArrowColor, ArrowStyle, ArrowType } from './CreateTacticModal';
import { v4 as uuidv4 } from 'uuid';
import { PlayerTokenProps } from './PlayerToken'; 

const ARROW_COLORS: ArrowColor[] = ['#6C5CE7', '#FF7F50', '#00CED1'];

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
}

// === [ĐÃ SỬA] Component này giờ dùng Class Tailwind thay vì mã màu cứng ===
const FootballPitchBackground = () => (
  <svg 
    className="absolute top-0 left-0 w-full h-full" 
    viewBox="0 0 600 400" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Mặt sân: Dùng màu xanh đậm (cần đảm bảo mã màu này hợp với theme) */}
    <rect x="0" y="0" width="600" height="400" className="fill-[#1C3D2E]" /> 
    
    {/* Các đường kẻ: Màu trắng opacity thấp */}
    <g className="stroke-white/30" strokeWidth="3">
        <rect x="1.5" y="1.5" width="597" height="397" rx="4" />
        <line x1="300" y1="2" x2="300" y2="398" />
        <circle cx="300" cy="200" r="50" />
        <rect x="1.5" y="80" width="60" height="240" rx="2" />
        <rect x="1.5" y="140" width="20" height="120" rx="1" />
        <rect x="538.5" y="80" width="60" height="240" rx="2" />
        <rect x="578.5" y="140" width="20" height="120" rx="1" />
        <path d="M60 140 C80 160, 80 240, 60 260" fill="none"/>
        <path d="M540 140 C520 160, 520 240, 540 260" fill="none"/>
    </g>
    
    {/* Chấm phạt đền */}
    <g className="fill-white/50">
        <circle cx="300" cy="200" r="2" />
        <circle cx="45" cy="200" r="2" />
        <circle cx="555" cy="200" r="2" />
    </g>
  </svg>
);

// ... (Phần còn lại giữ nguyên logic cũ)

function DraggablePlayerToken({ 
  player, 
  activeTool, 
  selectedPlayerId, 
  setSelectedPlayerId 
}: { 
  player: Player, 
  activeTool: Tool, 
  selectedPlayerId: string | null, 
  setSelectedPlayerId: React.Dispatch<React.SetStateAction<string | null>> 
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: player.id,
    data: { isPaletteToken: false },
    disabled: activeTool !== 'move',
  });
  
  const isSelected = selectedPlayerId === player.id; 
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 20 } : undefined;
  
  const handleClick = (e: React.MouseEvent) => {
    if (activeTool === 'select') {
      setSelectedPlayerId?.(player.id); 
      e.stopPropagation();
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={{ 
        position: 'absolute', 
        left: player.pos.x, 
        top: player.pos.y, 
        ...style,
        cursor: activeTool === 'move' ? 'grab' : (activeTool === 'select' ? 'pointer' : 'default'),
        zIndex: 20
      }} 
      {...listeners} 
      {...attributes}
      onClick={handleClick}
    >
      <PlayerToken 
        position={player.position} 
        label={player.label}
        className={cn(isSelected && "shadow-lg shadow-primary ring-2 ring-primary")} 
      />
    </div>
  );
}

const DrawingLayer = ({ 
  arrows, 
  setArrows, 
  activeTool,
  currentArrowColor,
  currentArrowStyle,
  currentArrowType, 
}: { 
  arrows: Arrow[], 
  setArrows: React.Dispatch<React.SetStateAction<Arrow[]>>, 
  activeTool: Tool,
  currentArrowColor: ArrowColor,
  currentArrowStyle: ArrowStyle,
  currentArrowType: ArrowType,
}) => {
  const [drawingArrow, setDrawingArrow] = useState<Arrow | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const getPathData = (from: { x: number; y: number }, to: { x: number; y: number }, type: ArrowType) => {
    if (type === 'straight') {
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    }
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const curveIntensity = 30;
    const angle = Math.atan2(to.y - from.y, to.x - from.x) + Math.PI / 2;
    const controlX = midX + Math.cos(angle) * curveIntensity;
    const controlY = midY + Math.sin(angle) * curveIntensity;
    return `M ${from.x} ${from.y} Q ${controlX} ${controlY}, ${to.x} ${to.y}`;
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool !== 'draw') return;
    const pos = getPos(e);
    setDrawingArrow({
      id: 'live-preview',
      from: pos,
      to: pos,
      color: currentArrowColor,
      style: currentArrowStyle,
      type: currentArrowType,
    });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool !== 'draw' || !drawingArrow) return;
    const pos = getPos(e);
    setDrawingArrow(prev => ({ ...prev!, to: pos }));
  };

  const handleMouseUp = () => {
    if (activeTool !== 'draw' || !drawingArrow) return;
    const distance = Math.hypot(drawingArrow.to.x - drawingArrow.from.x, drawingArrow.to.y - drawingArrow.from.y);
    if (distance > 10) {
      setArrows(prev => [...prev, { ...drawingArrow, id: uuidv4() }]);
    }
    setDrawingArrow(null);
  };

  const handleArrowClick = (id: string) => {
    if (activeTool === 'erase') {
      setArrows(prev => prev.filter(a => a.id !== id));
    }
  };
  
  const getDashArray = (style: ArrowStyle): string | undefined => {
      return style === 'dashed' ? '8, 8' : undefined;
  };
  
  const getMarkerId = (color: ArrowColor): string => {
      const colorMap = {
          '#6C5CE7': 'primary',
          '#FF7F50': 'secondary',
          '#00CED1': 'tertiary',
          '#FF6B81': 'attack',
          '#54A0FF': 'defend',
      };
      return `arrowhead-${colorMap[color] || 'default'}`;
  };

  return (
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 w-full h-full z-10"
      style={{
        cursor: activeTool === 'draw' ? 'crosshair' : (activeTool === 'erase' ? 'cell' : 'default'),
        pointerEvents: activeTool === 'draw' || activeTool === 'erase' ? 'auto' : 'none' 
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      <defs>
        {ARROW_COLORS.map(color => (
            <marker 
                key={color} 
                id={getMarkerId(color)} 
                viewBox="0 0 10 10" 
                refX="8" 
                refY="5" 
                markerWidth="6" 
                markerHeight="6" 
                orient="auto-start-reverse"
            >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
            </marker>
        ))}
      </defs>

      {arrows.map(arrow => (
        <path
          key={arrow.id}
          d={getPathData(arrow.from, arrow.to, arrow.type)}
          stroke={arrow.color}
          strokeWidth="4"
          fill="none" 
          markerEnd={`url(#${getMarkerId(arrow.color)})`}
          strokeDasharray={getDashArray(arrow.style)}
          onClick={() => handleArrowClick(arrow.id)}
          className={cn(activeTool === 'erase' && "cursor-cell hover:stroke-danger")}
        />
      ))}
      
      {drawingArrow && (
        <path
          d={getPathData(drawingArrow.from, drawingArrow.to, drawingArrow.type)}
          stroke={drawingArrow.color}
          strokeWidth="4"
          fill="none"
          markerEnd={`url(#${getMarkerId(drawingArrow.color)})`}
          strokeDasharray={getDashArray(drawingArrow.style)}
        />
      )}
    </svg>
  );
};

interface TacticBoardProps {
  variant?: 'full' | 'thumbnail';
  players?: Player[];
  setPlayers?: React.Dispatch<React.SetStateAction<Player[]>>;
  arrows?: Arrow[];
  setArrows?: React.Dispatch<React.SetStateAction<Arrow[]>>;
  activeTool?: Tool;
  boardRect?: DOMRect | null;
  selectedPlayerId?: string | null; 
  setSelectedPlayerId?: React.Dispatch<React.SetStateAction<string | null>>;
  onBoardClick?: (pos: { x: number, y: number }) => void;
  positionToPlace?: PlayerTokenProps['position'] | null;
  currentArrowColor?: ArrowColor; 
  currentArrowStyle?: ArrowStyle;
  currentArrowType?: ArrowType; 
}

export const TacticBoard = ({ 
  variant = 'full', 
  players,
  arrows,
  setArrows,
  activeTool,
  selectedPlayerId,
  setSelectedPlayerId,
  onBoardClick,
  positionToPlace,
  currentArrowColor,
  currentArrowStyle,
  currentArrowType, 
}: TacticBoardProps) => {

  const { setNodeRef } = useDroppable({
    id: 'tactic-board-droppable-area',
  });

  const boardRef = useRef<HTMLDivElement>(null);
  
  const setCombinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (boardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };
  
  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const isPlayerTokenClick = (e.target as HTMLElement).closest('[data-dnd-kit-draggable]');
    if (isPlayerTokenClick) {
        return; 
    }
    if (!positionToPlace && (activeTool === 'select' || activeTool === 'move')) { 
      setSelectedPlayerId?.(null); 
    }
    if (positionToPlace && boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;
        const centeredX = relativeX - 20;
        const centeredY = relativeY - 20;
        onBoardClick?.({ x: centeredX, y: centeredY });
    }
  };

  return (
    <div 
      ref={setCombinedRef} 
      className={cn(
        "relative w-full aspect-video overflow-hidden",
        "bg-panel border border-white/10 rounded-lg", 
        variant === 'thumbnail' && "border-none"
      )}
      onClick={handleBoardClick}
    >
      <FootballPitchBackground />
      
      {variant === 'full' && players && arrows && activeTool && (
        <DrawingLayer 
          arrows={arrows!} 
          setArrows={setArrows!} 
          activeTool={activeTool} 
          currentArrowColor={currentArrowColor!}
          currentArrowStyle={currentArrowStyle!}
          currentArrowType={currentArrowType!}
        />
      )}
      
      {variant === 'full' && players && (
        <div className="z-20"> 
            {players.map((player) => (
            <DraggablePlayerToken 
                key={player.id} 
                player={player} 
                activeTool={activeTool!}
                selectedPlayerId={selectedPlayerId!}
                setSelectedPlayerId={setSelectedPlayerId!}
            />
            ))}
        </div>
      )}
      
      {variant === 'thumbnail' && (
        <div className="flex items-center justify-center h-full">
          {/* Có thể thêm icon play hoặc overlay nếu muốn */}
        </div>
      )}
    </div>
  );
};