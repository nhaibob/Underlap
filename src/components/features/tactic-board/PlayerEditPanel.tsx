import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Player } from './TacticBoard';
// [FIXED] Import Tool từ useTacticLogic
import { Tool as GlobalTool } from '@/lib/hooks/useTacticLogic'; 
import { Trash2 } from 'lucide-react';
import { PlayerToken, PlayerTokenProps } from './PlayerToken';
import { POSITION_OPTIONS } from '@/lib/constants'; 

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

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPosition = e.target.value as PlayerTokenProps['position'];
    onUpdate(player.id, { 
      position: newPosition, 
      label: newPosition      
    });
  };
  
  const handleDelete = () => {
    onDelete(player.id); 
    setActiveTool('select'); 
  };

  return (
    <div className="w-72 flex-shrink-0 space-y-4 p-4 rounded-lg bg-panel border border-white/10">
      <h3 className="font-headline text-xl font-bold border-b border-panel pb-3">
        Chỉnh sửa Cầu thủ
      </h3>
      
      <div className="flex items-center gap-4">
        {/* Token lớn (preview) */}
        <div className="w-16 h-16">
          <PlayerToken position={player.position} label={player.label} className="w-full h-full" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">Nhãn hiện tại: <strong className="text-foreground">{player.label}</strong></p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Số áo / Nhãn</label>
        <Input
          value={player.label}
          onChange={handleLabelChange}
          maxLength={3}
          placeholder={player.position}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Vị trí (Vai trò)</label>
        <select
          value={player.position}
          onChange={handlePositionChange}
          className="w-full h-10 rounded-lg border border-panel bg-background px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {POSITION_OPTIONS_TYPES.map(pos => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </select>
      </div>
      
      <Button variant="destructive" className="w-full justify-center gap-2" onClick={handleDelete}>
        <Trash2 className="w-4 h-4" />
        Xóa cầu thủ {player.label}
      </Button>
    </div>
  );
};