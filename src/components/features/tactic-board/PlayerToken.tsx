// src/components/features/tactic-board/PlayerToken.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { PlayerTokenIcon } from './PlayerTokenIcon';
import { POSITION_CATEGORY_COLORS, POSITION_OPTIONS } from '@/lib/constants';

// Lấy tất cả các vị trí đã định nghĩa
type PositionValue = typeof POSITION_OPTIONS[number]['value'];

// Khai báo các vị trí chi tiết
export interface PlayerTokenProps {
  position: PositionValue;
  label: string;
  className?: string;
}

const getPlayerCategory = (position: PositionValue) => {
	const option = POSITION_OPTIONS.find(p => p.value === position);
	return option ? option.category : 'FWD';
};


export const PlayerToken = ({
	position,
	label,
	className
}: PlayerTokenProps) => {

	const category = getPlayerCategory(position);
	// Lấy đối tượng chứa { stroke: '...', fill: '...' }
	const colorClasses = POSITION_CATEGORY_COLORS[category]; 

	return (
		<div
			className={cn(
				'w-12 h-12 relative flex items-center justify-center cursor-pointer transition-all duration-150 transform-gpu overflow-hidden',
				'hover:scale-105 active:scale-95 z-30',
				className
			)}
			aria-hidden={false}
			role="button"
		>
			{/* Icon SVG (Phải nhận lớp màu) */}
			<PlayerTokenIcon
				className={cn(
					'w-full h-full absolute transition-all',
					// === SỬA LỖI: TRUYỀN CẢ HAI LỚP STROKE VÀ FILL RIÊNG BIỆT ===
					colorClasses.stroke, // Ví dụ: stroke-red-500
                    colorClasses.fill   // Ví dụ: fill-red-500/20
				)}
			/>
			{/* Chữ (nằm trên) */}
			<span className="relative font-bold text-xs text-white drop-shadow-sm px-1 bg-black/30 rounded-sm">
				{label}
			</span>
		</div>
	);
};