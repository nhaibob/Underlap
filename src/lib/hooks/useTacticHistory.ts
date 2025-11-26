// src/lib/hooks/useTacticHistory.ts
import { useState, useCallback, useEffect } from 'react';
import { Player, Arrow, Area } from '@/components/features/tactic-board/TacticBoard';

// Định nghĩa trạng thái tổng thể của sa bàn
export interface TacticState {
  players: Player[];
  arrows: Arrow[];
  areas: Area[];
}

export const useTacticHistory = (initialState: TacticState) => {
  // Lịch sử gồm: Quá khứ (past), Hiện tại (present), Tương lai (future - dùng cho redo)
  const [history, setHistory] = useState<{
    past: TacticState[];
    present: TacticState;
    future: TacticState[];
  }>({
    past: [],
    present: initialState,
    future: [],
  });

  // Hàm thực hiện thay đổi (lưu lại trạng thái cũ vào past)
  const setState = useCallback((newState: TacticState) => {
    setHistory((curr) => {
      // Nếu trạng thái mới giống hệt trạng thái cũ thì không lưu (tránh spam history)
      if (JSON.stringify(curr.present) === JSON.stringify(newState)) return curr;

      return {
        past: [...curr.past, curr.present], // Đẩy hiện tại vào quá khứ
        present: newState,                 // Cập nhật hiện tại mới
        future: [],                        // Xóa tương lai (vì đã rẽ nhánh mới)
      };
    });
  }, []);

  // Hàm Undo (Ctrl + Z)
  const undo = useCallback(() => {
    setHistory((curr) => {
      if (curr.past.length === 0) return curr; // Không còn gì để undo

      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, curr.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future], // Đẩy hiện tại vào tương lai
      };
    });
  }, []);

  // Hàm Redo (Ctrl + Y hoặc Ctrl + Shift + Z)
  const redo = useCallback(() => {
    setHistory((curr) => {
      if (curr.future.length === 0) return curr; // Không còn gì để redo

      const next = curr.future[0];
      const newFuture = curr.future.slice(1);

      return {
        past: [...curr.past, curr.present], // Đẩy hiện tại vào quá khứ
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Hàm Reset toàn bộ
  const reset = useCallback((emptyState: TacticState) => {
      setHistory({
          past: [],
          present: emptyState,
          future: []
      });
  }, []);

  // Lắng nghe sự kiện bàn phím (Keyboard Shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Kiểm tra nếu đang nhập liệu vào input/textarea thì không undo
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo(); // Ctrl + Shift + Z
        } else {
          undo(); // Ctrl + Z
        }
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo(); // Ctrl + Y
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
};