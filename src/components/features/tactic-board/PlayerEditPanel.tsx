import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Player } from './TacticBoard';
import { Tool as GlobalTool } from './CreateTacticModal'; 
import { Trash2, Shield, Shirt } from 'lucide-react';
import { PlayerToken, PlayerTokenProps } from './PlayerToken';
import { POSITION_OPTIONS } from '@/lib/constants'; 
import { cn } from '@/lib/utils';

const POSITION_OPTIONS_TYPES = POSITION_OPTIONS.map(p => p.value) as PlayerTokenProps['position'][];

interface PlayerEditPanelProps {
  player: Player;
  onUpdate: (id: string, updates: Partial<Player>) => void;
  onDelete: (id: string) => void; 
  setActiveTool: (tool: GlobalTool) => void; 
}

export const PlayerEditPanel = ({ player, onUpdate, onDelete, setActiveTool }: PlayerEditPanelProps) => {
  
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(player.id, { label: e.target.value.toUpperCase() });
  };

  const handlePositionChange = (pos: PlayerTokenProps['position']) => {
    onUpdate(player.id, { position: pos, label: pos }); // Reset label theo role mới
  };
  
  const handleDelete = () => {
    onDelete(player.id); 
    setActiveTool('move'); 
  };

  return (
    <div className="space-y-6">
      
      {/* Player Card Preview */}
      <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-b from-muted/50 to-muted/10 border border-border/50">
          <div className="w-20 h-20 mb-3 shadow-xl rounded-full overflow-hidden ring-4 ring-background">
             <PlayerToken position={player.position} label={player.label} className="w-full h-full text-2xl" />
          </div>
          <span className="font-headline text-lg font-bold">{player.label}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium mt-1">
            {POSITION_OPTIONS.find(p => p.value === player.position)?.label || player.position}
          </span>
      </div>

      <div className="space-y-4">
        {/* Số áo / Tên */}
        <div>
           <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block flex items-center gap-2">
              <Shirt size={14} /> Số áo / Nhãn
           </label>
           <Input
             value={player.label}
             onChange={handleLabelChange}
             maxLength={3}
             className="text-center font-headline font-bold text-lg tracking-widest bg-background"
           />
        </div>

        {/* Chọn vị trí (Role Grid) */}
        <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block flex items-center gap-2">
               <Shield size={14} /> Vai trò
            </label>
            <div className="grid grid-cols-4 gap-2">
               {POSITION_OPTIONS_TYPES.map(pos => (
                 <button
                    key={pos}
                    onClick={() => handlePositionChange(pos)}
                    className={cn(
                        "aspect-square rounded-md text-[10px] font-bold border transition-all flex flex-col items-center justify-center gap-1",
                        player.position === pos 
                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" 
                            : "bg-card border-border hover:bg-accent hover:border-accent-foreground/20"
                    )}
                 >
                    <span>{pos}</span>
                 </button>
               ))}
            </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-border">
        <Button 
            variant="destructive" 
            className="w-full gap-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700 border border-red-200 dark:border-red-900/30 shadow-none" 
            onClick={handleDelete}
        >
            <Trash2 className="w-4 h-4" />
            Xóa cầu thủ này
        </Button>
      </div>
    </div>
  );
};