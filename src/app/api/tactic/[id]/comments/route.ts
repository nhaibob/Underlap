// src/app/api/tactic/[id]/comments/route.ts
import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET: Fetch comments for a tactic
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('tactic_id', params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Fetch comments error:', error);
    return NextResponse.json([]);
  }
}

// POST: Add a comment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, username, name, avatar, content } = await request.json();
    
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        tactic_id: params.id,
        user_id: userId,
        user_username: username,
        user_name: name || username,
        user_avatar: avatar,
        content: content.trim()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Add comment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
