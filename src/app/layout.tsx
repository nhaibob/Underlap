// src/app/layout.tsx

import type { Metadata } from 'next';
import '@/styles/globals.css'; // Import Global Styles
import React from 'react';
// Import Modal component
import { CreateTacticModal } from '@/components/features/tactic-board/CreateTacticModal';
import { SettingsModal } from '@/components/core/SettingsModal';

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
        <html lang="vi" className="bg-background text-text-primary">
            <body>
                {children}

                {/* Render Modals */}
                <CreateTacticModal />
                <SettingsModal />
            </body>
        </html>
    );
}