// src/components/layout/Header.tsx
"use client"; 
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase, supabaseAuth } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { useUIStore } from '@/lib/store/uiStore';
import { PenSquare, Search, Bell, Home, Compass, MessageCircle, LogOut, User, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/explore', icon: Compass, label: 'Khám phá' },
    { href: '/dm', icon: MessageCircle, label: 'Tin nhắn' },
];

const NavLink = ({ href, icon: Icon }: typeof NAV_ITEMS[0]) => {
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
  const router = useRouter();
  const { openCreateModal, openSettingsModal } = useUIStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      const currentUser = await supabaseAuth.getUser();
      setUser(currentUser);
    };
    getUser();

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleLogout = async () => {
    try {
      await supabaseAuth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url || '';

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-panel/80 backdrop-blur-md border-b border-panel">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        
        {/* 1. LOGO & NAV */}
        <div className="flex items-center gap-6">
          <Link href="/feed" className="flex items-center gap-2 flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="Underlap" 
              className="h-8 w-auto"
            />
          </Link>
          <nav className="hidden lg:flex items-center gap-4">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
        </div>

        {/* 2. THANH TÌM KIẾM */}
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
          
          <Button variant="ghost" size="icon" className="flex md:hidden">
             <Search className="w-5 h-5" />
          </Button>
          
          {/* Combined Avatar + Menu Button */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors focus:outline-none"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatarUrl} alt={displayName} /> 
                <AvatarFallback className="text-sm">{displayName[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowDropdown(false)}
                />
                
                <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-white/10 py-2 z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium text-foreground truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {displayEmail}
                    </p>
                  </div>
                  
                  <div className="py-1">
                    <Link 
                      href="/profile/me"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-white/5 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      Trang cá nhân
                    </Link>
                    
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        openSettingsModal();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-white/5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      Cài đặt
                    </button>
                  </div>
                  
                  <div className="border-t border-white/10 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};