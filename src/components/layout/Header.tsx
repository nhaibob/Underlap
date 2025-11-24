// src/components/layout/Header.tsx
"use client"; 
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { useUIStore } from '@/lib/store/uiStore';
import { PenSquare, Search, Bell, Home, Compass, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/explore', icon: Compass, label: 'Khám phá' },
    { href: '/community', icon: MessageCircle, label: 'Cộng đồng' },
];

const NavLink = ({ href, icon: Icon, label }: typeof NAV_ITEMS[0]) => {
    const pathname = usePathname();
    const isActive = pathname === href || (pathname.startsWith('/profile') && href === '/profile/me');

    return (
        <Link 
            href={href}
            className={cn(
                "flex items-center p-2 rounded-full transition-colors",
                isActive 
                    ? "bg-panel text-text-primary" 
                    : "text-text-secondary hover:bg-panel hover:text-text-primary"
            )}
        >
            <Icon className="w-5 h-5" />
        </Link>
    );
};

export const Header = () => {
  const { openCreateModal, openSettingsModal } = useUIStore();
  
  return (
    // SỬA Ở ĐÂY: Đã đổi 'bg-background/80' thành 'bg-panel'
    <header className="sticky top-0 z-50 w-full h-16 bg-panel backdrop-blur-md border-b border-panel">
      <div className="container mx-auto flex items-center justify-between h-full px-4 md:px-6">
        
        {/* 1. LOGO & NAV */}
        <div className="flex items-center gap-6">
          <Link href="/feed" className="font-headline text-xl font-semibold text-text-primary flex-shrink-0">
            Underlap
          </Link>
          <nav className="hidden lg:flex items-center gap-4">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
        </div>

        {/* 2. THANH TÌM KIẾM (Ẩn trên mobile) */}
        <div className="flex-1 max-w-sm mx-6 hidden md:block">
          <div className="relative flex items-center bg-background rounded-full px-4 py-2 border border-transparent focus-within:border-primary transition-colors">
            <Search className="w-5 h-5 text-text-secondary mr-3" />
            <input
              type="text"
              placeholder="Tìm đội / sơ đồ..."
              className="w-full bg-transparent text-text-primary placeholder:text-text-secondary focus:outline-none"
            />
          </div>
        </div>

        {/* 3. CÁC NÚT HÀNH ĐỘNG */}
        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
          
          <Button variant="default" className="gap-2 hidden md:flex" onClick={openCreateModal}>
            <PenSquare className="w-4 h-4" />
            Tạo chiến thuật
          </Button>
          
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="w-5 h-5" />
          </Button>
          
          <Link href="/profile/me">
            <Avatar>
              <AvatarImage src="" alt="H" /> 
              <AvatarFallback>H</AvatarFallback>
            </Avatar>
          </Link>

          <button onClick={openSettingsModal}>
             <div className="w-8 h-8 rounded-full bg-panel text-text-secondary flex items-center justify-center hover:bg-background transition-colors">
                {/* (Nếu bạn có icon Settings, hãy thêm vào đây) */}
             </div>
          </button>
        </div>
      </div>
    </header>
  );
};