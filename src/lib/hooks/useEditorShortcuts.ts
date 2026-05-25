import { useEffect } from 'react';
import { Tool } from '@/lib/hooks/useTacticLogic';
import { PlayerTokenProps } from '@/components/features/tactic-board/PlayerToken';

interface UseEditorShortcutsProps {
  setActiveTool: (tool: Tool) => void;
  selectedPlayerId: string | null;
  setSelectedPlayerId: (id: string | null) => void;
  onPlayerDelete: (id: string) => void;
  setPositionToPlace: (pos: PlayerTokenProps['position'] | null) => void;
  setIsPlacingBall: (placing: boolean) => void;
  undo: () => void;
  redo: () => void;
}

export const useEditorShortcuts = ({
  setActiveTool,
  selectedPlayerId,
  setSelectedPlayerId,
  onPlayerDelete,
  setPositionToPlace,
  setIsPlacingBall,
  undo,
  redo
}: UseEditorShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (!e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'v': setActiveTool('select'); break;
          case 'd': case 'p': setActiveTool('draw'); break;
          case 'a': setActiveTool('area'); break;
          case 'e': setActiveTool('erase'); break;
          case 'escape': 
            setSelectedPlayerId(null); 
            setPositionToPlace(null);
            setIsPlacingBall(false);
            break;
          case 'delete': case 'backspace':
            if (selectedPlayerId) {
              e.preventDefault();
              onPlayerDelete(selectedPlayerId);
            }
            break;
        }
      }
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, selectedPlayerId, onPlayerDelete, undo, redo, setSelectedPlayerId, setPositionToPlace, setIsPlacingBall]);
};
