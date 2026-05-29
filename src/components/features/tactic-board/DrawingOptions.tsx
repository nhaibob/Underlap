import React from 'react';
import { cn } from '@/lib/utils';
import { Tool, ArrowColor, ArrowStyle } from '@/lib/hooks/useTacticLogic';
import { ALL_ARROW_COLOR_VALUES } from '@/lib/constants';
import { Minus, MoreHorizontal } from 'lucide-react';
import { Divider } from './ToolButton';

interface DrawingOptionsProps {
  arrowColor: ArrowColor;
  setArrowColor: (color: ArrowColor) => void;
  arrowStyle: ArrowStyle;
  setArrowStyle: (style: ArrowStyle) => void;
  activeTool: Tool;
}

export const DrawingOptions = ({
  arrowColor, setArrowColor,
  arrowStyle, setArrowStyle,
  activeTool
}: DrawingOptionsProps) => {
  if (activeTool !== 'draw' && activeTool !== 'area') return null;

  return (
    <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-4 py-2.5 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
      
      {/* Color Picker */}
      <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/50 rounded-full p-0.5 sm:p-1">
        {ALL_ARROW_COLOR_VALUES.map((c) => (
          <button
            key={c}
            onClick={() => setArrowColor(c as ArrowColor)}
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
        <div className="flex bg-muted/50 rounded-full p-0.5">
          <button 
            onClick={() => setArrowStyle('solid')}
            className={cn(
              "p-1.5 rounded-full transition-all",
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
              "p-1.5 rounded-full transition-all",
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
