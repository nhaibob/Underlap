// src/app/api/follow/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Check if user is following another user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');
    const userId = request.headers.get('x-user-id');

    if (!userId || !targetId) {
      return NextResponse.json({ isFollowing: false });
    }

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', targetId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Follow check error:', error);
      return NextResponse.json({ isFollowing: false });
    }

    return NextResponse.json({ isFollowing: !!data });
  } catch (error) {
    console.error('Follow check error:', error);
    return NextResponse.json({ isFollowing: false });
  }
}

// POST - Follow a user
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const { targetId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!targetId) {
      return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });
    }

    if (userId === targetId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', targetId)
      .single();

    if (existingFollow) {
      return NextResponse.json({ message: 'Already following', isFollowing: true });
    }

    // Create follow relationship
    const { error: insertError } = await supabase
      .from('follows')
      .insert({
        follower_id: userId,
        following_id: targetId
      });

    if (insertError) {
      console.error('Follow insert error:', insertError);
      return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Successfully followed', isFollowing: true });
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Unfollow a user
export async function DELETE(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!targetId) {
      return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', targetId);

    if (deleteError) {
      console.error('Unfollow error:', deleteError);
      return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Successfully unfollowed', isFollowing: false });
  } catch (error) {
    console.error('Unfollow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
