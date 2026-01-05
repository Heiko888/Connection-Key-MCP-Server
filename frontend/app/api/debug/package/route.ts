import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ⚠️ WICHTIG: Supabase SSR funktioniert NICHT in der Edge Runtime
export const runtime = 'nodejs';

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // 1. Session prüfen
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session || !session.user) {
      return NextResponse.json({
        success: false,
        error: "Nicht eingeloggt",
        sessionError: sessionError?.message,
      });
    }

    const userId = session.user.id;

    // 2. Paket aus subscriptions Tabelle laden
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("package_id, status, created_at, updated_at")
      .eq("user_id", userId)
      .single();

    // 3. user_metadata prüfen (Fallback)
    const userMetadataPackage = session.user.user_metadata?.package;

    // 4. Alle relevanten Daten sammeln
    const debugInfo = {
      success: true,
      userId,
      userEmail: session.user.email,
      timestamp: new Date().toISOString(),
      sources: {
        subscriptions: {
          found: !!subscription,
          package_id: subscription?.package_id || null,
          status: subscription?.status || null,
          error: subscriptionError?.message || null,
          fullData: subscription || null,
        },
        user_metadata: {
          package: userMetadataPackage || null,
          fullMetadata: session.user.user_metadata || null,
        },
      },
      normalized: {
        fromSubscriptions: subscription?.package_id || null,
        fromUserMetadata: userMetadataPackage || null,
        finalPackage: subscription?.package_id || userMetadataPackage || "basic",
      },
    };

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

