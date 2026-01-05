import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SubscriptionService } from '@/lib/supabase/services';

// ⚠️ WICHTIG: Stripe Webhooks funktionieren NICHT in der Edge Runtime
export const runtime = 'nodejs';

// Stripe Client - wird lazy initialisiert
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

// GET für Health-Check (optional, aber hilfreich für Debugging)
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Stripe webhook endpoint is active',
    methods: ['POST']
  });
}

export async function POST(request: NextRequest) {
  try {
    // Lazy initialization von Stripe Client
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    // Prüfe ob Stripe konfiguriert ist
    if (!stripe || !webhookSecret) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Event-Handler
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Checkout Session abgeschlossen
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const packageId = session.metadata?.packageId;

  if (!userId || !packageId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  try {
    // Supabase Subscription aktualisieren
    const success = await SubscriptionService.updateSubscription(userId, packageId);
    
    if (success) {
      console.log(`✅ Subscription created for user ${userId}: ${packageId}`);
    } else {
      console.error(`❌ Failed to update subscription for user ${userId}: ${packageId}`);
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

// Subscription erstellt
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const packageId = subscription.metadata?.packageId || 'basic';
    
    // User ID aus Customer ID ermitteln (falls in Stripe Customer Metadata gespeichert)
    // Für jetzt verwenden wir die Customer ID als User ID
    const userId = customerId;
    
    const success = await SubscriptionService.updateSubscription(userId, packageId);
    
    if (success) {
      console.log(`✅ Subscription created: ${subscription.id} for user ${userId}`);
    } else {
      console.error(`❌ Failed to update subscription: ${subscription.id}`);
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

// Subscription aktualisiert
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const packageId = subscription.metadata?.packageId || 'basic';
    const userId = customerId;
    
    // Status-basierte Logik
    let targetPackage = packageId;
    
    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      targetPackage = 'free';
    } else if (subscription.status === 'active') {
      targetPackage = packageId;
    }
    
    const success = await SubscriptionService.updateSubscription(userId, targetPackage);
    
    if (success) {
      console.log(`✅ Subscription updated: ${subscription.id} - ${subscription.status} -> ${targetPackage}`);
    } else {
      console.error(`❌ Failed to update subscription: ${subscription.id}`);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

// Subscription gelöscht
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const userId = customerId;
    
    // Subscription auf 'free' setzen
    const success = await SubscriptionService.updateSubscription(userId, 'free');
    
    if (success) {
      console.log(`✅ Subscription deleted: ${subscription.id} -> user ${userId} set to free`);
    } else {
      console.error(`❌ Failed to update subscription after deletion: ${subscription.id}`);
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

// Zahlung erfolgreich
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription as string;
    const customerId = invoice.customer as string;
    const userId = customerId;
    
    // Bei erfolgreicher Zahlung: Subscription bestätigen
    const success = await SubscriptionService.updateSubscription(userId, 'premium');
    
    if (success) {
      console.log(`✅ Payment succeeded for subscription: ${subscriptionId} -> user ${userId} confirmed`);
    } else {
      console.error(`❌ Failed to confirm subscription after payment: ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

// Zahlung fehlgeschlagen
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription as string;
    const customerId = invoice.customer as string;
    const userId = customerId;
    
    // Bei fehlgeschlagener Zahlung: Subscription auf 'free' setzen
    const success = await SubscriptionService.updateSubscription(userId, 'free');
    
    if (success) {
      console.log(`⚠️ Payment failed for subscription: ${subscriptionId} -> user ${userId} set to free`);
    } else {
      console.error(`❌ Failed to update subscription after payment failure: ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}
