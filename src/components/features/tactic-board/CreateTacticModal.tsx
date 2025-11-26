// src/components/features/tactic-board/CreateTacticModal.tsx
"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Player, Arrow, Area } from './TacticBoard';
import { useUIStore } from '@/lib/store/uiStore';
import { DndContext, DragEndEvent, MeasuringStrategy } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { TacticEditorUI } from './TacticEditorUI';
import { PlayerTokenProps } from './PlayerToken'; 
import { ALL_ARROW_COLOR_VALUES } from '@/lib/constants'; 
// [NEW] Import hook history
import { useTacticHistory } from '@/lib/hooks/useTacticHistory';

export type ArrowColor = typeof ALL_ARROW_COLOR_VALUES[number];
export type ArrowStyle = 'solid' | 'dashed';
export type ArrowType = 'straight' | 'curved'; 
export type Tool = 'select' | 'move' | 'draw' | 'erase' | 'area';

export const CreateTacticModal = () => {
  const { isCreateModalOpen, closeCreateModal } = useUIStore();

  // [UPDATED] Sử dụng Custom Hook quản lý history thay vì useState riêng lẻ
  const { state, setState, undo, redo, reset, canUndo, canRedo } = useTacticHistory({
      players: [],
      arrows: [],
      areas: []
  });

  // Destructure state để code phía dưới gọn hơn
  const { players, arrows, areas } = state;

  const [boardRect, setBoardRect] = useState<DOMRect | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('move');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [positionToPlace, setPositionToPlace] = useState<PlayerTokenProps['position'] | null>(null);
  const [arrowColor, setArrowColor] = useState<ArrowColor>(ALL_ARROW_COLOR_VALUES[0]);
  const [arrowStyle, setArrowStyle] = useState<ArrowStyle>('solid');
  const [arrowType, setArrowType] = useState<ArrowType>('straight');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // --- WRAPPERS ĐỂ TƯƠNG THÍCH VỚI UI COMPONENTS ---
  // Các component con (TacticEditorUI, TacticBoard) mong đợi một hàm setPlayers(prev => ...)
  // Chúng ta cần tạo wrapper để chuyển đổi logic đó sang setState({ ...state, players: ... })

  const setPlayersWrapper = (action: React.SetStateAction<Player[]>) => {
      const newPlayers = typeof action === 'function' ? action(players) : action;
      setState({ ...state, players: newPlayers });
  };

  const setArrowsWrapper = (action: React.SetStateAction<Arrow[]>) => {
      const newArrows = typeof action === 'function' ? action(arrows) : action;
      setState({ ...state, arrows: newArrows });
  };

  const setAreasWrapper = (action: React.SetStateAction<Area[]>) => {
      const newAreas = typeof action === 'function' ? action(areas) : action;
      setState({ ...state, areas: newAreas });
  };

  // --- HANDLERS ---

  const handlePlayerDelete = (id: string) => {
      setPlayersWrapper((prev) => prev.filter(p => p.id !== id));
      setSelectedPlayerId(null);
  };
  
  const handleClearAll = () => {
      if (confirm('Bạn có chắc chắn muốn xóa toàn bộ sa bàn không?')) {
          reset({ players: [], arrows: [], areas: [] });
          setSelectedPlayerId(null);
          setPositionToPlace(null);
          setActiveTool('move');
      }
  };

  const handleBoardClickToPlace = (pos: { x: number, y: number }) => {
    if (!positionToPlace) return; 
    const count = players.filter(p => p.position === positionToPlace).length;
    const finalLabel = count > 0 ? `${positionToPlace}${count + 1}` : positionToPlace; 
    const newPlayer: Player = { id: uuidv4(), position: positionToPlace, label: finalLabel, pos: pos };
    
    // Thêm vào history
    setPlayersWrapper((current) => [...current, newPlayer]);
    setPositionToPlace(null); setActiveTool('select');
  };
  
  const handlePostTactic = async () => {
    if (title.trim().length === 0 || players.length === 0) return;
    setIsPosting(true);
    // Include areas in payload if backend supports it
    const payload = { metadata: { title: title.trim(), description, tags: tags.split(',').map(t => t.trim()).filter(t => t) }, players, arrows, areas };
    try {
        const response = await fetch('/api/tactic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const result = await response.json();
        console.log("POST Result:", result);
        // Reset sau khi post thành công
        reset({ players: [], arrows: [], areas: [] });
        setTitle(''); setDescription(''); setTags(''); closeCreateModal();
    } catch (error) { console.error("Post Tactic Failed:", error); alert("Đăng thất bại."); } finally { setIsPosting(false); }
  };

  function handleDragEnd(event: DragEndEvent) {
    if (activeTool !== 'move') return; 
    const { active, over, delta } = event;
    if (!over) return; 
    
    // Nếu kéo vào thùng rác
    if (over.id === 'delete-zone') {
      if (!active.data.current?.isPaletteToken) handlePlayerDelete(active.id as string);
      return;
    }
    
    // Nếu thả trên sân
    if (over.id === 'tactic-board-droppable-area') {
      if (active.data.current?.isPaletteToken) return;

      const scaleX = (boardRect?.width || 600) / 600;
      const scaleY = (boardRect?.height || 400) / 400;
      
      // Tính toán vị trí mới
      const newPlayers = players.map((player) => {
          if (player.id === active.id) {
            return { 
                ...player, 
                pos: { 
                    x: player.pos.x + (delta.x / scaleX), 
                    y: player.pos.y + (delta.y / scaleY) 
                } 
            };
          }
          return player;
      });

      // Cập nhật State và lưu vào History
      setState({ ...state, players: newPlayers });
    }
  }
  
  // Props cho MetaPanel (Giờ thêm cả undo/redo nếu cần hiển thị ở đó, nhưng ta sẽ để ở ToolsPalette)
  const metaProps = { title, setTitle, description, setDescription, tags, setTags, players, arrows, onPost: handlePostTactic, isPosting };

  return (
    <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} className="max-w-full w-[95vw] h-[95vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <DndContext onDragEnd={handleDragEnd} measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}>
        <TacticEditorUI
          // State
          players={players} 
          arrows={arrows} 
          areas={areas}
          // Setters (Wrappers)
          setPlayers={setPlayersWrapper}
          setArrows={setArrowsWrapper}
          setAreas={setAreasWrapper}
          
          setBoardRect={setBoardRect}
          activeTool={activeTool} setActiveTool={setActiveTool}
          boardRect={boardRect}
          selectedPlayerId={selectedPlayerId} setSelectedPlayerId={setSelectedPlayerId}
          onPlayerDelete={handlePlayerDelete} 
          positionToPlace={positionToPlace} setPositionToPlace={setPositionToPlace}
          onBoardClick={handleBoardClickToPlace}
          arrowColor={arrowColor} setArrowColor={setArrowColor}
          arrowStyle={arrowStyle} setArrowStyle={setArrowStyle}
          arrowType={arrowType} setArrowType={setArrowType}
          onClearAll={handleClearAll}
          metaProps={metaProps}
          
          // [NEW] Truyền props Undo/Redo xuống UI
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </DndContext>
    </Modal>
  );
};