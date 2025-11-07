// src/components/layout/SidebarRight.tsx
import React from 'react';

export const SidebarRight = () => {
  return (
    // 'sticky' để nó cố định khi cuộn, 'hidden xl:block' để ẩn trên màn nhỏ/vừa
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-72 p-4 border-l border-panel hidden xl:block">
      <h2 className="font-headline text-lg font-semibold mb-4">Trending Creators</h2>
      <div className="flex flex-col gap-3">
        {/* Placeholder Item */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-sm">Huy Sơn</h3>
            <p className="text-xs text-text-secondary">@huyson</p>
          </div>
        </div>
        {/* Placeholder Item */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-sm">TacticalFan</h3>
            <p className="text-xs text-text-secondary">@tactical</p>
          </div>
        </div>
      </div>
    </aside>
  );
};