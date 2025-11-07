// src/components/features/tactic-board/DrawingCanvas.tsx
"use client";
import React, { useState, useRef } from 'react';
// 1. KHÔNG CẦN IMPORT KONVA
import { Tool } from './CreateTacticModal';
import { v4 as uuidv4 } from 'uuid'; // (Đảm bảo bạn đã cài 'uuid')

// (Interface DrawnArrow giữ nguyên, nó vẫn hợp lý)
export interface DrawnArrow {
  id: string;
  points: [number, number, number, number]; // [x1, y1, x2, y2]
  color: string;
}

interface DrawingCanvasProps {
  activeTool: Tool;
  arrows: DrawnArrow[];
  setArrows: React.Dispatch<React.SetStateAction<DrawnArrow[]>>;
}

export const DrawingCanvas = ({
  activeTool,
  arrows,
  setArrows
}: DrawingCanvasProps) => {
  // State lưu mũi tên "live preview"
  const [currentArrowPoints, setCurrentArrowPoints] = useState<[number, number, number, number] | null>(null);
  const svgRef = useRef<SVGSVGElement>(null); // Ref để lấy tọa độ

  const isDrawMode = activeTool === 'draw';
  const isEraseMode = activeTool === 'erase';

  // Hàm lấy tọa độ TƯƠNG ĐỐI với SVG (rất quan trọng)
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    
    // Lấy tọa độ (tương thích cả-touch và mouse)
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawMode) return;
    const pos = getPos(e);
    if (!pos) return;
    // Bắt đầu mũi tên (điểm đầu và cuối trùng nhau)
    setCurrentArrowPoints([pos.x, pos.y, pos.x, pos.y]);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawMode || !currentArrowPoints) return;
    const pos = getPos(e);
    if (!pos) return;
    // Cập nhật điểm cuối (x2, y2) của live preview
    setCurrentArrowPoints([currentArrowPoints[0], currentArrowPoints[1], pos.x, pos.y]);
  };

  const handleMouseUp = () => {
    if (!isDrawMode || !currentArrowPoints) return;
    // Lưu mũi tên vào state cha
    setArrows([...arrows, {
      id: uuidv4(),
      points: currentArrowPoints,
      color: '#6C5CE7' // Màu Primary
    }]);
    setCurrentArrowPoints(null); // Xóa live preview
  };

  // Hàm XÓA khi click vào mũi tên
  const handleLineClick = (id: string) => {
    if (isEraseMode) {
      setArrows(arrows.filter(arrow => arrow.id !== id));
    }
  };

  return (
    // 2. DÙNG <svg> THAY VÌ <Stage>
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 w-full h-full"
      style={{
        cursor: isDrawMode ? 'crosshair' : (isEraseMode ? 'cell' : 'default'),
        pointerEvents: isDrawMode || isEraseMode ? 'auto' : 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      {/* 3. Định nghĩa đầu mũi tên (bằng SVG <marker>) */}
      <defs>
        <marker
          id="arrowhead-primary"
          viewBox="0 0 10 10"
          refX="8" // Căn chỉnh đầu mũi tên
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          {/* Hình dạng đầu mũi tên (tam giác) */}
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#6C5CE7" />
        </marker>
      </defs>

      {/* 4. Render các mũi tên đã hoàn thành (bằng <line>) */}
      {arrows.map((arrow) => (
        <line
          key={arrow.id}
          x1={arrow.points[0]}
          y1={arrow.points[1]}
          x2={arrow.points[2]}
          y2={arrow.points[3]}
          stroke={arrow.color}
          strokeWidth="4"
          markerEnd="url(#arrowhead-primary)" // Gắn đầu mũi tên
          onClick={() => handleLineClick(arrow.id)} // Để xóa
          className={isEraseMode ? "cursor-cell" : "cursor-default"}
        />
      ))}

      {/* 5. Render mũi tên đang vẽ (live preview) */}
      {currentArrowPoints && (
        <line
          x1={currentArrowPoints[0]}
          y1={currentArrowPoints[1]}
          x2={currentArrowPoints[2]}
          y2={currentArrowPoints[3]}
          stroke="#6C5CE7"
          strokeWidth="4"
          markerEnd="url(#arrowhead-primary)"
          strokeDasharray="5 5" // (Tùy chọn: làm cho nó đứt nét)
        />
      )}
    </svg>
  );
};