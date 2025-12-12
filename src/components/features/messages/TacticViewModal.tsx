// src/components/features/messages/TacticViewModal.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TacticBoard } from '@/components/features/tactic-board/TacticBoard';
import { 
  X, 
  Eye, 
  EyeOff, 
  GitFork, 
  Share2, 
  Check,
  Copy
} from 'lucide-react';

interface TacticViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tacticData: { players: any[]; arrows: any[] } | null;
  onFork?: (data: any) => void;
}

export function TacticViewModal({ 
  isOpen, 
  onClose, 
  tacticData,
  onFork 
}: TacticViewModalProps) {
  const [showHome, setShowHome] = useState(true);
  const [showAway, setShowAway] = useState(true);
  const [showBall, setShowBall] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !tacticData) return null;

  // Filter players by visibility - players use 'team' property ('home' or 'away')
  const visiblePlayers = (tacticData.players || []).filter(player => {
    const team = player.team || 'home'; // Default to 'home' if not specified
    if (team === 'home' && !showHome) return false;
    if (team === 'away' && !showAway) return false;
    return true;
  });

  // Handle ball visibility separately (ball might be in tacticData.ball)
  const visibleBall = showBall ? (tacticData as any).ball : null;

  const handleShare = () => {
    const tacticJson = encodeURIComponent(JSON.stringify(tacticData));
    const url = `${window.location.origin}/tactic/view?data=${tacticJson}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFork = () => {
    if (onFork) {
      onFork(tacticData);
      onClose(); // Close after calling fork
    } else {
      alert('Tính năng fork sắp ra mắt!');
    }
  };

  // Count players by team
  const homeCount = (tacticData.players || []).filter(p => (p.team || 'home') === 'home').length;
  const awayCount = (tacticData.players || []).filter(p => p.team === 'away').length;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-panel rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="font-headline font-bold text-lg">Xem chiến thuật</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
              {copied ? 'Đã sao chép!' : 'Chia sẻ'}
            </Button>
            <Button variant="default" size="sm" onClick={handleFork}>
              <GitFork className="w-4 h-4 mr-2" />
              Fork
            </Button>
            <button onClick={onClose} className="ml-2 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-background/50">
          <span className="text-sm font-medium text-muted-foreground">Hiển thị:</span>
          
          <button
            onClick={() => setShowHome(!showHome)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
              showHome 
                ? 'bg-[hsl(224,76%,48%)] text-white' 
                : 'bg-white/5 text-muted-foreground'
            }`}
          >
            {showHome ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Đội nhà
          </button>

          <button
            onClick={() => setShowAway(!showAway)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
              showAway 
                ? 'bg-[hsl(0,84%,60%)] text-white' 
                : 'bg-white/5 text-muted-foreground'
            }`}
          >
            {showAway ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Đội khách
          </button>

          <button
            onClick={() => setShowBall(!showBall)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
              showBall 
                ? 'bg-[hsl(45,93%,47%)] text-black' 
                : 'bg-white/5 text-muted-foreground'
            }`}
          >
            {showBall ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Bóng
          </button>
        </div>

        {/* Tactic Board */}
        <div className="flex-1 p-4">
          <div className="aspect-[16/10] bg-background rounded-xl border border-white/10 overflow-hidden">
            <TacticBoard
              players={visiblePlayers}
              arrows={tacticData.arrows || []}
              ball={visibleBall}
              readOnly={true}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 border-t border-white/5 bg-background/50">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Đội nhà: <strong className="text-foreground">{homeCount}</strong> cầu thủ</span>
            <span>Đội khách: <strong className="text-foreground">{awayCount}</strong> cầu thủ</span>
            <span>Mũi tên: <strong className="text-foreground">{tacticData.arrows?.length || 0}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
