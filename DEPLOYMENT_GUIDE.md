# 🚀 Deploying DocuChat Pro to Vercel

Complete step-by-step guide for deploying your app to production.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [x] GitHub account
- [x] Vercel account (free tier works!)
- [x] Production Supabase project
- [x] Live Stripe account (for real payments)
- [x] All API keys ready

---

## 🔧 Step 1: Prepare Environment Variables

Create a list of your production environment variables:

```env
# Supabase
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe (LIVE keys for production!)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server
PORT=3001
FRONTEND_URL=https://your-app.vercel.app

# n8n Webhooks
VITE_N8N_UPLOAD_WEBHOOK=https://your-n8n.app/webhook/upload
VITE_N8N_CHAT_WEBHOOK=https://your-n8n.app/webhook/chat
VITE_N8N_YOUTUBE_WEBHOOK=https://your-n8n.app/webhook/youtube
```

⚠️ **IMPORTANT:** Use **LIVE** Stripe keys for production, not test keys!

---

## 📦 Step 2: Push to GitHub

### Initialize Git (if not done):

```bash
cd /Users/abdulrahmanisah/Documents/ragproject
git init
git add .
git commit -m "Initial commit - DocuChat Pro"
```

### Create GitHub Repository:

1. Go to https://github.com/new
2. Name: `docuchat-pro` (or your choice)
3. Make it **Private** (recommended)
4. **Don't** initialize with README
5. Click "Create repository"

### Push Code:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/docuchat-pro.git
git push -u origin main
```

---

## 🌐 Step 3: Deploy to Vercel

### A. Import Project

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository
4. Click "Import"

### B. Configure Build Settings

Vercel should auto-detect:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

If not, set them manually.

### C. Add Environment Variables

In the Vercel dashboard:

1. Go to "Settings" → "Environment Variables"
2. Add each variable from Step 1
3. Select **all** environments (Production, Preview, Development)
4. Click "Save"

**Variables to add:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `FRONTEND_URL` (use your Vercel URL)
- `VITE_N8N_UPLOAD_WEBHOOK`
- `VITE_N8N_CHAT_WEBHOOK`
- `VITE_N8N_YOUTUBE_WEBHOOK`

### D. Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes
3. ✅ Your app is live!

---

## 🔗 Step 4: Update API URLs

After deployment, update these URLs:

### In Stripe Dashboard:

1. Go to: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe-webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Add to Vercel env vars: `STRIPE_WEBHOOK_SECRET=whsec_...`

### In Vercel:

1. Update `FRONTEND_URL` to your actual domain
2. Redeploy to apply changes

---

## ✅ Step 5: Test Production

### Test the app:

1. Visit `https://your-app.vercel.app`
2. Sign up with a real email
3. Try uploading a document
4. Test the checkout flow (**use test card 4242 4242 4242 4242**)
5. Verify Pro status activates

### Check Supabase:

- `user_usage` table → User exists, `is_pro = true`
- `subscriptions` table → Subscription saved
- `payments` table → Payment recorded

---

## 🎯 Step 6: Switch to Live Stripe Keys

**For real customers:**

1. Go to Stripe Dashboard → Developers → API Keys
2. Copy **LIVE** publishable key and secret key
3. Update in Vercel environment variables:
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_PRICE_ID=price_live_...` (create a live price)
4. Redeploy in Vercel
5. Test with a **real card** (will charge!)

---

## 🔐 Security Checklist

Before going live:

- [ ] All sensitive keys in environment variables (not in code)
- [ ] `.env` file in `.gitignore`
- [ ] Stripe webhook signature verification enabled
- [ ] Supabase RLS policies enabled on all tables
- [ ] CORS properly configured
- [ ] Test payment flow end-to-end
- [ ] Set up Stripe Customer Portal for subscription management

---

## 📊 Monitoring & Analytics

### Vercel Analytics:

- Enable in Vercel dashboard for traffic insights

### Stripe Dashboard:

- Monitor payments, subscriptions, and revenue
- Set up email notifications for failed payments

### Supabase:

- Use SQL Editor to run analytics queries
- Monitor database performance

---

## 🐛 Common Deployment Issues

### Issue 1: Environment variables not loading

**Solution:**
- Verify all env vars are set in Vercel
- Redeploy after adding variables
- Check that variables start with `VITE_` for frontend access

### Issue 2: API routes returning 404

**Solution:**
- Check `vercel.json` routes configuration
- Verify backend endpoints start with `/api`
- Redeploy

### Issue 3: Stripe webhook not working

**Solution:**
- Update webhook URL in Stripe Dashboard
- Use production domain (not localhost)
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Check webhook logs in Stripe Dashboard

### Issue 4: CORS errors

**Solution:**
- Update `FRONTEND_URL` in backend
- Verify CORS origins in `server.js`
- Redeploy backend

---

## 🔄 Continuous Deployment

Once set up, Vercel auto-deploys:

- **Main branch** → Production
- **Other branches** → Preview deployments

Just push to GitHub and Vercel handles the rest!

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel automatically deploys in ~2 minutes.

---

## 📝 Post-Deployment Tasks

1. **Set up domain:**
   - Go to Vercel → Settings → Domains
   - Add your custom domain (e.g., `docuchat.pro`)
   - Update DNS records

2. **Enable Stripe Customer Portal:**
   - Go to Stripe Dashboard → Customer Portal
   - Configure settings
   - Enable subscription management

3. **Set up monitoring:**
   - Vercel Analytics
   - Sentry for error tracking (optional)
   - Google Analytics (optional)

4. **Create admin dashboard** (optional):
   - Use Supabase SQL queries
   - Build analytics views
   - Monitor revenue and subscriptions

---

## ✅ Deployment Complete!

Your app is now live at: `https://your-app.vercel.app`

**Next Steps:**
- Share with beta testers
- Collect feedback
- Iterate and improve
- Start marketing!

---

## 🆘 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs

---

**Congratulations! Your app is deployed! 🎉**
