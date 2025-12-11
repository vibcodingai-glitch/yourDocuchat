# ✅ QUICK START CHECKLIST

## Before Testing (One-Time Setup)

### 1. Get Stripe Price ID
- [ ] Go to: https://dashboard.stripe.com/test/products
- [ ] Click "DocuChat Pro"
- [ ] Copy Price ID (starts with `price_`)
- [ ] Paste in `src/lib/stripe.ts` line 7
- [ ] Paste in `src/pages/Checkout.tsx` line 29

### 2. Get Supabase Service Key
- [ ] Go to: https://supabase.com/dashboard/project/lkwdjzxahgyowigdnktt/settings/api
- [ ] Copy "service_role" key (click eye icon to reveal)
- [ ] Paste in `server.js` line 11

### 3. Run Database Setup
- [ ] Go to Supabase SQL Editor
- [ ] Copy/paste content from `supabase_usage_setup.sql`
- [ ] Click "Run" to create the user_usage table

---

## Every Time You Test (Runtime)

### Terminal 1 - Frontend
```bash
npm run dev
```
Should show: `http://localhost:5173/`

### Terminal 2 - Backend
```bash
npm run server
```
Should show: `✅ Stripe backend server running on http://localhost:3001`

---

## Testing the Payment Flow

1. [ ] Open http://localhost:5173
2. [ ] Login with your account
3. [ ] Upload 3 files (to hit the limit)
4. [ ] Try to upload 4th file → Modal appears
5. [ ] Click "Upgrade to Pro" → Goes to checkout page
6. [ ] Click "Subscribe Now" → Opens Stripe
7. [ ] Enter card: `4242 4242 4242 4242`
8. [ ] Enter expiry: `12/25` (any future date)
9. [ ] Enter CVC: `123` (any 3 digits)
10. [ ] Enter ZIP: `12345` (any 5 digits)
11. [ ] Click "Pay" → Success page appears
12. [ ] Check header → Should show "∞" instead of "3"
13. [ ] Try uploading more files → Should work!

---

## Troubleshooting

### ❌ "Failed to start checkout"
→ Make sure backend is running: `npm run server`

### ❌ Backend won't start
→ Check that port 3001 is available
→ Make sure all npm packages are installed: `npm install`

### ❌ Payment works but still shows limit
→ Check backend terminal for errors
→ Verify service_role key is correct in server.js
→ Make sure SQL setup was run in Supabase

---

## Quick Links

- **Stripe Dashboard**: https://dashboard.stripe.com/test/products
- **Supabase Dashboard**: https://supabase.com/dashboard/project/lkwdjzxahgyowigdnktt
- **Frontend**: http://localhost:5173
- **Backend Health**: http://localhost:3001/health

---

## Important Files

- `server.js` - Backend server (handles Stripe + Supabase)
- `src/pages/Checkout.tsx` - Payment page
- `src/contexts/UsageContext.tsx` - Pro status manager
- `supabase_usage_setup.sql` - Database setup

---

## Status Indicators

✅ = Ready to test
⚠️ = Needs configuration
❌ = Has errors

Current Status:
- Stripe Integration: ⚠️ (needs Price ID)
- Supabase Integration: ⚠️ (needs service_role key)
- Database Setup: ⚠️ (needs SQL script run)
- Frontend: ✅ (ready)
- Backend: ✅ (ready)

Once all show ✅, you're ready to test!
