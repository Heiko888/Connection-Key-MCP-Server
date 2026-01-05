import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_BOOKING_PRODUCTS } from '@/lib/stripe';

// ⚠️ WICHTIG: Stripe funktioniert NICHT in der Edge Runtime
// Verhindert auch den Supabase Fehler im Log
export const runtime = 'nodejs';

// Stripe Client - wird lazy initialisiert, um Build-Fehler zu vermeiden
function getStripeClient(): Stripe | null {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('❌ Stripe API Key fehlt');
    return null;
  }
  
  return new Stripe(stripeKey, {
    apiVersion: '2025-08-27.basil',
  });
}

export async function POST(request: NextRequest) {
  try {
    // Lazy initialization von Stripe Client
    const stripe = getStripeClient();
    
    // Prüfe ob Stripe konfiguriert ist
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: { code: 'STRIPE_NOT_CONFIGURED', message: 'Stripe ist nicht konfiguriert' } },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { packageId, priceId, productId, amount, productName, successUrl, cancelUrl, metadata, bookingType } = body;

    // User ID aus Authorization Header extrahieren
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_TOKEN', message: 'Kein gültiger Token' } },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // User ID aus Request Headers oder Session extrahieren
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    // TODO: Implementiere echte User-Verifizierung über Supabase Auth

    // Mapping für Subscription-Pakete
    const subscriptionPriceIds = {
      basic: process.env.STRIPE_BASIC_PRICE_ID || 'prod_TLRONZGIhwK56i',
      premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'prod_TLRQokF99nZbLL',
      vip: process.env.STRIPE_VIP_PRICE_ID || 'prod_TLRRRto9OeulkD'
    };

    // Mapping für Buchungs-Produkte
    const bookingProductIds: Record<string, string | undefined> = {
      // Connection Key
      'connection-key-single': STRIPE_BOOKING_PRODUCTS.CONNECTION_KEY_SINGLE,
      'connection-key-triple': STRIPE_BOOKING_PRODUCTS.CONNECTION_KEY_TRIPLE,
      'connection-key-five': STRIPE_BOOKING_PRODUCTS.CONNECTION_KEY_FIVE,
      // Penta
      'penta-single': STRIPE_BOOKING_PRODUCTS.PENTA_SINGLE,
      'penta-extended': STRIPE_BOOKING_PRODUCTS.PENTA_EXTENDED,
      'penta-premium': STRIPE_BOOKING_PRODUCTS.PENTA_PREMIUM,
      // Human Design Readings
      'human-design-basic': STRIPE_BOOKING_PRODUCTS.HUMAN_DESIGN_BASIC,
      'human-design-extended': STRIPE_BOOKING_PRODUCTS.HUMAN_DESIGN_EXTENDED,
      'human-design-premium': STRIPE_BOOKING_PRODUCTS.HUMAN_DESIGN_PREMIUM,
      'human-design-planets': STRIPE_BOOKING_PRODUCTS.HUMAN_DESIGN_PLANETS,
      // Legacy IDs für Kompatibilität
      'single': packageId === 'connection-key-single' ? STRIPE_BOOKING_PRODUCTS.CONNECTION_KEY_SINGLE : 
                packageId === 'penta-single' ? STRIPE_BOOKING_PRODUCTS.PENTA_SINGLE : undefined,
      'triple': STRIPE_BOOKING_PRODUCTS.CONNECTION_KEY_TRIPLE,
      'five': STRIPE_BOOKING_PRODUCTS.CONNECTION_KEY_FIVE,
      'extended': STRIPE_BOOKING_PRODUCTS.PENTA_EXTENDED,
      'premium': STRIPE_BOOKING_PRODUCTS.PENTA_PREMIUM,
    };

    // Bestimme die Stripe Product ID
    let stripeProductId: string | undefined;
    
    if (productId) {
      // Direkte Produkt-ID übergeben
      stripeProductId = productId;
    } else if (priceId) {
      // Price ID übergeben
      stripeProductId = priceId;
    } else if (packageId && bookingType) {
      // Buchungs-Typ mit Package ID
      const key = `${bookingType}-${packageId}`;
      stripeProductId = bookingProductIds[key] || bookingProductIds[packageId];
    } else if (packageId && subscriptionPriceIds[packageId as keyof typeof subscriptionPriceIds]) {
      // Subscription Package
      stripeProductId = subscriptionPriceIds[packageId as keyof typeof subscriptionPriceIds];
    } else if (packageId && bookingProductIds[packageId]) {
      // Direkte Package ID in Buchungs-Mapping
      stripeProductId = bookingProductIds[packageId];
    }

    if (!stripeProductId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PACKAGE', message: `Ungültiges Paket oder Produkt-ID: ${packageId || productId}` } },
        { status: 400 }
      );
    }

    // Bestimme den Modus (subscription für Abos, payment für einmalige Buchungen)
    const isSubscription = packageId && ['basic', 'premium', 'vip'].includes(packageId);
    const mode = isSubscription ? 'subscription' : 'payment';

    // Line Items konfigurieren
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    
    if (isSubscription) {
      // Für Subscriptions: Price ID verwenden
      lineItems.push({
        price: stripeProductId,
        quantity: 1,
      });
    } else {
      // Für einmalige Buchungen: Product ID mit Preis verwenden
      if (amount) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product: stripeProductId,
            unit_amount: Math.round(amount * 100), // Stripe erwartet Cent
          },
          quantity: 1,
        });
      } else {
        // Fallback: Direkt Product ID verwenden (wenn Price bereits in Stripe erstellt)
        lineItems.push({
          price: stripeProductId,
          quantity: 1,
        });
      }
    }

    // Success und Cancel URLs
    const defaultSuccessUrl = isSubscription 
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/buchung/dankeseiten/${packageId || 'success'}`;
    
    const defaultCancelUrl = isSubscription
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/pricing`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/connection-key/booking`;

    // Stripe Checkout Session erstellen
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: mode,
      success_url: successUrl || defaultSuccessUrl,
      cancel_url: cancelUrl || defaultCancelUrl,
      customer_email: metadata?.customerEmail || 'user@example.com', // TODO: Echte User-Email aus Supabase Auth
      metadata: {
        userId: userId,
        packageId: packageId || '',
        bookingType: bookingType || (isSubscription ? 'subscription' : 'booking'),
        ...metadata,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });

  } catch (error) {
    console.error('Stripe Checkout Session Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'STRIPE_ERROR', 
          message: 'Fehler beim Erstellen der Checkout-Session' 
        } 
      },
      { status: 500 }
    );
  }
}
