"use client";
import React from 'react';
import { Button } from '@/components/ui/Button';
import { 
  MousePointer2, 
  Move, 
  PenTool, 
  SquareDashed, 
  Eraser, 
  Undo2, 
  Redo2, 
  Minus,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool, ArrowColor, ArrowStyle } from './CreateTacticModal';
import { ALL_ARROW_COLOR_VALUES } from '@/lib/constants';

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
}

export const FloatingToolbar = ({
  activeTool, setActiveTool,
  arrowColor, setArrowColor,
  arrowStyle, setArrowStyle,
  undo, redo, canUndo, canRedo
}: FloatingToolbarProps) => {

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Chọn (V)' },
    { id: 'move', icon: Move, label: 'Di chuyển (M)' },
    { separator: true },
    { id: 'draw', icon: PenTool, label: 'Vẽ mũi tên (P)' },
    { id: 'area', icon: SquareDashed, label: 'Vẽ vùng (A)' },
    { id: 'erase', icon: Eraser, label: 'Tẩy (E)' },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 w-full max-w-fit px-4 pointer-events-none">
      
      {/* Settings Popover (Chỉ hiện khi đang chọn Vẽ hoặc Vùng) */}
      <div className={cn(
        "flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border p-2 rounded-full shadow-lg transition-all duration-300 pointer-events-auto origin-bottom scale-90 opacity-0 translate-y-4",
        (activeTool === 'draw' || activeTool === 'area') && "scale-100 opacity-100 translate-y-0"
      )}>
        {/* Color Picker */}
        <div className="flex gap-1.5 px-2">
           {ALL_ARROW_COLOR_VALUES.map((c) => (
             <button
                key={c}
                onClick={() => setArrowColor(c as ArrowColor)}
                className={cn(
                  "w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125",
                  arrowColor === c && "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110"
                )}
                style={{ backgroundColor: c }}
                title={`Màu ${c}`}
             />
           ))}
        </div>
        
        {/* Style Picker (Chỉ hiện khi vẽ mũi tên) */}
        {activeTool === 'draw' && (
          <>
            <div className="w-px h-4 bg-border mx-1" />
            <div className="flex bg-muted rounded-full p-0.5">
               <button 
                  onClick={() => setArrowStyle('solid')}
                  className={cn("p-1.5 rounded-full transition-all", arrowStyle === 'solid' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                  title="Nét liền"
               >
                  <Minus className="w-4 h-4" />
               </button>
               <button 
                  onClick={() => setArrowStyle('dashed')}
                  className={cn("p-1.5 rounded-full transition-all", arrowStyle === 'dashed' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                  title="Nét đứt"
               >
                  <MoreHorizontal className="w-4 h-4" />
               </button>
            </div>
          </>
        )}
      </div>

      {/* Main Toolbar */}
      <div className="flex items-center gap-1.5 p-2 bg-card/90 backdrop-blur-xl border border-white/10 dark:border-border/50 rounded-2xl shadow-2xl pointer-events-auto">
         {/* History Controls */}
         <div className="flex items-center gap-1 pr-2 border-r border-border/50">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted" onClick={undo} disabled={!canUndo} title="Hoàn tác (Ctrl+Z)">
               <Undo2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted" onClick={redo} disabled={!canRedo} title="Làm lại (Ctrl+Y)">
               <Redo2 className="w-5 h-5" />
            </Button>
         </div>

         {/* Tool Items */}
         <div className="flex items-center gap-1 pl-1">
            {tools.map((t: any, idx) => {
              if (t.separator) return <div key={idx} className="w-px h-6 bg-border/50 mx-1" />;
              
              const isActive = activeTool === t.id;
              // Sử dụng icon động
              const IconComp = t.icon;

              return (
                <Button
                  key={t.id}
                  variant={isActive ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setActiveTool(t.id)}
                  className={cn(
                    "h-11 w-11 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md scale-105" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  title={t.label}
                >
                  <IconComp className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                </Button>
              );
            })}
         </div>
      </div>
    </div>
  );
};