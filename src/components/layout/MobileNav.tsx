// src/components/layout/MobileNav.tsx
"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PenSquare, Home, Compass, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store/uiStore';
import { Button } from '@/components/ui/Button';

// Khai báo các mục điều hướng (tái sử dụng)
const NAV_ITEMS = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/explore', icon: Compass, label: 'Khám phá' },
    { href: '/dm', icon: MessageCircle, label: 'Tin nhắn' },
    { href: '/profile/me', icon: User, label: 'Hồ sơ' },
];

export const MobileNav = () => {
    const pathname = usePathname();
    const { openCreateModal } = useUIStore();
    
    // Chỉ hiển thị trên mobile/tablet (ẩn trên desktop)
    // và không hiển thị trên Landing Page
    if (pathname === '/' || pathname.startsWith('/post')) {
        return null;
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-panel border-t border-white/10 p-2 flex justify-around items-center md:hidden">
            
            {NAV_ITEMS.map(item => (
                <Link 
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "flex flex-col items-center p-1 transition-colors text-xs",
                        pathname.startsWith(item.href) ? "text-primary font-semibold" : "text-text-secondary hover:text-text-primary"
                    )}
                >
                    <item.icon className="w-6 h-6 mb-0.5" />
                    <span>{item.label}</span>
                </Link>
            ))}

            {/* Nút FAB (Hành động nhanh) */}
            <Button
                size="icon"
                className="w-12 h-12 rounded-full bg-primary fixed right-4 bottom-16 shadow-lg md:hidden"
                onClick={openCreateModal}
                title="Tạo chiến thuật"
            >
                <PenSquare className="w-6 h-6" />
            </Button>
        </div>
    );
};