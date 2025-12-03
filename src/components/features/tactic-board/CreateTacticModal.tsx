"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useUIStore } from '@/lib/store/uiStore';
import { DndContext, DragEndEvent, MeasuringStrategy } from '@dnd-kit/core';
import { TacticEditorUI } from './TacticEditorUI';
import { useTacticLogic } from '@/lib/hooks/useTacticLogic';

export const CreateTacticModal = () => {
  const { isCreateModalOpen, closeCreateModal } = useUIStore();
  
  // Sử dụng custom hook logic
  const logic = useTacticLogic();

  // State riêng cho form metadata (không thuộc về tactic logic thuần túy)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Xử lý kéo thả (Drag End)
  function handleDragEnd(event: DragEndEvent) {
    const { activeTool, activeTool: tool, players, setPlayers, deletePlayer, boardRect } = logic;
    
    if (tool !== 'move') return; 
    const { active, over, delta } = event;
    if (!over) return; 
    
    // Kéo vào thùng rác
    if (over.id === 'delete-zone') {
      if (!active.data.current?.isPaletteToken) deletePlayer(active.id as string);
      return;
    }
    
    // Thả trên sân
    if (over.id === 'tactic-board-droppable-area') {
      if (active.data.current?.isPaletteToken) return;

      const scaleX = (boardRect?.width || 600) / 600;
      const scaleY = (boardRect?.height || 400) / 400;
      
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
      setPlayers(newPlayers);
    }
  }

  const handlePostTactic = async () => {
    if (title.trim().length === 0 || logic.players.length === 0) return;
    setIsPosting(true);
    
    const payload = { 
        metadata: { 
            title: title.trim(), 
            description, 
            tags: tags.split(',').map(t => t.trim()).filter(t => t) 
        }, 
        players: logic.players, 
        arrows: logic.arrows, 
        areas: logic.areas 
    };

    try {
        const response = await fetch('/api/tactic', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
        const result = await response.json();
        console.log("POST Result:", result);
        
        // Reset và đóng modal
        logic.reset({ players: [], arrows: [], areas: [] });
        setTitle(''); setDescription(''); setTags(''); 
        closeCreateModal();
    } catch (error) { 
        console.error("Post Tactic Failed:", error); 
        alert("Đăng thất bại."); 
    } finally { 
        setIsPosting(false); 
    }
  };

  const metaProps = { 
      title, setTitle, 
      description, setDescription, 
      tags, setTags, 
      players: logic.players, 
      arrows: logic.arrows, 
      onPost: handlePostTactic, 
      isPosting 
  };

  return (
    <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} className="max-w-full w-[95vw] h-[95vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <DndContext onDragEnd={handleDragEnd} measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}>
        <TacticEditorUI
          {...logic} // Truyền toàn bộ state và handlers từ hook
          onPlayerDelete={logic.deletePlayer}
          onBoardClick={logic.addPlayerAtPosition}
          onClearAll={logic.clearAll}
          metaProps={metaProps}
        />
      </DndContext>
    </Modal>
  );
};