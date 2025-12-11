"use client";
import React from 'react';
import { cn } from '@/lib/utils';
import { Team } from './TacticBoard';

// Position types based on POSITION_OPTIONS from constants
export type PlayerPosition = 'GK' | 'RB' | 'LB' | 'CB' | 'LWB' | 'RWB' | 'DM' | 'CM' | 'AM' | 'RW' | 'LW' | 'CF' | 'ST';

export interface PlayerTokenProps {
  position: PlayerPosition;
  label?: string;
  className?: string;
  variant?: 'default' | 'responsive';
  team?: Team;
}

// Color mapping based on position category - HOME TEAM (vibrant colors)
const HOME_POSITION_COLORS: Record<string, {
  bg: string;
  border: string;
  text: string;
}> = {
  // Goalkeeper
  GK: { bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-white' },
  
  // Defenders
  RB: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-white' },
  LB: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-white' },
  CB: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-white' },
  LWB: { bg: 'bg-blue-400', border: 'border-blue-300', text: 'text-white' },
  RWB: { bg: 'bg-blue-400', border: 'border-blue-300', text: 'text-white' },
  
  // Midfielders
  DM: { bg: 'bg-green-500', border: 'border-green-400', text: 'text-white' },
  CM: { bg: 'bg-green-500', border: 'border-green-400', text: 'text-white' },
  AM: { bg: 'bg-green-400', border: 'border-green-300', text: 'text-white' },
  
  // Forwards
  RW: { bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-white' },
  LW: { bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-white' },
  CF: { bg: 'bg-rose-600', border: 'border-rose-500', text: 'text-white' },
  ST: { bg: 'bg-red-500', border: 'border-red-400', text: 'text-white' },
};

// Color mapping - AWAY TEAM (darker/alternate colors)
const AWAY_POSITION_COLORS: Record<string, {
  bg: string;
  border: string;
  text: string;
}> = {
  // Goalkeeper
  GK: { bg: 'bg-orange-700', border: 'border-orange-600', text: 'text-white' },
  
  // Defenders
  RB: { bg: 'bg-slate-600', border: 'border-slate-500', text: 'text-white' },
  LB: { bg: 'bg-slate-600', border: 'border-slate-500', text: 'text-white' },
  CB: { bg: 'bg-slate-600', border: 'border-slate-500', text: 'text-white' },
  LWB: { bg: 'bg-slate-500', border: 'border-slate-400', text: 'text-white' },
  RWB: { bg: 'bg-slate-500', border: 'border-slate-400', text: 'text-white' },
  
  // Midfielders
  DM: { bg: 'bg-teal-700', border: 'border-teal-600', text: 'text-white' },
  CM: { bg: 'bg-teal-700', border: 'border-teal-600', text: 'text-white' },
  AM: { bg: 'bg-teal-600', border: 'border-teal-500', text: 'text-white' },
  
  // Forwards
  RW: { bg: 'bg-purple-600', border: 'border-purple-500', text: 'text-white' },
  LW: { bg: 'bg-purple-600', border: 'border-purple-500', text: 'text-white' },
  CF: { bg: 'bg-purple-700', border: 'border-purple-600', text: 'text-white' },
  ST: { bg: 'bg-fuchsia-600', border: 'border-fuchsia-500', text: 'text-white' },
};

export const PlayerToken = ({
  position,
  label,
  className,
  variant = 'default',
  team = 'home',
}: PlayerTokenProps) => {
  const colorMap = team === 'away' ? AWAY_POSITION_COLORS : HOME_POSITION_COLORS;
  const colors = colorMap[position] || { 
    bg: 'bg-neutral-500', 
    border: 'border-neutral-400', 
    text: 'text-white' 
  };

  const displayLabel = label || position;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full font-bold shadow-lg border-2 select-none",
        colors.bg,
        colors.border,
        colors.text,
        variant === 'responsive' ? 'w-full h-full text-[clamp(8px,2vw,12px)]' : 'w-10 h-10 text-xs',
        "transition-all duration-200",
        className
      )}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
      
      {/* Label */}
      <span className="relative z-10 drop-shadow-sm">
        {displayLabel}
      </span>
    </div>
  );
};

