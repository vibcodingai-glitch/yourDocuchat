# 🚀 Complete Stripe + Supabase Integration Setup

## ⚡ Quick Start (3 Steps)

### Step 1: Get Your Stripe Price ID
1. Go to: https://dashboard.stripe.com/test/products
2. Click on "DocuChat Pro"
3. Copy the **Price ID** (starts with `price_`)
4. Update in **2 files**:
   - `src/lib/stripe.ts` → Line 7
   - `src/pages/Checkout.tsx` → Line 29

### Step 2: Get Your Supabase Service Role Key
1. Go to: https://supabase.com/dashboard/project/lkwdjzxahgyowigdnktt/settings/api
2. Scroll to "Project API keys"
3. Copy the **service_role** key (NOT the anon key)
4. Update in `server.js` → Line 11

### Step 3: Run the Backend Server
```bash
# In a NEW terminal (keep npm run dev running in the other)
node server.js
```

You should see:
```
🚀 ========================================
✅ Stripe backend server running on http://localhost:3001
📋 Available endpoints:
   - POST /api/create-checkout
   - POST /api/stripe-webhook
   - GET  /health
========================================
```

---

## 🧪 Testing the Full Flow

1. **Go to**: http://localhost:5173
2. **Login** with your account
3. **Upload 3 files** or **extract 3 transcripts** (to hit the limit)
4. **Try to upload 4th** → Upgrade modal appears
5. **Click "Upgrade to Pro"** → Goes to `/checkout`
6. **Click "Subscribe Now"** → Opens Stripe Checkout
7. **Use test card**: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
8. **Complete payment** → Redirects to success page
9. **Click "Get Started"** → Back to dashboard
10. **Check header** → Should show "∞" instead of "3"
11. **Try unlimited uploads/transcripts** → Works!

---

## 📊 How It Works (Architecture)

```
User clicks "Subscribe Now"
    ↓
Frontend (Checkout.tsx) → POST to localhost:3001/api/create-checkout
    ↓
Backend (server.js) → Creates Stripe checkout session
    ↓
Stripe Checkout page opens → User enters card
    ↓
Payment successful → Stripe webhook → localhost:3001/api/stripe-webhook
    ↓
Backend updates Supabase → user_usage.is_pro = true
    ↓
User redirected to /payment-success
    ↓
UsageContext refreshes → isPro = true
    ↓
Header shows "∞" + Pro badge appears
    ↓
Unlimited usage enabled! 🎉
```

---

## 🔧 What Each File Does

### Frontend Files:
- **`src/pages/Checkout.tsx`** - Payment page, calls backend to create checkout
- **`src/pages/PaymentSuccess.tsx`** - Success page after payment
- **`src/components/UpgradeModal.tsx`** - Popup when limit reached
- **`src/contexts/UsageContext.tsx`** - Manages Pro status & limits

### Backend File:
- **`server.js`** - Express server that:
  - Creates Stripe checkout sessions
  - Handles Stripe webhooks
  - Updates Supabase when payment succeeds

### Database:
- **`user_usage` table in Supabase**:
  - `user_id` - Links to auth.users
  - `document_count` - Number of uploads used
  - `transcript_count` - Number of transcripts used
  - `is_pro` - Boolean (false = free, true = Pro)

---

## 🔐 Important Security Notes

### ⚠️ Current Setup (Development Only)
- Stripe secret key is in `server.js` (OK for testing)
- Supabase service key is in `server.js` (OK for testing)
- Webhook signature verification is DISABLED (for easier testing)

### ✅ Before Production:
1. Move all keys to environment variables (`.env` file)
2. Enable webhook signature verification in `server.js`
3. Use proper server hosting (not localhost)
4. Set up Stripe webhook endpoint in Stripe Dashboard
5. Update success/cancel URLs to your production domain

---

## 📝 Troubleshooting

### "Failed to start checkout"
- ✅ Make sure `node server.js` is running
- ✅ Check that Price ID is updated in Checkout.tsx
- ✅ Open browser console to see the error

### "Backend not responding"
- ✅ Run `node server.js` in a separate terminal
- ✅ Check that port 3001 is available
- ✅ Visit http://localhost:3001/health to test

### "Payment succeeded but still showing limits"
- ✅ Check server.js console for webhook logs
- ✅ Verify Supabase service_role key is correct
- ✅ Run the SQL setup script (supabase_usage_setup.sql)
- ✅ Manually check Supabase: `user_usage` table → is_pro column

### "Can't find service_role key"
1. Go to: https://supabase.com/dashboard/project/lkwdjzxahgyowigdnktt/settings/api
2. Scroll down to "Project API keys"
3. Click the eye icon next to "service_role"
4. Copy the long key (starts with `eyJ...`)

---

## 🎯 Verification Checklist

Before testing, ensure:
- [ ] Stripe Price ID updated in 2 files
- [ ] Supabase service_role key in server.js
- [ ] SQL setup script run in Supabase
- [ ] Backend server running (`node server.js`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Can access both http://localhost:5173 and http://localhost:3001/health

---

## 💡 Pro Tips

1. **Keep both terminals open**:
   - Terminal 1: `npm run dev` (frontend)
   - Terminal 2: `node server.js` (backend)

2. **Watch the backend console** for real-time logs

3. **Test card numbers**:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

4. **No real charges**: Test mode cards don't charge real money!

---

## 📞 Need Help?

Check the backend logs in the terminal running `node server.js` - it shows:
- ✅ Checkout sessions created
- 💳 Payments received
- 🔄 Supabase updates
- ❌ Any errors

Logs use emojis to make it easy to follow! 🎨
