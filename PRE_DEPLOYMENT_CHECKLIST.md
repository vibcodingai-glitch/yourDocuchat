# ✅ Pre-Deployment Checklist - DocuChat Pro

## 🔐 Security & Credentials

- [ ] `.env` file exists locally (with all keys)
- [ ] `.env` is in `.gitignore` (never committed)
- [ ] Supabase URL and keys ready
- [ ] Stripe test keys ready (for testing)
- [ ] Stripe live keys ready (for production)
- [ ] n8n webhook URLs configured

## 📊 Database Setup

- [ ] `user_usage` table created in Supabase
- [ ] `subscriptions` table created (analytics)
- [ ] `payments` table created (analytics)
- [ ] RLS policies enabled on all tables
- [ ] Triggers set up for new users
- [ ] Test user exists with data

## 💳 Stripe Configuration

- [ ] Stripe account activated
- [ ] Product created ("DocuChat Pro")
- [ ] Price created ($9/month)
- [ ] Price ID copied to `.env`
- [ ] Webhook endpoint ready (will update after deploy)
- [ ] Test mode enabled for testing

## 🛠️ Code Quality

- [ ] All TypeScript errors fixed
- [ ] No console errors in browser
- [ ] Backend server runs without errors
- [ ] Frontend builds successfully (`npm run build`)
- [ ] All routes working locally
- [ ] Payment flow tested end-to-end

## 📝 Documentation

- [ ] README.md complete
- [ ] DEPLOYMENT_GUIDE.md created
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Database schema documented

## 🗂️ File Organization

- [ ] `.gitignore` created
- [ ] No `node_modules` committed
- [ ] No `.env` committed
- [ ] All source files organized
- [ ] Build artifacts excluded

## 🧪 Testing

- [ ] User signup/login works
- [ ] Document upload works (hits limit at 3)
- [ ] Transcript extraction works (hits limit at 3)
- [ ] Checkout page loads
- [ ] Payment processes successfully
- [ ] Pro status activates automatically
- [ ] Header shows ∞ after Pro activation
- [ ] Unlimited uploads work for Pro users

## 🚀 Ready to Deploy

- [ ] GitHub account ready
- [ ] Vercel account ready
- [ ] All checklist items above completed
- [ ] Latest code saved and committed locally

---

## 📋 Quick Test Sequence

Run this before deploying:

1. **Start servers:**
   ```bash
   npm run server  # Terminal 1
   npm run dev     # Terminal 2
   ```

2. **Test user flow:**
   - Go to http://localhost:5173
   - Sign up / Login
   - Upload 3 documents (should hit limit)
   - Click upload again → Redirects to checkout ✓
   - Complete payment (4242 4242 4242 4242)
   - Verify Pro status activates ✓
   - Header shows ∞ ✓

3. **Check database:**
   - `user_usage`: `is_pro = true` ✓
   - `subscriptions`: Row exists ✓
   - `payments`: Row exists ✓

4. **Verify backend logs:**
   ```
   ✅ Payment verified
   ✅ Pro status activated
   ✅ Subscription saved
   ✅ Payment saved
   ```

---

## ⚠️ Common Issues to Fix Before Deploy

### Issue 1: Missing Environment Variables
**Check:** All vars in `.env.example` are in your `.env`

### Issue 2: Build Errors
**Fix:** Run `npm run build` and fix any TypeScript errors

### Issue 3: Database Tables Missing
**Fix:** Run SQL scripts in Supabase SQL Editor

### Issue 4: Stripe Keys Not Working
**Fix:** Verify you're using the correct mode (test vs live)

---

## 🎯 Deployment Steps (Summary)

1. **Initialize Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub:**
   ```bash
   git remote add origin <YOUR_REPO_URL>
   git push -u origin main
   ```

3. **Deploy to Vercel:**
   - Import GitHub repo
   - Add environment variables
   - Deploy

4. **Post-Deployment:**
   - Update Stripe webhook URL
   - Test payment flow
   - Switch to live keys

---

## ✅ All Set!

Once all items are checked, you're ready to deploy!

See `DEPLOY_NOW.md` for exact commands.
See `DEPLOYMENT_GUIDE.md` for detailed instructions.

**Good luck! 🚀**
