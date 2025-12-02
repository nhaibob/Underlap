import React from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button'; 
import { Download, FileJson } from 'lucide-react'; 
import { Player, Arrow } from './TacticBoard'; 
import { cn } from '@/lib/utils'; 

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
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
    title, setTitle,
    description, setDescription,
    tags, setTags,
    players, arrows,
}: MetaPanelProps) => {
    
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
        console.log(JSON.stringify(tacticData, null, 2));
        alert("Đã xuất JSON ra Console!");
    };

  return (
    <div className="space-y-6">
      
      <div className="space-y-4">
          <div>
            <Label>Tiêu đề chiến thuật</Label>
            <Input
              placeholder="VD: 4-3-3 Gegenpressing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn("bg-background border-input focus-visible:ring-primary", !title.trim() && 'border-red-400 focus-visible:ring-red-400')}
            />
            {!title.trim() && <p className="text-[10px] text-red-500 mt-1 font-medium">Bắt buộc nhập tiêu đề.</p>}
          </div>

          <div>
            <Label>Mô tả chi tiết</Label>
            <Textarea
              placeholder="Mô tả cách vận hành, vai trò từng vị trí..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] bg-background resize-none text-sm"
            />
          </div>

          <div>
            <Label>Tags (Hashtags)</Label>
            <Input
              placeholder="#attack, #defense"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-background text-sm"
            />
          </div>
      </div>
      
      <div className="pt-4 border-t border-border border-dashed">
          <Button 
            variant="outline" 
            className="w-full justify-center gap-2 text-xs h-9 border-dashed border-border hover:border-primary hover:text-primary transition-colors"
            onClick={handleExport}
          >
            <FileJson className="w-4 h-4" />
            Export JSON Data
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Dữ liệu bao gồm {players.length} cầu thủ và {arrows.length} mũi tên.
          </p>
      </div>
    </div>
  );
};