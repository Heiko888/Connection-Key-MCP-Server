import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';

// ⚠️ WICHTIG: Supabase SSR funktioniert NICHT in der Edge Runtime
export const runtime = 'nodejs';

// Server-side Supabase Client für API Routes
function getSupabaseClient(request: NextRequest) {
  const response = new NextResponse();

  // Verwende Publishable Key für Public-Client (neues Supabase-Key-Modell)
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Y-pGGWYrMl_Uhl52hTAxCw_bVU0EFTb';
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  return { supabase, response };
}

/**
 * PUT /api/admin/users/coach
 * Setzt oder entfernt die Coach-Rolle eines Users
 * 
 * Body: {
 *   userId: string,
 *   isCoach: boolean
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const { supabase, response } = getSupabaseClient(request);
    
    // Prüfe, ob User authentifiziert ist
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Prüfe, ob User Admin ist
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('package_id')
      .eq('user_id', user.id)
      .single();
    
    let userPackage = subscription?.package_id || user.user_metadata?.package || 'basic';
    
    // Validiere Paket
    const validPackages = ['basic', 'premium', 'vip', 'admin'];
    if (!validPackages.includes(userPackage)) {
      userPackage = 'basic';
    }
    
    if (userPackage !== 'admin') {
      return NextResponse.json(
        { error: 'Nur Admins können Coach-Rollen verwalten' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, isCoach } = body;

    if (!userId || typeof isCoach !== 'boolean') {
      return NextResponse.json(
        { error: 'userId und isCoach (boolean) sind erforderlich' },
        { status: 400 }
      );
    }

    // Verwende Service Role Key für Admin-Operationen
    // Verwende Secret Key für Admin-Operationen (neues Supabase-Key-Modell)
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!secretKey) {
      logger.error('SUPABASE_SECRET_KEY ist nicht gesetzt');
      return NextResponse.json(
        { error: 'Server-Konfiguration fehlt' },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      secretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Hole aktuellen User
    const { data: targetUser, error: getUserError } = await adminSupabase.auth.admin.getUserById(userId);
    
    if (getUserError || !targetUser) {
      logger.error('Error fetching user:', getUserError);
      return NextResponse.json(
        { error: 'User nicht gefunden', details: getUserError?.message },
        { status: 404 }
      );
    }

    // Prüfe, ob Profil existiert
    const { data: existingProfile, error: fetchError } = await adminSupabase
      .from('profiles')
      .select('user_id, role, is_coach')
      .eq('user_id', userId)
      .single();

    // Bereite Update-Daten vor
    const updateData: any = { is_coach: isCoach };
    if (isCoach) {
      updateData.role = 'coach';
    } else {
      // Wenn Coach-Rolle entfernt wird, setze role auf null (falls es vorher 'coach' war)
      if (existingProfile?.role === 'coach') {
        updateData.role = null;
      }
    }

    let profileError = null;

    if (existingProfile) {
      // Profil existiert - aktualisiere es
      const { error: updateError } = await adminSupabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId);
      
      profileError = updateError;
    } else {
      // Profil existiert nicht - erstelle es
      const { error: insertError } = await adminSupabase
        .from('profiles')
        .insert({
          user_id: userId,
          ...updateData,
          // Setze Standardwerte falls nötig
          email: targetUser.user.email || null,
        });
      
      profileError = insertError;
    }

    if (profileError) {
      logger.error('Error updating/creating profile:', {
        error: profileError,
        userId,
        existingProfile: !!existingProfile,
        updateData
      });
      
      // Prüfe, ob es ein Spalten-Problem ist
      const isColumnError = profileError.message?.includes('column') || 
                           profileError.message?.includes('does not exist') ||
                           profileError.code === '42703';
      
      return NextResponse.json(
        { 
          error: 'Fehler beim Aktualisieren der Profile-Tabelle', 
          details: profileError.message,
          code: profileError.code,
          hint: isColumnError 
            ? 'Die Spalten is_coach oder role existieren möglicherweise nicht in der profiles Tabelle. Bitte prüfe die Datenbankstruktur.'
            : existingProfile 
              ? 'Update fehlgeschlagen - möglicherweise RLS (Row Level Security) Problem'
              : 'Erstellen fehlgeschlagen - möglicherweise fehlen Spalten oder RLS verhindert Insert'
        },
        { status: 500 }
      );
    }

    // Aktualisiere auch User-Metadaten
    const currentMetadata = targetUser.user.user_metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      role: isCoach ? 'coach' : (currentMetadata.role === 'coach' ? null : currentMetadata.role),
      user_role: isCoach ? 'coach' : (currentMetadata.user_role === 'coach' ? null : currentMetadata.user_role),
    };

    const { data: updatedUser, error: updateError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: updatedMetadata,
      }
    );

    if (updateError) {
      logger.error('Error updating user metadata:', updateError);
      // Nicht kritisch - profiles Tabelle ist aktualisiert
      logger.warn('Profile updated but user metadata update failed (non-critical)');
    } else {
      logger.info('User metadata updated successfully', { userId, isCoach });
    }

    logger.info('Coach status updated successfully', { 
      userId, 
      isCoach,
      updatedBy: user.id 
    });

    return NextResponse.json({
      success: true,
      message: isCoach 
        ? 'Coach-Rolle erfolgreich vergeben' 
        : 'Coach-Rolle erfolgreich entfernt',
      user: {
        id: updatedUser?.user?.id || targetUser.user.id,
        email: updatedUser?.user?.email || targetUser.user.email,
        isCoach: isCoach,
        role: isCoach ? 'coach' : null,
      }
    }, {
      headers: response.headers
    });

  } catch (error) {
    logger.error('Error in PUT /api/admin/users/coach:', error);
    return NextResponse.json(
      { 
        error: 'Interner Serverfehler', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/users/coach?userId=xxx
 * Lädt den Coach-Status eines Users
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, response } = getSupabaseClient(request);
    
    // Prüfe, ob User authentifiziert ist
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Prüfe, ob User Admin ist
    const { data: adminSubscription } = await supabase
      .from('subscriptions')
      .select('package_id')
      .eq('user_id', user.id)
      .single();
    
    let userPackage = adminSubscription?.package_id || user.user_metadata?.package || 'basic';
    
    const validPackages = ['basic', 'premium', 'vip', 'admin'];
    if (!validPackages.includes(userPackage)) {
      userPackage = 'basic';
    }
    
    if (userPackage !== 'admin') {
      return NextResponse.json(
        { error: 'Nur Admins können Coach-Status abfragen' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId Parameter ist erforderlich' },
        { status: 400 }
      );
    }

    // Verwende Service Role Key für Admin-Operationen
    // Verwende Secret Key für Admin-Operationen (neues Supabase-Key-Modell)
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!secretKey) {
      logger.error('SUPABASE_SECRET_KEY ist nicht gesetzt');
      return NextResponse.json(
        { error: 'Server-Konfiguration fehlt' },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      secretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: targetUser, error: getUserError } = await adminSupabase.auth.admin.getUserById(userId);
    
    if (getUserError || !targetUser) {
      logger.error('Error fetching user:', getUserError);
      return NextResponse.json(
        { error: 'User nicht gefunden', details: getUserError?.message },
        { status: 404 }
      );
    }

    // Lade Coach-Status aus profiles Tabelle
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('role, is_coach')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      logger.warn('Error fetching profile (non-critical):', profileError);
    }

    const isCoach = profile?.is_coach === true || profile?.role === 'coach' || targetUser.user.user_metadata?.role === 'coach';

    return NextResponse.json({
      success: true,
      user: {
        id: targetUser.user.id,
        email: targetUser.user.email,
        isCoach: isCoach,
        role: profile?.role || targetUser.user.user_metadata?.role || null,
      }
    }, {
      headers: response.headers
    });

  } catch (error) {
    logger.error('Error in GET /api/admin/users/coach:', error);
    return NextResponse.json(
      { 
        error: 'Interner Serverfehler', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

