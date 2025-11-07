// src/components/features/tactic-board/MetaPanel.tsx
import React from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button'; 
import { Download } from 'lucide-react'; 
import { Player, Arrow } from './TacticBoard'; 
import { cn } from '@/lib/utils'; 

// Component con cho Label (nhãn)
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-text-secondary mb-2">
    {children}
  </label>
);

// Khai báo Prop Types (KHÔNG CHỨA onPost, isPosting)
export interface MetaPanelProps {
    title: string;
    setTitle: (title: string) => void;
    description: string;
    setDescription: (description: string) => void;
    tags: string;
    setTags: (tags: string) => void;
    
    players: Player[];
    arrows: Arrow[];
}

export const MetaPanel = ({
    title,
    setTitle,
    description,
    setDescription,
    tags,
    setTags,
    players,
    arrows,
}: MetaPanelProps) => {
    
    // HÀM EXPORT DỮ LIỆU JSON
    const handleExport = () => {
        const tacticData = {
            metadata: {
                title,
                description,
                tags: tags.split(',').map(t => t.trim()).filter(t => t),
                timestamp: new Date().toISOString(),
            },
            players: players,
            arrows: arrows,
        };
        
        console.log("--- TACTIC EXPORTED JSON ---");
        console.log(JSON.stringify(tacticData, null, 2));
        alert("Dữ liệu đã được xuất ra Console (F12)!");
    };

  return (
    <div className="w-72 flex-shrink-0 space-y-4"> {/* Lỗi không phải ở đây, giữ w-72 */}
        <h3 className="font-headline text-xl font-bold border-b border-panel pb-3">
            Thông tin Chiến thuật
        </h3>
      {/* Tiêu đề */}
      <div>
        <Label>Tiêu đề</Label>
        <Input
          placeholder="Ví dụ: Tấn công cánh phải 4-3-3"
           value={title}
           onChange={(e) => setTitle(e.target.value)}
           className={cn(!title.trim() && 'border-danger')}
        />
        {!title.trim() && <p className="text-xs text-danger mt-1">Tiêu đề là bắt buộc.</p>}
      </div>

      {/* Mô tả */}
      <div>
        <Label>Mô tả</Label>
        <Textarea
          placeholder="Giải thích cách vận hành chiến thuật..."
           value={description}
           onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Tags */}
      <div>
        <Label>Tags (cách nhau bằng dấu phẩy)</Label>
        <Input
          placeholder="#4-3-3, #pressing, #counter"
           value={tags}
           onChange={(e) => setTags(e.target.value)}
        />
      </div>
      
      <hr className="my-4 border-panel" />
      
      {/* Nút Export JSON */}
      <Button 
        variant="ghost" 
        className="w-full justify-center gap-2 border border-panel hover:border-primary"
        onClick={handleExport}
      >
        <Download className="w-4 h-4" />
        Xuất JSON ({players.length} cầu thủ)
      </Button>
      
      {/* NÚT ĐĂNG CHIẾN THUẬT VÀ HỦY ĐÃ BỊ XÓA KHỎI ĐÂY */}
    </div>
  );
};