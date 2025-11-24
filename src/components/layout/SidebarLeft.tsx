// src/components/layout/SidebarLeft.tsx
import React from 'react';

export const SidebarLeft = () => {
  return (
    // SỬA Ở ĐÂY: Đã thêm 'bg-panel'
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 p-4 border-r border-panel hidden lg:block bg-panel">
      <h2 className="font-headline text-lg font-semibold mb-4">Filters</h2>
      <nav className="flex flex-col gap-2">
        <a href="#" className="p-2 rounded-lg bg-panel text-text-primary font-semibold">Following</a>
        <a href="#" className="p-2 rounded-lg hover:bg-panel text-text-secondary">Recent</a>
        <a href="#" className="p-2 rounded-lg hover:bg-panel text-text-secondary">Global</a>
      </nav>
    </aside>
  );
};