// src/components/core/TacticBoardDisplay.tsx
"use client";
import React from 'react';
// Đây là component Client Component đích của chúng ta:
import { TacticBoard, Player, Arrow } from '@/components/features/tactic-board/TacticBoard'; 

// Dữ liệu cần thiết để hiển thị (nhận từ Server Component)
interface TacticBoardDisplayProps {
    players: Player[];
    arrows: Arrow[];
}

// Hàm rỗng/null an toàn cho Client-side (NOOP - No Operation)
const NOOP = () => {}; 
const DUMMY_NULL = null;

export const TacticBoardDisplay = ({ players, arrows }: TacticBoardDisplayProps) => {
    return (
        <TacticBoard 
            variant="thumbnail"
            players={players}
            arrows={arrows}
            
            // --- CUNG CẤP CÁC HÀM SET RỖNG AN TOÀN (FIX LỖI) ---
            // Ép kiểu 'as any' lên NOOP để thỏa mãn type của TacticBoard.
            setPlayers={NOOP as any}
            setArrows={NOOP as any}
            setSelectedPlayerId={NOOP as any}
            onBoardClick={NOOP}
            
            // --- DỮ LIỆU TĨNH CẦN THIẾT ---
            activeTool={'select'} 
            boardRect={DUMMY_NULL}
            selectedPlayerId={DUMMY_NULL}
            positionToPlace={DUMMY_NULL}
            currentArrowColor={'#6C5CE7'}
            currentArrowStyle={'solid'}
            currentArrowType={'straight'}
        />
    );
};