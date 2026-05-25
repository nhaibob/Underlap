import React, { useRef, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Tool, ArrowColor, ArrowStyle, ArrowType } from '@/lib/hooks/useTacticLogic';
import { Arrow, Area, AREA_COLORS } from './types';

interface TacticalLayerProps {
  arrows: Arrow[];
  setArrows: React.Dispatch<React.SetStateAction<Arrow[]>>;
  areas: Area[];
  setAreas: React.Dispatch<React.SetStateAction<Area[]>>;
  activeTool: Tool;
  currentArrowColor: ArrowColor;
  currentArrowStyle: ArrowStyle;
  currentArrowType: ArrowType;
  positionToPlace?: boolean;
}

export const TacticalLayer = ({ 
  arrows, setArrows, areas, setAreas, activeTool,
  currentArrowColor, currentArrowStyle, currentArrowType,
  positionToPlace,
}: TacticalLayerProps) => {
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
