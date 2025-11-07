// src/components/core/SettingsModal.tsx
"use client"; // Cần "use client" vì đây là component tương tác
import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { useUIStore } from '@/lib/store/uiStore';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/Tabs'; // Tái sử dụng Tabs

export const SettingsModal = () => {
  // Lấy trạng thái từ store (Zustand)
  const { isSettingsModalOpen, closeSettingsModal } = useUIStore();

  return (
    <Modal isOpen={isSettingsModalOpen} onClose={closeSettingsModal} className="max-w-xl">
      <h2 className="font-headline text-2xl font-bold mb-4">
        Cài đặt
      </h2>
      
      <Tabs defaultValue="appearance">
        
        <TabsList>
          <TabsTrigger value="appearance">Giao diện</TabsTrigger>
          <TabsTrigger value="privacy">Riêng tư</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
        </TabsList>

        {/* Tab 1: Giao diện */}
        <TabsContent value="appearance">
          <h3 className="text-lg font-semibold mt-4">Theme</h3>
          <p className="text-sm text-text-secondary">
            Hiện tại chỉ hỗ trợ giao diện Tối (Dark Mode).
          </p>
          {/* (Placeholder cho Nút chọn Theme) */}
          <div className="mt-2 p-3 rounded-lg bg-background border border-panel">
            Dark Mode (Mặc định)
          </div>
        </TabsContent>

        {/* Tab 2: Riêng tư (Placeholder) */}
        <TabsContent value="privacy">
          <p className="mt-6 text-text-secondary">Cài đặt riêng tư sẽ sớm có mặt.</p>
        </TabsContent>

        {/* Tab 3: Thông báo (Placeholder) */}
        <TabsContent value="notifications">
          <p className="mt-6 text-text-secondary">Cài đặt thông báo sẽ sớm có mặt.</p>
        </TabsContent>
      </Tabs>
    </Modal>
  );
};