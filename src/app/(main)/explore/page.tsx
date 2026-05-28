// src/app/(main)/explore/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { PostCard } from '@/components/core/PostCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { 
  Search, 
  Loader2, 
  TrendingUp, 
  Clock, 
  Filter,
  Swords,
  X,
  Users,
  Layers,
  MapPin,
  UserPlus,
  ChevronRight
} from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface TacticPost {
  id: string;
  title: string;
  description: string;
  formation?: string;
  tags?: string[];
  createdAt: string;
  author: {
    username: string;
    avatarUrl: string;
    name?: string;
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

interface UserResult {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatarUrl: string;
  location: string;
  followersCount: number;
  tacticsCount: number;
}

// Formation options
const FORMATIONS = [
  '4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2', '3-4-3', '4-1-4-1', '4-5-1'
];

// Popular tags
const POPULAR_TAGS = [
  'pressing', 'phản công', 'tiki-taka', 'gegenpressing', 'catenaccio', 
  'xây dựng lối chơi', 'set pieces', 'phòng ngự'
];

type SortType = 'trending' | 'latest';
type TabType = 'tactics' | 'users';

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<TabType>('tactics');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedFormation, setSelectedFormation] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortType>('trending');
  const [tactics, setTactics] = useState<TacticPost[]>([]);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const debouncedSearch = useDebouncedCallback((query: string) => {
    setActiveQuery(query);
  }, 300);

  // Fetch tactics
  const fetchTactics = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeQuery) params.append('q', activeQuery);
      if (selectedFormation) params.append('formation', selectedFormation);
      if (selectedTag) params.append('tag', selectedTag);
      params.append('sort', sortBy);

      const res = await fetch(`/api/tactic?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTactics(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch tactics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeQuery, selectedFormation, selectedTag, sortBy]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!activeQuery) {
      setUsers([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/search?q=${encodeURIComponent(activeQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeQuery]);

  useEffect(() => {
    if (activeTab === 'tactics') {
      fetchTactics();
    } else {
      fetchUsers();
    }
  }, [activeTab, fetchTactics, fetchUsers]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setActiveQuery('');
    setSelectedFormation(null);
    setSelectedTag(null);
  };

  const hasFilters = activeQuery || selectedFormation || selectedTag;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground mb-2">
          Khám phá
        </h1>
        <p className="text-muted-foreground">
          Tìm kiếm chiến thuật và người dùng từ cộng đồng
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm chiến thuật, người dùng, sơ đồ..." 
            className="pl-10 h-12 bg-panel border-white/10 focus:border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setActiveQuery(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {activeTab === 'tactics' && (
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-4"
          >
            <Filter className="w-4 h-4 mr-2" />
            Bộ lọc
          </Button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('tactics')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeTab === 'tactics'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'bg-panel border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20'
          }`}
        >
          <Layers className="w-4 h-4" />
          Chiến thuật
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeTab === 'users'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'bg-panel border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20'
          }`}
        >
          <Users className="w-4 h-4" />
          Người dùng
        </button>
      </div>

      {/* ─── TACTICS TAB ─── */}
      {activeTab === 'tactics' && (
        <>
          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-panel rounded-xl border border-white/5 p-4 mb-6 space-y-4">
              {/* Formations */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Swords className="w-4 h-4" />
                  Sơ đồ chiến thuật
                </h3>
                <div className="flex flex-wrap gap-2">
                  {FORMATIONS.map(formation => (
                    <button
                      key={formation}
                      onClick={() => setSelectedFormation(
                        selectedFormation === formation ? null : formation
                      )}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedFormation === formation
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                      }`}
                    >
                      {formation}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Phong cách chơi
                </h3>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedTag === tag
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Button */}
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          )}

          {/* Sort Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('trending')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  sortBy === 'trending'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-panel border border-white/10 text-muted-foreground hover:text-foreground'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Thịnh hành
              </button>
              <button
                onClick={() => setSortBy('latest')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  sortBy === 'latest'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-panel border border-white/10 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock className="w-4 h-4" />
                Mới nhất
              </button>
            </div>

            {/* Results count */}
            <span className="text-sm text-muted-foreground">
              {tactics.length} kết quả
            </span>
          </div>

          {/* Active Filters Display */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/15 text-primary text-sm">
                  Tìm: &quot;{activeQuery}&quot;
                  <button onClick={() => { setSearchQuery(''); setActiveQuery(''); }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedFormation && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/15 text-primary text-sm">
                  {selectedFormation}
                  <button onClick={() => setSelectedFormation(null)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedTag && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-sm">
                  #{selectedTag}
                  <button onClick={() => setSelectedTag(null)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Tactics Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Tactics Results */}
          {!isLoading && (
            <>
              {tactics.length === 0 ? (
                <div className="text-center py-12 bg-panel rounded-xl border border-white/10">
                  <Swords className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground mb-4">
                    Không tìm thấy chiến thuật nào phù hợp.
                  </p>
                  {hasFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {tactics.map((tactic) => (
                    <div key={tactic.id} className="relative">
                      <Link 
                        href={`/post/${tactic.id}`}
                        className="absolute top-0 left-0 right-0 h-16 z-10"
                      />
                      <PostCard 
                        id={tactic.id}
                        author={{
                          name: tactic.author.name || tactic.author.username,
                          username: tactic.author.username,
                          avatar: tactic.author.avatarUrl
                        }}
                        content={`**${tactic.title}**\n\n${tactic.description}`}
                        timestamp={tactic.createdAt ? new Date(tactic.createdAt).toLocaleDateString('vi-VN') : "Vừa xong"}
                        likes={tactic.stats.likes}
                        comments={tactic.stats.comments}
                        tacticData={tactic.tacticData}
                        formation={tactic.formation || "4-4-2"}
                        tags={tactic.tags || []}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ─── USERS TAB ─── */}
      {activeTab === 'users' && (
        <>
          {/* Prompt to search */}
          {!activeQuery && (
            <div className="text-center py-16 bg-panel/50 rounded-2xl border border-white/5">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary/60" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Tìm kiếm người dùng
              </h3>
              <p className="text-muted-foreground text-sm">
                Nhập tên hoặc username vào ô tìm kiếm bên trên
              </p>
            </div>
          )}

          {/* Users Loading */}
          {isLoading && activeQuery && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Users Results */}
          {!isLoading && activeQuery && (
            <>
              {users.length === 0 ? (
                <div className="text-center py-12 bg-panel rounded-xl border border-white/10">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    Không tìm thấy người dùng nào với &quot;{activeQuery}&quot;
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    {users.length} người dùng
                  </p>
                  {users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      className="group flex items-center gap-4 p-4 rounded-xl bg-panel border border-white/5 hover:border-primary/30 hover:bg-panel/80 transition-all duration-200"
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <Avatar
                          src={user.avatarUrl}
                          alt={user.name}
                          size="lg"
                          className="ring-2 ring-white/10 group-hover:ring-primary/30 transition-all"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {user.name}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">@{user.username}</p>
                        {user.bio && (
                          <p className="text-sm text-muted-foreground/80 line-clamp-1 mb-1">
                            {user.bio}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <UserPlus className="w-3 h-3" />
                            {user.followersCount >= 1000
                              ? `${(user.followersCount / 1000).toFixed(1)}K`
                              : user.followersCount} người theo dõi
                          </span>
                          <span className="flex items-center gap-1">
                            <Swords className="w-3 h-3" />
                            {user.tacticsCount} chiến thuật
                          </span>
                          {user.location && (
                            <span className="hidden sm:flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {user.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}