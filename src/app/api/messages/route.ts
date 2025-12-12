// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - List user's conversations
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get conversations for this user with participant info and last message
    const { data: participations, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (partError) throw partError;

    const conversationIds = participations?.map(p => p.conversation_id) || [];

    if (conversationIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get conversations with participants
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        created_at,
        updated_at
      `)
      .in('id', conversationIds)
      .order('updated_at', { ascending: false });

    if (convError) throw convError;

    // Get participants for each conversation  
    const conversationsWithDetails = await Promise.all(
      (conversations || []).map(async (conv) => {
        // Get other participants
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select(`
            user_id,
            profiles:user_id (
              id,
              username,
              avatar_url
            )
          `)
          .eq('conversation_id', conv.id)
          .neq('user_id', userId);

        // Get last message
        const { data: lastMessages } = await supabase
          .from('messages')
          .select('id, content, tactic_data, created_at, sender_id')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Get unread count
        const { data: myParticipation } = await supabase
          .from('conversation_participants')
          .select('last_read_at')
          .eq('conversation_id', conv.id)
          .eq('user_id', userId)
          .single();

        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .gt('created_at', myParticipation?.last_read_at || '1970-01-01');

        return {
          id: conv.id,
          updatedAt: conv.updated_at,
          participants: participants?.map(p => p.profiles) || [],
          lastMessage: lastMessages?.[0] || null,
          unreadCount: unreadCount || 0
        };
      })
    );

    return NextResponse.json(conversationsWithDetails);
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new conversation or get existing one
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { participantId } = await request.json();

    if (!participantId) {
      return NextResponse.json({ error: 'participantId required' }, { status: 400 });
    }

    // Check if conversation already exists between these users
    const { data: existingParticipations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    const myConversationIds = existingParticipations?.map(p => p.conversation_id) || [];

    if (myConversationIds.length > 0) {
      const { data: otherParticipation } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', participantId)
        .in('conversation_id', myConversationIds)
        .single();

      if (otherParticipation) {
        // Conversation already exists
        return NextResponse.json({ 
          conversationId: otherParticipation.conversation_id,
          isNew: false 
        });
      }
    }

    // Create new conversation
    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (convError) throw convError;

    // Add participants
    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConv.id, user_id: userId },
        { conversation_id: newConv.id, user_id: participantId }
      ]);

    if (partError) throw partError;

    return NextResponse.json({ 
      conversationId: newConv.id,
      isNew: true 
    });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
