// src/app/(main)/profile/[username]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileHeader } from '@/components/features/profile/ProfileHeader';
import { PostCard } from '@/components/core/PostCard';
import { EditProfileModal } from '@/components/core/EditProfileModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { supabaseAuth } from '@/lib/supabase';
import { 
  Grid3X3, 
  FileText, 
  Bookmark, 
  Heart,
  Plus,
  TrendingUp,
  Eye,
  Loader2,
  GitFork,
  FilePlus2,
  Edit,
  Trash2
} from 'lucide-react';

interface TacticPost {
  id: string;
  title: string;
  description: string;
  formation: string;
  createdAt: string;
  tags: string[];
  author: {
    username: string;
    name: string;
    avatarUrl: string;
  };
  stats: {
    likes: number;
    comments: number;
    views: number;
  };
  tacticData: {
    players: any[];
    arrows: any[];
  };
}

interface UserProfile {
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
  location: string;
  website: string;
  created_at: string;
}

// Tactic Card for Grid View
const TacticGridCard = ({ 
  id,
  title, 
  formation, 
  views, 
  likes,
  onClick
}: { 
  id: string;
  title: string; 
  formation: string; 
  views: number; 
  likes: number;
  onClick?: () => void;
}) => {
  return (
    <div 
      onClick={onClick}
      className="group relative aspect-[4/3] rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 border border-white/10 overflow-hidden cursor-pointer hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Field pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-4 border border-white/50 rounded" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-white/50 rounded-full" />
      </div>
      
      {/* Overlay info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <h3 className="font-medium text-white text-sm line-clamp-1">{title}</h3>
        <div className="flex items-center gap-3 text-xs text-white/70 mt-1">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {views}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {likes}
          </span>
        </div>
      </div>
      
      {/* Formation badge */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-[10px] font-bold text-white">
        {formation}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default function ProfilePage({ params }: { params: { username: string } }) {
  const router = useRouter();
  const rawUsername = decodeURIComponent(params.username);
  const [activeTab, setActiveTab] = useState('tactics');
  const [isLoading, setIsLoading] = useState(true);
  const [tactics, setTactics] = useState<TacticPost[]>([]);
  const [forkedTactics, setForkedTactics] = useState<TacticPost[]>([]);
  const [draftTactics, setDraftTactics] = useState<TacticPost[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actualUsername, setActualUsername] = useState(rawUsername);

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Get current logged-in user
        const user = await supabaseAuth.getUser();
        setCurrentUser(user);
        
        // Determine actual username to fetch
        let usernameToFetch = rawUsername;
        
        // Special case: if URL is "me", use current user's username
        if (rawUsername.toLowerCase() === 'me' && user) {
          usernameToFetch = user.user_metadata?.username || user.email?.split('@')[0] || 'me';
          setActualUsername(usernameToFetch);
          setIsOwnProfile(true); // "me" route is always own profile
        } else {
          setActualUsername(rawUsername);
          
          // Get all possible usernames for the current user
          const currentUsernames = [
            user?.user_metadata?.username,
            user?.email?.split('@')[0],
            user?.email
          ].filter(Boolean).map(u => u?.toLowerCase());
          
          // Check if viewing own profile
          setIsOwnProfile(currentUsernames.includes(rawUsername.toLowerCase()));
        }

        // Fetch profile data (might not exist yet)
        const profileRes = await fetch(`/api/user/profile?username=${usernameToFetch}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (!profileData.error) {
            setProfile(profileData);
            // Set profile user ID for messaging
            if (profileData.id) {
              setProfileUserId(profileData.id);
            }
          } else if (rawUsername.toLowerCase() === 'me' && user) {
            // Create mock profile from user session for "me" route
            setProfile({
              username: usernameToFetch,
              name: user.user_metadata?.name || usernameToFetch,
              bio: '',
              avatar_url: user.user_metadata?.avatar_url || '',
              location: '',
              website: '',
              created_at: user.created_at || new Date().toISOString()
            });
          }
        } else if (rawUsername.toLowerCase() === 'me' && user) {
          // Profile doesn't exist, create mock from session
          setProfile({
            username: usernameToFetch,
            name: user.user_metadata?.name || usernameToFetch,
            bio: '',
            avatar_url: user.user_metadata?.avatar_url || '',
            location: '',
            website: '',
            created_at: user.created_at || new Date().toISOString()
          });
        }

        // Fetch user's tactics (all tactics, then filter by status client-side)
        const tacticsRes = await fetch(`/api/user/${usernameToFetch}/tactics`);
        if (tacticsRes.ok) {
          const tacticsData = await tacticsRes.json();
          
          // Filter tactics by status
          const published = tacticsData.filter((t: any) => !t.status || t.status === 'published');
          const forked = tacticsData.filter((t: any) => t.status === 'forked');
          const drafts = tacticsData.filter((t: any) => t.status === 'draft');
          
          setTactics(published);
          setForkedTactics(forked);
          setDraftTactics(drafts);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [rawUsername]);

  // Handle sending a message to this user
  const handleMessage = async () => {
    // Check if user is logged in
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Check if we have the profile user's ID
    if (!profileUserId) {
      alert('Không thể tạo cuộc trò chuyện. Vui lòng thử lại.');
      console.error('Profile user ID not found');
      return;
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ participantId: profileUserId })
      });

      if (res.ok) {
        const { conversationId } = await res.json();
        router.push(`/messages/${conversationId}`);
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.error || 'Không thể tạo cuộc trò chuyện'}`);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Đã xảy ra lỗi khi tạo cuộc trò chuyện');
    }
  };

  // Delete a tactic
  const handleDeleteTactic = async (tacticId: string, type: 'published' | 'forked' | 'draft') => {
    if (!currentUser?.id) {
      alert('Vui lòng đăng nhập để xóa');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa chiến thuật này?')) {
      return;
    }

    try {
      const res = await fetch(`/api/tactic/${tacticId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id
        }
      });

      if (res.ok) {
        // Remove from appropriate list
        if (type === 'published') {
          setTactics(prev => prev.filter(t => t.id !== tacticId));
        } else if (type === 'forked') {
          setForkedTactics(prev => prev.filter(t => t.id !== tacticId));
        } else if (type === 'draft') {
          setDraftTactics(prev => prev.filter(t => t.id !== tacticId));
        }
        alert('✅ Đã xóa chiến thuật!');
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.error || 'Không thể xóa'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Có lỗi xảy ra khi xóa');
    }
  };

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
      
      {/* Profile Header */}
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
        onEditProfile={() => setEditModalOpen(true)}
        onMessage={handleMessage}
        stats={{
          followers: 0,
          following: 0,
          likes: tactics.reduce((sum, t) => sum + t.stats.likes, 0),
          tactics: tactics.length
        }}
      />

      {/* Stats Bar */}
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

      {/* Tabs */}
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

        {/* Tactics Grid */}
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
                  {/* Edit button overlay - only for own profile */}
                  {isOwnProfile && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/tactic/edit/${tactic.id}`);
                        }}
                        className="p-2 bg-black/60 rounded-lg hover:bg-black/80"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTactic(tactic.id, 'published');
                        }}
                        className="p-2 bg-red-600/80 rounded-lg hover:bg-red-600"
                        title="Xóa"
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
              description={isOwnProfile ? "Bạn chưa tạo chiến thuật nào. Hãy bắt đầu tạo chiến thuật đầu tiên!" : "Người dùng này chưa tạo chiến thuật nào."}
              actionLabel={isOwnProfile ? "Tạo chiến thuật" : undefined}
              onAction={isOwnProfile ? () => {} : undefined}
            />
          )}
        </TabsContent>

        {/* Forked Tactics - Only for own profile */}
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
                    {/* Edit and Delete button overlay */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/tactic/edit/${tactic.id}`);
                        }}
                        className="p-2 bg-black/60 rounded-lg hover:bg-black/80"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTactic(tactic.id, 'forked');
                        }}
                        className="p-2 bg-red-600/80 rounded-lg hover:bg-red-600"
                        title="Xóa"
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

        {/* Drafts - Only for own profile */}
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
                    {/* Draft badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500/90 text-black text-xs font-medium rounded">
                      Bản nháp
                    </div>
                    {/* Edit and Delete buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/tactic/edit/${tactic.id}`);
                        }}
                        className="p-2 bg-black/60 rounded-lg hover:bg-black/80"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTactic(tactic.id, 'draft');
                        }}
                        className="p-2 bg-red-600/80 rounded-lg hover:bg-red-600"
                        title="Xóa"
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

        {/* Liked */}
        <TabsContent value="liked" className="mt-6">
          <EmptyState 
            icon={Heart}
            title="Chưa thích chiến thuật nào"
            description="Các chiến thuật bạn thích sẽ xuất hiện ở đây."
          />
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={() => {
          // Refresh profile data
          fetch(`/api/user/profile?username=${actualUsername}`)
            .then(res => res.json())
            .then(data => {
              if (!data.error) setProfile(data);
            });
        }}
        currentData={profile ? {
          name: profile.name || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || '',
          location: profile.location || '',
          website: profile.website || ''
        } : undefined}
      />
    </div>
  );
}