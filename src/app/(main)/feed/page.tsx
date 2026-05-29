// src/app/(main)/feed/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { PostCard } from "@/components/core/PostCard";
import { CreatePostButton } from "@/components/core/CreatePostButton";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Loader2, TrendingUp, Clock, Users, RefreshCw } from "lucide-react";
import { supabaseAuth } from "@/lib/supabase";
import { useUIStore } from "@/lib/store/uiStore";
import { motion } from "framer-motion";


interface PostData {
  id: string;
  title: string;
  description: string;
  createdAt?: string;
  formation?: string;
  tags?: string[];
  author: {
    username: string;
    avatarUrl: string;
    name?: string;
    id?: string;
  };
  stats: {
    likes: number;
    comments: number;
    forks: number;
  };
  tacticData: {
    players: any[];
    arrows: any[];
  };
}

type SortType = "latest" | "trending" | "following";

const SORT_OPTIONS: {
  value: SortType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "latest", label: "Mới nhất", icon: Clock },
  { value: "trending", label: "Thịnh hành", icon: TrendingUp },
  { value: "following", label: "Đang theo dõi", icon: Users },
];

export default function FeedPage() {
  const { openCreateModal } = useUIStore();
  const [feedData, setFeedData] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortType>("latest");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Fetch user on mount
  useEffect(() => {
    const getUser = async () => {
      const user = await supabaseAuth.getUser();
      setCurrentUser(user);

      // Fetch following list if user is logged in
      if (user?.id) {
        try {
          const res = await fetch(
            `/api/user/${user.user_metadata?.username || user.email?.split("@")[0]}/following`,
            {
              headers: { },
            },
          );
          if (res.ok) {
            const following = await res.json();
            setFollowingIds(new Set(following.map((f: any) => f.id)));
          }
        } catch (error) {
          console.warn("Failed to fetch following list:", error);
        }
      }
    };
    getUser();
  }, []);

  const fetchFeed = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch(`/api/tactic?sort=${sortBy}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setFeedData(Array.isArray(data) ? data : [data]);
      }
    } catch (e) {
      console.warn("Feed fetch error:", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [sortBy]);

  // Filter and sort feed data client-side based on sortBy
  const filteredFeed =
    sortBy === "following"
      ? feedData.filter((post) => {
          // Match by author id if available, otherwise by username
          if (post.author.id) {
            return followingIds.has(post.author.id);
          }
          // Fallback: check if we're following any user with this username
          return Array.from(followingIds).some(
            (id) => id === post.author.username,
          );
        })
      : feedData;

  const sortedFeed = [...filteredFeed].sort((a, b) => {
    if (sortBy === "trending") {
      return (
        b.stats.likes + b.stats.comments - (a.stats.likes + a.stats.comments)
      );
    }
    // Default: latest
    return (
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
    );
  });



  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with Title and Refresh */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-bold text-foreground">
          Feed
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchFeed(true)}
          disabled={isRefreshing}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      {/* Sort Tabs */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {SORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = sortBy === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap
                transition-colors z-10 bg-[#111111]/80 border border-white/5 hover:bg-white/5
                ${
                  isActive
                    ? "text-black !border-transparent !bg-transparent"
                    : "text-muted-foreground hover:text-white"
                }
              `}
            >
              {isActive && (
                <motion.div layoutId="feedSortPill" className="absolute inset-0 bg-white rounded-full z-[-1] shadow-md" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
              )}
              <Icon className="w-4 h-4" />
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Create Post Button */}
      <div className="mb-6">
        <CreatePostButton />
      </div>

      {/* Feed Content */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">Đang tải bài viết...</p>
          </div>
        </div>
      ) : sortedFeed.length === 0 ? (
        <div className="text-center py-12 bg-panel rounded-xl border border-white/10">
          <p className="text-muted-foreground mb-4">
            {sortBy === "following"
              ? "Chưa có bài viết từ người bạn theo dõi."
              : "Chưa có bài đăng nào."}
          </p>
          <Button variant="default" onClick={openCreateModal}>Tạo chiến thuật đầu tiên</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedFeed.map((post) => (
            <div key={post.id} className="relative">

              <PostCard
                id={post.id}
                author={{
                  name: post.author.name || post.author.username,
                  username: post.author.username,
                  avatar: post.author.avatarUrl,
                }}
                content={`**${post.title}**\n\n${post.description}`}
                timestamp={
                  post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString("vi-VN")
                    : "Vừa xong"
                }
                likes={post.stats.likes}
                comments={post.stats.comments}
                forks={post.stats.forks}
                tacticData={post.tacticData}
                formation={post.formation || "4-4-2"}
                tags={post.tags || ["pressing", "phản công"]}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More Hint */}
      {sortedFeed.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Hiển thị {sortedFeed.length} chiến thuật
          </p>
        </div>
      )}
    </div>
  );
}
