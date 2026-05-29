'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TacticStack3DProps {
  tactics: any[]; 
  isOwnProfile?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const TacticStack3D: React.FC<TacticStack3DProps> = ({ tactics, isOwnProfile, onEdit, onDelete }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setActiveIndex((prev) => Math.min(prev + 1, tactics.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tactics.length]);

  useEffect(() => {
    if (activeIndex >= tactics.length && tactics.length > 0) {
      setActiveIndex(tactics.length - 1);
    }
  }, [tactics.length, activeIndex]);

  if (!tactics || tactics.length === 0) return <div className="text-muted-foreground p-8">Không có chiến thuật nào.</div>;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[600px] flex items-center justify-center overflow-hidden rounded-2xl bg-transparent group z-0 isolate"
      style={{ perspective: '1200px' }}
      onWheel={(e) => {
        e.preventDefault();
        if (e.deltaX > 20 || e.deltaY > 20) {
          setActiveIndex((prev) => Math.min(prev + 1, tactics.length - 1));
        } else if (e.deltaX < -20 || e.deltaY < -20) {
          setActiveIndex((prev) => Math.max(prev - 1, 0));
        }
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none z-0" />
      
      {/* Bao bọc stack */}
      <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
        <AnimatePresence mode="popLayout">
          {tactics.map((tactic, index) => {
            const distance = index - activeIndex;
            const absDistance = Math.abs(distance);
            
            // Limit render count for performance
            if (absDistance > 6) return null;

            // Xếp hàng ngang chuẩn Apple Cover Flow
            let xOffset = 0;
            let zOffset = 0;
            let rotateY = 0;
            let scale = 1;
            let opacity = 1;

            if (distance === 0) {
              // Thẻ active nằm trung tâm
              xOffset = 0;
              zOffset = 50;
              rotateY = 0;
              scale = 1.1;
              opacity = 1;
            } else {
              // Các thẻ đằng sau nghiêng góc 45 độ hướng về trung tâm
              const direction = Math.sign(distance);
              xOffset = direction * (140 + absDistance * 40); 
              zOffset = -absDistance * 80;
              rotateY = direction * -45; // Xoay hướng vào giữa
              scale = 1 - (absDistance * 0.05); // Scale giảm nhẹ
              opacity = Math.max(0.3, 1 - (absDistance * 0.15)); // Mờ dần
            }

            // Blur effect for depth
            const filterBlur = distance === 0 ? 'blur(0px)' : `blur(${absDistance * 1.5}px)`;

            return (
              <motion.div
                key={tactic.id}
                layout
                initial={false}
                animate={{
                  x: xOffset,
                  y: 0,
                  z: zOffset,
                  rotateY: rotateY,
                  scale: scale,
                  opacity: opacity,
                  filter: filterBlur,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 90, // Reduced stiffness for slower motion
                  damping: 20, // Increased smoothness (less bounce, fluid)
                  mass: 1.2,
                }}
                className={`absolute top-1/2 left-1/2 -mt-[200px] -ml-[140px] w-[280px] h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer ${
                  distance === 0 
                    ? 'bg-gradient-to-br from-[#1c1c1c]/90 to-[#0a0a0a]/90 ring-1 ring-copper/50 backdrop-blur-xl' 
                    : 'bg-gradient-to-br from-[#161616]/70 to-[#050505]/70 backdrop-blur-md hover:ring-1 hover:ring-white/20'
                }`}
                style={{
                  zIndex: 100 - absDistance,
                  transformStyle: 'preserve-3d',
                  boxShadow: distance === 0 
                    ? '0 30px 60px -15px rgba(0,0,0,0.9), 0 0 40px rgba(196,139,71,0.2)' 
                    : '0 10px 30px rgba(0,0,0,0.5)',
                }}
                onClick={() => setActiveIndex(index)}
              >
                {/* Ánh sáng lướt trên bề mặt kính (Glassmorphism highlight) */}
                <div className={`absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none transition-opacity ${distance === 0 ? 'opacity-100' : 'opacity-40'}`} />
                
                <div className="p-6 h-full flex flex-col justify-between relative z-10">
                  <div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10 backdrop-blur-sm shadow-inner">
                      <span className="text-copper font-bold text-lg">{index + 1}</span>
                    </div>
                    <h3 className="text-2xl font-headline font-bold text-white mb-2 leading-tight drop-shadow-md">
                      {tactic.title}
                    </h3>
                    <p className="text-sm font-mono text-copper/90 tracking-wide">{tactic.formation}</p>
                    <p className="text-xs text-white/50 mt-3 line-clamp-3 leading-relaxed">{tactic.description || 'Không có mô tả chi tiết cho sơ đồ này.'}</p>
                  </div>
                  
                  {distance === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="mt-4 flex flex-col gap-2"
                    >
                      <Link href={`/post/${tactic.id}`}>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3 bg-copper hover:bg-copper/90 text-black font-semibold rounded-lg transition-all text-sm shadow-[0_0_20px_rgba(196,139,71,0.3)]"
                        >
                          Xem sơ đồ
                        </motion.button>
                      </Link>
                      {isOwnProfile && (
                        <div className="flex gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(tactic.id); }}
                            className="flex-1 py-2 bg-black/60 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-colors text-xs backdrop-blur-md"
                          >
                            Chỉnh sửa
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(tactic.id); }}
                            className="flex-1 py-2 bg-red-950/40 border border-red-500/20 text-red-400 font-medium rounded-lg hover:bg-red-900/60 transition-colors text-xs backdrop-blur-md"
                          >
                            Xóa thẻ
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Arrows (Thanh mảnh, hai bên) */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-10 z-20 pointer-events-none">
        <button 
          onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          className="w-14 h-14 rounded-full flex items-center justify-center pointer-events-auto text-white/50 hover:text-white disabled:opacity-20 transition-all bg-black/20 hover:bg-black/50 backdrop-blur-md border border-white/5 hover:border-white/20"
        >
          <ChevronLeft strokeWidth={1} className="w-8 h-8 -ml-1" />
        </button>
        
        <div className="text-white/30 text-xs font-mono uppercase tracking-widest pointer-events-none">
          {activeIndex + 1} / {tactics.length}
        </div>

        <button 
          onClick={() => setActiveIndex(Math.min(tactics.length - 1, activeIndex + 1))}
          disabled={activeIndex === tactics.length - 1}
          className="w-14 h-14 rounded-full flex items-center justify-center pointer-events-auto text-white/50 hover:text-white disabled:opacity-20 transition-all bg-black/20 hover:bg-black/50 backdrop-blur-md border border-white/5 hover:border-white/20"
        >
          <ChevronRight strokeWidth={1} className="w-8 h-8 -mr-1" />
        </button>
      </div>
    </div>
  );
};
