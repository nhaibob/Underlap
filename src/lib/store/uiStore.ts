// src/lib/store/uiStore.ts
import { create } from 'zustand';

// 1. Nâng cấp Interface (thêm Settings)
interface UIState {
  // Create Modal
  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  
  // Settings Modal (PHẦN MỚI)
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
}

// 2. Cập nhật Store (thêm state/hàm cho Settings)
export const useUIStore = create<UIState>((set) => ({
  // Create Modal
  isCreateModalOpen: false,
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  
  // Settings Modal (PHẦN MỚI)
  isSettingsModalOpen: false, // Mặc định là đóng
  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),
}));