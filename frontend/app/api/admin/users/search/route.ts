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
 * GET /api/admin/users/search?email=xxx
 * Sucht einen User nach E-Mail-Adresse
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
        { error: 'Nur Admins können User suchen' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'email Parameter ist erforderlich' },
        { status: 400 }
      );
    }

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

    // Suche User nach E-Mail
    const { data: users, error: listError } = await adminSupabase.auth.admin.listUsers();
    
    if (listError) {
      logger.error('Error listing users:', listError);
      return NextResponse.json(
        { error: 'Fehler beim Suchen des Users', details: listError.message },
        { status: 500 }
      );
    }

    const foundUser = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      return NextResponse.json(
        { error: 'User nicht gefunden' },
        { status: 404 }
      );
    }

    // Lade Paket aus subscriptions Tabelle (konsistent mit Middleware/useAuth)
    const { data: subscription } = await adminSupabase
      .from('subscriptions')
      .select('package_id')
      .eq('user_id', foundUser.id)
      .single();
    
    const packageId = subscription?.package_id || foundUser.user_metadata?.package || 'basic';

    return NextResponse.json({
      success: true,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        package: packageId,
      }
    }, {
      headers: response.headers
    });

  } catch (error) {
    logger.error('Error in GET /api/admin/users/search:', error);
    return NextResponse.json(
      { 
        error: 'Interner Serverfehler', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

