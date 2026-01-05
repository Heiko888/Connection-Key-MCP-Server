/**
 * Chat API Routes
 * 
 * GET /api/chat - Lade alle Chats des aktuellen Benutzers
 * POST /api/chat - Erstelle einen neuen Chat oder finde bestehenden
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/chat - Lade alle Chats des aktuellen Benutzers
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Prüfe Authentifizierung
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Lade alle Chats des Benutzers
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('id, user1_id, user2_id, created_at, last_message_at')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (chatsError) {
      console.error('[api/chat] Fehler beim Laden der Chats:', chatsError);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Chats', details: chatsError.message },
        { status: 500 }
      );
    }

    // Lade die letzte Nachricht für jeden Chat
    const chatsWithLastMessage = await Promise.all(
      (chats || []).map(async (chat) => {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, timestamp, sender_id')
          .eq('chat_id', chat.id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Bestimme den anderen Benutzer
        const otherUserId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
        
        // Lade Profil-Daten des anderen Benutzers
        const { data: otherUserProfile } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar')
          .eq('user_id', otherUserId)
          .maybeSingle();
        
        // Versuche auch matching_profiles
        const { data: matchingProfile } = await supabase
          .from('matching_profiles')
          .select('name, avatar')
          .eq('user_id', otherUserId)
          .eq('is_active', true)
          .maybeSingle();

        // Zähle ungelesene Nachrichten
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .eq('is_read', false)
          .neq('sender_id', user.id);

        return {
          id: chat.id,
          otherUser: {
            id: otherUserId,
            name: matchingProfile?.name || 
                  (otherUserProfile?.first_name && otherUserProfile?.last_name
                    ? `${otherUserProfile.first_name} ${otherUserProfile.last_name}`
                    : otherUserProfile?.first_name || 'Unbekannt'),
            avatar: matchingProfile?.avatar || otherUserProfile?.avatar || null,
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            timestamp: lastMessage.timestamp,
            isFromMe: lastMessage.sender_id === user.id,
          } : null,
          unreadCount: unreadCount || 0,
          createdAt: chat.created_at,
          lastMessageAt: chat.last_message_at,
        };
      })
    );

    return NextResponse.json({
      success: true,
      chats: chatsWithLastMessage,
      count: chatsWithLastMessage.length,
    });

  } catch (error: any) {
    console.error('[api/chat] Server-Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat - Erstelle einen neuen Chat oder finde bestehenden
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Prüfe Authentifizierung
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { otherUserId } = body;

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'otherUserId ist erforderlich' },
        { status: 400 }
      );
    }

    if (otherUserId === user.id) {
      return NextResponse.json(
        { error: 'Du kannst keinen Chat mit dir selbst erstellen' },
        { status: 400 }
      );
    }

    // Prüfe ob Chat bereits existiert
    const { data: existingChat } = await supabase
      .from('chats')
      .select('id, user1_id, user2_id')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
      .single();

    if (existingChat) {
      // Chat existiert bereits
      return NextResponse.json({
        success: true,
        chat: {
          id: existingChat.id,
          alreadyExists: true,
        },
      });
    }

    // Erstelle neuen Chat
    const { data: newChat, error: createError } = await supabase
      .from('chats')
      .insert({
        user1_id: user.id,
        user2_id: otherUserId,
      })
      .select('id')
      .single();

    if (createError) {
      console.error('[api/chat] Fehler beim Erstellen des Chats:', createError);
      return NextResponse.json(
        { error: 'Fehler beim Erstellen des Chats', details: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      chat: {
        id: newChat.id,
        alreadyExists: false,
      },
    });

  } catch (error: any) {
    console.error('[api/chat] Server-Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler', details: error?.message },
      { status: 500 }
    );
  }
}

