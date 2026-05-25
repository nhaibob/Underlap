import React, { memo } from 'react';

export const FootballPitchBackground = memo(() => (
  <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
    {/* Enhanced grass background - more vibrant and realistic */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#2E7D47] via-[#25683D] to-[#1D5432]" />
    
    {/* Grass stripes pattern - more pronounced */}
    <div className="absolute inset-0 opacity-[0.15]" 
         style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.2) 0px, transparent 40px, transparent 80px, rgba(0,0,0,0.2) 80px, rgba(0,0,0,0.2) 120px)' }} />
    
    {/* Subtle noise texture for realism */}
    <div className="absolute inset-0 opacity-[0.03]"
         style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
    
    {/* Field markings - clearer and more visible */}
    <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 600 400" fill="none" preserveAspectRatio="none">
        {/* Outer boundary */}
        <rect x="5" y="5" width="590" height="390" rx="18" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
        
        {/* Center line */}
        <line x1="300" y1="5" x2="300" y2="395" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
        
        {/* Center circle */}
        <circle cx="300" cy="200" r="50" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
        <circle cx="300" cy="200" r="4" fill="#FFFFFF" opacity="0.95" />
        
        {/* Left penalty area */}
        <rect x="5" y="80" width="80" height="240" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
        {/* Left goal area */}
        <rect x="5" y="140" width="30" height="120" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
        {/* Left penalty spot */}
        <circle cx="60" cy="200" r="3" fill="#FFFFFF" opacity="0.95" />
        {/* Left penalty arc */}
        <path d="M 85 160 Q 110 200 85 240" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.95"/>
        
        {/* Right penalty area */}
        <rect x="515" y="80" width="80" height="240" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
        {/* Right goal area */}
        <rect x="565" y="140" width="30" height="120" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
        {/* Right penalty spot */}
        <circle cx="540" cy="200" r="3" fill="#FFFFFF" opacity="0.95" />
        {/* Right penalty arc */}
        <path d="M 515 160 Q 490 200 515 240" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.95"/>
        
        {/* Corner arcs */}
        <path d="M 5 25 A 20 20 0 0 1 25 5" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.95"/>
        <path d="M 595 25 A 20 20 0 0 0 575 5" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.95"/>
        <path d="M 5 375 A 20 20 0 0 0 25 395" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.95"/>
        <path d="M 595 375 A 20 20 0 0 1 575 395" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.95"/>
    </svg>
  </div>
));
FootballPitchBackground.displayName = "FootballPitchBackground";
