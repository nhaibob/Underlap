import { useState } from 'react';
import { useTacticHistory } from '@/lib/hooks/useTacticHistory';
// Import type Player, Arrow, Area từ file TacticBoard (đảm bảo file TacticBoard export chúng)
import { Player, Arrow, Area, Ball, Team } from '@/components/features/tactic-board/TacticBoard';
import { PlayerTokenProps } from '@/components/features/tactic-board/PlayerToken';
import { ALL_ARROW_COLOR_VALUES } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

// Định nghĩa các types dùng chung tại đây để các component khác import
export type ArrowColor = typeof ALL_ARROW_COLOR_VALUES[number];
export type ArrowStyle = 'solid' | 'dashed';
export type ArrowType = 'straight' | 'curved';
export type Tool = 'select' | 'draw' | 'erase' | 'area';

// Visibility state for layers
export interface LayerVisibility {
    home: boolean;
    away: boolean;
    ball: boolean;
}

export const useTacticLogic = () => {
    // 1. Quản lý History & State chính
    const { state, setState, undo, redo, reset, canUndo, canRedo } = useTacticHistory({
        players: [],
        arrows: [],
        areas: []
    });

    const { players, arrows, areas } = state;

    // 2. State UI phụ trợ
    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [arrowColor, setArrowColor] = useState<ArrowColor>(ALL_ARROW_COLOR_VALUES[0]);
    const [arrowStyle, setArrowStyle] = useState<ArrowStyle>('solid');
    const [arrowType, setArrowType] = useState<ArrowType>('straight');
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [positionToPlace, setPositionToPlace] = useState<PlayerTokenProps['position'] | null>(null);
    const [boardRect, setBoardRect] = useState<DOMRect | null>(null);
    
    // NEW: Team selection for adding players
    const [selectedTeam, setSelectedTeam] = useState<Team>('home');
    
    // NEW: Ball state (separate from history for simplicity)
    const [ball, setBall] = useState<Ball | null>(null);
    const [isPlacingBall, setIsPlacingBall] = useState(false);
    
    // NEW: Layer visibility
    const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
        home: true,
        away: true,
        ball: true
    });

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
        setBall(null);
        setSelectedPlayerId(null);
        setPositionToPlace(null);
        setActiveTool('select');
        setIsPlacingBall(false);
    };

    // Thêm cầu thủ khi click vào sân (with team)
    const addPlayerAtPosition = (pos: { x: number, y: number }) => {
        if (!positionToPlace) return;
        
        // Tự động đánh số nếu có nhiều cầu thủ cùng vị trí (VD: CM1, CM2)
        const count = players.filter(p => p.position === positionToPlace && p.team === selectedTeam).length;
        const finalLabel = count > 0 ? `${positionToPlace}${count + 1}` : positionToPlace;
        
        const newPlayer: Player = { 
            id: uuidv4(), 
            position: positionToPlace, 
            label: finalLabel, 
            pos: pos,
            team: selectedTeam
        };

        setPlayers((current) => [...current, newPlayer]);
        setPositionToPlace(null);
        setActiveTool('select');
    };
    
    // NEW: Add ball at position
    const addBallAtPosition = (pos: { x: number, y: number }) => {
        if (!isPlacingBall) return;
        setBall({ id: uuidv4(), pos });
        setIsPlacingBall(false);
        setActiveTool('select');
    };
    
    // NEW: Toggle layer visibility
    const toggleLayerVisibility = (layer: keyof LayerVisibility) => {
        setLayerVisibility(prev => ({
            ...prev,
            [layer]: !prev[layer]
        }));
    };

    return {
        // Data State
        players, arrows, areas, ball,
        setPlayers, setArrows, setAreas, setBall,
        
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
        
        // NEW: Team & Ball UI State
        selectedTeam, setSelectedTeam,
        isPlacingBall, setIsPlacingBall,
        layerVisibility, setLayerVisibility, toggleLayerVisibility,

        // Logic Actions
        deletePlayer,
        clearAll,
        addPlayerAtPosition,
        addBallAtPosition
    };
};
