'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const columns = 5;
  const pathname = usePathname();

  return (
    <div key={pathname} className="relative w-full h-full flex flex-col flex-1 bg-background">
      {/* Nội dung trang mới nằm phía dưới */}
      <div className="w-full h-full flex flex-col flex-1">
        {children}
      </div>

      {/* Lớp che (overlay) gồm nhiều mảnh dọc lật 3D */}
      <div 
        className="pointer-events-none absolute inset-0 flex z-50 overflow-hidden" 
        style={{ perspective: 1200 }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-neutral-950 border-r border-neutral-800/50 last:border-none shadow-2xl"
            initial={{ rotateY: 0, opacity: 1 }}
            animate={{ rotateY: 90, opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
              delay: i * 0.08, // Lật lần lượt từng mảnh từ trái sang phải
            }}
            style={{ transformOrigin: 'left center' }} // Lật giống cánh cửa bản lề trái
          />
        ))}
      </div>
    </div>
  );
};

