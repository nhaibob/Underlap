// src/components/features/profile/ProfileHeader.tsx
'use client';

import React, { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { 
  Settings, 
  Share2, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  CheckCircle2,
  UserPlus,
  MessageCircle,
  MoreHorizontal,
  Camera,
  Edit3
} from 'lucide-react';

export interface ProfileHeaderProps {
  username: string;
  name?: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate?: string;
  isVerified?: boolean;
  stats?: {
    followers: number;
    following: number;
    likes: number;
    tactics: number;
  };
  isOwnProfile?: boolean;
}

const StatItem = ({ value, label }: { value: number, label: string }) => (
  <div className="text-center group cursor-pointer">
    <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
      {value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
    </p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export const ProfileHeader = ({ 
  username, 
  name, 
  avatar, 
  banner,
  bio, 
  location,
  website,
  joinedDate,
  isVerified = false,
  stats,
  isOwnProfile = false 
}: ProfileHeaderProps) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const displayName = name || username;
  const displayBio = bio || "Chiến thuật gia đam mê bóng đá. Đang khám phá các hệ thống chiến thuật hiện đại.";
  const displayStats = stats || { followers: 0, following: 0, likes: 0, tactics: 0 };
  const displayDate = joinedDate || "Tháng 12, 2024";

  return (
    <div className="relative">
      {/* Banner with Gradient Overlay */}
      <div className="h-48 md:h-64 w-full rounded-2xl overflow-hidden relative group">
        {banner ? (
          <img 
            src={banner} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/40" />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
        
        {/* Edit Banner Button (Own Profile) */}
        {isOwnProfile && (
          <button className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
            <Camera className="w-5 h-5 text-foreground" />
          </button>
        )}
      </div>

      {/* Profile Info Container */}
      <div className="relative px-4 md:px-6 -mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          
          {/* Avatar Section */}
          <div className="relative group">
            <div className="relative">
              <Avatar
                alt={displayName}
                src={avatar}
                className="w-32 h-32 md:w-36 md:h-36 border-4 border-background bg-card shadow-2xl ring-4 ring-primary/20"
                size="lg"
              />
              {/* Online Indicator */}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-background" />
            </div>
            
            {/* Edit Avatar Button (Own Profile) */}
            {isOwnProfile && (
              <button className="absolute bottom-2 right-2 p-2 rounded-full bg-primary text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/90">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pb-2">
            {isOwnProfile ? (
              <>
                <Button 
                  variant="outline" 
                  className="gap-2 bg-card/50 border-white/10 hover:bg-white/5"
                >
                  <Edit3 className="w-4 h-4" />
                  Chỉnh sửa hồ sơ
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="bg-card/50 border border-white/10 hover:bg-white/5"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant={isFollowing ? "outline" : "default"}
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`gap-2 min-w-[120px] ${
                    isFollowing 
                      ? 'bg-card/50 border-white/10 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50' 
                      : 'shadow-lg shadow-primary/25'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Đang theo dõi
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Theo dõi
                    </>
                  )}
                </Button>
                <Button 
                  variant="secondary" 
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Nhắn tin
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="bg-card/50 border border-white/10 hover:bg-white/5"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="mt-4 space-y-3">
          {/* Name & Verification */}
          <div className="flex items-center gap-2">
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-foreground">
              {displayName}
            </h1>
            {isVerified && (
              <div className="p-1 rounded-full bg-primary/20">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>
          
          {/* Username */}
          <p className="text-muted-foreground font-medium">@{username}</p>
          
          {/* Bio */}
          <p className="text-foreground text-sm md:text-base leading-relaxed max-w-2xl">
            {displayBio}
          </p>
          
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
            )}
            {website && (
              <a 
                href={website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <LinkIcon className="w-4 h-4" />
                <span>{website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Tham gia {displayDate}</span>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
          <div className="flex gap-8 md:gap-12">
            <StatItem value={displayStats.tactics} label="Chiến thuật" />
            <StatItem value={displayStats.followers} label="Người theo dõi" />
            <StatItem value={displayStats.following} label="Đang theo dõi" />
            <StatItem value={displayStats.likes} label="Lượt thích" />
          </div>
          
          {/* Share Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="hidden md:flex bg-card/50 border border-white/10 hover:bg-white/5"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};