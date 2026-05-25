// src/components/features/profile/FollowersModal.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { X, Loader2, UserPlus, CheckCircle2, Users } from 'lucide-react';
import { useFollowers } from '@/lib/hooks/useFollowers';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  type: 'followers' | 'following';
  currentUserId?: string;
}

export const FollowersModal = ({ 
  isOpen, 
  onClose, 
  username, 
  type,
  currentUserId 
}: FollowersModalProps) => {
  const { users, isLoading, followingIds, handleFollowToggle } = useFollowers({
    isOpen,
    username,
    type,
    currentUserId
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[80vh] bg-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-headline text-lg font-bold text-foreground">
            {type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {type === 'followers' 
                  ? 'Chưa có người theo dõi' 
                  : 'Chưa theo dõi ai'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {users.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <Link href={`/profile/${user.username}`} onClick={onClose}>
                    <Avatar 
                      src={user.avatar_url} 
                      alt={user.name || user.username}
                      size="md"
                    />
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/profile/${user.username}`} 
                      onClick={onClose}
                      className="hover:underline"
                    >
                      <p className="font-semibold text-foreground truncate">
                        {user.name || user.username}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </Link>
                  </div>

                  {/* Follow/Unfollow button (don't show for own profile) */}
                  {currentUserId && currentUserId !== user.id && (
                    <Button
                      variant={followingIds.has(user.id) ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleFollowToggle(user.id)}
                      className={`min-w-[90px] ${
                        followingIds.has(user.id) 
                          ? 'hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50' 
                          : ''
                      }`}
                    >
                      {followingIds.has(user.id) ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Đã theo dõi
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5 mr-1" />
                          Theo dõi
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
