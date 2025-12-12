// src/app/tactic/view/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TacticBoard } from '@/components/features/tactic-board/TacticBoard';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  GitFork,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

function TacticViewContent() {
  const searchParams = useSearchParams();
  const [tacticData, setTacticData] = useState<{ players: any[]; arrows: any[] } | null>(null);
  const [showHome, setShowHome] = useState(true);
  const [showAway, setShowAway] = useState(true);
  const [showBall, setShowBall] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decoded = decodeURIComponent(dataParam);
        const parsed = JSON.parse(decoded);
        setTacticData(parsed);
      } catch (e) {
        console.error('Failed to parse tactic data:', e);
      }
    }
  }, [searchParams]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFork = () => {
    // TODO: Fork tactic to user's collection
    alert('Tính năng fork sắp ra mắt!');
  };

  // Filter players by visibility
  const visiblePlayers = (tacticData?.players || []).filter(player => {
    if (player.type === 'home' && !showHome) return false;
    if (player.type === 'away' && !showAway) return false;
    if (player.type === 'ball' && !showBall) return false;
    return true;
  });

  if (!tacticData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-panel/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/messages">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <h1 className="font-headline font-bold text-lg">Xem chiến thuật</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              {copied ? 'Đã sao chép!' : 'Chia sẻ'}
            </Button>
            <Button variant="default" size="sm" onClick={handleFork}>
              <GitFork className="w-4 h-4 mr-2" />
              Fork
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Layer Toggles */}
        <div className="flex items-center gap-4 mb-4 bg-panel rounded-xl p-3 border border-white/5">
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
        <div className="aspect-[16/10] bg-panel rounded-2xl border border-white/10 overflow-hidden">
          <TacticBoard
            players={visiblePlayers}
            arrows={tacticData.arrows || []}
            readOnly={true}
          />
        </div>

        {/* Info */}
        <div className="mt-6 bg-panel rounded-xl p-4 border border-white/5">
          <h2 className="font-semibold text-foreground mb-2">Thông tin</h2>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Số cầu thủ đội nhà: {tacticData.players?.filter(p => p.type === 'home').length || 0}</p>
            <p>Số cầu thủ đội khách: {tacticData.players?.filter(p => p.type === 'away').length || 0}</p>
            <p>Số mũi tên: {tacticData.arrows?.length || 0}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TacticViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <TacticViewContent />
    </Suspense>
  );
}
