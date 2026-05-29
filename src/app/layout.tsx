import type { Metadata } from 'next';
import '@/styles/globals.css';
import React from 'react';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { CreateTacticModal } from '@/components/features/tactic-board/CreateTacticModal';
import { SettingsModal } from '@/components/core/SettingsModal';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { PageTransition } from '@/components/layout/PageTransition';

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
        <html lang="vi" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
            <body className="bg-background text-text-primary antialiased font-sans">
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