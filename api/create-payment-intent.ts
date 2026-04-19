import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Mock Payment Intent API
 * Simulates payment processing without Stripe
 * For testing and development purposes
 */
export default async (req: VercelRequest, res: VercelResponse) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'mad', metadata } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return res.status(400).json({
        error: 'Invalid amount - must be greater than 0',
      });
    }

    console.log('✅ Mock payment created:', {
      amount: amount,
      currency: currency,
      metadata: metadata,
      timestamp: new Date().toISOString(),
    });

    // Generate mock payment IDs
    const clientSecret = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const paymentIntentId = `mock_${Date.now()}`;

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      clientSecret: clientSecret,
      paymentIntentId: paymentIntentId,
      amount: amount,
      currency: currency,
      status: 'succeeded',
      mock: true,
      message: '🧪 Mock payment (development mode)',
    });
  } catch (error: any) {
    console.error('❌ Payment error:', error.message || error);

    return res.status(500).json({
      error: error.message || 'Failed to create payment intent',
    });
  }
};
