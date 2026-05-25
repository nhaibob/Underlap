// src/app/(main)/profile/[username]/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileHeader } from '@/components/features/profile/ProfileHeader';
import { FollowersModal } from '@/components/features/profile/FollowersModal';
import { EditProfileModal } from '@/components/core/EditProfileModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { TacticGridCard } from '@/components/features/profile/TacticGridCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProfileData } from '@/lib/hooks/useProfileData';
import { 
  Grid3X3, 
  Heart,
  Loader2,
  GitFork,
  FilePlus2,
  Edit,
  Trash2
} from 'lucide-react';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const router = useRouter();
  const rawUsername = decodeURIComponent(params.username);
  const [activeTab, setActiveTab] = useState('tactics');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalType, setFollowersModalType] = useState<'followers' | 'following'>('followers');

  const {
    isLoading,
    tactics,
    forkedTactics,
    draftTactics,
    profile,
    profileUserId,
    isOwnProfile,
    currentUser,
    actualUsername,
    isFollowing,
    isFollowLoading,
    followersCount,
    followingCount,
    handleMessage,
    handleDeleteTactic,
    handleFollowToggle,
    fetchProfileData
  } = useProfileData(rawUsername);

  const formatJoinDate = (dateStr: string) => {
    if (!dateStr) return 'Không rõ';
    const date = new Date(dateStr);
    return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <ProfileHeader 
        username={actualUsername}
        userId={profileUserId || undefined}
        name={profile?.name || actualUsername}
        avatar={profile?.avatar_url || '/assets/avatars/default.png'}
        bio={profile?.bio || 'Chưa có mô tả'}
        location={profile?.location}
        website={profile?.website}
        joinedDate={formatJoinDate(profile?.created_at || '')}
        isVerified={false}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        isFollowLoading={isFollowLoading}
        onEditProfile={() => setEditModalOpen(true)}
        onMessage={handleMessage}
        onFollowToggle={handleFollowToggle}
        onFollowersClick={() => {
          setFollowersModalType('followers');
          setFollowersModalOpen(true);
        }}
        onFollowingClick={() => {
          setFollowersModalType('following');
          setFollowersModalOpen(true);
        }}
        stats={{
          followers: followersCount,
          following: followingCount,
          likes: tactics.reduce((sum, t) => sum + t.stats.likes, 0),
          tactics: tactics.length
        }}
      />

      <div className="flex items-center justify-around py-4 px-6 bg-panel/50 border-y border-white/5 my-4">
        <div className="text-center">
          <div className="text-xl font-bold text-foreground">{tactics.length}</div>
          <div className="text-xs text-muted-foreground">Chiến thuật</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-foreground">
            {tactics.reduce((sum, t) => sum + (t.stats.views || 0), 0)}
          </div>
          <div className="text-xs text-muted-foreground">Lượt xem</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-foreground">
            {tactics.reduce((sum, t) => sum + t.stats.likes, 0)}
          </div>
          <div className="text-xs text-muted-foreground">Lượt thích</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className={`w-full grid ${isOwnProfile ? 'grid-cols-4' : 'grid-cols-2'} bg-panel/50 p-1 rounded-lg`}>
          <TabsTrigger value="tactics" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all">
            <Grid3X3 className="w-4 h-4" />
            <span className="hidden sm:inline">Chiến thuật</span>
            {tactics.length > 0 && <span className="text-xs opacity-70">({tactics.length})</span>}
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger value="forked" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all">
              <GitFork className="w-4 h-4" />
              <span className="hidden sm:inline">Đã fork</span>
              {forkedTactics.length > 0 && <span className="text-xs opacity-70">({forkedTactics.length})</span>}
            </TabsTrigger>
          )}
          {isOwnProfile && (
            <TabsTrigger value="drafts" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all">
              <FilePlus2 className="w-4 h-4" />
              <span className="hidden sm:inline">Bản nháp</span>
              {draftTactics.length > 0 && <span className="text-xs opacity-70">({draftTactics.length})</span>}
            </TabsTrigger>
          )}
          <TabsTrigger value="liked" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Đã thích</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tactics" className="mt-6">
          {tactics.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tactics.map((tactic) => (
                <div key={tactic.id} className="relative group">
                  <TacticGridCard 
                    id={tactic.id}
                    title={tactic.title} 
                    formation={tactic.formation} 
                    views={tactic.stats.views || 0}
                    likes={tactic.stats.likes}
                    onClick={() => router.push(`/post/${tactic.id}`)}
                  />
                  {isOwnProfile && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/tactic/edit/${tactic.id}`); }}
                        className="p-2 bg-black/60 rounded-lg hover:bg-black/80"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTactic(tactic.id, 'published'); }}
                        className="p-2 bg-red-600/80 rounded-lg hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Grid3X3}
              title="Chưa có chiến thuật"
              description={isOwnProfile ? "Bạn chưa tạo chiến thuật nào." : "Người dùng này chưa tạo chiến thuật nào."}
              actionLabel={isOwnProfile ? "Tạo chiến thuật" : undefined}
              onAction={isOwnProfile ? () => {} : undefined}
            />
          )}
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="forked" className="mt-6">
            {forkedTactics.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {forkedTactics.map((tactic) => (
                  <div key={tactic.id} className="relative group">
                    <TacticGridCard 
                      id={tactic.id}
                      title={tactic.title} 
                      formation={tactic.formation} 
                      views={tactic.stats.views || 0}
                      likes={tactic.stats.likes}
                      onClick={() => router.push(`/post/${tactic.id}`)}
                    />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/tactic/edit/${tactic.id}`); }}
                        className="p-2 bg-black/60 rounded-lg hover:bg-black/80"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTactic(tactic.id, 'forked'); }}
                        className="p-2 bg-red-600/80 rounded-lg hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={GitFork}
                title="Chưa có chiến thuật đã fork"
                description="Fork chiến thuật từ tin nhắn hoặc bài viết để lưu vào bộ sưu tập của bạn."
              />
            )}
          </TabsContent>
        )}

        {isOwnProfile && (
          <TabsContent value="drafts" className="mt-6">
            {draftTactics.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {draftTactics.map((tactic) => (
                  <div key={tactic.id} className="relative group">
                    <TacticGridCard 
                      id={tactic.id}
                      title={tactic.title} 
                      formation={tactic.formation} 
                      views={tactic.stats.views || 0}
                      likes={tactic.stats.likes}
                      onClick={() => router.push(`/tactic/edit/${tactic.id}`)}
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500/90 text-black text-xs font-medium rounded">
                      Bản nháp
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/tactic/edit/${tactic.id}`); }}
                        className="p-2 bg-black/60 rounded-lg hover:bg-black/80"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTactic(tactic.id, 'draft'); }}
                        className="p-2 bg-red-600/80 rounded-lg hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={FilePlus2}
                title="Chưa có bản nháp"
                description="Lưu chiến thuật chưa hoàn thiện vào đây để tiếp tục chỉnh sửa sau."
              />
            )}
          </TabsContent>
        )}

        <TabsContent value="liked" className="mt-6">
          <EmptyState 
            icon={Heart}
            title="Chưa thích chiến thuật nào"
            description="Các chiến thuật bạn thích sẽ xuất hiện ở đây."
          />
        </TabsContent>
      </Tabs>

      <EditProfileModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={() => fetchProfileData()}
        currentData={profile ? {
          name: profile.name || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || '',
          location: profile.location || '',
          website: profile.website || ''
        } : undefined}
      />

      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        username={actualUsername}
        type={followersModalType}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}