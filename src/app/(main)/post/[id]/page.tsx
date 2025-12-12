// src/app/(main)/post/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TacticBoard } from '@/components/features/tactic-board/TacticBoard';
import type { Player, Arrow } from '@/components/features/tactic-board/TacticBoard';
import { CommentSection } from '@/components/core/CommentSection';
import { ReactionBar } from '@/components/core/ReactionBar';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Loader2, 
  Swords, 
  Users,
  Calendar,
  Eye
} from 'lucide-react';

interface TacticData {
  id: string;
  title: string;
  description: string;
  formation?: string;
  tags?: string[];
  createdAt: string;
  viewsCount?: number;
  author: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string;
  };
  stats: {
    likes: number;
    comments: number;
    forks: number;
  };
  tacticData: {
    players: Player[];
    arrows: Arrow[];
  };
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [tactic, setTactic] = useState<TacticData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layerVisibility, setLayerVisibility] = useState({ home: true, away: true, ball: true });

  useEffect(() => {
    const fetchTactic = async () => {
      try {
        const res = await fetch(`/api/tactic/${params.id}`);
        if (!res.ok) {
          throw new Error('Không tìm thấy bài viết');
        }
        const data = await res.json();
        setTactic(data);
      } catch (err: any) {
        setError(err.message || 'Đã có lỗi xảy ra');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTactic();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Đang tải chiến thuật...</p>
        </div>
      </div>
    );
  }

  if (error || !tactic) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-panel rounded-xl border border-white/10 p-8">
          <h2 className="text-xl font-bold text-foreground mb-2">Không tìm thấy</h2>
          <p className="text-muted-foreground mb-6">{error || 'Bài viết không tồn tại hoặc đã bị xóa.'}</p>
          <Link href="/feed">
            <Button variant="default">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const playerCount = tactic.tacticData?.players?.length || 0;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Back Button */}
      <Link 
        href="/feed" 
        className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Quay lại Feed
      </Link>

      {/* Main Content Card */}
      <div className="bg-panel rounded-2xl border border-white/5 overflow-hidden mb-6">
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            <Link href={`/profile/${tactic.author.username}`}>
              <Avatar 
                src={tactic.author.avatarUrl} 
                alt={tactic.author.name}
                size="lg"
                className="hover:ring-2 hover:ring-primary transition-all"
              />
            </Link>
            <div>
              <Link href={`/profile/${tactic.author.username}`}>
                <h3 className="font-bold text-foreground hover:text-primary transition-colors">
                  {tactic.author.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>@{tactic.author.username}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(tactic.createdAt).toLocaleDateString('vi-VN')}
                </span>
                {tactic.viewsCount && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {tactic.viewsCount} lượt xem
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="p-6 border-b border-white/5">
          <h1 className="text-2xl font-headline font-bold text-foreground mb-3">
            {tactic.title}
          </h1>
          
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-primary/15 text-primary border border-primary/20">
              <Swords className="w-3.5 h-3.5" />
              {tactic.formation || '4-3-3'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/15 text-secondary border border-secondary/20">
              <Users className="w-3.5 h-3.5" />
              {playerCount} cầu thủ
            </span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {tactic.description}
          </p>

          {/* Tags */}
          {tactic.tags && tactic.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tactic.tags.map((tag, i) => (
                <span 
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tactic Board */}
        {tactic.tacticData && (
          <div className="p-6">
            {/* Layer Toggle */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground mr-2">Hiển thị:</span>
              <button
                onClick={() => setLayerVisibility(prev => ({ ...prev, home: !prev.home }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  layerVisibility.home 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'bg-gray-700/50 text-gray-500 border border-gray-600/30'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Đội nhà
              </button>
              <button
                onClick={() => setLayerVisibility(prev => ({ ...prev, away: !prev.away }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  layerVisibility.away 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-gray-700/50 text-gray-500 border border-gray-600/30'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Đội khách
              </button>
            </div>

            {/* Board */}
            <div className="rounded-xl overflow-hidden border border-white/10">
              <div className="aspect-[3/2]">
                <TacticBoard 
                  variant="full"
                  players={tactic.tacticData.players}
                  arrows={tactic.tacticData.arrows}
                  areas={[]}
                  readOnly={true}
                  layerVisibility={layerVisibility}
                />
              </div>
            </div>
          </div>
        )}

        {/* Unified Action Bar - All actions in one bar */}
        <div className="px-6 pb-6">
          <ReactionBar 
            tacticId={tactic.id}
            likes={tactic.stats.likes}
            comments={tactic.stats.comments}
            forks={tactic.stats.forks}
            variant="full"
            showLabels={true}
            onCommentClick={() => {
              // Scroll to comments
              document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      </div>

      {/* Comments Section */}
      <div id="comments-section" className="bg-panel rounded-xl border border-white/5 p-6">
        <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
          Bình luận
          <span className="text-sm font-normal text-muted-foreground">
            ({tactic.stats.comments})
          </span>
        </h3>
        <CommentSection postId={params.id} />
      </div>
    </div>
  );
}