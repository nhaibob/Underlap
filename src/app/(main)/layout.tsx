"use client";
import { Header } from '@/components/layout/Header';
import { SidebarLeft } from '@/components/layout/SidebarLeft';
import { SidebarRight } from '@/components/layout/SidebarRight';
import { MobileNav } from '@/components/layout/MobileNav';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

// [ĐÃ SỬA] Thêm scale nhẹ để tạo chiều sâu cho hiệu ứng
const variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  enter: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
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
            
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                variants={variants}
                initial="hidden"
                animate="enter"
                exit="exit"
                // [ĐÃ SỬA] Dùng spring để chuyển động tự nhiên hơn
                transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    mass: 0.5 
                }}
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