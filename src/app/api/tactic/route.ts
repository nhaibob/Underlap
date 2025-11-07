// src/app/api/tactic/route.ts
import { NextResponse } from 'next/server';
import { MOCK_POST_DATA } from '@/lib/mock-data'; // SỬA LỖI #1: IMPORT MOCK DATA

// Xử lý POST request (Khi người dùng đăng bài)
export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.players || !data.arrows || !data.metadata) {
      return NextResponse.json({ error: 'Missing required data fields (players, arrows, metadata)' }, { status: 400 });
    }

    console.log('--- RECEIVED TACTIC DATA ---');
    console.log(`Title: ${data.metadata.title}`);
    console.log(`Players Count: ${data.players.length}`);
    console.log('----------------------------');

    return NextResponse.json({ 
        message: 'Tactic successfully published!', 
        tacticId: 'new-tactic-123',
        receivedData: data
    }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Xử lý GET request (Giả lập lấy danh sách feed/post)
export async function GET() {
    const MOCK_POST = MOCK_POST_DATA; 
    
    // TRẢ VỀ DỮ LIỆU TRONG MẢNG
    return NextResponse.json([MOCK_POST], { status: 200 });
}