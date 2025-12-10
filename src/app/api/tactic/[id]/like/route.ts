// src/app/api/tactic/[id]/like/route.ts
import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// POST: Add like
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, username } = await request.json();
    
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('likes')
      .insert({
        tactic_id: params.id,
        user_id: userId,
        user_username: username
      })
      .select()
      .single();

    if (error) {
      // If already liked, return success anyway
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Already liked' });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Like error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove like
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await request.json();
    
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('tactic_id', params.id)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unlike error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Check if user liked
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ liked: false });
    }

    if (!userId) {
      return NextResponse.json({ liked: false });
    }

    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('tactic_id', params.id)
      .eq('user_id', userId)
      .single();

    return NextResponse.json({ liked: !!data });
  } catch (error) {
    return NextResponse.json({ liked: false });
  }
}
