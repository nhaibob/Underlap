import { useState } from 'react';
import { useTacticHistory } from '@/lib/hooks/useTacticHistory';
// Import type Player, Arrow, Area từ file TacticBoard (đảm bảo file TacticBoard export chúng)
import { Player, Arrow, Area } from '@/components/features/tactic-board/TacticBoard';
import { PlayerTokenProps } from '@/components/features/tactic-board/PlayerToken';
import { ALL_ARROW_COLOR_VALUES } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

// Định nghĩa các types dùng chung tại đây để các component khác import
export type ArrowColor = typeof ALL_ARROW_COLOR_VALUES[number];
export type ArrowStyle = 'solid' | 'dashed';
export type ArrowType = 'straight' | 'curved';
export type Tool = 'select' | 'move' | 'draw' | 'erase' | 'area';

export const useTacticLogic = () => {
    // 1. Quản lý History & State chính
    const { state, setState, undo, redo, reset, canUndo, canRedo } = useTacticHistory({
        players: [],
        arrows: [],
        areas: []
    });

    const { players, arrows, areas } = state;

    // 2. State UI phụ trợ
    const [activeTool, setActiveTool] = useState<Tool>('move');
    const [arrowColor, setArrowColor] = useState<ArrowColor>(ALL_ARROW_COLOR_VALUES[0]);
    const [arrowStyle, setArrowStyle] = useState<ArrowStyle>('solid');
    const [arrowType, setArrowType] = useState<ArrowType>('straight');
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [positionToPlace, setPositionToPlace] = useState<PlayerTokenProps['position'] | null>(null);
    const [boardRect, setBoardRect] = useState<DOMRect | null>(null);

    // 3. Wrappers để tương thích với component cũ (Setters)
    // Các hàm này giúp update state thông qua history hook
    const setPlayers = (action: React.SetStateAction<Player[]>) => {
        const newPlayers = typeof action === 'function' ? action(players) : action;
        setState({ ...state, players: newPlayers });
    };

    const setArrows = (action: React.SetStateAction<Arrow[]>) => {
        const newArrows = typeof action === 'function' ? action(arrows) : action;
        setState({ ...state, arrows: newArrows });
    };

    const setAreas = (action: React.SetStateAction<Area[]>) => {
        const newAreas = typeof action === 'function' ? action(areas) : action;
        setState({ ...state, areas: newAreas });
    };

    // 4. Logic nghiệp vụ (Actions)
    
    // Xóa cầu thủ
    const deletePlayer = (id: string) => {
        setPlayers((prev) => prev.filter(p => p.id !== id));
        setSelectedPlayerId(null);
    };

    // Xóa toàn bộ (Reset)
    const clearAll = () => {
        reset({ players: [], arrows: [], areas: [] });
        setSelectedPlayerId(null);
        setPositionToPlace(null);
        setActiveTool('move');
    };

    // Thêm cầu thủ khi click vào sân
    const addPlayerAtPosition = (pos: { x: number, y: number }) => {
        if (!positionToPlace) return;
        
        // Tự động đánh số nếu có nhiều cầu thủ cùng vị trí (VD: CM1, CM2)
        const count = players.filter(p => p.position === positionToPlace).length;
        const finalLabel = count > 0 ? `${positionToPlace}${count + 1}` : positionToPlace;
        
        const newPlayer: Player = { 
            id: uuidv4(), 
            position: positionToPlace, 
            label: finalLabel, 
            pos: pos 
        };

        setPlayers((current) => [...current, newPlayer]);
        setPositionToPlace(null);
        setActiveTool('select');
    };

    return {
        // Data State
        players, arrows, areas,
        setPlayers, setArrows, setAreas, // Wrappers
        
        // History Actions
        undo, redo, canUndo, canRedo, reset,

        // UI State
        activeTool, setActiveTool,
        arrowColor, setArrowColor,
        arrowStyle, setArrowStyle,
        arrowType, setArrowType,
        selectedPlayerId, setSelectedPlayerId,
        positionToPlace, setPositionToPlace,
        boardRect, setBoardRect,

        // Logic Actions
        deletePlayer,
        clearAll,
        addPlayerAtPosition
    };
};