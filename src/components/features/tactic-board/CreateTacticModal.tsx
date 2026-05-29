"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useUIStore } from '@/lib/store/uiStore';
import { supabaseAuth } from '@/lib/supabase';
import { 
  DndContext, 
  DragEndEvent, 
  MeasuringStrategy,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
} from '@dnd-kit/core';
import { TacticEditorUI } from './TacticEditorUI';
import { useTacticLogic } from '@/lib/hooks/useTacticLogic';
import { motion, AnimatePresence } from 'framer-motion';

export const CreateTacticModal = () => {
  const { isCreateModalOpen, closeCreateModal } = useUIStore();
  
  // Sử dụng custom hook logic đã tách biệt
  const logic = useTacticLogic();

  // State riêng cho form metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      const user = await supabaseAuth.getUser();
      if (user?.id) setUserId(user.id);
    };
    getUser();
  }, []);

  // Sensors with distance constraint
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Xử lý kéo thả (Drag End)
  function handleDragEnd(event: DragEndEvent) {
    const { activeTool, players, setPlayers, deletePlayer, boardRect, ball, setBall } = logic;
    if (activeTool === 'draw' || activeTool === 'area' || activeTool === 'erase') return; 
    
    const { active, over, delta } = event;
    if (!over) return; 
    
    if (over.id === 'delete-zone') {
      if (!active.data.current?.isPaletteToken) {
        if ((active.id as string).startsWith('ball-')) {
          setBall(null);
        } else {
          deletePlayer(active.id as string);
        }
      }
      return;
    }
    
    if (over.id === 'tactic-board-droppable-area') {
      if (active.data.current?.isPaletteToken) return;

      const scaleX = (boardRect?.width || 600) / 600;
      const scaleY = (boardRect?.height || 400) / 400;
      
      if ((active.id as string).startsWith('ball-') && ball) {
        setBall({
          ...ball,
          pos: {
            x: ball.pos.x + (delta.x / scaleX),
            y: ball.pos.y + (delta.y / scaleY)
          }
        });
        return;
      }
      
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
        areas: logic.areas,
        status: 'published'
    };

    try {
        const response = await fetch('/api/tactic', { 
            method: 'POST', 
            headers: { 
              'Content-Type': 'application/json'
            }, 
            body: JSON.stringify(payload) 
        });
        await response.json();
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

  const handleSaveDraft = async () => {
    if (logic.players.length === 0) {
      alert('Vui lòng thêm ít nhất một cầu thủ');
      return;
    }
    setIsPosting(true);
    
    const payload = { 
        metadata: { 
            title: title.trim() || 'Bản nháp chưa đặt tên', 
            description, 
            tags: tags.split(',').map(t => t.trim()).filter(t => t) 
        }, 
        players: logic.players, 
        arrows: logic.arrows, 
        areas: logic.areas,
        status: 'draft'
    };

    try {
        const response = await fetch('/api/tactic', { 
            method: 'POST', 
            headers: { 
              'Content-Type': 'application/json'
            }, 
            body: JSON.stringify(payload) 
        });
        await response.json();
        alert('✅ Đã lưu bản nháp!');
        logic.reset({ players: [], arrows: [], areas: [] });
        setTitle(''); setDescription(''); setTags(''); 
        closeCreateModal();
    } catch (error) { 
        console.error("Save draft failed:", error); 
        alert("Lưu nháp thất bại."); 
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
      isPosting,
      onSaveDraft: handleSaveDraft
  };

  return (
    <AnimatePresence>
      {isCreateModalOpen && (
        <motion.div 
          className="fixed inset-0 z-50 w-full h-screen bg-background overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1, transition: { delay: 0.5 } }} // Parent waits 0.5s for slices to close before unmounting
        >
          {/* Lớp che (overlay) gồm 5 mảnh dọc lật 3D */}
          <div 
            className="pointer-events-none absolute inset-0 flex z-50 overflow-hidden" 
            style={{ perspective: 1200 }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-neutral-950 border-r border-neutral-800/50 last:border-none shadow-2xl"
                initial={{ rotateY: 0, opacity: 1 }}
                animate={{ 
                  rotateY: 90, 
                  opacity: 0,
                  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }
                }}
                exit={{ 
                  rotateY: 0, 
                  opacity: 1,
                  // Đóng nhanh hơn (0.4s thay vì 0.8s) để không bị đợi lâu
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: (4 - i) * 0.04 }
                }}
                style={{ transformOrigin: 'left center' }}
              />
            ))}
          </div>

          <DndContext 
            sensors={sensors}
            onDragEnd={handleDragEnd} 
            measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
          >
              <TacticEditorUI
              {...logic}
              onPlayerDelete={logic.deletePlayer}
              onBoardClick={logic.addPlayerAtPosition}
              onClearAll={logic.clearAll}
              metaProps={metaProps}
              onClose={closeCreateModal}
              />
          </DndContext>
        </motion.div>
      )}
    </AnimatePresence>
  );
};