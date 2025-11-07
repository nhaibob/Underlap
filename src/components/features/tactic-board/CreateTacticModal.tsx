// src/components/features/tactic-board/CreateTacticModal.tsx
"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Player, Arrow } from './TacticBoard';
import { useUIStore } from '@/lib/store/uiStore';
import {
  DndContext,
  DragEndEvent,
  MeasuringStrategy,
} from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { TacticEditorUI } from './TacticEditorUI';
import { PlayerTokenProps } from './PlayerToken'; 
import { ALL_ARROW_COLOR_VALUES } from '@/lib/constants'; 

// KHAI BÁO TYPE MŨI TÊN CHUNG
export type ArrowColor = typeof ALL_ARROW_COLOR_VALUES[number];
export type ArrowStyle = 'solid' | 'dashed';
export type ArrowType = 'straight' | 'curved'; 

export type Tool = 'select' | 'move' | 'draw' | 'erase';

export const CreateTacticModal = () => {
  const { isCreateModalOpen, closeCreateModal } = useUIStore();

  const [players, setPlayers] = useState<Player[]>([]);
  const [boardRect, setBoardRect] = useState<DOMRect | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('move');
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [positionToPlace, setPositionToPlace] = useState<PlayerTokenProps['position'] | null>(null);
  const [arrowColor, setArrowColor] = useState<ArrowColor>(ALL_ARROW_COLOR_VALUES[0]);
  const [arrowStyle, setArrowStyle] = useState<ArrowStyle>('solid');
  const [arrowType, setArrowType] = useState<ArrowType>('straight');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // XỬ LÝ XÓA DỰA TRÊN ID
  const handlePlayerDelete = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    setSelectedPlayerId(null);
  };
  
  // XỬ LÝ CLEAR ALL
  const handleClearAll = () => {
      if (window.confirm("Bạn có chắc chắn muốn xóa tất cả cầu thủ và đường vẽ không?")) {
          setPlayers([]);
          setArrows([]);
          setSelectedPlayerId(null);
          setPositionToPlace(null);
          setActiveTool('move');
      }
  };

  // XỬ LÝ ĐẶT CẦU THỦ BẰNG CLICK
  const handleBoardClickToPlace = (pos: { x: number, y: number }) => {
    if (!positionToPlace) return; 
    
    const count = players.filter(p => p.position === positionToPlace).length;
    const finalLabel = count > 0 ? `${positionToPlace}${count + 1}` : positionToPlace; 

    const newPlayer: Player = {
      id: uuidv4(),
      position: positionToPlace,
      label: finalLabel,
      pos: pos,
    };
    setPlayers((current) => [...current, newPlayer]);
    
    setPositionToPlace(null);
    setActiveTool('select');
  };
  
  // HÀM POST TACTIC
  const handlePostTactic = async () => {
    const canPost = title.trim().length > 0 && players.length > 0;
    if (!canPost) return;

    setIsPosting(true);
    
    const payload = {
        metadata: {
            title: title.trim(),
            description,
            tags: tags.split(',').map(t => t.trim()).filter(t => t),
        },
        players, 
        arrows,
    };

    try {
        const response = await fetch('/api/tactic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        
        console.log("POST Result:", result);
        alert(`Đăng thành công! ID: ${result.tacticId || 'mock-id'}`);

        // Logic reset sau khi đăng thành công
        setTitle('');
        setDescription('');
        setTags('');
        setPlayers([]);
        setArrows([]);
        setSelectedPlayerId(null);
        closeCreateModal();

    } catch (error) {
        console.error("Post Tactic Failed:", error);
        alert("Đăng thất bại. Kiểm tra console.");
    } finally {
        setIsPosting(false);
    }
  };


  // (Hàm handleDragEnd - GIỮ NGUYÊN)
  function handleDragEnd(event: DragEndEvent) {
    if (activeTool !== 'move') return; 
    const { active, over, delta } = event;
    if (!over) return; 
    
    if (over.id === 'delete-zone') {
      const isPaletteToken = active.data.current?.isPaletteToken;
      if (!isPaletteToken) {
        handlePlayerDelete(active.id as string);
      }
      return;
    }
    
    if (over.id === 'tactic-board-droppable-area') {
      const isPaletteToken = active.data.current?.isPaletteToken;
      if (isPaletteToken) { return; }
      
      setPlayers((currentPlayers) =>
        currentPlayers.map((player) => {
          if (player.id === active.id) {
            return { ...player, pos: { x: player.pos.x + delta.x, y: player.pos.y + delta.y } };
          }
          return player;
        })
      );
    }
  }
  
  const metaProps = {
    title,
    setTitle,
    description,
    setDescription,
    tags,
    setTags,
    players,
    arrows,
    onPost: handlePostTactic,
    isPosting,
  };


  return (
    // SỬA LỖI: Mở rộng Modal lên tối đa
    <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} className="max-w-full w-[95vw] h-[95vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <DndContext
        onDragEnd={handleDragEnd}
        measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
      >
        <TacticEditorUI
          players={players}
          setPlayers={setPlayers}
          arrows={arrows}
          setArrows={setArrows}
          setBoardRect={setBoardRect}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          boardRect={boardRect}
          selectedPlayerId={selectedPlayerId}
          setSelectedPlayerId={setSelectedPlayerId}
          onPlayerDelete={handlePlayerDelete} 
          
          positionToPlace={positionToPlace}
          setPositionToPlace={setPositionToPlace}
          onBoardClick={handleBoardClickToPlace}
          
          arrowColor={arrowColor}
          setArrowColor={setArrowColor}
          arrowStyle={arrowStyle}
          setArrowStyle={setArrowStyle}
          arrowType={arrowType}
          setArrowType={setArrowType}
          onClearAll={handleClearAll}
          
          metaProps={metaProps}
        />
      </DndContext>
    </Modal>
  );
};