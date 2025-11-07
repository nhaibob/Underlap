// src/app/(main)/feed/page.tsx
import React from 'react';
import { PostCard } from '@/components/core/PostCard'; 
import { Button } from '@/components/ui/Button';
import Link from 'next/link'; // Cần import Link nếu chưa có

// Khai báo kiểu dữ liệu cho Post (Đơn giản hóa)
interface PostData {
    id: string;
    title: string;
    description: string;
    author: { username: string; avatarUrl: string; };
    stats: { likes: number; comments: number; forks: number; };
    tacticData: {
        players: any[]; 
        arrows: any[]; 
    };
}

// Hàm fetch data phía Server Component
async function getFeedData(): Promise<PostData[]> {
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    try {
        const res = await fetch(`${apiUrl}/api/tactic`, {
            cache: 'no-store' 
        });
        
        if (!res.ok) {
            console.error("Failed to fetch feed data:", res.status, res.statusText);
            return [];
        }
        
        const data = await res.json();
        
        return Array.isArray(data) ? data : [data]; 

    } catch (e) {
        console.error("Error fetching feed:", e);
        return [];
    }
}


export default async function FeedPage() {
    const feedData = await getFeedData();
    
    if (feedData.length === 0) {
        return (
            <div className="p-4 md:p-6 text-center text-text-secondary">
                <h1 className="font-headline text-2xl font-bold mb-6">Feed</h1>
                <div className="p-8 rounded-lg bg-panel border border-white/10">
                    <p className="mb-4">Chưa có bài đăng nào. Hãy là người đầu tiên tạo chiến thuật!</p>
                    <Button variant="primary">Tạo ngay</Button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4 md:p-6">
            
            <h1 className="font-headline text-2xl font-bold mb-6">Feed</h1>
            
            {/* Placeholder cho Post Composer */}
            <div className="p-4 rounded-lg bg-panel mb-6 border border-white/10">
                <textarea
                    className="w-full bg-transparent text-text-primary placeholder:text-text-secondary focus:outline-none resize-none"
                    placeholder="Bạn đang nghĩ gì về chiến thuật hôm nay?"
                    rows={2}
                />
                <div className="flex justify-end mt-3">
                    {/* SỬA LỖI SIZE: Đã xóa size="sm" */}
                    <Button variant="secondary">Bắt đầu đăng</Button>
                </div>
            </div>

            {/* HIỂN THỊ CÁC POSTCARD DỰA TRÊN DỮ LIỆU */}
            <div className="space-y-6">
                {feedData.map((post) => (
                    <PostCard 
                        key={post.id} 
                        postTitle={post.title}
                        postDescription={post.description}
                        authorUsername={post.author.username}
                        stats={post.stats}
                    />
                ))}
            </div>
            
        </div>
    );
}