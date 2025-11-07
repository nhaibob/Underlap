// src/lib/mock-data.ts
import { Player, Arrow } from '@/components/features/tactic-board/TacticBoard';

// Dữ liệu mẫu (mock data) cho một bài đăng
export const MOCK_POST_DATA = {
    id: 'tactic-001',
    title: 'Phản công cánh phải (4-3-3)',
    description: 'Sơ đồ tập trung vào khả năng chuyển đổi trạng thái nhanh từ DM sang RW.',
    author: {
        username: 'HuySon',
        avatarUrl: '/assets/avatars/huyson.png',
    },
    stats: {
        likes: 15,
        comments: 3,
        forks: 5,
    },
    // Dữ liệu Tactic Board
    tacticData: {
        players: [
            { id: 'p1', position: 'GK', label: 'GK', pos: { x: 50, y: 200 } },
            { id: 'p2', position: 'CB', label: 'CB1', pos: { x: 150, y: 150 } },
            { id: 'p3', position: 'CM', label: 'CM', pos: { x: 280, y: 200 } },
            { id: 'p4', position: 'RW', label: 'RW', pos: { x: 450, y: 100 } },
        ] as Player[],
        arrows: [
            { id: 'a1', from: { x: 50, y: 200 }, to: { x: 450, y: 100 }, color: '#6C5CE7', style: 'solid', type: 'straight' },
        ] as Arrow[],
    },
};