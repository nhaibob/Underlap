import React from 'react';
import { Button } from '@/components/ui/Button';
import { X, Save, PanelRightClose, PanelRight } from 'lucide-react';
import { useUIStore } from '@/lib/store/uiStore';

interface TacticEditorHeaderProps {
  onClose?: () => void;
  playerCount: number;
  arrowCount: number;
  isPanelCollapsed: boolean;
  setIsPanelCollapsed: (collapsed: boolean) => void;
  onSaveDraft?: () => void;
  onPost: () => void;
  isPosting: boolean;
  canPost: boolean;
}

export const TacticEditorHeader = ({
  onClose,
  playerCount,
  arrowCount,
  isPanelCollapsed,
  setIsPanelCollapsed,
  onSaveDraft,
  onPost,
  isPosting,
  canPost
}: TacticEditorHeaderProps) => {
  const { closeCreateModal } = useUIStore();

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border/50 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent backdrop-blur-md z-50 shrink-0">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose || closeCreateModal} 
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </Button>
        <div className="border-l border-border/50 h-8 hidden sm:block" />
        <div>
          <h2 className="text-lg font-bold font-headline tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Tạo Chiến Thuật
          </h2>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
              {playerCount} cầu thủ
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              {arrowCount} mũi tên
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Toggle Panel Button (Desktop) */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          className="hidden xl:flex text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
          title={isPanelCollapsed ? "Mở panel" : "Đóng panel"}
        >
          {isPanelCollapsed ? <PanelRight className="w-5 h-5" /> : <PanelRightClose className="w-5 h-5" />}
        </Button>
        
        {/* Save Draft Button */}
        {onSaveDraft && (
          <Button 
            variant="outline" 
            onClick={onSaveDraft} 
            disabled={isPosting} 
            className="gap-2 border-white/10 hover:bg-white/5" 
            size="sm"
          >
            <Save size={16} />
            <span className="hidden sm:inline">Lưu nháp</span>
          </Button>
        )}
        
        {/* Publish Button */}
        <Button 
          variant="default" 
          onClick={onPost} 
          disabled={isPosting || !canPost} 
          className="gap-2 min-w-[100px] bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20" 
          size="sm"
        >
          {isPosting ? (
            <span className="animate-pulse">Đang lưu...</span>
          ) : (
            <>
              <Save size={16} />
              <span className="hidden sm:inline">Đăng bài</span>
              <span className="sm:hidden">Lưu</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
};
