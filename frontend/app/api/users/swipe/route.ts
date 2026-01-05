import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logger } from '@/lib/utils/logger';

// Runtime-Konfiguration: Node.js Runtime erzwingen (nicht Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      logger.error('Unauthorized access to /api/users/swipe', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { targetUserId, targetFriendId, action } = body; // action: 'like' or 'pass'

    if (!targetUserId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Bei "like" wird eine Friendship erstellt
    if (action === 'like') {
      // Prüfe ob der andere User uns auch geliket hat
      const { data: reciprocalLike, error: checkError } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('friend_id', user.id)
        .single();

      const isMatch = !!reciprocalLike;

      // Erstelle unsere Friendship
      const { data: newFriendship, error: friendshipError } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: targetFriendId,
          status: isMatch ? 'accepted' : 'pending',
          connection_type: isMatch ? 'match' : 'like',
          compatibility: Math.floor(Math.random() * 40) + 60 // Zufälliger Score für jetzt
        })
        .select()
        .single();

      if (friendshipError) {
        logger.error('Error creating friendship:', friendshipError);
        return NextResponse.json({ error: friendshipError.message }, { status: 500 });
      }

      // Wenn Match, update auch die andere Friendship zu "accepted"
      if (isMatch && reciprocalLike) {
        await supabase
          .from('friendships')
          .update({
            status: 'accepted',
            connection_type: 'match'
          })
          .eq('id', reciprocalLike.id);
      }

      logger.info(`User ${user.id} liked ${targetUserId}. Match: ${isMatch}`);

      return NextResponse.json({
        success: true,
        action: 'like',
        isMatch,
        friendship: newFriendship
      });
    }

    // Bei "pass" erstellen wir auch einen Eintrag (um den User nicht wieder anzuzeigen)
    if (action === 'pass') {
      const { data: pass, error: passError } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: targetFriendId,
          status: 'blocked', // Verwende "blocked" für "passed" User
          connection_type: 'pass'
        })
        .select()
        .single();

      if (passError) {
        logger.error('Error recording pass:', passError);
        return NextResponse.json({ error: passError.message }, { status: 500 });
      }

      logger.info(`User ${user.id} passed on ${targetUserId}`);

      return NextResponse.json({
        success: true,
        action: 'pass',
        pass
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    logger.error('Failed to process swipe:', error);
    return NextResponse.json({ error: 'Failed to process swipe' }, { status: 500 });
  }
}

