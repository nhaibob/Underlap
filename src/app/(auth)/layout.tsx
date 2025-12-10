// src/app/(auth)/layout.tsx
import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
            {/* Animated Background Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 -right-40 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header */}
            <header className="relative z-10 p-6">
                <Link href="/" className="inline-flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">U</span>
                    </div>
                    <span className="font-headline text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        Underlap
                    </span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    {/* Glass Card */}
                    <div className="backdrop-blur-xl bg-card/50 border border-white/10 rounded-2xl p-8 shadow-2xl shadow-primary/5">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 p-6 text-center text-sm text-muted-foreground">
                © 2024 Underlap. Tactics, Community, Victory.
            </footer>
        </div>
    );
}