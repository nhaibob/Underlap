// src/app/layout.tsx

import type { Metadata } from 'next';
import '@/styles/globals.css';
import React from 'react';
import { SessionProvider } from '@/components/providers/SessionProvider';
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
        <html lang="vi" className="dark bg-background text-text-primary">
            <body>
                <SessionProvider>
                    {children}

                    {/* Render Modals */}
                    <CreateTacticModal />
                    <SettingsModal />
                </SessionProvider>
            </body>
        </html>
    );
}