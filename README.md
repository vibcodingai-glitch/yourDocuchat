# DocuChat Pro - AI Document Processing Platform

A modern web application for AI-powered document uploads, chat with documents, and YouTube transcript extraction with Stripe payment integration.

## 🚀 Features

- **Document Upload & Processing** - Upload PDFs, TXT, DOC, DOCX files
- **AI-Powered Chat** - Chat with your uploaded documents
- **YouTube Transcript Extraction** - Extract transcripts from YouTube videos
- **Pro Subscription** - $9/month for unlimited access
- **Usage Limits** - Free tier: 3 uploads & 3 transcripts
- **Stripe Payments** - Secure subscription management
- **Analytics Dashboard** - Track revenue, subscriptions, and customer metrics

## 🛠️ Tech Stack

### Frontend
- React + TypeScript
- Vite
- React Router
- Supabase Auth

### Backend
- Node.js + Express
- Stripe API
- Supabase (PostgreSQL)

### Services
- Supabase (Auth + Database)
- Stripe (Payments)
- n8n (Webhooks for document processing)

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account
- Stripe account
- n8n instance (for document/transcript processing)

## 🔧 Local Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ragproject
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRICE_ID=your_price_id
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173

# n8n Webhooks
VITE_N8N_UPLOAD_WEBHOOK=your_upload_webhook_url
VITE_N8N_CHAT_WEBHOOK=your_chat_webhook_url
VITE_N8N_YOUTUBE_WEBHOOK=your_youtube_webhook_url
```

### 4. Set Up Supabase Database

Run these SQL scripts in your Supabase SQL Editor:

1. **User Usage Table:**
   ```bash
   # File: supabase_usage_setup.sql
   ```

2. **Analytics Tables (Optional):**
   ```bash
   # File: supabase_stripe_analytics_setup.sql
   ```

### 5. Run the Application

**Start the backend server:**
```bash
npm run server
```

**Start the frontend (in a new terminal):**
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🌐 Deployment

### Deploy to Vercel

#### Frontend Deployment

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables (see `.env.example`)
   - Deploy!

#### Backend Deployment

**Option 1: Vercel Serverless Functions**
- The backend can be deployed as Vercel serverless functions
- See `vercel.json` for configuration

**Option 2: Separate Service (Railway/Render)**
- Deploy `server.js` to Railway or Render
- Update `FRONTEND_URL` in backend env
- Update frontend API URLs to point to deployed backend

### Environment Variables for Production

Set these in Vercel Dashboard:

```
VITE_SUPABASE_URL=<your-production-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
VITE_STRIPE_PUBLISHABLE_KEY=<your-live-stripe-pk>
STRIPE_SECRET_KEY=<your-live-stripe-sk>
STRIPE_PRICE_ID=<your-live-price-id>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
FRONTEND_URL=https://your-domain.vercel.app
VITE_N8N_UPLOAD_WEBHOOK=<your-production-webhook>
VITE_N8N_CHAT_WEBHOOK=<your-production-webhook>
VITE_N8N_YOUTUBE_WEBHOOK=<your-production-webhook>
```

## 📊 Analytics

The app includes built-in analytics for:
- Monthly Recurring Revenue (MRR)
- Total Revenue
- Active Subscriptions
- Customer Lifetime Value
- Payment Success Rates
- Churn Analysis

Query examples in: `STRIPE_ANALYTICS_GUIDE.md`

## 🔐 Security Notes

- All API keys are in `.env` (never commit this file)
- RLS (Row Level Security) enabled on all Supabase tables
- Stripe webhook signature verification for production
- Backend validates all payments before activating Pro status

## 📚 Documentation

- `README_STRIPE.md` - Complete Stripe integration guide
- `STRIPE_ANALYTICS_GUIDE.md` - Analytics setup and queries
- `AUTOMATIC_PRO_ACTIVATION.md` - How Pro activation works
- `PAYMENT_FLOW_DIAGRAM.txt` - Visual payment flow

## 🧪 Testing

### Test Stripe Payments

Use these test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits

## 🐛 Troubleshooting

### Common Issues

1. **Blank page after login**
   - Check browser console for errors
   - Verify Supabase credentials
   - Check `user_usage` table exists

2. **Payment not activating Pro**
   - Check backend server is running
   - Verify `/api/verify-payment` endpoint
   - Check Supabase service role key

3. **CORS errors**
   - Update `FRONTEND_URL` in backend
   - Check CORS configuration in `server.js`

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue first to discuss changes.

## 📧 Support

For issues, please create a GitHub issue or contact support.

---

**Built with ❤️ using React, Supabase, and Stripe**
