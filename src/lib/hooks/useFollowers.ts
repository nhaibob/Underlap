import { useState, useEffect } from 'react';

export interface FollowUser {
  id: string;
  username: string;
  name: string;
  avatar_url: string;
  isFollowing: boolean;
}

interface UseFollowersProps {
  isOpen: boolean;
  username: string;
  type: 'followers' | 'following';
  currentUserId?: string;
}

export const useFollowers = ({ isOpen, username, type, currentUserId }: UseFollowersProps) => {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const endpoint = type === 'followers' 
          ? `/api/user/${username}/followers`
          : `/api/user/${username}/following`;
        
        const res = await fetch(endpoint, {
          headers: currentUserId ? { 'x-user-id': currentUserId } : {}
        });
        
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
          
          // Track which users the current user is following
          const followingSet = new Set<string>(
            data.filter((u: FollowUser) => u.isFollowing).map((u: FollowUser) => u.id)
          );
          setFollowingIds(followingSet);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, username, type, currentUserId]);

  const handleFollowToggle = async (targetId: string) => {
    if (!currentUserId) return;

    const isCurrentlyFollowing = followingIds.has(targetId);

    try {
      if (isCurrentlyFollowing) {
        // Unfollow
        await fetch(`/api/follow?targetId=${targetId}`, {
          method: 'DELETE',
          headers: { 'x-user-id': currentUserId }
        });
        setFollowingIds(prev => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
      } else {
        // Follow
        await fetch('/api/follow', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': currentUserId 
          },
          body: JSON.stringify({ targetId })
        });
        setFollowingIds(prev => new Set(prev).add(targetId));
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
    }
  };

  return {
    users,
    isLoading,
    followingIds,
    handleFollowToggle
  };
};
