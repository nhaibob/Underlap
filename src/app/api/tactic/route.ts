// src/app/api/tactic/route.ts
import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_POST_DATA } from '@/lib/mock-data';

// GET - Fetch all public tactics for feed
export async function GET() {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      console.log('Supabase not configured, using mock data');
      return NextResponse.json([MOCK_POST_DATA], { status: 200 });
    }

    console.log('Fetching tactics from Supabase...');

    // Try to fetch from Supabase
    const { data: tactics, error } = await supabase
      .from('tactics')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.warn('Supabase fetch error, using mock data:', error.message);
      return NextResponse.json([MOCK_POST_DATA], { status: 200 });
    }

    console.log(`Found ${tactics?.length || 0} tactics in database`);

    if (!tactics || tactics.length === 0) {
      console.log('No tactics found, using mock data');
      return NextResponse.json([MOCK_POST_DATA], { status: 200 });
    }

    // Transform data to match frontend expected format
    const formattedTactics = tactics.map(tactic => ({
      id: tactic.id,
      title: tactic.title,
      description: tactic.description,
      formation: tactic.formation,
      createdAt: tactic.created_at,
      tags: tactic.tags || [],
      author: {
        username: tactic.author_username || 'Anonymous',
        name: tactic.author_name || tactic.author_username || 'Anonymous',
        avatarUrl: tactic.author_avatar || '/assets/avatars/huyson.png',
      },
      stats: {
        likes: tactic.likes_count || 0,
        comments: tactic.comments_count || 0,
        forks: tactic.forks_count || 0,
      },
      tacticData: {
        players: tactic.players || [],
        arrows: tactic.arrows || [],
      },
    }));

    console.log('Returning tactics from database');
    return NextResponse.json(formattedTactics, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json([MOCK_POST_DATA], { status: 200 });
  }
}

// POST - Create a new tactic
export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.players || !data.arrows || !data.metadata) {
      return NextResponse.json(
        { error: 'Missing required data fields (players, arrows, metadata)' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      console.log('Supabase not configured, saving locally');
      return NextResponse.json({
        message: 'Tactic saved locally (database not configured)',
        tacticId: 'local-' + Date.now(),
        receivedData: data,
      }, { status: 201 });
    }

    // Insert tactic without user_id foreign key (simplified for demo)
    const { data: newTactic, error } = await supabase
      .from('tactics')
      .insert({
        title: data.metadata.title || 'Untitled Tactic',
        description: data.metadata.description || null,
        formation: data.metadata.formation || null,
        author_username: data.metadata.authorUsername || 'HuySon',
        author_name: data.metadata.authorName || 'Huy Sơn',
        author_avatar: data.metadata.authorAvatar || '/assets/avatars/huyson.png',
        players: data.players,
        arrows: data.arrows,
        is_public: data.metadata.isPublic !== false,
      })
      .select()
      .single();

    if (error) {
      console.warn('Supabase insert error:', error.message);
      return NextResponse.json({
        message: 'Tactic saved locally (database error: ' + error.message + ')',
        tacticId: 'local-' + Date.now(),
        receivedData: data,
      }, { status: 201 });
    }

    console.log('--- TACTIC SAVED TO DATABASE ---');
    console.log(`ID: ${newTactic.id}`);
    console.log(`Title: ${newTactic.title}`);

    return NextResponse.json({
      message: 'Tactic successfully published!',
      tacticId: newTactic.id,
      tactic: newTactic,
    }, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}