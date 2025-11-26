import React from 'react';
import { PostCard } from '@/components/core/PostCard'; 
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// [QUAN TRỌNG] Dòng này sửa lỗi "Dynamic server usage" và lỗi fetch localhost khi build
// Nó ép buộc trang này chỉ được render trên server khi có request thực tế
export const dynamic = 'force-dynamic';

interface PostData {
    id: string;
    title: string;
    description: string;
    createdAt?: string;
    author: { 
        username: string; 
        avatarUrl: string; 
        name?: string;
    };
    stats: { 
        likes: number; 
        comments: number; 
        forks: number; 
    };
    tacticData: {
        players: any[]; 
        arrows: any[]; 
    };
}

async function getFeedData(): Promise<PostData[]> {
    // Lưu ý: Khi chạy local, biến môi trường này có thể chưa có.
    // Đảm bảo bạn truy cập đúng port (thường là 3000)
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    try {
        const res = await fetch(`${apiUrl}/api/tactic`, {
            cache: 'no-store' 
        });
        
        if (!res.ok) {
            // Log nhẹ để debug nhưng trả về mảng rỗng để không crash UI
            console.warn("Feed data fetch warning:", res.status);
            return [];
        }
        
        const data = await res.json();
        return Array.isArray(data) ? data : [data]; 

    } catch (e) {
        // Lỗi này thường xảy ra lúc build vì localhost chưa chạy -> Return rỗng là an toàn nhất
        console.warn("Skipping feed fetch during build or network error.");
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
                    <p className="mb-4">Chưa có bài đăng nào hoặc không thể kết nối đến server.</p>
                    <Link href="/">
                        <Button variant="default">Tạo ngay</Button>
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4 md:p-6">
            
            <h1 className="font-headline text-2xl font-bold mb-6">Feed</h1>
            
            <div className="p-4 rounded-lg bg-panel mb-6 border border-white/10">
                <textarea
                    className="w-full bg-transparent text-text-primary placeholder:text-text-secondary focus:outline-none resize-none"
                    placeholder="Bạn đang nghĩ gì về chiến thuật hôm nay?"
                    rows={2}
                />
                <div className="flex justify-end mt-3">
                    <Button variant="secondary">Bắt đầu đăng</Button>
                </div>
            </div>

            <div className="space-y-6">
                {feedData.map((post) => (
                    <PostCard 
                        key={post.id} 
                        author={{
                            name: post.author.name || post.author.username,
                            username: post.author.username,
                            avatar: post.author.avatarUrl
                        }}
                        content={`**${post.title}**\n\n${post.description}`}
                        timestamp={post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : "Vừa xong"}
                        likes={post.stats.likes}
                        comments={post.stats.comments}
                        tacticData={post.tacticData}
                    />
                ))}
            </div>
            
        </div>
    );
}