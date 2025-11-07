// src/components/features/tactic-board/PlayerEditPanel.tsx
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Player } from './TacticBoard';
// Sửa lỗi: Import Tool dưới tên GlobalTool
import { Tool as GlobalTool } from './CreateTacticModal'; 
import { Trash2 } from 'lucide-react';
import { PlayerToken, PlayerTokenProps } from './PlayerToken';
// IMPORT CONSTANTS ĐỂ DÙNG CHUNG
import { POSITION_OPTIONS } from '@/lib/constants'; 


// Lấy danh sách vị trí từ Constants và ép kiểu an toàn
const POSITION_OPTIONS_TYPES = POSITION_OPTIONS.map(p => p.value) as PlayerTokenProps['position'][];


interface PlayerEditPanelProps {
  player: Player;
  onUpdate: (id: string, updates: Partial<Player>) => void;
  onDelete: (id: string) => void; 
  setActiveTool: (tool: GlobalTool) => void; 
}

export const PlayerEditPanel = ({ player, onUpdate, onDelete, setActiveTool }: PlayerEditPanelProps) => {
  
  // Xử lý đổi tên/số áo
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(player.id, { label: e.target.value.toUpperCase() });
  };

  // CHỨC NĂNG ĐÃ SỬA: Xử lý đổi Vị trí (Role)
  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Ép kiểu chuỗi (string) thành Union Type cụ thể
    const newPosition = e.target.value as PlayerTokenProps['position'];
    
    onUpdate(player.id, { 
      position: newPosition, // Cập nhật position (giờ đã là Union Type)
      label: newPosition      // Đồng bộ nhãn
    });
  };
  
  // Xử lý xóa cầu thủ khi ấn nút
  const handleDelete = () => {
    onDelete(player.id); 
    setActiveTool('move'); 
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
          <p className="text-sm text-text-secondary">Nhãn hiện tại: **{player.label}**</p>
        </div>
      </div>

      {/* Input đổi tên/số áo */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Số áo / Nhãn</label>
        <Input
          value={player.label}
          onChange={handleLabelChange}
          maxLength={3}
          placeholder={player.position}
        />
      </div>

      {/* Select đổi vị trí */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Vị trí (Vai trò)</label>
        <select
          value={player.position}
          onChange={handlePositionChange}
          className="w-full h-10 rounded-lg border border-panel bg-background px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {/* SỬ DỤNG DANH SÁCH ĐÃ ĐƯỢC ÉP KIỂU */}
          {POSITION_OPTIONS_TYPES.map(pos => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </select>
      </div>
      
      {/* Button Xóa */}
      <Button variant="danger" className="w-full justify-center gap-2" onClick={handleDelete}>
        <Trash2 className="w-4 h-4" />
        Xóa cầu thủ {player.label}
      </Button>
    </div>
  );
};