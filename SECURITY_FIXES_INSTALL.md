# 🔒 Security Fixes - Installation Guide

## Step 1: Install Security Dependencies

```bash
cd /Users/abdulrahmanisah/Documents/ragproject

# Install rate limiting
npm install express-rate-limit

# Install input validation
npm install express-validator validator

# Install dotenv (if not already installed)
npm install dotenv
```

---

## Step 2: Replace server.js with Secure Version

```bash
# Backup current server
cp server.js server.OLD.js

# Replace with secure version
cp server.SECURE.js server.js
```

---

## Step 3: Create .env File

Create a `.env` file in the project root:

```bash
# Copy from example
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
# Supabase
VITE_SUPABASE_URL=https://lkwdjzxahgyowigdnktt.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (TEST keys for now)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_51Sc5CsGu1VPlInb3...
STRIPE_PRICE_ID=price_1Sc6VjGu1VPlInb3MFdTuqzM
STRIPE_WEBHOOK_SECRET=whsec_...

# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# n8n Webhooks
VITE_N8N_UPLOAD_WEBHOOK=your_webhook_url
VITE_N8N_CHAT_WEBHOOK=your_webhook_url
VITE_N8N_YOUTUBE_WEBHOOK=your_webhook_url
```

---

## Step 4: Verify .env is in .gitignore

Check that `.gitignore` includes:

```
.env
.env.local
.env.*.local
```

✅ Already done - your `.gitignore` is correct!

---

## Step 5: Update Stripe Webhook in Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `http://localhost:3001/api/stripe-webhook` (for testing)
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## Step 6: Test the Secure Server

```bash
# Start backend
npm run server

# Start frontend (new terminal)
npm run dev
```

You should see:
```
✅ Stripe backend server running on http://localhost:3001
📋 Environment: development
📋 Available endpoints:
   - POST /api/create-checkout
   - POST /api/verify-payment
   - POST /api/stripe-webhook
   - GET  /health
```

---

## Step 7: Test Payment Flow

1. Go to http://localhost:5173/checkout
2. Click "Subscribe Now"
3. Use test card: `4242 4242 4242 4242`
4. Complete payment
5. Verify Pro status activates

Backend should show:
```
🔍 Verifying payment for session: cs_test_...
📋 Session status: paid
✅ Payment verified for user: ...
✅ Pro status activated
✅ Subscription saved to analytics
✅ Payment saved to analytics
```

---

## Step 8: Run Security Audit

```bash
# Check for vulnerabilities
npm audit

# Fix if needed
npm audit fix

# Update dependencies
npm update
```

---

## Step 9: Before Production Deployment

### Update These in Vercel:

1. **Switch to LIVE Stripe keys:**
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_PRICE_ID=price_live_...` (create in Stripe)

2. **Update webhook URL:**
   - Stripe Dashboard → `https://your-app.vercel.app/api/stripe-webhook`
   - Copy new webhook secret

3. **Set NODE_ENV:**
   - `NODE_ENV=production`

4. **Update FRONTEND_URL:**
   - `FRONTEND_URL=https://your-app.vercel.app`

---

## ✅ Security Checklist

After completing all steps:

- [x] Rate limiting enabled
- [x] Input validation added
- [x] CORS restricted to your domain
- [x] API keys in environment variables
- [x] Webhook signature verification enabled
- [x] .env not committed to git
- [x] Error messages don't expose stack traces
- [x] All dependencies updated

---

## 🚨 IMPORTANT REMINDERS

1. **NEVER commit .env to git**
2. **Rotate ALL API keys** if you accidentally committed them
3. **Use TEST keys** for development
4. **Use LIVE keys** only in production
5. **Enable webhook verification** in production

---

## 📚 Additional Resources

- Security Audit: `SECURITY_AUDIT.md`
- Deployment Guide: `DEPLOYMENT_GUIDE.md`
- Stripe Docs: https://stripe.com/docs/security

---

**Your app is now significantly more secure! 🔒**
