"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  MousePointer2, Move, PenTool, SquareDashed, Eraser, 
  Undo2, Redo2, Minus, MoreHorizontal, UserPlus, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool, ArrowColor, ArrowStyle } from '@/lib/hooks/useTacticLogic';
import { ALL_ARROW_COLOR_VALUES
 } from '@/lib/constants';

// Position groups for player picker
const QUICK_POSITIONS = ['GK', 'CB', 'CM', 'ST'];

interface FloatingToolbarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  arrowColor: ArrowColor;
  setArrowColor: (color: ArrowColor) => void;
  arrowStyle: ArrowStyle;
  setArrowStyle: (style: ArrowStyle) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  // Optional: for player adding on mobile
  positionToPlace?: string | null;
  setPositionToPlace?: (pos: string | null) => void;
}

import { motion, AnimatePresence } from 'framer-motion';

export const FloatingToolbar = ({
  activeTool, setActiveTool,
  arrowColor, setArrowColor,
  arrowStyle, setArrowStyle,
  undo, redo, canUndo, canRedo,
  positionToPlace, setPositionToPlace
}: FloatingToolbarProps) => {

  const [showPlayerPicker, setShowPlayerPicker] = useState(false);

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Chọn' },
    { id: 'move', icon: Move, label: 'Di chuyển' },
    { separator: true },
    { id: 'draw', icon: PenTool, label: 'Vẽ mũi tên' },
    { id: 'area', icon: SquareDashed, label: 'Vẽ vùng' },
    { id: 'erase', icon: Eraser, label: 'Tẩy' },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 w-full max-w-fit px-4 pointer-events-none">
      
      {/* Quick Player Picker (Mobile) */}
      <AnimatePresence>
        {showPlayerPicker && setPositionToPlace && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex items-center gap-1.5 p-2 bg-neutral-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto"
          >
            {QUICK_POSITIONS.map((pos) => (
              <motion.button
                key={pos}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setPositionToPlace(pos);
                  setActiveTool('select');
                  setShowPlayerPicker(false);
                }}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                  positionToPlace === pos 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-transparent border-white/20 text-foreground hover:bg-white/10"
                )}
              >
                {pos}
              </motion.button>
            ))}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPlayerPicker(false)}
              className="p-2 rounded-xl text-muted-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Popover - Colors & Style */}
      <div className={cn(
        "flex items-center gap-2 bg-neutral-900/95 backdrop-blur-3xl border border-white/10 p-2 rounded-2xl shadow-lg transition-all duration-300 pointer-events-auto origin-bottom",
        (activeTool === 'draw' || activeTool === 'area') 
          ? "scale-100 opacity-100 translate-y-0" 
          : "scale-90 opacity-0 translate-y-4 pointer-events-none"
      )}>
        {/* Color Picker */}
        <div className="flex gap-1.5 px-1">
          {ALL_ARROW_COLOR_VALUES.map((c) => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.8 }}
              onClick={() => setArrowColor(c)}
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                arrowColor === c 
                  ? "border-white scale-110 ring-2 ring-primary/50" 
                  : "border-white/20 opacity-70 hover:opacity-100"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        
        {/* Style Picker */}
        {activeTool === 'draw' && (
          <>
            <div className="w-px h-5 bg-border" />
            <div className="flex bg-muted/50 rounded-xl p-0.5">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setArrowStyle('solid')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  arrowStyle === 'solid' 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Minus className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setArrowStyle('dashed')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  arrowStyle === 'dashed' 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
              </motion.button>
            </div>
          </>
        )}
      </div>

      {/* Main Toolbar */}
      <div className="flex items-center gap-1 p-1.5 bg-neutral-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto">
        {/* History Controls */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-border/50">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-xl hover:bg-muted" 
            onClick={undo} 
            disabled={!canUndo}
          >
            <Undo2 className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-xl hover:bg-muted" 
            onClick={redo} 
            disabled={!canRedo}
          >
            <Redo2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Tool Items */}
        <div className="flex items-center gap-0.5 px-0.5">
          {tools.map((t: any, idx) => {
            if (t.separator) return <div key={idx} className="w-px h-6 bg-border/50 mx-0.5" />;
            
            const isActive = activeTool === t.id;
            const IconComp = t.icon;

            return (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTool(t.id)}
                className={cn(
                  "h-11 w-11 rounded-xl transition-all duration-200 flex items-center justify-center relative",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <IconComp className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                {isActive && (
                    <motion.div
                        layoutId="active-mobile-tool"
                        className="absolute inset-0 rounded-xl bg-primary/10 -z-10"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Player Add Button (if provided) */}
        {setPositionToPlace && (
          <>
            <div className="w-px h-6 bg-border/50 mx-0.5" />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPlayerPicker(!showPlayerPicker)}
              className={cn(
                "h-11 w-11 rounded-xl transition-all flex items-center justify-center",
                positionToPlace 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <UserPlus className="w-5 h-5" />
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
};