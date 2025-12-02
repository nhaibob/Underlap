// src/components/layout/SidebarRight.tsx
import React from 'react';

export const SidebarRight = () => {
  return (
    // [FIX] Thêm bg-panel để đồng bộ layout
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-72 p-4 border-l border-panel hidden xl:block bg-panel">
      <h2 className="font-headline text-lg font-semibold mb-4">Trending Creators</h2>
      <div className="flex flex-col gap-3">
        {/* Placeholder Item */}
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            HS
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">Huy Sơn</h3>
            <p className="text-xs text-text-secondary truncate">@huyson</p>
          </div>
        </div>
        {/* Placeholder Item */}
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            TF
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">TacticalFan</h3>
            <p className="text-xs text-text-secondary truncate">@tactical</p>
          </div>
        </div>
      </div>
    </aside>
  );
};