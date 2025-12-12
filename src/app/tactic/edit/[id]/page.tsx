// src/app/tactic/edit/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TacticEditorUI } from '@/components/features/tactic-board/TacticEditorUI';
import { useTacticLogic } from '@/lib/hooks/useTacticLogic';
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
import { Loader2 } from 'lucide-react';

export default function EditTacticPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const logic = useTacticLogic();
  
  // State for form metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Sensors with distance constraint
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Load user and tactic data
  useEffect(() => {
    const init = async () => {
      const user = await supabaseAuth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      // Fetch tactic data
      try {
        const res = await fetch(`/api/tactic/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title || '');
          setDescription(data.description || '');
          setTags(data.tags?.join(', ') || '');
          
          // Load players, arrows, and ball into logic using reset
          logic.reset({
            players: data.tacticData?.players || [],
            arrows: data.tacticData?.arrows || [],
            areas: []
          });
          
          setIsDataLoaded(true);
        } else {
          alert('Không tìm thấy chiến thuật');
          router.push('/profile/me');
        }
      } catch (error) {
        console.error('Error loading tactic:', error);
        router.push('/profile/me');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [params.id]);

  // Handle drag end - same as CreateTacticModal
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

  // Handle save - update existing tactic
  const handleSave = async () => {
    if (!userId || title.trim().length === 0) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const res = await fetch(`/api/tactic/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          title: title.trim(),
          description,
          players: logic.players,
          arrows: logic.arrows,
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          isPublic: true, // Will be published when saving
          status: 'published'
        })
      });

      if (res.ok) {
        alert('✅ Đã lưu chiến thuật!');
        router.push('/profile/me');
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.error || 'Không thể lưu'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
    }
  };

  // Metadata props for TacticEditorUI
  const metaProps = { 
    title, setTitle, 
    description, setDescription, 
    tags, setTags, 
    players: logic.players, 
    arrows: logic.arrows, 
    onPost: handleSave, 
    isPosting: isSaving,
    isEditMode: true
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-background overflow-hidden">
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
          onClose={() => router.back()}
        />
      </DndContext>
    </div>
  );
}
