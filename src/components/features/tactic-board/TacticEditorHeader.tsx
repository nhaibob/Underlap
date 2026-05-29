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
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-transparent z-50 shrink-0 relative mt-2">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose || closeCreateModal} 
          className="text-muted-foreground hover:text-white hover:bg-white/10 rounded-full transition-all bg-black/40 backdrop-blur-md shadow-lg"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </Button>
        <div className="flex flex-col bg-black/40 backdrop-blur-md px-4 py-1 rounded-full shadow-lg border border-white/5">
          <h2 className="text-sm font-bold font-headline tracking-tight text-white">
            Tạo Chiến Thuật
          </h2>
          <p className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {playerCount}
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              {arrowCount}
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
