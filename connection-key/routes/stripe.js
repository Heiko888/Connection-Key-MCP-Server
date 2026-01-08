import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

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
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log(`??? Checkout Session completed: ${session.id}`, session.metadata);
        // TODO: Update Supabase Subscription
        break;

      case 'customer.subscription.created':
        const subscriptionCreated = event.data.object;
        console.log(`??? Subscription created: ${subscriptionCreated.id}`);
        break;

      case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object;
        console.log(`??? Subscription updated: ${subscriptionUpdated.id} - Status: ${subscriptionUpdated.status}`);
        break;

      case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object;
        console.log(`??? Subscription deleted: ${subscriptionDeleted.id}`);
        break;

      case 'invoice.payment_succeeded':
        const invoiceSucceeded = event.data.object;
        console.log(`??? Payment succeeded: ${invoiceSucceeded.id}`);
        break;

      case 'invoice.payment_failed':
        const invoiceFailed = event.data.object;
        console.log(`??? Payment failed: ${invoiceFailed.id}`);
        break;

      default:
        console.log(`?????? Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('??? Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export { router as stripeRouter };

