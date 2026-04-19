import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;

// Initialize Stripe safely
if (stripeKey && stripeKey.startsWith('sk_')) {
  try {
    stripe = new Stripe(stripeKey);
  } catch (err) {
    console.error('❌ Failed to initialize Stripe:', err);
  }
} else {
  console.error('⚠️  STRIPE_SECRET_KEY not configured or invalid format (must start with sk_)');
}

export const handler = async (event: any) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Check if Stripe is initialized
  if (!stripe) {
    console.error('❌ Stripe not initialized - STRIPE_SECRET_KEY missing or invalid');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Payment service not configured. Please contact support.',
      }),
    };
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (parseErr) {
      console.error('❌ Failed to parse request body:', event.body);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid request format' }),
      };
    }

    const { amount, currency = 'mad', metadata } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid amount - must be greater than 0' }),
      };
    }

    console.log('✅ Creating payment intent: amount=', amount, 'currency=', currency);

    // Create payment intent
    const paymentIntent = await stripe!.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
    };
  } catch (error: any) {
    console.error('❌ Stripe error:', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      type: error.type,
    });
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message || 'Failed to create payment intent',
        code: error.code,
      }),
    };
  }
};
