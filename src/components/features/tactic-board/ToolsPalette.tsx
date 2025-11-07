// src/components/features/tactic-board/ToolsPalette.tsx
"use client";
import React from 'react';
import { PlayerTokenProps } from './PlayerToken';
import { MousePointer, Move, Pen, Eraser, RotateCcw, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Tool, ArrowColor, ArrowStyle, ArrowType } from './CreateTacticModal';
// === IMPORT TỪ CONSTANTS ===
import { POSITION_OPTIONS, ALL_ARROW_COLOR_VALUES } from '@/lib/constants';

// (Các hằng số ARROW_STYLES, ArrowColor, ArrowType giữ nguyên)
const ARROW_STYLES: ArrowStyle[] = ['solid', 'dashed'];
const ARROW_TYPES: { type: ArrowType, label: string }[] = [
  { type: 'straight', label: 'Thẳng' },
  { type: 'curved', label: 'Cong' }
];

// (Component ToolButton giữ nguyên)
const ToolButton = ({
  icon: Icon,
  label,
  tool,
  activeTool,
  onClick
}: {
  icon: React.ElementType,
  label: string,
  tool: Tool | 'clear',
  activeTool: Tool,
  onClick: (tool: Tool) => void | (() => void)
}) => {
  const isActive = activeTool === tool;

  return (
    <Button
      variant="ghost"
      className={cn(
        "flex flex-col items-center h-auto p-2 gap-1 text-text-secondary",
        isActive
          ? "bg-primary/20 text-primary"
          : "hover:text-text-primary"
      )}
      onClick={() => (tool === 'clear' ? (onClick as () => void)() : (onClick as (tool: Tool) => void)(tool))}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </Button>
  );
};

// (Component PositionButton giữ nguyên)
interface PositionButtonProps {
  position: PlayerTokenProps['position'];
  label: string;
  onSelect: (pos: PlayerTokenProps['position']) => void;
  active: boolean;
}

const PositionButton = ({ position, label, onSelect, active }: PositionButtonProps) => {
  return (
    <button
      onClick={() => onSelect(position)}
      className={cn(
        "w-full h-10 flex items-center justify-center rounded-lg font-semibold text-xs transition-colors",
        active ? "bg-secondary text-white" : "bg-panel text-text-primary hover:bg-white/10"
      )}
    >
      {label}
    </button>
  );
};

// (Component DeleteZone giữ nguyên)
const DeleteZone = () => {
  const { setNodeRef } = useDroppable({ id: 'delete-zone' });
  return <div ref={setNodeRef} className="h-0 w-full" />;
};

// (Component ArrowOptions - SỬ DỤNG HẰNG SỐ MÀU MỚI)
interface ArrowOptionsProps {
  currentArrowColor: ArrowColor;
  setArrowColor: React.Dispatch<React.SetStateAction<ArrowColor>>;
  currentArrowStyle: ArrowStyle;
  setArrowStyle: React.Dispatch<React.SetStateAction<ArrowStyle>>;
  currentArrowType: ArrowType;
  setArrowType: React.Dispatch<React.SetStateAction<ArrowType>>;
  activeTool: Tool;
}

const ArrowOptions = ({ currentArrowColor, setArrowColor, currentArrowStyle, setArrowStyle, currentArrowType, setArrowType, activeTool }: ArrowOptionsProps) => {
  if (activeTool !== 'draw') return null;

  return (
    <div className="w-full bg-panel/40 rounded-xl p-3 border border-white/10 space-y-3">
      <p className="text-[10px] uppercase text-text-secondary font-semibold tracking-wider ml-1">Tùy chỉnh vẽ</p>

      {/* Kiểu Đường (Thẳng/Cong) */}
      <div className="grid grid-cols-2 gap-2">
        {ARROW_TYPES.map((t) => (
          <button
            key={t.type}
            onClick={() => setArrowType(t.type)}
            className={cn(
              "h-7 rounded-lg border border-text-secondary/40 flex items-center justify-center text-xs font-medium transition-colors",
              currentArrowType === t.type
                ? "bg-secondary text-white border-secondary"
                : "hover:bg-white/10"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Kiểu nét */}
      <div className="grid grid-cols-2 gap-2">
        {ARROW_STYLES.map((style) => (
          <button
            key={style}
            onClick={() => setArrowStyle(style)}
            className={cn(
              "h-7 rounded-lg border border-text-secondary/40 flex items-center justify-center text-xs font-medium transition-colors",
              currentArrowStyle === style
                ? "bg-primary text-white border-primary"
                : "hover:bg-white/10"
            )}
          >
            {style === 'solid' ? 'Liền' : 'Nét đứt'}
          </button>
        ))}
      </div>

      {/* Màu vẽ */}
      <div className="flex justify-between items-center gap-2 pt-1">
        {/* SỬ DỤNG ALL_ARROW_COLOR_VALUES */}
        {ALL_ARROW_COLOR_VALUES.map((color) => (
          <button
            key={color}
            onClick={() => setArrowColor(color as ArrowColor)}
            className={cn(
              "w-6 h-6 rounded-full border-2 transition-transform",
              currentArrowColor === color ? "scale-110 ring-2 ring-white" : "hover:scale-105"
            )}
            style={{ backgroundColor: color, borderColor: color }}
          />
        ))}
      </div>
    </div>
  );
};
// ===================================


interface ToolsPaletteProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  positionToPlace: PlayerTokenProps['position'] | null;
  setPositionToPlace: (pos: PlayerTokenProps['position'] | null) => void;
  arrowColor: ArrowColor;
  setArrowColor: React.Dispatch<React.SetStateAction<ArrowColor>>;
  arrowStyle: ArrowStyle;
  setArrowStyle: React.Dispatch<React.SetStateAction<ArrowStyle>>;
  arrowType: ArrowType;
  setArrowType: React.Dispatch<React.SetStateAction<ArrowType>>;
  onClearAll: () => void;
  selectedPlayerId: string | null;
  onDeleteSelectedPlayer: (id: string) => void;
}

export const ToolsPalette = ({ activeTool, setActiveTool, positionToPlace, setPositionToPlace, arrowColor, setArrowColor, arrowStyle, setArrowStyle, onClearAll, selectedPlayerId, onDeleteSelectedPlayer, arrowType, setArrowType }: ToolsPaletteProps) => {

  const handlePositionSelect = (pos: PlayerTokenProps['position']) => {
    if (positionToPlace === pos) {
      setPositionToPlace(null);
      setActiveTool('move');
    } else {
      setPositionToPlace(pos);
      setActiveTool('select');
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPlayerId) {
      onDeleteSelectedPlayer(selectedPlayerId);
    }
  };

  return (
    <div className="w-36 bg-background/70 p-3 rounded-2xl border border-white/5 flex flex-col items-center gap-4 shadow-lg backdrop-blur-sm">

      {/* 1. Nhóm Công cụ Tương tác */}
      <div className="w-full bg-panel/40 rounded-xl p-3 space-y-2">
        <p className="text-[10px] uppercase text-text-secondary font-semibold tracking-wider ml-1">Tương tác</p>
        <div className="grid grid-cols-2 gap-2">
          <ToolButton icon={MousePointer} label="Chọn" tool="select" activeTool={activeTool} onClick={setActiveTool} />
          <ToolButton icon={Move} label="Di chuyển" tool="move" activeTool={activeTool} onClick={setActiveTool} />
        </div>
      </div>

      {/* 2. Nhóm Công cụ Vẽ (Đường nét) */}
      <div className="w-full bg-panel/40 rounded-xl p-3 space-y-2">
        <p className="text-[10px] uppercase text-text-secondary font-semibold tracking-wider ml-1">Đường nét</p>
        <div className="grid grid-cols-2 gap-2">
          <ToolButton icon={Pen} label="Vẽ" tool="draw" activeTool={activeTool} onClick={setActiveTool} />
          <ToolButton icon={Eraser} label="Tẩy" tool="erase" activeTool={activeTool} onClick={setActiveTool} />
        </div>
      </div>

      {/* 3. Tùy chọn Mũi tên */}
      <ArrowOptions
        currentArrowColor={arrowColor}
        setArrowColor={setArrowColor}
        currentArrowStyle={arrowStyle}
        setArrowStyle={setArrowStyle}
        currentArrowType={arrowType}
        setArrowType={setArrowType}
        activeTool={activeTool}
      />

      {/* NÚT CLEAR ALL */}
      <Button
        variant="ghost"
        className="flex flex-col items-center justify-center w-full p-3 gap-1 text-danger hover:bg-danger/10 transition-all rounded-xl"
        onClick={onClearAll}
      >
        <RotateCcw className="w-5 h-5" />
        <span className="text-xs font-medium">Xóa hết</span>
      </Button>

      {/* Thùng rác (Vô hình) */}
      <DeleteZone />

      <hr className="w-full my-1 border-panel" />

      {/* 4. Nhóm Vị trí */}
      <div className="w-full bg-panel/40 rounded-xl p-3 space-y-2 overflow-y-auto max-h-[32vh] scrollbar-thin scrollbar-thumb-panel/70 scrollbar-track-transparent">
        <p className="text-[10px] uppercase text-text-secondary font-semibold tracking-wider ml-1">Vị trí</p>
        <div className="grid grid-cols-2 gap-2">
          {POSITION_OPTIONS.map(p => (
            <PositionButton
              key={p.value} // DÙNG p.value
              position={p.value}
              label={p.label}
              onSelect={handlePositionSelect}
              active={positionToPlace === p.value}
            />
          ))}
        </div>
      </div>
    </div>
  );
};