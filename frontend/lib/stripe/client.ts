/**
 * Stripe Client für Payment-Integration
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export interface CreateCheckoutSessionParams {
  packageId: string;
  priceId: string;
}

export interface CreateCheckoutSessionResponse {
  success: boolean;
  data?: {
    sessionId: string;
    url: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Erstellt eine Stripe Checkout Session
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CreateCheckoutSessionResponse> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return {
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Kein Authentifizierungs-Token gefunden'
        }
      };
    }

    const response = await fetch('/api/payment/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params)
    });

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Netzwerkfehler beim Erstellen der Checkout-Session'
      }
    };
  }
}

/**
 * Leitet zur Stripe Checkout-Seite weiter
 */
export async function redirectToCheckout(sessionUrl: string): Promise<void> {
  const stripe = await getStripe();
  if (stripe) {
    await stripe.redirectToCheckout({ sessionId: sessionUrl });
  }
}

/**
 * Stripe-Preis-IDs für verschiedene Pakete
 */
export const STRIPE_PRICE_IDS = {
  basic: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || 'prod_TLRONZGIhwK56i',
  premium: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'prod_TLRQokF99nZbLL',
  vip: process.env.NEXT_PUBLIC_STRIPE_VIP_PRICE_ID || 'prod_TLRRRto9OeulkD'
} as const;

/**
 * Stripe Product IDs für Buchungen
 */
export const STRIPE_BOOKING_PRODUCTS = {
  // Connection Key Buchungen
  connectionKeySingle: 'prod_TLn3wyU9StKNXc', // Connection Key Einzelsession
  connectionKeyTriple: 'prod_TLRYaPzOBn1t8j', // Connection Key 3er Paket
  connectionKeyFive: 'prod_TLRbWZCHxeJoGG', // Connection Key 5er Paket
  
  // Penta Buchungen
  pentaSingle: 'prod_TU4AJXQPxlrxC1', // Penta Einzelanalyse
  pentaExtended: 'prod_TU4BTgjTIQwPvg', // Erweiterte Penta-Analyse
  pentaPremium: 'prod_TU4C5SzbjDojsm', // Premium-Penta
} as const;

/**
 * Paket-zu-Preis-ID-Mapping
 */
export const PACKAGE_TO_PRICE_ID: Record<string, string> = {
  'basic': STRIPE_PRICE_IDS.basic,
  'premium': STRIPE_PRICE_IDS.premium,
  'vip': STRIPE_PRICE_IDS.vip
};

/**
 * Buchungs-zu-Produkt-ID-Mapping
 */
export const BOOKING_TO_PRODUCT_ID: Record<string, string> = {
  // Connection Key
  'connection-key-single': STRIPE_BOOKING_PRODUCTS.connectionKeySingle,
  'connection-key-triple': STRIPE_BOOKING_PRODUCTS.connectionKeyTriple,
  'connection-key-five': STRIPE_BOOKING_PRODUCTS.connectionKeyFive,
  // Penta
  'penta-single': STRIPE_BOOKING_PRODUCTS.pentaSingle,
  'penta-extended': STRIPE_BOOKING_PRODUCTS.pentaExtended,
  'penta-premium': STRIPE_BOOKING_PRODUCTS.pentaPremium,
};

/**
 * Validiert Stripe-Konfiguration
 */
export function validateStripeConfig(): boolean {
  const requiredEnvVars = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  return requiredEnvVars.every(envVar => process.env[envVar]);
}

/**
 * Stripe-Fehler-Handler
 */
export function handleStripeError(error: any): string {
  if (error.type === 'card_error') {
    return 'Kartennummer ungültig oder abgelehnt';
  } else if (error.type === 'rate_limit_error') {
    return 'Zu viele Anfragen. Bitte versuche es später erneut';
  } else if (error.type === 'invalid_request_error') {
    return 'Ungültige Anfrage. Bitte überprüfe deine Eingaben';
  } else if (error.type === 'api_connection_error') {
    return 'Verbindungsfehler. Bitte versuche es später erneut';
  } else if (error.type === 'api_error') {
    return 'Serverfehler. Bitte versuche es später erneut';
  } else if (error.type === 'authentication_error') {
    return 'Authentifizierungsfehler. Bitte melde dich erneut an';
  } else {
    return 'Ein unbekannter Fehler ist aufgetreten';
  }
}
