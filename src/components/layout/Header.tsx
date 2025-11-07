// src/components/layout/Header.tsx
"use client"; 
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import hook để kiểm tra trang hiện tại
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useUIStore } from '@/lib/store/uiStore';
import { PenSquare, Search, Bell, Home, Compass, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Khai báo các mục điều hướng
const NAV_ITEMS = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/explore', icon: Compass, label: 'Khám phá' },
    { href: '/community', icon: MessageCircle, label: 'Cộng đồng' },
];

// Hàm NavLink (Component con)
const NavLink = ({ href, icon: Icon, label }: typeof NAV_ITEMS[0]) => {
    const pathname = usePathname();
    const isActive = pathname === href || (pathname.startsWith('/profile') && href === '/profile/me'); // Giả sử /profile/me là trang cá nhân

    return (
        <Link 
            href={href}
            className={cn(
                "flex items-center p-2 rounded-full transition-colors",
                isActive ? "bg-panel text-white" : "text-text-secondary hover:bg-panel"
            )}
            title={label}
        >
            <Icon className="w-5 h-5" />
        </Link>
    );
};


export const Header = () => {
  const { openCreateModal, openSettingsModal } = useUIStore();
  const pathname = usePathname();
  
  // Ẩn Header đơn giản trên Landing Page
  if (pathname === '/') {
      return null; // Hoặc render Header đơn giản cũ của Landing Page
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-panel bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-6">
        
        {/* Logo (Trở về Feed) */}
        <Link href="/feed" className="font-headline text-xl font-semibold text-text-primary flex-shrink-0">
          Underlap
        </Link>

        {/* 1. THANH ĐIỀU HƯỚNG GIỮA */}
        <nav className="flex gap-2 mx-4 hidden md:flex">
            {NAV_ITEMS.map(item => (
                <NavLink key={item.href} {...item} />
            ))}
        </nav>

        {/* 2. THANH TÌM KIẾM */}
        <div className="flex-1 max-w-md hidden lg:block">
          <div className="flex items-center w-full px-4 py-2 rounded-lg bg-panel border border-white/10">
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
          <Button variant="primary" className="gap-2 hidden md:flex" onClick={openCreateModal}>
            <PenSquare className="w-4 h-4" />
            Tạo chiến thuật
          </Button>
          
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="w-5 h-5" />
          </Button>
          
          {/* Nút Profile */}
          <Link href="/profile/me">
            <Avatar alt="H" src="" /> 
          </Link>

          {/* Nút Settings */}
          <button onClick={openSettingsModal}>
             <div className="w-8 h-8 rounded-full bg-panel text-text-secondary flex items-center justify-center hover:bg-white/10 transition-colors">
                <User className="w-4 h-4" />
             </div>
          </button>
        </div>
      </div>
    </header>
  );
};