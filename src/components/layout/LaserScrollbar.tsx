"use client";

import { motion, useScroll, useSpring, useTransform, useVelocity, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

export const LaserScrollbar = () => {
  const { scrollYProgress, scrollY } = useScroll();
  
  // Hiệu ứng vật lý (spring) để tạo quán tính trượt mượt mà
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 40,
    mass: 0.5,
  });

  const scrollVelocity = useVelocity(scrollY);
  const [isScrolling, setIsScrolling] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);

  // Lấy chiều cao màn hình để tính toán giới hạn trượt của tia laser
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Theo dõi vận tốc cuộn để biết khi nào người dùng đang cuộn
  // Thêm timer để tắt hiệu ứng sau khi dừng cuộn
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const unsubscribe = scrollVelocity.on("change", (latest) => {
      if (Math.abs(latest) > 5) {
        setIsScrolling(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => setIsScrolling(false), 300);
      }
    });
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [scrollVelocity]);

  // Độ cao của thanh laser (thumb)
  const thumbHeight = 80;

  // Tính toán vị trí Y dựa trên phần trăm cuộn
  const y = useTransform(smoothProgress, (value) => {
    // Tránh NaN hoặc âm khi windowHeight chưa load
    if (!windowHeight) return 0;
    return value * (windowHeight - thumbHeight);
  });

  // Nếu trang web chưa mount trên client, không render (để tránh lỗi hydration/SSR)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[2px] z-[100] pointer-events-none">
      <motion.div
        className="absolute top-0 right-0 w-[2px] bg-white rounded-full"
        style={{
          height: thumbHeight,
          y,
        }}
        initial="idle"
        animate={isScrolling ? "scrolling" : "idle"}
        variants={{
          idle: {
            opacity: 0.2,
            boxShadow: "0 0 4px 1px rgba(255, 255, 255, 0.2)",
            filter: "brightness(0.8)",
            transition: { duration: 0.5 }
          },
          scrolling: {
            opacity: 1,
            boxShadow: "0 0 20px 4px rgba(255, 255, 255, 0.8), 0 0 40px 8px rgba(255, 255, 255, 0.4)",
            filter: "brightness(1.5)",
            transition: { duration: 0.15 }
          }
        }}
      />
    </div>
  );
};
