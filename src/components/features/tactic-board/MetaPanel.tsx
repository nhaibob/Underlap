import React from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button'; 
import { Download } from 'lucide-react'; 
import { Player, Arrow } from './TacticBoard'; 
import { cn } from '@/lib/utils'; 

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-text-secondary mb-2">
    {children}
  </label>
);

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
    
    // [UPDATED] Hàm Export JSON File
    const handleExport = () => {
        const tacticData = {
            metadata: {
                title,
                description,
                tags: tags.split(',').map(t => t.trim()).filter(t => t),
                timestamp: new Date().toISOString(),
            },
            players,
            arrows,
        };
        
        // Tạo file Blob và tải xuống
        const jsonString = JSON.stringify(tacticData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/\s+/g, '_') || 'tactic'}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

  return (
    <div className="w-72 flex-shrink-0 space-y-4">
        <h3 className="font-headline text-xl font-bold border-b border-panel pb-3">
            Thông tin Chiến thuật
        </h3>
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

      <div>
        <Label>Mô tả</Label>
        <Textarea
          placeholder="Giải thích cách vận hành chiến thuật..."
           value={description}
           onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <Label>Tags (cách nhau bằng dấu phẩy)</Label>
        <Input
          placeholder="#4-3-3, #pressing, #counter"
           value={tags}
           onChange={(e) => setTags(e.target.value)}
        />
      </div>
      
      <hr className="my-4 border-panel" />
      
      <Button 
        variant="ghost" 
        className="w-full justify-center gap-2 border border-panel hover:border-primary"
        onClick={handleExport}
      >
        <Download className="w-4 h-4" />
        Xuất JSON ({players.length} cầu thủ)
      </Button>
    </div>
  );
};