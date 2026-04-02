import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Supabase für Onboarding-Updates
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

// Mattermost-Benachrichtigung
async function notifyMattermost(text, type = 'readings') {
  const urls = {
    readings: process.env.MATTERMOST_WEBHOOK_READINGS || process.env.MATTERMOST_WEBHOOK_URL,
    errors:   process.env.MATTERMOST_WEBHOOK_ERRORS   || process.env.MATTERMOST_WEBHOOK_URL,
  };
  const url = urls[type];
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(6000),
    });
  } catch (e) {
    console.warn('[Mattermost] Fehler:', e.message);
  }
}

// Trigger: Willkommens-Reading nach Zahlung
async function triggerWelcomeReading(userId, packageId, email) {
  const readingAgentUrl = process.env.READING_AGENT_URL || 'http://reading-worker:4000';
  try {
    // Nutzerdaten aus Supabase laden
    const { data: profile } = supabase
      ? await supabase.from('profiles').select('birth_date, birth_time, birth_place, full_name').eq('id', userId).single()
      : { data: null };

    if (!profile?.birth_date || !profile?.birth_place) {
      console.log(`[Onboarding] Kein Geburtsdaten für ${userId} — kein Auto-Reading`);
      return null;
    }

    const readingType = packageId?.includes('business') ? 'business' : 'basic';
    const res = await fetch(`${readingAgentUrl}/api/readings/generic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reading_type: readingType,
        name: profile.full_name || email || 'Neuer Klient',
        birthdate: profile.birth_date,
        birthtime: profile.birth_time || '12:00',
        birthplace: profile.birth_place,
        auto_generated: true,
        user_id: userId,
      }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    console.log(`[Onboarding] Welcome-Reading gestartet: ${data.job_id || data.id}`);
    return data.job_id || data.id;
  } catch (e) {
    console.warn('[Onboarding] Welcome-Reading Fehler:', e.message);
    return null;
  }
}

// Stripe Client initialisieren
const getStripeClient = () => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('??? STRIPE_SECRET_KEY fehlt in .env');
    return null;
  }
  return new Stripe(stripeKey, {
    apiVersion: '2024-11-20.acacia',
  });
};

/**
 * POST /api/stripe/create-checkout-session
 * Erstellt eine Stripe Checkout Session
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: { code: 'STRIPE_NOT_CONFIGURED', message: 'Stripe ist nicht konfiguriert' }
      });
    }

    const { packageId, priceId, amount, successUrl, cancelUrl, metadata, bookingType } = req.body;
    const userId = req.user?.id || req.headers['x-user-id'] || 'guest';

    // Mapping f??r Price IDs
    const priceIdMap = {
      basic: process.env.STRIPE_BASIC_PRICE_ID,
      premium: process.env.STRIPE_PREMIUM_PRICE_ID,
      vip: process.env.STRIPE_VIP_PRICE_ID,
      'connection-key-single': process.env.STRIPE_CONNECTION_KEY_EINZEL,
      'connection-key-triple': process.env.STRIPE_CONNECTION_KEY_DREI,
      'connection-key-five': process.env.STRIPE_CONNECTION_KEY_FUENF,
      'penta-single': process.env.STRIPE_PENTA_EINZEL,
      'penta-extended': process.env.STRIPE_PENTA_ERWEITERT,
      'penta-premium': process.env.STRIPE_PENTA_PREMIUM,
      'human-design-basic': process.env.STRIPE_HD_BASIS,
      'human-design-extended': process.env.STRIPE_HD_ERWEITERT,
      'human-design-premium': process.env.STRIPE_HD_PREMIUM,
      'human-design-planets': process.env.STRIPE_HD_PLANETEN,
    };

    const stripePriceId = priceId || priceIdMap[packageId];

    if (!stripePriceId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PACKAGE', message: `Ung??ltiges Paket: ${packageId}` }
      });
    }

    // Stripe Checkout Session erstellen
    const isSubscription = ['basic', 'premium', 'vip'].includes(packageId);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: stripePriceId,
        quantity: 1,
      }],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: successUrl || `${process.env.APP_URL || 'https://the-connection-key.de'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.APP_URL || 'https://the-connection-key.de'}/payment/cancel`,
      metadata: {
        userId,
        packageId: packageId || '',
        bookingType: bookingType || (isSubscription ? 'subscription' : 'payment'),
        ...metadata,
      },
    });

    console.log(`??? Checkout Session erstellt: ${session.id} f??r User ${userId}`);

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });

  } catch (error) {
    console.error('??? Stripe Checkout Error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'STRIPE_ERROR', message: error.message }
    });
  }
});

/**
 * POST /api/stripe/webhook
 * Stripe Webhook Endpoint
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !webhookSecret) {
      console.error('??? Stripe Webhook nicht konfiguriert');
      return res.status(500).send('Webhook not configured');
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('??? Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`???? Stripe Event empfangen: ${event.type}`);

    // Event Handler
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, packageId, bookingType } = session.metadata || {};
        const amount = session.amount_total ? `${(session.amount_total / 100).toFixed(2)} ${session.currency?.toUpperCase()}` : '—';
        const email = session.customer_details?.email || '—';
        console.log(`✅ Checkout Session completed: ${session.id} | ${packageId} | ${amount}`);

        // Supabase: Subscription-Status aktualisieren
        if (supabase && userId) {
          await supabase.from('profiles').upsert({
            id: userId,
            subscription_status: 'active',
            subscription_package: packageId,
            subscription_updated_at: new Date().toISOString(),
          }, { onConflict: 'id' }).catch(e => console.warn('[Stripe] Supabase Update:', e.message));
        }

        // Welcome-Reading triggern
        if (userId) {
          triggerWelcomeReading(userId, packageId, email);
        }

        notifyMattermost(
          `💳 **Neue Zahlung** | ${packageId || bookingType} | ${amount}\n**E-Mail:** ${email}\n**Session:** \`${session.id}\``,
          'readings'
        );
        break;
      }

      case 'customer.subscription.created': {
        const sub = event.data.object;
        const amount = sub.items?.data?.[0]?.price?.unit_amount
          ? `${(sub.items.data[0].price.unit_amount / 100).toFixed(2)} ${sub.currency?.toUpperCase()}/Monat`
          : '—';
        console.log(`🔔 Subscription created: ${sub.id} | Status: ${sub.status}`);
        notifyMattermost(
          `🟢 **Neues Abo** | ${sub.status} | ${amount}\nAbo-ID: \`${sub.id}\``,
          'readings'
        );
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        console.log(`🔄 Subscription updated: ${sub.id} - Status: ${sub.status}`);
        if (['canceled', 'unpaid', 'past_due'].includes(sub.status)) {
          notifyMattermost(
            `⚠️ **Abo-Problem** | Status: ${sub.status}\nAbo-ID: \`${sub.id}\``,
            'errors'
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        console.log(`❌ Subscription deleted: ${sub.id}`);
        notifyMattermost(
          `🔴 **Abo gekündigt** | Abo-ID: \`${sub.id}\``,
          'readings'
        );
        break;
      }

      case 'invoice.payment_succeeded': {
        const inv = event.data.object;
        const amount = inv.amount_paid ? `${(inv.amount_paid / 100).toFixed(2)} ${inv.currency?.toUpperCase()}` : '—';
        console.log(`💰 Payment succeeded: ${inv.id} | ${amount}`);
        // Nur bei Erstzahlung notifizieren (nicht bei wiederkehrenden)
        if (inv.billing_reason === 'subscription_create') {
          notifyMattermost(`💰 **Erste Zahlung eingegangen** | ${amount}`, 'readings');
        }
        break;
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object;
        const amount = inv.amount_due ? `${(inv.amount_due / 100).toFixed(2)} ${inv.currency?.toUpperCase()}` : '—';
        console.log(`❌ Payment failed: ${inv.id} | ${amount}`);
        notifyMattermost(
          `❌ **Zahlung fehlgeschlagen** | ${amount}\nKunde: ${inv.customer_email || '—'}\nRechnung: \`${inv.id}\``,
          'errors'
        );
        break;
      }

      default:
        console.log(`⚪ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('??? Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export { router as stripeRouter };

