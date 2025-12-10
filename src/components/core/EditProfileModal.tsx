// src/components/core/EditProfileModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, User, FileText, MapPin, Link as LinkIcon, Camera, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { supabaseAuth } from '@/lib/supabase';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  currentData?: {
    name: string;
    bio: string;
    avatar_url: string;
    location: string;
    website: string;
  };
}

export const EditProfileModal = ({ isOpen, onClose, onSave, currentData }: EditProfileModalProps) => {
  const [name, setName] = useState(currentData?.name || '');
  const [bio, setBio] = useState(currentData?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentData?.avatar_url || '');
  const [location, setLocation] = useState(currentData?.location || '');
  const [website, setWebsite] = useState(currentData?.website || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentData) {
      setName(currentData.name || '');
      setBio(currentData.bio || '');
      setAvatarUrl(currentData.avatar_url || '');
      setLocation(currentData.location || '');
      setWebsite(currentData.website || '');
    }
  }, [currentData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Chỉ hỗ trợ ảnh JPEG, PNG, GIF, WebP');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh quá lớn. Tối đa 5MB.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatars');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setAvatarUrl(data.url);
      }
    } catch (err: any) {
      setError('Lỗi tải ảnh lên: ' + (err.message || 'Không xác định'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const user = await supabaseAuth.getUser();
      if (!user) {
        setError('Bạn cần đăng nhập để cập nhật hồ sơ');
        return;
      }

      const username = user.user_metadata?.username || user.email?.split('@')[0];

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          name,
          bio,
          avatar_url: avatarUrl,
          location,
          website
        })
      });

      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        onSave?.();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card flex items-center justify-between p-4 border-b border-white/10 z-10">
          <h3 className="font-semibold text-foreground text-lg">Chỉnh sửa hồ sơ</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4 pb-4 border-b border-white/5">
            <div className="relative group">
              <Avatar 
                src={avatarUrl} 
                alt="Avatar" 
                size="xl"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Tải ảnh lên
                  </>
                )}
              </Button>
            </div>

            {/* Or enter URL manually */}
            <div className="w-full">
              <label className="block text-xs text-muted-foreground mb-1 text-center">
                Hoặc nhập URL ảnh
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full bg-white/5 rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-white/10"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Tên hiển thị
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên của bạn"
              className="w-full bg-white/5 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-white/10"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Giới thiệu
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Viết vài dòng về bản thân..."
              rows={3}
              className="w-full bg-white/5 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-white/10 resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Địa điểm
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Hà Nội, Việt Nam"
              className="w-full bg-white/5 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-white/10"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              <LinkIcon className="w-4 h-4 inline mr-2" />
              Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full bg-white/5 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-white/10"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              variant="default"
              disabled={isSaving || isUploading}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
