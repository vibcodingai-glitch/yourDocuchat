# 🎯 FINAL STEPS TO COMPLETE SETUP

## ✅ Backend Server is Running!

The server is now active at http://localhost:3001

However, you need to update 2 values before testing:

---

## 1️⃣ Get Stripe Price ID (2 minutes)

1. Open: https://dashboard.stripe.com/test/products
2. Click on "DocuChat Pro"
3. You'll see the Price ID (starts with `price_`)
4. Copy it

5. **Update in 2 files:**

### File 1: `src/lib/stripe.ts`
Find line 7:
```typescript
export const STRIPE_PRICE_ID = 'price_XXXXXXXXX';
```
Replace `price_XXXXXXXXX` with your actual Price ID

### File 2: `src/pages/Checkout.tsx`
Find line 29:
```typescript
priceId: 'price_XXXXXXXXX',
```
Replace `price_XXXXXXXXX` with your actual Price ID

---

## 2️⃣ Get Supabase Service Key (1 minute)

1. Open: https://supabase.com/dashboard/project/lkwdjzxahgyowigdnktt/settings/api
2. Scroll to "Project API keys"
3. Find "service_role" key
4. Click the eye icon to reveal it
5. Copy the entire key (it's very long, starts with `eyJ`)

6. **Update in 1 file:**

### File: `server.js`
Find line 11:
```javascript
const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';
```
Replace `YOUR_SUPABASE_SERVICE_ROLE_KEY` with your actual service key

⚠️ **IMPORTANT**: Use the **service_role** key, NOT the anon key!

---

## 3️⃣ Restart the Backend Server

After updating the files:

1. **Stop** the current server (press Ctrl+C in the terminal running `node server.js`)
2. **Start** it again:
```bash
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

## 4️⃣ Test the Payment Flow

1. Go to: http://localhost:5173
2. Login
3. Upload 3 files (to hit the limit)
4. Try to upload 4th → Modal appears
5. Click "Upgrade to Pro"
6. Click "Subscribe Now"
7. Should now open Stripe Checkout (instead of error!)
8. Use card: **4242 4242 4242 4242**
9. Expiry: **12/25**, CVC: **123**, ZIP: **12345**
10. Complete payment
11. You're now Pro! ∞

---

## ✅ Quick Checklist

- [ ] Updated Stripe Price ID in `src/lib/stripe.ts`
- [ ] Updated Stripe Price ID in `src/pages/Checkout.tsx`
- [ ] Updated Supabase service key in `server.js`
- [ ] Restarted backend server
- [ ] Backend shows startup message
- [ ] Frontend still running (`npm run dev`)
- [ ] Ready to test!

---

## 🆘 If You Still See the Error

1. **Check backend is running**:
   - Should see "✅ Stripe backend server running..."
   - Terminal should be active, not crashed

2. **Check browser console** (F12):
   - Look for network errors
   - Should show POST to localhost:3001

3. **Try opening directly**:
   - http://localhost:3001/health
   - Should see: `{"status":"ok","message":"Stripe backend is running!"}`

---

## 💡 Why the Error Happened

The "Failed to start checkout" error means the frontend couldn't reach the backend. Common causes:
- ❌ Backend not running
- ❌ Wrong port (should be 3001)
- ❌ Price ID missing/wrong
- ❌ Service key missing/wrong

Once you complete steps 1-3 above, it will work! 🚀
