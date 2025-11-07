// src/components/layout/LandingHeader.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const LandingHeader = () => {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-panel bg-background/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="font-headline text-xl font-semibold text-text-primary">
          Underlap
        </Link>

        {/* Các nút hành động */}
        <div className="flex items-center gap-4">
          {/* Nút Đăng nhập/Đăng ký */}
          <Link href="/login">
            <Button variant="ghost" className="text-text-secondary hover:text-text-primary">
              Đăng nhập
            </Button>
          </Link>
          
          {/* Nút chính */}
          <Link href="/feed">
            <Button variant="primary">
              Bắt đầu
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};