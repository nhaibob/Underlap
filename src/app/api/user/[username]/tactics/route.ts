// src/app/api/user/[username]/tactics/route.ts
import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET: Fetch tactics by username
export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from('tactics')
      .select('*')
      .eq('author_username', params.username)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform to match expected format
    const tactics = (data || []).map(tactic => ({
      id: tactic.id,
      title: tactic.title,
      description: tactic.description,
      formation: tactic.formation,
      createdAt: tactic.created_at,
      author: {
        username: tactic.author_username,
        name: tactic.author_name,
        avatarUrl: tactic.author_avatar
      },
      stats: {
        likes: tactic.likes_count || 0,
        comments: tactic.comments_count || 0,
        views: tactic.views_count || 0
      },
      tacticData: {
        players: tactic.players || [],
        arrows: tactic.arrows || []
      },
      tags: tactic.tags || []
    }));

    return NextResponse.json(tactics);
  } catch (error: any) {
    console.error('Fetch user tactics error:', error);
    return NextResponse.json([]);
  }
}
