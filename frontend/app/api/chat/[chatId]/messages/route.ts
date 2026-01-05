/**
 * Chat Messages API Route
 * 
 * GET /api/chat/[chatId]/messages - Lade Nachrichten eines Chats
 * POST /api/chat/[chatId]/messages - Sende eine neue Nachricht
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/[chatId]/messages - Lade Nachrichten
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const supabase = await createClient();
    const chatId = params.chatId;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // Timestamp für Pagination

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat-ID fehlt' },
        { status: 400 }
      );
    }

    // Prüfe Authentifizierung
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Prüfe ob Benutzer Teilnehmer des Chats ist
    const { data: chat } = await supabase
      .from('chats')
      .select('user1_id, user2_id')
      .eq('id', chatId)
      .single();

    if (!chat || (chat.user1_id !== user.id && chat.user2_id !== user.id)) {
      return NextResponse.json(
        { error: 'Chat nicht gefunden oder Zugriff verweigert' },
        { status: 404 }
      );
    }

    // Baue Query auf
    let query = supabase
      .from('messages')
      .select('id, sender_id, content, timestamp, is_read, message_type')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    // Pagination: Lade Nachrichten vor einem bestimmten Timestamp
    if (before) {
      query = query.lt('timestamp', before);
    }

    const { data: messages, error: messagesError } = await query;

    if (messagesError) {
      console.error('[api/chat/[chatId]/messages] Fehler beim Laden der Nachrichten:', messagesError);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Nachrichten', details: messagesError.message },
        { status: 500 }
      );
    }

    // Markiere Nachrichten als gelesen (nur die, die nicht vom aktuellen Benutzer sind)
    if (messages && messages.length > 0) {
      const unreadMessageIds = messages
        .filter(msg => msg.sender_id !== user.id && !msg.is_read)
        .map(msg => msg.id);

      if (unreadMessageIds.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessageIds);
      }
    }

    // Formatiere Nachrichten für Frontend
    const formattedMessages = (messages || []).reverse().map(msg => ({
      id: msg.id,
      text: msg.content,
      sender: msg.sender_id === user.id ? 'me' : 'them',
      timestamp: new Date(msg.timestamp),
      type: msg.message_type || 'text',
      isRead: msg.is_read,
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      count: formattedMessages.length,
      hasMore: formattedMessages.length === limit,
    });

  } catch (error: any) {
    console.error('[api/chat/[chatId]/messages] Server-Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/[chatId]/messages - Sende eine neue Nachricht
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const supabase = await createClient();
    const chatId = params.chatId;

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat-ID fehlt' },
        { status: 400 }
      );
    }

    // Prüfe Authentifizierung
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, messageType = 'text' } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Nachrichteninhalt ist erforderlich' },
        { status: 400 }
      );
    }

    // Prüfe ob Benutzer Teilnehmer des Chats ist
    const { data: chat } = await supabase
      .from('chats')
      .select('user1_id, user2_id')
      .eq('id', chatId)
      .single();

    if (!chat || (chat.user1_id !== user.id && chat.user2_id !== user.id)) {
      return NextResponse.json(
        { error: 'Chat nicht gefunden oder Zugriff verweigert' },
        { status: 404 }
      );
    }

    // Erstelle Nachricht
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: user.id,
        content: content.trim(),
        message_type: messageType,
        is_read: false,
      })
      .select('id, sender_id, content, timestamp, is_read, message_type')
      .single();

    if (messageError) {
      console.error('[api/chat/[chatId]/messages] Fehler beim Senden der Nachricht:', messageError);
      return NextResponse.json(
        { error: 'Fehler beim Senden der Nachricht', details: messageError.message },
        { status: 500 }
      );
    }

    // Formatiere Nachricht für Frontend
    const formattedMessage = {
      id: message.id,
      text: message.content,
      sender: 'me' as const,
      timestamp: new Date(message.timestamp),
      type: message.message_type || 'text',
      isRead: message.is_read,
    };

    return NextResponse.json({
      success: true,
      message: formattedMessage,
    });

  } catch (error: any) {
    console.error('[api/chat/[chatId]/messages] Server-Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler', details: error?.message },
      { status: 500 }
    );
  }
}

