"use client";
import React from 'react';
import { cn } from '@/lib/utils';
import { Team } from './TacticBoard';

// Position types based on POSITION_OPTIONS from constants
export type PlayerPosition = 'GK' | 'RB' | 'LB' | 'CB' | 'LWB' | 'RWB' | 'CDM' | 'DM' | 'CM' | 'LM' | 'RM' | 'CAM' | 'AM' | 'RW' | 'LW' | 'CF' | 'ST';

export interface PlayerTokenProps {
  position: PlayerPosition;
  label?: string;
  className?: string;
  variant?: 'default' | 'responsive';
  team?: Team;
}

// Color mapping based on position category - HOME TEAM (BLUE theme)
const HOME_POSITION_COLORS: Record<string, {
  bg: string;
  border: string;
  text: string;
}> = {
  // Goalkeeper - Yellow/Gold (classic GK color)
  GK: { bg: 'bg-yellow-500', border: 'border-yellow-400', text: 'text-black' },
  
  // Defenders - Dark Blue
  RB: { bg: 'bg-blue-700', border: 'border-blue-600', text: 'text-white' },
  LB: { bg: 'bg-blue-700', border: 'border-blue-600', text: 'text-white' },
  CB: { bg: 'bg-blue-700', border: 'border-blue-600', text: 'text-white' },
  LWB: { bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-white' },
  RWB: { bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-white' },
  
  // Midfielders - Medium Blue
  CDM: { bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-white' },
  DM: { bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-white' },
  CM: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-white' },
  LM: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-white' },
  RM: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-white' },
  CAM: { bg: 'bg-sky-500', border: 'border-sky-400', text: 'text-white' },
  AM: { bg: 'bg-sky-500', border: 'border-sky-400', text: 'text-white' },
  
  // Forwards - Light Blue/Cyan
  RW: { bg: 'bg-cyan-500', border: 'border-cyan-400', text: 'text-white' },
  LW: { bg: 'bg-cyan-500', border: 'border-cyan-400', text: 'text-white' },
  CF: { bg: 'bg-cyan-600', border: 'border-cyan-500', text: 'text-white' },
  ST: { bg: 'bg-sky-600', border: 'border-sky-500', text: 'text-white' },
};

// Color mapping - AWAY TEAM (RED/CRIMSON theme)
const AWAY_POSITION_COLORS: Record<string, {
  bg: string;
  border: string;
  text: string;
}> = {
  // Goalkeeper - Lime/Green (contrast with red)
  GK: { bg: 'bg-lime-500', border: 'border-lime-400', text: 'text-black' },
  
  // Defenders - Dark Red
  RB: { bg: 'bg-red-700', border: 'border-red-600', text: 'text-white' },
  LB: { bg: 'bg-red-700', border: 'border-red-600', text: 'text-white' },
  CB: { bg: 'bg-red-700', border: 'border-red-600', text: 'text-white' },
  LWB: { bg: 'bg-red-600', border: 'border-red-500', text: 'text-white' },
  RWB: { bg: 'bg-red-600', border: 'border-red-500', text: 'text-white' },
  
  // Midfielders - Medium Red/Rose
  CDM: { bg: 'bg-red-600', border: 'border-red-500', text: 'text-white' },
  DM: { bg: 'bg-red-600', border: 'border-red-500', text: 'text-white' },
  CM: { bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-white' },
  LM: { bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-white' },
  RM: { bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-white' },
  CAM: { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-white' },
  AM: { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-white' },
  
  // Forwards - Orange/Amber
  RW: { bg: 'bg-orange-600', border: 'border-orange-500', text: 'text-white' },
  LW: { bg: 'bg-orange-600', border: 'border-orange-500', text: 'text-white' },
  CF: { bg: 'bg-amber-600', border: 'border-amber-500', text: 'text-white' },
  ST: { bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-white' },
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

