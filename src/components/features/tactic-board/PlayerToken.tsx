// src/components/features/tactic-board/PlayerToken.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { PlayerTokenIcon } from './PlayerTokenIcon';
import { POSITION_CATEGORY_COLORS, POSITION_OPTIONS } from '@/lib/constants';

type PositionValue = typeof POSITION_OPTIONS[number]['value'];

export interface PlayerTokenProps {
  position: PositionValue;
  label: string;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'small' | 'responsive'; // Thêm 'responsive'
}

const getPlayerCategory = (position: PositionValue) => {
	const option = POSITION_OPTIONS.find(p => p.value === position);
	return option ? option.category : 'FWD';
};

export const PlayerToken = ({
	position,
	label,
	className,
    showLabel = true,
    variant = 'default'
}: PlayerTokenProps) => {
	const category = getPlayerCategory(position);
	const colorClasses = POSITION_CATEGORY_COLORS[category]; 

    // Logic Class kích thước
    let sizeClass = 'w-10 h-10 md:w-12 md:h-12'; // Default
    let fontSizeClass = 'text-[10px] md:text-xs';

    if (variant === 'small') {
        sizeClass = 'w-8 h-8 md:w-9 md:h-9';
        fontSizeClass = 'text-[9px]';
    } else if (variant === 'responsive') {
        // [RESPONSIVE] Tự scale theo container cha (là % của bảng)
        sizeClass = 'w-full h-full'; 
        // Dùng container query unit hoặc clamp để font chữ không bị quá nhỏ/to
        fontSizeClass = 'text-[clamp(8px,20%,14px)]'; 
    }

	return (
		<div
			className={cn(
				sizeClass,
				'relative flex items-center justify-center cursor-pointer transition-all duration-200 transform-gpu',
				'rounded-full shadow-lg z-30 group select-none',
                'border-[2px] border-white ring-1 ring-black/20',
                'bg-slate-800', 
				className
			)}
			aria-hidden={false}
			role="button"
            aria-label={`Player position ${label}`}
		>
            <div className={cn("absolute inset-0 rounded-full opacity-90", colorClasses.fill?.replace('fill-', 'bg-').replace('/20', ''))} />
			<PlayerTokenIcon className={cn('w-full h-full absolute transition-all p-1', colorClasses.stroke)} />
            
            {showLabel && (
			    <span className={cn(
                    "relative z-10 font-bold text-white drop-shadow-md select-none pointer-events-none font-mono uppercase leading-none",
                    fontSizeClass
                )}>
				    {label}
			    </span>
            )}
            <div className="absolute top-0 left-0 w-full h-1/2 rounded-t-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
		</div>
	);
};