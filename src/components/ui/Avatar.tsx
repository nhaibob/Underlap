// src/components/ui/Avatar.tsx
import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src: string; // Đường dẫn ảnh
  alt: string;
  className?: string;
}

// Giả sử chúng ta có 1 ảnh avatar mẫu
import DefaultAvatar from 'public/assets/images/avatar-placeholder.png'; // (Tạm thời trỏ đến ảnh bạn chưa có)

export const Avatar = ({ src, alt, className }: AvatarProps) => {
  return (
    <div
      className={cn(
        'relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0',
        className
      )}
    >
      {/* Chúng ta sẽ dùng div placeholder màu 'bg-primary'
        cho đến khi bạn có ảnh avatar mẫu.
      */}
      <div className="w-full h-full bg-primary flex items-center justify-center font-bold text-white">
        {/* Lấy chữ cái đầu của alt */}
        {alt.charAt(0).toUpperCase()}
      </div>
      
      {/* // Khi nào có ảnh, hãy dùng code Image này:
        <Image
          src={src || DefaultAvatar}
          alt={alt}
          fill
          className="object-cover"
        /> 
      */}
    </div>
  );
};