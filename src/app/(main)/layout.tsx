// src/app/(main)/layout.tsx
"use client"; // BẮT BUỘC dùng Client Component
import { Header } from '@/components/layout/Header';
import { SidebarLeft } from '@/components/layout/SidebarLeft';
import { SidebarRight } from '@/components/layout/SidebarRight';
import { MobileNav } from '@/components/layout/MobileNav';
import { motion } from 'framer-motion'; // 1. IMPORT FRAMER MOTION
import { usePathname } from 'next/navigation'; // 2. IMPORT usePathname

// Khai báo animation variant (Hiệu ứng Fade-in/Slide-up nhẹ)
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
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Header /> 
      
      <div className="flex flex-1 container mx-auto">
        <SidebarLeft />
        
        <main className="flex-1 min-w-0">
          <div className="pb-[4.5rem] md:pb-0"> 
            
            {/* 3. BỌC NỘI DUNG CHÍNH BẰNG motion.div */}
            <motion.div
              key={pathname} // KEY RẤT QUAN TRỌNG: Buộc React nhận diện trang là mới
              variants={variants}
              initial="hidden" // Trạng thái khởi tạo (từ 0)
              animate="enter"  // Trạng thái khi đã tải xong (đến 1)
              transition={{ type: 'tween', duration: 0.2 }} // Kiểu chuyển động
              className="w-full"
            >
              {children}
            </motion.div>
            
          </div>
        </main>

        <SidebarRight />
      </div>
      
      <MobileNav />
    </div>
  );
}