// src/app/dm/layout.tsx
import React from 'react';

export default function DMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
