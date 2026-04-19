# 🚀 Netlify Environment Variables Setup Guide

## 🔴 CRITICAL: Add Your Stripe Secret Key to Netlify

If you're getting **502 errors from the payment function**, it's because `STRIPE_SECRET_KEY` is not set on Netlify.

### ⚠️ DO NOT commit your secret key to GitHub!

Instead, set it as an **environment variable** in Netlify dashboard.

## How to Add Environment Variables to Netlify

### Step 1: Go to Netlify Dashboard

1. Open [https://app.netlify.com](https://app.netlify.com)
2. Select your site: **hestim-talent-academy**
3. Click **Site settings** (top menu)

### Step 2: Configure Build & Deploy

1. Go to **Build & deploy** → **Environment**
2. Click **Edit variables** button

### Step 3: Add Your Stripe Secret Key

Add this variable:
- **Key:** `STRIPE_SECRET_KEY`
- **Value:** `sk_test_...` (your Stripe test secret key)

Click **Save**

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click the **three dots (⋮)** on the latest deployment
3. Select **Trigger deploy**

## Finding Your Stripe Secret Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **API Keys**
3. Copy the **Secret key** (starts with `sk_test_` or `sk_live_`)
4. ⚠️ **Never** share this key or commit it to GitHub

## All Required Environment Variables

For full functionality, you need these on Netlify:

```
STRIPE_SECRET_KEY=sk_test_xxxxx
FIREBASE_API_KEY=AIzaXxxx
```

### Local Development (.env.local)

For local testing, also add to your `.env.local`:

```env
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

## Verifying Setup

After adding env variables and redeploying:

```bash
# Check functions are working
curl https://your-site.netlify.app/.netlify/functions/create-payment-intent
# Should NOT return 502 error
```

## If Still Getting 502 Errors

### Troubleshooting Steps:

1. **Verify env variable is set**
   ```
   Netlify Dashboard → Site settings → Build & deploy → Environment
   ```
   Should show `STRIPE_SECRET_KEY`

2. **Check the function logs**
   ```
   Netlify Dashboard → Functions
   ```
   Click `create-payment-intent` → View logs
   Look for "STRIPE_SECRET_KEY not configured" message

3. **Redeploy after adding env variable**
   ```
   Deployments → Trigger deploy
   ```
   Previous deployments won't have the new env var

4. **Verify Stripe key format**
   - Test keys start with `sk_test_`
   - Live keys start with `sk_live_`
   - Must be full key (usually 100+ characters)

5. **Check function timeout**
   - Default timeout: 10 seconds
   - Stripe API usually responds in <1 second
   - If timeout, might indicate network issue

## Testing Locally

When running `npm run dev`, Netlify functions are NOT available locally (unless using Firebase Emulator mode).

To test locally:
1. Add `.env.local` with test keys
2. Function will show `DEV_MODE` error gracefully
3. This is expected behavior - functions run on production only

## After Setting Up Env Variables

Your payment flow will:

1. ✅ User clicks "Buy Course"
2. ✅ Frontend calls `/.netlify/functions/create-payment-intent`
3. ✅ Function uses `STRIPE_SECRET_KEY` to create payment intent
4. ✅ Return `clientSecret` to frontend
5. ✅ Stripe Embedded Checkout renders
6. ✅ Payment processed securely

## Reference

- Netlify Env Variables: https://docs.netlify.com/configure-builds/environment-variables/
- Stripe Keys: https://stripe.com/docs/keys
- Functions Setup: https://docs.netlify.com/functions/overview/

