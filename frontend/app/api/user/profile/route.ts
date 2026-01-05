// app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// ⚠️ WICHTIG: Supabase SSR funktioniert NICHT in der Edge Runtime
export const runtime = 'nodejs';

// Kleine Helper-Funktion, um Supabase-Server-Client zu erstellen
function createSupabaseServerClient() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // In diesem Handler müssen wir Cookies nicht setzen/entfernen,
        // daher bleiben diese Methoden leer – das ist okay.
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(_name: string, _options: CookieOptions) {},
      },
    }
  );

  return supabase;
}

// GET /api/user/profile
// -> liest das Profil des eingeloggten Users aus der "profiles"-Tabelle
export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    // 1. User über Session (Cookies) holen
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nicht authentifiziert',
        },
        { status: 401 }
      );
    }

    // 2. Profil lesen
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('❌ GET /api/user/profile: DB-Fehler:', profileError);
      return NextResponse.json(
        {
          success: false,
          error: 'Fehler beim Laden des Profils',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: profile || null,
    });
  } catch (error) {
    console.error('❌ GET /api/user/profile: Unerwarteter Fehler:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unerwarteter Serverfehler',
      },
      { status: 500 }
    );
  }
}

// POST /api/user/profile
// -> legt ein Profil an oder aktualisiert es für den eingeloggten User
export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient();

    // 1. User über Session holen
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nicht authentifiziert',
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    // 2. Daten aus dem Body in DB-Format mappen
    const payload = {
      user_id: user.id,
      email: body.email ?? user.email ?? null,
      first_name: body.firstName ?? null,
      last_name: body.lastName ?? null,
      phone: body.phone ?? null,
      website: body.website ?? null,
      location: body.location ?? null,
      birth_date: body.birthDate ?? null,
      birth_time: body.birthTime ?? null,
      birth_place: body.birthPlace ?? null,
      bio: body.bio ?? null,
      interests: body.interests ?? null, // sollte in DB als json/jsonb oder text[] angelegt sein
      relationship_status: body.relationshipStatus ?? null,
      looking_for: body.lookingFor ?? null,
      age_range: body.ageRange ?? null, // json/jsonb
      max_distance: body.maxDistance ?? null,
      privacy_settings: body.privacySettings ?? null, // json/jsonb

      // Human Design Felder
      hd_type: body.hdType ?? null,
      hd_profile: body.hdProfile ?? null,
      hd_authority: body.hdAuthority ?? null,
      hd_strategy: body.hdStrategy ?? null,
      hd_incarnation_cross: body.hdIncarnationCross ?? null,
    };

    // 3. Prüfen, ob Profil existiert
    const { data: existing, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ POST /api/user/profile: Select-Fehler:', selectError);
      return NextResponse.json(
        {
          success: false,
          error: 'Fehler beim Prüfen des Profils',
        },
        { status: 500 }
      );
    }

    let dbError = null;

    if (existing) {
      // 4a. Update
      const { error: updateError } = await supabase
        .from('profiles')
        .update(payload)
        .eq('user_id', user.id);

      dbError = updateError;
    } else {
      // 4b. Insert
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(payload);

      dbError = insertError;
    }

    if (dbError) {
      console.error('❌ POST /api/user/profile: Insert/Update-Fehler:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Fehler beim Speichern des Profils',
        },
        { status: 500 }
      );
    }

    // 5. Aktualisiertes Profil zurückliefern
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.warn('⚠️ POST /api/user/profile: Profil nach Save nicht lesbar:', profileError);
    }

    return NextResponse.json({
      success: true,
      profile: profile ?? null,
    });
  } catch (error) {
    console.error('❌ POST /api/user/profile: Unerwarteter Fehler:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unerwarteter Serverfehler',
      },
      { status: 500 }
    );
  }
}
