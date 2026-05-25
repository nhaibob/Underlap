import React, { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { PlayerToken } from './PlayerToken';
import { BallToken } from './BallToken';
import { Tool } from '@/lib/hooks/useTacticLogic';
import { Player, Ball } from './types';

interface DraggablePlayerTokenProps {
  player: Player;
  activeTool: Tool;
  selectedPlayerId: string | null;
  setSelectedPlayerId: React.Dispatch<React.SetStateAction<string | null>>;
  onDelete: (id: string) => void;
}

export const DraggablePlayerToken = memo(function DraggablePlayerToken({ 
    player, activeTool, selectedPlayerId, setSelectedPlayerId, onDelete 
}: DraggablePlayerTokenProps) {
  const isDragDisabled = activeTool === 'draw' || activeTool === 'area' || activeTool === 'erase';
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    disabled: isDragDisabled,
  });
  
  const isSelected = selectedPlayerId === player.id; 
  const leftPercent = (player.pos.x / 600) * 100;
  const topPercent = (player.pos.y / 400) * 100;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `calc(${leftPercent}% - 2.75%)`, 
    top: `calc(${topPercent}% - 2.75%)`,   
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
});

interface DraggableBallTokenProps {
  ball: Ball;
  activeTool: Tool;
  setBall: (ball: Ball | null) => void;
}

export const DraggableBallToken = memo(function DraggableBallToken({ 
    ball, activeTool, setBall 
}: DraggableBallTokenProps) {
  const isDragDisabled = activeTool === 'draw' || activeTool === 'area' || activeTool === 'erase';
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `ball-${ball.id}`,
    disabled: isDragDisabled,
  });
  
  const leftPercent = (ball.pos.x / 600) * 100;
  const topPercent = (ball.pos.y / 400) * 100;

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
});
