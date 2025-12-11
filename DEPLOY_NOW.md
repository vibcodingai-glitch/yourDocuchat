# 🚀 Quick Deployment Commands

## Initialize Git & Push to GitHub

```bash
# Navigate to project
cd /Users/abdulrahmanisah/Documents/ragproject

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - DocuChat Pro with Stripe integration"

# Create main branch
git branch -M main

# Add your GitHub repo (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

---

## Deploy to Vercel (Web Interface)

1. Go to: https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repo
4. Add environment variables (see DEPLOYMENT_GUIDE.md)
5. Click "Deploy"

---

## Deploy to Vercel (CLI - Optional)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts
# Set up project name
# Configure settings
# Add environment variables when prompted

# Deploy to production
vercel --prod
```

---

## Quick Checklist

Before deploying:

- [ ] `.gitignore` created ✅
- [ ] `.env` file NOT committed (excluded by .gitignore) ✅
- [ ] All API keys ready
- [ ] Supabase tables created
- [ ] Stripe product/price created
- [ ] README.md complete ✅
- [ ] Code tested locally

After deploying:

- [ ] Add environment variables in Vercel
- [ ] Update Stripe webhook URL
- [ ] Test payment flow
- [ ] Check Supabase data
- [ ] Switch to live Stripe keys (for production)

---

## Environment Variables for Vercel

Copy these to Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
FRONTEND_URL=https://your-app.vercel.app
VITE_N8N_UPLOAD_WEBHOOK=
VITE_N8N_CHAT_WEBHOOK=
VITE_N8N_YOUTUBE_WEBHOOK=
```

---

## Your Current Setup

**Local URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

**API Endpoints:**
- POST /api/create-checkout
- POST /api/verify-payment
- POST /api/stripe-webhook
- GET /health

**Database Tables:**
- user_usage ✅
- subscriptions ✅
- payments ✅
- customer_ltv (view) ✅
- revenue_by_month (view) ✅
- subscription_analytics (view) ✅

---

## Files Ready for Deployment

✅ `.gitignore` - Excludes sensitive files
✅ `.env.example` - Template for environment variables  
✅ `README.md` - Project documentation
✅ `DEPLOYMENT_GUIDE.md` - Full deployment instructions
✅ `vercel.json` - Vercel configuration
✅ `package.json` - Dependencies and scripts
✅ All source code - Frontend & Backend
✅ Database schemas - SQL files for Supabase

---

## Next Steps

1. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Name it (e.g., "docuchat-pro")
   - Don't initialize with README
   - Create repository

2. **Run Git Commands:**
   ```bash
   cd /Users/abdulrahmanisah/Documents/ragproject
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <YOUR_GITHUB_URL>
   git push -u origin main
   ```

3. **Deploy on Vercel:**
   - Import from GitHub
   - Add environment variables
   - Deploy!

---

**Everything is ready! Just follow the steps above to deploy.** 🚀
