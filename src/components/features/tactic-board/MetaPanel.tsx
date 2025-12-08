"use client";
import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button'; 
import { Download, ChevronDown, Users, ArrowRight, Hash } from 'lucide-react'; 
import { Player, Arrow } from './TacticBoard'; 
import { cn } from '@/lib/utils'; 

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
    const [isExportOpen, setIsExportOpen] = useState(false);
    
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
        
        const jsonString = JSON.stringify(tacticData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'tactic'}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsExportOpen(false);
    };

    const descriptionLength = description.length;
    const maxDescLength = 500;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-headline text-lg font-bold">
                    Thông tin
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {players.length}
                    </span>
                    <span className="flex items-center gap-1">
                        <ArrowRight className="w-3.5 h-3.5" />
                        {arrows.length}
                    </span>
                </div>
            </div>

            {/* Title Input */}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                    <span>Tiêu đề <span className="text-red-400">*</span></span>
                </label>
                <Input
                    placeholder="VD: Phản công cánh phải 4-3-3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={cn(
                        "h-10 bg-background/50 border-border/50 focus:border-primary transition-colors",
                        !title.trim() && "border-red-500/50 focus:border-red-500"
                    )}
                />
                {!title.trim() && (
                    <p className="text-[10px] text-red-400">Tiêu đề là bắt buộc</p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                    <span>Mô tả</span>
                    <span className={cn(
                        "text-[10px]",
                        descriptionLength > maxDescLength ? "text-red-400" : "text-muted-foreground/60"
                    )}>
                        {descriptionLength}/{maxDescLength}
                    </span>
                </label>
                <Textarea
                    placeholder="Giải thích cách vận hành chiến thuật, điểm mạnh, điểm yếu..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, maxDescLength))}
                    className="min-h-[100px] bg-background/50 border-border/50 focus:border-primary resize-none transition-colors"
                />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Hash className="w-3 h-3" />
                    Tags
                </label>
                <Input
                    placeholder="4-3-3, pressing, counter..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="h-10 bg-background/50 border-border/50 focus:border-primary transition-colors"
                />
                <p className="text-[10px] text-muted-foreground/60">
                    Phân cách bằng dấu phẩy
                </p>
            </div>
            
            {/* Export Section (Collapsible) */}
            <div className="pt-3 border-t border-border/30">
                <button 
                    onClick={() => setIsExportOpen(!isExportOpen)}
                    className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                    <span className="font-medium">Tùy chọn nâng cao</span>
                    <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        isExportOpen && "rotate-180"
                    )} />
                </button>
                
                {isExportOpen && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            className="w-full justify-center gap-2 border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground"
                            onClick={handleExport}
                        >
                            <Download className="w-4 h-4" />
                            Xuất JSON
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};