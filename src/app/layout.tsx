// src/app/layout.tsx

import type { Metadata } from 'next';
import '@/styles/globals.css'; // Import Global Styles
import React from 'react';
// Import Modal component (vì nó cần được render ở cấp cao nhất)
import { CreateTacticModal } from '@/components/features/tactic-board/CreateTacticModal';
import { SettingsModal } from '@/components/core/SettingsModal';


// Metadata của ứng dụng
export const metadata: Metadata = {
    title: 'Underlap - Tactic Board',
    description: 'Sa bàn chiến thuật, cộng đồng và công cụ tạo sơ đồ.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // Thêm các class font và theme vào thẻ HTML/Body
        <html lang="vi" className="bg-background text-text-primary">
            <body>
                {children} {/* Nội dung trang (page.tsx, /feed, /login...) */}

                {/* Render Modals (Chúng cần ở cấp cao nhất) */}
                <CreateTacticModal />
                <SettingsModal />
            </body>
        </html>
    );
}