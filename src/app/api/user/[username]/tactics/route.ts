// src/app/api/user/[username]/tactics/route.ts
import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: Fetch tactics by username with optional status filter
export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json([]);
    }

    // Get status filter from query params
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // Build query
    let query = supabase
      .from('tactics')
      .select('*')
      .eq('author_username', params.username)
      .order('created_at', { ascending: false });

    // Apply status filter if provided
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform to match expected format
    const tactics = (data || []).map(tactic => ({
      id: tactic.id,
      title: tactic.title,
      description: tactic.description,
      formation: tactic.formation,
      createdAt: tactic.created_at,
      status: tactic.status || 'published', // Include status in response
      isPublic: tactic.is_public,
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
