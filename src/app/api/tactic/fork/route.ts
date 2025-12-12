// src/app/api/tactic/fork/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST - Fork a tactic (create a copy in user's collection)
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { tacticId, players, arrows, title, description, formation } = data;
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      console.log('Supabase not configured, fork saved locally');
      return NextResponse.json({
        message: 'Tactic forked locally (database not configured)',
        tacticId: 'local-fork-' + Date.now(),
      }, { status: 201 });
    }

    // If tacticId is provided, fetch the original tactic first
    let originalTactic = null;
    if (tacticId) {
      const { data: fetchedTactic, error: fetchError } = await supabase
        .from('tactics')
        .select('*')
        .eq('id', tacticId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching original tactic:', fetchError);
        return NextResponse.json({ error: 'Tactic not found' }, { status: 404 });
      }
      originalTactic = fetchedTactic;

      // Check if user already forked this tactic (get user profile first)
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
      
      if (profile?.username) {
        // Check if this user already has a forked version of this tactic
        const { data: existingFork } = await supabase
          .from('tactics')
          .select('id')
          .eq('author_username', profile.username)
          .eq('status', 'forked')
          .eq('title', fetchedTactic.title)
          .single();
        
        if (existingFork) {
          return NextResponse.json(
            { error: 'Bạn đã fork chiến thuật này rồi!' },
            { status: 400 }
          );
        }
      }
    }

    // Get tactic data from original or from request body
    const tacticPlayers = players || originalTactic?.players;
    const tacticArrows = arrows || originalTactic?.arrows || [];
    const tacticTitle = title || originalTactic?.title || 'Chiến thuật đã fork';
    const tacticDescription = description || originalTactic?.description || 'Fork từ bài viết';
    const tacticFormation = formation || originalTactic?.formation || null;

    if (!tacticPlayers || !Array.isArray(tacticPlayers)) {
      return NextResponse.json(
        { error: 'Missing required data (players)' },
        { status: 400 }
      );
    }

    // Get user profile to set as author
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, name, avatar_url')
      .eq('id', userId)
      .single();

    console.log('--- FORK DEBUG ---');
    console.log('User ID:', userId);
    console.log('Original tactic ID:', tacticId);
    console.log('Profile found:', profile?.username);

    // Set default values if profile not found
    const authorUsername = profile?.username || 'Anonymous';
    const authorName = profile?.name || profile?.username || 'Anonymous';
    const authorAvatar = profile?.avatar_url || '/assets/avatars/default.png';

    // Insert forked tactic
    const { data: newTactic, error } = await supabase
      .from('tactics')
      .insert({
        title: tacticTitle,
        description: tacticDescription,
        formation: tacticFormation,
        author_username: authorUsername,
        author_name: authorName,
        author_avatar: authorAvatar,
        players: tacticPlayers,
        arrows: tacticArrows,
        is_public: false, // Forked tactics are private by default
        status: 'forked', // Mark as forked tactic
      })
      .select()
      .single();

    if (error) {
      console.error('Fork error:', error.message);
      return NextResponse.json(
        { error: 'Failed to fork tactic: ' + error.message },
        { status: 500 }
      );
    }

    console.log('--- TACTIC FORKED ---');
    console.log(`New ID: ${newTactic.id}`);
    console.log(`By User: ${authorUsername}`);

    // Increment forks_count on the original tactic
    if (tacticId && originalTactic) {
      await supabase
        .from('tactics')
        .update({ forks_count: (originalTactic.forks_count || 0) + 1 })
        .eq('id', tacticId);
    }

    return NextResponse.json({
      message: 'Tactic successfully forked!',
      tacticId: newTactic.id,
      tactic: newTactic,
    }, { status: 201 });

  } catch (error) {
    console.error('Fork API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
