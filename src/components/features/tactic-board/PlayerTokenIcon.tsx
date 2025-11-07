// src/components/features/tactic-board/PlayerTokenIcon.tsx
import React from 'react';

// Component này nhận 'className' để Tailwind có thể đổi màu fill/stroke
export const PlayerTokenIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 40 40"
    xmlns="http://www.w3.org/2000/svg"
    className={className} 
  >
    {/* Vòng tròn bên ngoài: STROKE (Viền) */}
    <circle cx="20" cy="20" r="18.5" strokeWidth="3" fill="none" /> 

    {/* Vòng tròn bên trong: FILL (Nền mờ) */}
    <circle cx="20" cy="20" r="14" fillOpacity="0.25" /> 
  </svg>
);