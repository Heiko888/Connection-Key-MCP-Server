import { createClient } from './supabase/server';

/**
 * Prüft ob ein User Coach-Rechte hat
 * @param userId - Die User-ID des authentifizierten Users
 * @returns true wenn User Coach oder Admin ist, sonst false
 */
export async function isCoach(userId: string): Promise<boolean> {
  console.log('[isCoach] START - Prüfe Coach-Rolle für User:', userId);
  try {
    console.log('[isCoach] Erstelle Supabase-Client...');
    const supabase = await createClient();
    console.log('[isCoach] Supabase-Client erstellt');

    // Prüfe zuerst User-Metadaten
    console.log('[isCoach] Prüfe User-Metadaten...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('[isCoach] getUser() Ergebnis:', {
      hasUser: !!user,
      userId: user?.id,
      userMetadata: user?.user_metadata,
      error: userError?.message,
      errorCode: userError?.code,
    });
    
    if (!userError && user) {
      const userRole = user.user_metadata?.role || user.user_metadata?.user_role;
      console.log('[isCoach] User-Metadaten-Rolle:', {
        role: userRole,
        user_metadata: user.user_metadata,
      });
      if (userRole === 'coach' || userRole === 'admin') {
        console.log('[isCoach] ✅ Coach-Rolle in User-Metadaten gefunden:', {
          userId,
          role: userRole,
        });
        return true;
      }
    }

    // Prüfe in profiles Tabelle
    console.log('[isCoach] Prüfe profiles Tabelle für user_id:', userId);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_coach')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    // PGRST116 Trace
    if (profileError?.code === 'PGRST116') {
      console.error('[PGRST116 TRACE] coach-auth.ts:48', {
        file: 'coach-auth.ts',
        fn: 'isCoach',
        line: 48,
        queryContext: {
          table: 'profiles',
          filter: { user_id: userId },
          method: 'single()',
        },
        error: profileError,
      });
      console.error(new Error('PGRST116 STACK').stack);
    }

    const profile = profiles?.[0];

    console.log('[isCoach] Profile-Abfrage Ergebnis:', {
      hasProfile: !!profile,
      profile: profile ? {
        role: profile.role,
        is_coach: profile.is_coach,
      } : null,
      error: profileError?.message,
      errorCode: profileError?.code,
      errorDetails: profileError?.details,
      errorHint: profileError?.hint,
    });

    if (profileError) {
      console.warn('[isCoach] ⚠️ Fehler beim Laden des Profiles:', {
        userId,
        error: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      });
    }

    if (!profileError && profile) {
      const isCoachRole = profile.role === 'coach' || profile.role === 'admin' || profile.is_coach === true;
      console.log('[isCoach] Profile-Prüfung Ergebnis:', {
        userId,
        role: profile.role,
        is_coach: profile.is_coach,
        result: isCoachRole,
      });
      if (isCoachRole) {
        console.log('[isCoach] ✅ Coach-Rolle in Profile gefunden');
      } else {
        console.log('[isCoach] ❌ Keine Coach-Rolle in Profile');
      }
      return isCoachRole;
    }

    console.log('[isCoach] ❌ Keine Coach-Rolle gefunden:', {
      userId,
      hasProfile: !!profile,
      profileError: profileError?.message,
      profileErrorCode: profileError?.code,
    });
    return false;
  } catch (error) {
    console.error('[isCoach] ❌ EXCEPTION bei Coach-Prüfung:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unbekannter Fehler',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
    });
    return false;
  }
}

/**
 * Prüft ob ein Request von einem authentifizierten Coach kommt
 * @param request - NextRequest Objekt
 * @returns { user: User | null, isCoach: boolean }
 */
export async function checkCoachAuth(request: Request) {
  console.log('[checkCoachAuth] START - Auth-Prüfung beginnt');
  try {
    // Prüfe ob Authorization-Header vorhanden ist (für curl/API-Calls)
    const authHeader = request.headers.get('authorization');
    console.log('[checkCoachAuth] Request-Header geprüft:', {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader ? authHeader.substring(0, 20) + '...' : 'kein Header',
    });
    
    console.log('[checkCoachAuth] Erstelle Supabase-Client...');
    const supabase = await createClient();
    console.log('[checkCoachAuth] Supabase-Client erstellt');
    
    // Prüfe ob User eingeloggt ist
    let user = null;
    let authError = null;
    
    // Wenn Bearer-Token im Header vorhanden, verwende diesen direkt
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log('[checkCoachAuth] Bearer-Token erkannt - verwende Token-Auth');
      const token = authHeader.substring(7);
      
      // Erstelle Supabase-Client mit explizitem Token
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      // Verwende Publishable Key (neues Supabase-Key-Modell)
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Y-pGGWYrMl_Uhl52hTAxCw_bVU0EFTb';
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set');
      }
      
      const tokenClient = createSupabaseClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      
      // Verwende getUser mit Token
      console.log('[checkCoachAuth] Rufe getUser() mit Token auf...');
      const { data: { user: tokenUser }, error: tokenError } = await tokenClient.auth.getUser(token);
      user = tokenUser;
      authError = tokenError;
      console.log('[checkCoachAuth] getUser() mit Token Ergebnis:', {
        hasUser: !!tokenUser,
        userId: tokenUser?.id,
        error: tokenError?.message,
        errorCode: tokenError?.code,
      });
    } else {
      // Normale Cookie-basierte Auth (Standard für Browser-Requests)
      console.log('[checkCoachAuth] Kein Bearer-Token - verwende Cookie-basierte Auth');
      console.log('[checkCoachAuth] Rufe supabase.auth.getUser() auf (ohne Parameter = aus Cookies)...');
      
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
      user = cookieUser;
      authError = cookieError;
      
      console.log('[checkCoachAuth] getUser() aus Cookies Ergebnis:', {
        hasUser: !!cookieUser,
        userId: cookieUser?.id,
        email: cookieUser?.email,
        error: cookieError?.message,
        errorCode: cookieError?.code,
        errorStatus: cookieError?.status,
      });
      
      // Zusätzlich: Prüfe Session explizit
      console.log('[checkCoachAuth] Prüfe zusätzlich getSession()...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('[checkCoachAuth] getSession() Ergebnis:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        accessTokenPrefix: session?.access_token ? session.access_token.substring(0, 20) + '...' : 'kein Token',
        userId: session?.user?.id,
        error: sessionError?.message,
        errorCode: sessionError?.code,
      });
    }
    
    if (authError || !user) {
      console.error('[checkCoachAuth] ❌ FEHLER: User nicht gefunden', {
        error: authError?.message,
        errorCode: authError?.code,
        errorStatus: authError?.status,
        hasUser: !!user,
        hasAuthHeader: !!authHeader,
        authMethod: authHeader ? 'Bearer-Token' : 'Cookies',
      });
      return { user: null, isCoach: false };
    }

    console.log('[checkCoachAuth] ✅ User gefunden:', {
      userId: user.id,
      email: user.email,
      authMethod: authHeader ? 'Bearer-Token' : 'Cookies',
    });

    // Prüfe Coach-Rolle
    console.log('[checkCoachAuth] Prüfe Coach-Rolle für User:', user.id);
    const coachStatus = await isCoach(user.id);
    
    if (!coachStatus) {
      console.warn('[checkCoachAuth] ⚠️ User hat keine Coach-Rolle', {
        userId: user.id,
        email: user.email,
      });
    } else {
      console.log('[checkCoachAuth] ✅ Coach-Status bestätigt:', {
        userId: user.id,
        email: user.email,
      });
    }
    
    return { user, isCoach: coachStatus };
  } catch (error) {
    console.error('[checkCoachAuth] ❌ EXCEPTION bei Coach-Auth-Prüfung:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unbekannter Fehler',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { user: null, isCoach: false };
  }
}

