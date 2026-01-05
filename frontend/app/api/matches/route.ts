import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Runtime-Konfiguration: Node.js Runtime erzwingen (nicht Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Factory-Funktion für Supabase-Client (wird erst zur Laufzeit erstellt)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) must be set.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Lade alle aktiven Profile aus der Datenbank
    const { data: profiles, error } = await supabase
      .from('matching_profiles')
      .select('*')
      .eq('is_active', true)
      .limit(limit);

    if (error) {
      console.error('Error fetching profiles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: error.message },
        { status: 500 }
      );
    }

    // Transformiere die Datenbank-Daten in das Match-Format
    const matches = profiles?.map(profile => {
      // Berechne Kompatibilität (vereinfacht - könnte später komplexer sein)
      const compatibility = Math.floor(Math.random() * 20) + 75; // 75-95%
      
      // Parse JSONB-Felder
      const interests = Array.isArray(profile.interests) 
        ? profile.interests 
        : (typeof profile.interests === 'string' ? JSON.parse(profile.interests) : []);
      
      const images = Array.isArray(profile.images)
        ? profile.images
        : (typeof profile.images === 'string' ? JSON.parse(profile.images) : []);

      return {
        id: profile.id,
        userId: profile.user_id,
        name: profile.name,
        age: profile.age,
        location: profile.location || 'Unbekannt',
        avatar: profile.avatar || '/api/placeholder/60/60',
        profile_images: images.map((url: string, index: number) => ({
          id: `${profile.id}-${index}`,
          url: url,
          is_primary: index === 0,
          uploaded_at: profile.created_at,
          order: index,
          alt_text: `${profile.name} - Bild ${index + 1}`
        })),
        hdType: profile.hd_type || 'Generator',
        compatibility: compatibility,
        lastMessage: null,
        lastMessageTime: null,
        isOnline: false, // Könnte später erweitert werden
        isNewMatch: false,
        mutualInterests: interests.slice(0, 3), // Erste 3 Interessen
        profile: {
          bio: profile.bio || 'Keine Bio verfügbar',
          interests: interests,
          lifestyle: [], // Könnte später aus der DB geladen werden
          goals: [] // Könnte später aus der DB geladen werden
        }
      };
    }) || [];

    return NextResponse.json({
      success: true,
      matches: matches,
      count: matches.length,
      message: 'Matches erfolgreich geladen'
    });

  } catch (error) {
    console.error('Error in matches API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Erstelle ein neues Match-Profil
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { user_id, name, age, location, bio, hd_type, profile, authority, strategy, interests, images, avatar } = body;

    if (!user_id || !name) {
      return NextResponse.json(
        { error: 'user_id and name are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('matching_profiles')
      .insert([{
        user_id,
        name,
        age,
        location,
        bio,
        hd_type,
        profile,
        authority,
        strategy,
        interests,
        images,
        avatar,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return NextResponse.json(
        { error: 'Failed to create profile', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: data,
      message: 'Profil erfolgreich erstellt'
    });

  } catch (error) {
    console.error('Error in POST matches API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

