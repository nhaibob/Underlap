"use client"; 
import React, { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { PlayerToken } from './PlayerToken';
import { BallToken } from './BallToken';
import { FootballPitchBackground } from './FootballPitchBackground';
import { DraggablePlayerToken, DraggableBallToken } from './DraggableTokens';
import { TacticalLayer } from './TacticalLayer';
import { Arrow, Area, AREA_COLORS, Player, Ball } from './types';

// Re-export types so that other files don't break
export * from './types';

// --- Main Component ---
export const TacticBoard = ({ 
  variant = 'full', players = [], setPlayers, arrows = [], setArrows, areas = [], setAreas,
  activeTool = 'select', selectedPlayerId, setSelectedPlayerId, onBoardClick, positionToPlace,
  currentArrowColor, currentArrowStyle, currentArrowType, readOnly = false,
  ball, setBall, layerVisibility, isPlacingBall, addBallAtPosition,
}: any) => {

  const { setNodeRef } = useDroppable({ id: 'tactic-board-droppable-area' });
  const boardRef = useRef<HTMLDivElement>(null);
  
  const handleDeletePlayer = useCallback((id: string) => { setPlayers?.((prev: any) => prev.filter((p: any) => p.id !== id)); }, [setPlayers]);

  // Filter players by visibility
  const visiblePlayers = players.filter((p: any) => {
    const team = p.team || 'home';
    if (!layerVisibility) return true;
    return layerVisibility[team];
  });

  const handleBoardClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
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
  }, [readOnly, activeTool, positionToPlace, isPlacingBall, selectedPlayerId, setSelectedPlayerId, addBallAtPosition, onBoardClick]);

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