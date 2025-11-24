// src/app/(main)/layout.tsx
"use client";
import { Header } from '@/components/layout/Header';
import { SidebarLeft } from '@/components/layout/SidebarLeft';
import { SidebarRight } from '@/components/layout/SidebarRight';
import { MobileNav } from '@/components/layout/MobileNav';
// 1. IMPORT THÊM AnimatePresence
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const variants = {
  hidden: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      <Header /> 
      
      <div className="flex flex-1 container mx-auto">
        <SidebarLeft />
        
        <main className="flex-1 min-w-0">
          <div className="pb-[4.5rem] md:pb-0"> 
            
            {/* 2. BỌC MỌI THỨ BẰNG AnimatePresence */}
            {/* mode="wait" là quan trọng: nó chờ animation cũ xong mới chạy animation mới */}
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname} // Key vẫn là yếu tố quan trọng nhất
                variants={variants}
                initial="hidden"
                animate="enter"
                // 3. THÊM TRẠNG THÁI "exit"
                exit="exit" // Bảo cho component biết phải làm gì khi bị gỡ bỏ
                transition={{ type: 'tween', duration: 0.2 }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
            
          </div>
        </main>

        <SidebarRight />
      </div>
      
      <MobileNav />
    </div>
  );
}