// src/components/core/SettingsModal.tsx
"use client"; 
import React, { useState, useEffect } from 'react'; // THÊM: import useState, useEffect
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

  // === BẮT ĐẦU SỬA LỖI HYDRATION ===
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Không render gì cho đến khi component đã mount
  }
  // === KẾT THÚC SỬA LỖI HYDRATION ===

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

        {/* Tab 3: Thông báo */}
        <TabsContent value="notifications">
          <div className="mt-4 space-y-4">
            <h3 className="text-lg font-semibold">Cài đặt thông báo</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-panel">
                <div>
                  <p className="text-sm font-medium">Theo dõi mới</p>
                  <p className="text-xs text-text-secondary">Thông báo khi có người follow bạn</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-panel">
                <div>
                  <p className="text-sm font-medium">Lượt thích</p>
                  <p className="text-xs text-text-secondary">Thông báo khi có người thích tactic của bạn</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-panel">
                <div>
                  <p className="text-sm font-medium">Bình luận</p>
                  <p className="text-xs text-text-secondary">Thông báo khi có người bình luận</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-panel">
                <div>
                  <p className="text-sm font-medium">Tin nhắn</p>
                  <p className="text-xs text-text-secondary">Thông báo khi có tin nhắn mới</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
              </div>
            </div>
            
            <p className="text-xs text-text-secondary mt-4">
              * Cài đặt này hiện chỉ là giao diện. Chức năng lưu sẽ được bổ sung sau.
            </p>
          </div>
        </TabsContent>

      </Tabs>
    </Modal>
  );
}