import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Runtime-Konfiguration: Node.js Runtime erzwingen (nicht Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Factory-Funktion für Supabase-Client (wird erst zur Laufzeit erstellt)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Verwende SERVICE_ROLE_KEY wenn vorhanden, sonst ANON_KEY für Entwicklung
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) must be set.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// GET - Alle Friends eines Users laden
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Lade alle Friendships des Users
    const { data: friendships, error: friendshipsError } = await supabase
      .from('friendships')
      .select(`
        *,
        friend:friends (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (friendshipsError) {
      console.error('Error loading friendships:', friendshipsError);
      return NextResponse.json(
        { error: 'Failed to load friends' },
        { status: 500 }
      );
    }

    // Transformiere Daten für Frontend
    const friends = friendships?.map((fs: any) => ({
      id: fs.friend.id,
      name: fs.friend.name,
      email: fs.friend.email,
      avatar: fs.friend.avatar,
      location: fs.friend.location,
      age: fs.friend.age,
      hdType: fs.friend.hd_type,
      hdProfile: fs.friend.hd_profile,
      hdAuthority: fs.friend.hd_authority,
      hdStrategy: fs.friend.hd_strategy,
      bio: fs.friend.bio,
      interests: fs.friend.interests || [],
      isOnline: fs.friend.is_online,
      lastSeen: fs.friend.last_seen,
      status: fs.friend.status,
      compatibility: fs.compatibility,
      mutualFriends: fs.mutual_friends,
      connectionType: fs.connection_type,
      friendshipId: fs.id
    })) || [];

    return NextResponse.json({ success: true, friends });
  } catch (error) {
    console.error('Error in GET /api/friends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Neuen Friend hinzufügen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, friendData } = body;

    if (!userId || !friendData) {
      return NextResponse.json(
        { error: 'User ID and friend data are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 1. Erstelle Friend-Profil
    const { data: friend, error: friendError } = await supabase
      .from('friends')
      .insert({
        user_id: userId,
        name: friendData.name,
        email: friendData.email,
        avatar: friendData.avatar,
        location: friendData.location,
        age: friendData.age,
        hd_type: friendData.hdType,
        hd_profile: friendData.hdProfile,
        hd_authority: friendData.hdAuthority,
        hd_strategy: friendData.hdStrategy,
        bio: friendData.bio,
        interests: friendData.interests || [],
        birth_date: friendData.birthDate,
        birth_time: friendData.birthTime,
        birth_place: friendData.birthPlace,
        is_online: false,
        status: 'offline'
      })
      .select()
      .single();

    if (friendError) {
      console.error('Error creating friend:', friendError);
      return NextResponse.json(
        { error: 'Failed to create friend' },
        { status: 500 }
      );
    }

    // 2. Erstelle Friendship
    const { data: friendship, error: friendshipError } = await supabase
      .from('friendships')
      .insert({
        user_id: userId,
        friend_id: friend.id,
        status: 'accepted',
        compatibility: friendData.compatibility || 0,
        connection_type: friendData.connectionType || 'friend'
      })
      .select()
      .single();

    if (friendshipError) {
      console.error('Error creating friendship:', friendshipError);
      return NextResponse.json(
        { error: 'Failed to create friendship' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      friend: {
        id: friend.id,
        name: friend.name,
        hdType: friend.hd_type,
        hdProfile: friend.hd_profile,
        hdAuthority: friend.hd_authority,
        hdStrategy: friend.hd_strategy,
        friendshipId: friendship.id
      }
    });
  } catch (error) {
    console.error('Error in POST /api/friends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Friend entfernen
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const friendshipId = searchParams.get('friendshipId');
    
    if (!friendshipId) {
      return NextResponse.json(
        { error: 'Friendship ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) {
      console.error('Error deleting friendship:', error);
      return NextResponse.json(
        { error: 'Failed to delete friendship' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/friends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

