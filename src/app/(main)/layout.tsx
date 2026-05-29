"use client";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

import { TransitionProvider } from "@/components/providers/TransitionProvider";

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

      <div className="flex flex-1 container mx-auto gap-6">
        <main className="flex-1 min-w-0 px-4 md:px-6 relative">
          <div className="pb-[4.5rem] md:pb-0 w-full h-full">
            <TransitionProvider>
              {children}
            </TransitionProvider>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}