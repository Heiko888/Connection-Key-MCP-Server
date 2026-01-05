import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';

// ⚠️ WICHTIG: Supabase SSR funktioniert NICHT in der Edge Runtime
export const runtime = 'nodejs';

// Server-side Supabase Client für API Routes
function getSupabaseClient(request: NextRequest) {
  // ✅ FIX: Erstelle eine neue NextResponse für Cookie-Management (OHNE next())
  // In API-Routen darf NextResponse.next() NICHT verwendet werden!
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
          // Cookie im Request setzen (für Supabase Client)
          request.cookies.set({
            name,
            value,
            ...options,
          });
          // Cookie in Response setzen (für Browser)
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // Cookie im Request entfernen (für Supabase Client)
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          // Cookie in Response entfernen (für Browser)
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
 * PUT /api/admin/users/package
 * Aktualisiert das Paket eines Users in Supabase user_metadata
 * 
 * Body: {
 *   userId: string,
 *   package: 'basic' | 'premium' | 'vip' | 'admin'
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

    // Prüfe, ob User Admin ist (konsistent mit Middleware/useAuth: aus subscriptions Tabelle)
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
        { error: 'Nur Admins können Pakete ändern' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, package: packageId } = body;

    if (!userId || !packageId) {
      return NextResponse.json(
        { error: 'userId und package sind erforderlich' },
        { status: 400 }
      );
    }

    // Validiere Paket (validPackages bereits oben definiert)
    if (!validPackages.includes(packageId)) {
      return NextResponse.json(
        { error: `Ungültiges Paket. Erlaubt: ${validPackages.join(', ')}` },
        { status: 400 }
      );
    }

    // Verwende Service Role Key für Admin-Operationen
    // Erstelle einen Admin-Client mit Service Role Key (direkt, nicht über SSR)
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

    // Hole aktuellen User, um user_metadata zu erhalten
    const { data: targetUser, error: getUserError } = await adminSupabase.auth.admin.getUserById(userId);
    
    if (getUserError || !targetUser) {
      logger.error('Error fetching user:', getUserError);
      return NextResponse.json(
        { error: 'User nicht gefunden', details: getUserError?.message },
        { status: 404 }
      );
    }

    // Aktualisiere user_metadata.package
    const currentMetadata = targetUser.user.user_metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      package: packageId,
    };

    const { data: updatedUser, error: updateError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: updatedMetadata,
      }
    );

    if (updateError) {
      logger.error('Error updating user metadata:', updateError);
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Pakets', details: updateError.message },
        { status: 500 }
      );
    }

    // Optional: Aktualisiere auch die profiles Tabelle
    try {
      const { error: profileError } = await adminSupabase
        .from('profiles')
        .update({ subscription_package: packageId })
        .eq('user_id', userId);

      if (profileError) {
        logger.warn('Error updating profile table (non-critical):', profileError);
        // Nicht kritisch - user_metadata ist die Hauptquelle
      }
    } catch (profileError) {
      logger.warn('Error updating profile table (non-critical):', profileError);
      // Nicht kritisch - user_metadata ist die Hauptquelle
    }

    // Optional: Aktualisiere auch die subscriptions Tabelle
    try {
      const { error: subscriptionError } = await adminSupabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          package_id: packageId,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 Jahr
        }, {
          onConflict: 'user_id'
        });

      if (subscriptionError) {
        logger.warn('Error updating subscriptions table (non-critical):', subscriptionError);
        // Nicht kritisch - user_metadata ist die Hauptquelle
      }
    } catch (subscriptionError) {
      logger.warn('Error updating subscriptions table (non-critical):', subscriptionError);
      // Nicht kritisch - user_metadata ist die Hauptquelle
    }

    logger.info('Package updated successfully', { 
      userId, 
      package: packageId,
      updatedBy: user.id 
    });

    return NextResponse.json({
      success: true,
      message: `Paket erfolgreich auf ${packageId.toUpperCase()} gesetzt`,
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        package: packageId,
      }
    }, {
      headers: response.headers
    });

  } catch (error) {
    logger.error('Error in PUT /api/admin/users/package:', error);
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
 * GET /api/admin/users/package?userId=xxx
 * Lädt das aktuelle Paket eines Users
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

    // Prüfe, ob User Admin ist (konsistent mit Middleware/useAuth: aus subscriptions Tabelle)
    const { data: adminSubscription } = await supabase
      .from('subscriptions')
      .select('package_id')
      .eq('user_id', user.id)
      .single();
    
    let userPackage = adminSubscription?.package_id || user.user_metadata?.package || 'basic';
    
    // Validiere Paket
    const validPackages = ['basic', 'premium', 'vip', 'admin'];
    if (!validPackages.includes(userPackage)) {
      userPackage = 'basic';
    }
    
    if (userPackage !== 'admin') {
      return NextResponse.json(
        { error: 'Nur Admins können Pakete abfragen' },
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

    // Lade Paket aus subscriptions Tabelle (konsistent mit Middleware/useAuth)
    const { data: subscription } = await adminSupabase
      .from('subscriptions')
      .select('package_id')
      .eq('user_id', userId)
      .single();
    
    const packageId = subscription?.package_id || targetUser.user.user_metadata?.package || 'basic';

    return NextResponse.json({
      success: true,
      user: {
        id: targetUser.user.id,
        email: targetUser.user.email,
        package: packageId,
      }
    }, {
      headers: response.headers
    });

  } catch (error) {
    logger.error('Error in GET /api/admin/users/package:', error);
    return NextResponse.json(
      { 
        error: 'Interner Serverfehler', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

