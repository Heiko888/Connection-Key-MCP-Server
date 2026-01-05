/**
 * Chat Details API Route
 * 
 * GET /api/chat/[chatId] - Lade Chat-Details und andere Benutzer-Informationen
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/[chatId] - Lade Chat-Details
 */
export async function GET(
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

    // Lade Chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('id, user1_id, user2_id, created_at, last_message_at')
      .eq('id', chatId)
      .maybeSingle();

    if (chatError || !chat) {
      return NextResponse.json(
        { error: 'Chat nicht gefunden' },
        { status: 404 }
      );
    }

    // Prüfe ob Benutzer Teilnehmer des Chats ist
    if (chat.user1_id !== user.id && chat.user2_id !== user.id) {
      return NextResponse.json(
        { error: 'Zugriff verweigert' },
        { status: 403 }
      );
    }

    // Bestimme den anderen Benutzer
    const otherUserId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
    
    // Lade Profil-Daten des anderen Benutzers
    const { data: otherUserProfile } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar, hd_type, profile')
      .eq('user_id', otherUserId)
      .maybeSingle();

    // Lade Profil-Daten aus matching_profiles (falls vorhanden)
    const { data: matchingProfile } = await supabase
      .from('matching_profiles')
      .select('name, age, location, bio, hd_type, profile, avatar')
      .eq('user_id', otherUserId)
      .eq('is_active', true)
      .single();

    // Kombiniere Daten
    const userData = {
      id: otherUserId,
      name: matchingProfile?.name || 
            (otherUserProfile?.first_name && otherUserProfile?.last_name
              ? `${otherUserProfile.first_name} ${otherUserProfile.last_name}`
              : otherUserProfile?.first_name || 'Unbekannt'),
      age: matchingProfile?.age || null,
      image: matchingProfile?.avatar || otherUserProfile?.avatar || null,
      hd_type: matchingProfile?.hd_type || otherUserProfile?.hd_type || null,
      profile: matchingProfile?.profile || otherUserProfile?.profile || null,
      location: matchingProfile?.location || null,
      bio: matchingProfile?.bio || null,
    };

    return NextResponse.json({
      success: true,
      chat: {
        id: chat.id,
        createdAt: chat.created_at,
        lastMessageAt: chat.last_message_at,
      },
      user: userData,
    });

  } catch (error: any) {
    console.error('[api/chat/[chatId]] Server-Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler', details: error?.message },
      { status: 500 }
    );
  }
}

