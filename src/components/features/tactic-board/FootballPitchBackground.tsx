import React, { memo } from 'react';

export const FootballPitchBackground = memo(() => (
  <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none rounded-2xl shadow-[inset_0_0_80px_rgba(0,0,0,0.5)] bg-black">
    {/* Cinematic grass background - deep emerald green with rich dark edges */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#184E2B] via-[#0E381E] to-[#041208]" />
    
    {/* Grass stripes pattern - very subtle, wide stripes */}
    <div className="absolute inset-0 opacity-[0.06]" 
         style={{ backgroundImage: 'repeating-linear-gradient(90deg, #000 0px, #000 50px, transparent 50px, transparent 100px)' }} />
    
    {/* Subtle noise texture for realism */}
    <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
         style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
    
    {/* Field markings - cinematic thin white/glow lines */}
    <svg className="absolute top-0 left-0 w-full h-full drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" viewBox="0 0 600 400" fill="none" preserveAspectRatio="none">
        {/* Outer boundary */}
        <rect x="5" y="5" width="590" height="390" rx="12" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
        
        {/* Center line */}
        <line x1="300" y1="5" x2="300" y2="395" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
        
        {/* Center circle */}
        <circle cx="300" cy="200" r="50" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
        <circle cx="300" cy="200" r="3" fill="#FFFFFF" opacity="0.9" />
        
        {/* Left penalty area */}
        <rect x="5" y="80" width="80" height="240" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
        {/* Left goal area */}
        <rect x="5" y="140" width="30" height="120" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
        {/* Left penalty spot */}
        <circle cx="60" cy="200" r="2.5" fill="#FFFFFF" opacity="0.9" />
        {/* Left penalty arc */}
        <path d="M 85 160 Q 110 200 85 240" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.8"/>
        
        {/* Right penalty area */}
        <rect x="515" y="80" width="80" height="240" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
        {/* Right goal area */}
        <rect x="565" y="140" width="30" height="120" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
        {/* Right penalty spot */}
        <circle cx="540" cy="200" r="2.5" fill="#FFFFFF" opacity="0.9" />
        {/* Right penalty arc */}
        <path d="M 515 160 Q 490 200 515 240" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.8"/>
        
        {/* Corner arcs */}
        <path d="M 5 25 A 20 20 0 0 1 25 5" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.8"/>
        <path d="M 595 25 A 20 20 0 0 0 575 5" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.8"/>
        <path d="M 5 375 A 20 20 0 0 0 25 395" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.8"/>
        <path d="M 595 375 A 20 20 0 0 1 575 395" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.8"/>
    </svg>
  </div>
));
FootballPitchBackground.displayName = "FootballPitchBackground";
