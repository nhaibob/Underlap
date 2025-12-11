"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  MousePointer2, PenTool, SquareDashed, Eraser, 
  Undo2, Redo2, Trash2, UserPlus, ChevronDown,
  Minus, MoreHorizontal, X, Circle, Layers, Eye, EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool, ArrowColor, ArrowStyle, LayerVisibility } from '@/lib/hooks/useTacticLogic';
import { ALL_ARROW_COLOR_VALUES } from '@/lib/constants';
import { PlayerTokenProps } from './PlayerToken';
import { Team } from './TacticBoard';

// --- Types ---
interface CompactToolbarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  arrowColor: ArrowColor;
  setArrowColor: (color: ArrowColor) => void;
  arrowStyle: ArrowStyle;
  setArrowStyle: (style: ArrowStyle) => void;
  positionToPlace: PlayerTokenProps['position'] | null;
  setPositionToPlace: (pos: PlayerTokenProps['position'] | null) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClearAll: () => void;
  // NEW: Team, Ball, and Layer props
  selectedTeam: Team;
  setSelectedTeam: (team: Team) => void;
  isPlacingBall: boolean;
  setIsPlacingBall: (placing: boolean) => void;
  layerVisibility: LayerVisibility;
  toggleLayerVisibility: (layer: keyof LayerVisibility) => void;
}

// --- Position Groups ---
const POSITION_GROUPS = [
  { label: 'Thủ môn', positions: ['GK'] },
  { label: 'Hậu vệ', positions: ['CB', 'LB', 'RB', 'LWB', 'RWB'] },
  { label: 'Tiền vệ', positions: ['DM', 'CM', 'AM'] },
  { label: 'Tiền đạo', positions: ['LW', 'RW', 'CF', 'ST'] },
];

import { motion, AnimatePresence } from 'framer-motion';

// --- Sub Components ---
const ToolButton = ({ 
  icon: Icon, 
  isActive, 
  onClick, 
  title, 
  disabled,
  variant = 'default'
}: { 
  icon: React.ElementType;
  isActive?: boolean;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "h-9 w-9 rounded-lg transition-colors duration-200 flex items-center justify-center relative",
      isActive 
        ? "bg-primary text-primary-foreground shadow-md" 
        : "text-muted-foreground hover:text-foreground hover:bg-muted",
      variant === 'danger' && "text-red-400 hover:text-red-500 hover:bg-red-500/10",
      disabled && "opacity-40 cursor-not-allowed"
    )}
    title={title}
  >
    <Icon className={cn("w-4 h-4", isActive && "stroke-[2.5]")} />
    {isActive && (
      <motion.div
        layoutId="active-indicator"
        className="absolute inset-0 rounded-lg bg-primary/10 -z-10"
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </motion.button>
);

const Divider = () => <div className="w-px h-6 bg-border/50 mx-1" />;

// --- Player Picker Popover ---
const PlayerPicker = ({ 
  positionToPlace, 
  setPositionToPlace,
  setActiveTool,
  selectedTeam,
  setSelectedTeam
}: { 
  positionToPlace: PlayerTokenProps['position'] | null;
  setPositionToPlace: (pos: PlayerTokenProps['position'] | null) => void;
  setActiveTool: (tool: Tool) => void;
  selectedTeam: Team;
  setSelectedTeam: (team: Team) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (pos: string) => {
    setPositionToPlace(pos as PlayerTokenProps['position']);
    setActiveTool('select');
    setIsOpen(false);
  };

  const handleClose = () => {
    setPositionToPlace(null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-9 px-3 rounded-lg gap-1.5 transition-all flex items-center border border-transparent",
          positionToPlace 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <UserPlus className="w-4 h-4" />
        <span className="text-xs font-bold hidden sm:inline">
          {positionToPlace || 'Thêm'}
        </span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </motion.button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[1px]" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Content - positioned to the right */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="absolute top-full right-0 mt-2 z-[70] w-[300px] sm:w-[340px] bg-gray-950/95 backdrop-blur-xl border-2 border-violet-500/30 rounded-2xl shadow-2xl p-4 origin-top-right"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  THÊM CẦU THỦ
                </h4>
                {positionToPlace && (
                  <button 
                    onClick={handleClose}
                    className="text-sm font-semibold text-red-400 hover:text-red-300 flex items-center gap-1.5 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Hủy
                  </button>
                )}
              </div>
              
              {/* Team Tabs */}
              <div className="flex gap-2 mb-4 p-1 bg-gray-900/50 rounded-lg">
                <button
                  onClick={() => setSelectedTeam('home')}
                  className={cn(
                    "flex-1 py-2 rounded-md text-sm font-bold transition-all",
                    selectedTeam === 'home'
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  🏠 Đội nhà
                </button>
                <button
                  onClick={() => setSelectedTeam('away')}
                  className={cn(
                    "flex-1 py-2 rounded-md text-sm font-bold transition-all",
                    selectedTeam === 'away'
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  ✈️ Đội khách
                </button>
              </div>
              
              <div className="space-y-3">
                {POSITION_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-xs font-bold text-gray-400 mb-2">{group.label}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {group.positions.map((pos) => (
                        <motion.button
                          key={pos}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSelect(pos)}
                          className={cn(
                            "h-11 flex items-center justify-center rounded-lg text-sm font-bold border-2 transition-all",
                            positionToPlace === pos 
                              ? selectedTeam === 'home'
                                ? "bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/30"
                                : "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/30"
                              : "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-700/70 hover:border-gray-600"
                          )}
                        >
                          {pos}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-800 flex gap-2">
                 <span className="shrink-0">💡</span>
                 <span>Chọn đội, vị trí rồi click vào sân để đặt</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Color & Style Picker ---
const DrawingOptions = ({
  arrowColor, setArrowColor,
  arrowStyle, setArrowStyle,
  activeTool
}: {
  arrowColor: ArrowColor;
  setArrowColor: (color: ArrowColor) => void;
  arrowStyle: ArrowStyle;
  setArrowStyle: (style: ArrowStyle) => void;
  activeTool: Tool;
}) => {
  if (activeTool !== 'draw' && activeTool !== 'area') return null;

  return (
    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
      <Divider />
      
      {/* Color Picker */}
      <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/50 rounded-lg p-0.5 sm:p-1">
        {ALL_ARROW_COLOR_VALUES.map((c) => (
          <button
            key={c}
            onClick={() => setArrowColor(c)}
            className={cn(
              "w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all hover:scale-110",
              arrowColor === c 
                ? "border-white scale-110 ring-2 ring-primary/50" 
                : "border-transparent opacity-70 hover:opacity-100"
            )}
            style={{ backgroundColor: c }}
            title={`Màu ${c}`}
          />
        ))}
      </div>

      {/* Style Picker (only for draw) */}
      {activeTool === 'draw' && (
        <div className="flex bg-muted/50 rounded-lg p-0.5">
          <button 
            onClick={() => setArrowStyle('solid')}
            className={cn(
              "p-1.5 rounded-md transition-all",
              arrowStyle === 'solid' 
                ? "bg-background shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Nét liền"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setArrowStyle('dashed')}
            className={cn(
              "p-1.5 rounded-md transition-all",
              arrowStyle === 'dashed' 
                ? "bg-background shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Nét đứt"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
export const CompactToolbar = ({
  activeTool, setActiveTool,
  arrowColor, setArrowColor,
  arrowStyle, setArrowStyle,
  positionToPlace, setPositionToPlace,
  undo, redo, canUndo, canRedo,
  onClearAll,
  selectedTeam, setSelectedTeam,
  isPlacingBall, setIsPlacingBall,
  layerVisibility, toggleLayerVisibility
}: CompactToolbarProps) => {
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-card/80 backdrop-blur-md border-b border-border/50">
      {/* Left: History + Mode Tools */}
      <div className="flex items-center gap-1">
        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <ToolButton icon={Undo2} onClick={undo} disabled={!canUndo} title="Hoàn tác (Ctrl+Z)" />
          <ToolButton icon={Redo2} onClick={redo} disabled={!canRedo} title="Làm lại (Ctrl+Y)" />
        </div>

        <Divider />

        {/* Mode Tools */}
        <div className="flex items-center gap-0.5">
          <ToolButton 
            icon={MousePointer2} 
            isActive={activeTool === 'select'} 
            onClick={() => setActiveTool('select')} 
            title="Chọn (V)"
          />
        </div>

        <Divider />

        {/* Drawing Tools */}
        <div className="flex items-center gap-0.5">
          <ToolButton 
            icon={PenTool} 
            isActive={activeTool === 'draw'} 
            onClick={() => setActiveTool('draw')} 
            title="Vẽ mũi tên (P)"
          />
          <ToolButton 
            icon={SquareDashed} 
            isActive={activeTool === 'area'} 
            onClick={() => setActiveTool('area')} 
            title="Vẽ vùng (A)"
          />
          <ToolButton 
            icon={Eraser} 
            isActive={activeTool === 'erase'} 
            onClick={() => setActiveTool('erase')} 
            title="Tẩy (E)"
          />
        </div>

        {/* Drawing Options (Colors, Style) */}
        <DrawingOptions 
          arrowColor={arrowColor} 
          setArrowColor={setArrowColor}
          arrowStyle={arrowStyle}
          setArrowStyle={setArrowStyle}
          activeTool={activeTool}
        />
      </div>

      {/* Right: Layer Toggle + Ball + Player Picker + Clear */}
      <div className="flex items-center gap-2">
        {/* Layer Visibility Toggle */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
              showLayerMenu 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title="Layer (Hiển thị)"
          >
            <Layers className="w-4 h-4" />
          </motion.button>
          
          <AnimatePresence>
            {showLayerMenu && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60]" 
                  onClick={() => setShowLayerMenu(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -5 }}
                  className="absolute top-full right-0 mt-2 z-[70] w-48 bg-gray-950/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-xl p-2 origin-top-right"
                >
                  <p className="text-xs font-bold text-gray-400 mb-2 px-2">Hiển thị layer</p>
                  
                  <button
                    onClick={() => toggleLayerVisibility('home')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm text-white flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500" />
                      Đội nhà
                    </span>
                    {layerVisibility.home ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                  </button>
                  
                  <button
                    onClick={() => toggleLayerVisibility('away')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm text-white flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-purple-600" />
                      Đội khách
                    </span>
                    {layerVisibility.away ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                  </button>
                  
                  <button
                    onClick={() => toggleLayerVisibility('ball')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm text-white flex items-center gap-2">
                      <Circle className="w-3 h-3 fill-white" />
                      Bóng
                    </span>
                    {layerVisibility.ball ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        {/* Ball Placement Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsPlacingBall(!isPlacingBall);
            if (!isPlacingBall) setActiveTool('select');
          }}
          className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
            isPlacingBall 
              ? "bg-amber-500 text-white shadow-md" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          title="Đặt bóng"
        >
          <Circle className="w-4 h-4 fill-current" />
        </motion.button>
        
        <PlayerPicker 
          positionToPlace={positionToPlace} 
          setPositionToPlace={setPositionToPlace}
          setActiveTool={setActiveTool}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
        />
        
        <ToolButton 
          icon={Trash2} 
          onClick={onClearAll} 
          title="Xóa tất cả" 
          variant="danger"
        />
      </div>
    </div>
  );
};

