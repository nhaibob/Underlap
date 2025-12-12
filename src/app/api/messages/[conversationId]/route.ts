// src/app/api/messages/[conversationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Get messages in a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify user is participant
    const { data: participation, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', params.conversationId)
      .eq('user_id', userId)
      .single();

    if (partError || !participation) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get messages with sender info
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        tactic_data,
        is_suggestion,
        original_message_id,
        reply_to_id,
        created_at,
        sender_id,
        profiles:sender_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('conversation_id', params.conversationId)
      .order('created_at', { ascending: true });

    if (msgError) throw msgError;

    // Update last_read_at
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', params.conversationId)
      .eq('user_id', userId);

    // Get conversation participants
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select(`
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('conversation_id', params.conversationId);

    return NextResponse.json({
      messages: messages || [],
      participants: participants?.map(p => p.profiles) || []
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify user is participant
    const { data: participation } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', params.conversationId)
      .eq('user_id', userId)
      .single();

    if (!participation) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { content, tacticData, isSuggestion, originalMessageId, replyToId } = await request.json();

    if (!content && !tacticData) {
      return NextResponse.json({ error: 'Content or tacticData required' }, { status: 400 });
    }

    // Insert message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: params.conversationId,
        sender_id: userId,
        content,
        tactic_data: tacticData || null,
        is_suggestion: isSuggestion || false,
        original_message_id: originalMessageId || null,
        reply_to_id: replyToId || null
      })
      .select(`
        id,
        content,
        tactic_data,
        is_suggestion,
        original_message_id,
        reply_to_id,
        created_at,
        sender_id,
        profiles:sender_id (
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (msgError) throw msgError;

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', params.conversationId);

    return NextResponse.json(message);
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const userId = request.headers.get('x-user-id');
  const { searchParams } = new URL(request.url);
  const messageId = searchParams.get('messageId');
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!messageId) {
    return NextResponse.json({ error: 'messageId required' }, { status: 400 });
  }

  try {
    // Get the message to verify ownership
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .select('id, sender_id')
      .eq('id', messageId)
      .eq('conversation_id', params.conversationId)
      .single();

    if (msgError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Only sender can delete their message
    if (message.sender_id !== userId) {
      return NextResponse.json({ error: 'Not authorized to delete this message' }, { status: 403 });
    }

    // Delete the message
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
