import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuth } from '@/lib/supabase';

export interface UserProfile {
  id?: string;
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
  location: string;
  website: string;
  created_at: string;
  followers_count?: number;
  following_count?: number;
}

export interface TacticPost {
  id: string;
  title: string;
  description: string;
  formation: string;
  createdAt: string;
  tags: string[];
  status?: string;
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

export const useProfileData = (rawUsername: string) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tactics, setTactics] = useState<TacticPost[]>([]);
  const [forkedTactics, setForkedTactics] = useState<TacticPost[]>([]);
  const [draftTactics, setDraftTactics] = useState<TacticPost[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actualUsername, setActualUsername] = useState(rawUsername);
  
  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const user = await supabaseAuth.getUser();
      setCurrentUser(user);
      
      let usernameToFetch = rawUsername;
      
      if (rawUsername.toLowerCase() === 'me' && user) {
        usernameToFetch = user.user_metadata?.username || user.email?.split('@')[0] || 'me';
        setActualUsername(usernameToFetch);
        setIsOwnProfile(true);
      } else {
        setActualUsername(rawUsername);
        const currentUsernames = [
          user?.user_metadata?.username,
          user?.email?.split('@')[0],
          user?.email
        ].filter(Boolean).map(u => u?.toLowerCase());
        
        setIsOwnProfile(currentUsernames.includes(rawUsername.toLowerCase()));
      }

      const profileRes = await fetch(`/api/user/profile?username=${usernameToFetch}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (!profileData.error) {
          setProfile(profileData);
          if (profileData.id) setProfileUserId(profileData.id);
          setFollowersCount(profileData.followers_count || 0);
          setFollowingCount(profileData.following_count || 0);
        } else if (rawUsername.toLowerCase() === 'me' && user) {
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

      const tacticsRes = await fetch(`/api/user/${usernameToFetch}/tactics`);
      if (tacticsRes.ok) {
        const tacticsData = await tacticsRes.json();
        const published = tacticsData.filter((t: any) => !t.status || t.status === 'published');
        const forked = tacticsData.filter((t: any) => t.status === 'forked');
        const drafts = tacticsData.filter((t: any) => t.status === 'draft');
        setTactics(published);
        setForkedTactics(forked);
        setDraftTactics(drafts);
      }

      if (user && profileUserId && user.id !== profileUserId) {
        const followRes = await fetch(`/api/follow?targetId=${profileUserId}`, {
          headers: { 'x-user-id': user.id }
        });
        if (followRes.ok) {
          const { isFollowing: followStatus } = await followRes.json();
          setIsFollowing(followStatus);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [rawUsername, profileUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMessage = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (!profileUserId) {
      alert('Không thể tạo cuộc trò chuyện. Vui lòng thử lại.');
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

  const handleDeleteTactic = async (tacticId: string, type: 'published' | 'forked' | 'draft') => {
    if (!currentUser?.id) {
      alert('Vui lòng đăng nhập để xóa');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa chiến thuật này?')) return;

    try {
      const res = await fetch(`/api/tactic/${tacticId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id }
      });

      if (res.ok) {
        if (type === 'published') setTactics(prev => prev.filter(t => t.id !== tacticId));
        else if (type === 'forked') setForkedTactics(prev => prev.filter(t => t.id !== tacticId));
        else if (type === 'draft') setDraftTactics(prev => prev.filter(t => t.id !== tacticId));
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

  const handleFollowToggle = async () => {
    if (!currentUser?.id || !profileUserId) {
      router.push('/login');
      return;
    }

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        const res = await fetch(`/api/follow?targetId=${profileUserId}`, {
          method: 'DELETE',
          headers: { 'x-user-id': currentUser.id }
        });
        if (res.ok) {
          setIsFollowing(false);
          setFollowersCount(prev => Math.max(0, prev - 1));
        }
      } else {
        const res = await fetch('/api/follow', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id 
          },
          body: JSON.stringify({ targetId: profileUserId })
        });
        if (res.ok) {
          setIsFollowing(true);
          setFollowersCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return {
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
  };
};
