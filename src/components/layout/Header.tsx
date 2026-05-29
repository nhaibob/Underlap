// src/components/layout/Header.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { NotificationDropdown } from "@/components/features/notifications";
import { useUIStore } from "@/lib/store/uiStore";
import { motion } from "framer-motion";
import {
  PenSquare,
  Search,
  Home,
  Compass,
  MessageCircle,
  LogOut,
  User,
  Settings,
  Menu,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/explore", icon: Compass, label: "Khám phá" },
  { href: "/messages", icon: MessageCircle, label: "Tin nhắn" },
];

const NavLink = ({ href, icon: Icon }: (typeof NAV_ITEMS)[0]) => {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    (pathname.startsWith("/profile") && href === "/profile/me");

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center p-2.5 rounded-full transition-colors z-10",
        isActive
          ? "text-black"
          : "text-text-secondary hover:text-white hover:bg-white/5",
      )}
    >
      {isActive && (
        <motion.div layoutId="headerNavPill" className="absolute inset-0 bg-white rounded-full z-[-1] shadow-sm" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
      )}
      <Icon className="w-5 h-5" />
    </Link>
  );
};

export const Header = () => {
  const router = useRouter();
  const { openCreateModal, openSettingsModal } = useUIStore();
  const [showDropdown, setShowDropdown] = useState(false);

  // ── Dùng NextAuth session thay vì supabase.getUser() ──────────────────────
  const { data: session, status } = useSession();
  const user = session?.user;

  const handleLogout = async () => {
    setShowDropdown(false);
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  const displayName =
    user?.name || (user as any)?.username || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";
  const avatarUrl = user?.image || "";

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-background/60 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* 1. LOGO & NAV */}
        <div className="flex items-center gap-6">
          <Link href="/feed" className="flex items-center gap-2 flex-shrink-0 font-bold tracking-tight text-xl uppercase text-foreground">
            {/* Minimalist text logo instead of image if preferred, but we keep img just in case */}
            UNDERLAP
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
        </div>

        {/* 2. THANH TÌM KIẾM */}
        <div className="flex-1 max-w-sm mx-6 hidden md:block">
          <div className="relative flex items-center bg-transparent rounded-none border-b border-white/10 px-0 py-2 focus-within:border-white/50 transition-colors">
            <Search className="w-4 h-4 text-muted-foreground mr-3" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* 3. CÁC NÚT HÀNH ĐỘNG */}
        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
          <Button
            variant="default"
            className="gap-2 hidden md:flex"
            onClick={openCreateModal}
          >
            <PenSquare className="w-4 h-4" />
            Tạo chiến thuật
          </Button>

          <NotificationDropdown className="hidden sm:flex" />

          <Button variant="ghost" size="icon" className="flex md:hidden">
            <Search className="w-5 h-5" />
          </Button>

          {/* Avatar + Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors focus:outline-none"
            >
              {status === "loading" ? (
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              ) : (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="text-sm">
                    {displayName[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
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