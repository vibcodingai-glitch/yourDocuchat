/*
  Stripe Analytics Tables for Supabase
  Run this in your Supabase SQL Editor
  
  This creates tables to track:
  - Subscriptions (for analytics)
  - Payment history
  - Customer data
*/

-- ==========================================
-- 1. SUBSCRIPTIONS TABLE
-- ==========================================
-- Tracks all subscription data for analytics

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stripe IDs
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  
  -- Subscription details
  status TEXT DEFAULT 'active', -- active, canceled, past_due, trialing
  plan_name TEXT DEFAULT 'DocuChat Pro',
  amount DECIMAL(10,2) DEFAULT 9.00,
  currency TEXT DEFAULT 'usd',
  interval TEXT DEFAULT 'month', -- month, year
  
  -- Dates
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- ==========================================
-- 2. PAYMENTS TABLE
-- ==========================================
-- Tracks all payment transactions for revenue analytics

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  
  -- Stripe IDs
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_customer_id TEXT,
  
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'succeeded', -- succeeded, failed, pending, refunded
  
  -- Payment method
  payment_method_type TEXT, -- card, bank_transfer, etc.
  card_brand TEXT, -- visa, mastercard, amex
  card_last4 TEXT,
  
  -- Metadata
  description TEXT,
  receipt_url TEXT,
  
  -- Dates
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_paid_at ON public.payments(paid_at);

-- ==========================================
-- 3. ROW LEVEL SECURITY
-- ==========================================

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = user_id);

-- ==========================================
-- 4. HELPER FUNCTIONS
-- ==========================================

-- Function to get Monthly Recurring Revenue (MRR)
CREATE OR REPLACE FUNCTION public.get_mrr()
RETURNS DECIMAL AS $$
SELECT COALESCE(SUM(amount), 0) as mrr
FROM public.subscriptions
WHERE status = 'active'
  AND interval = 'month';
$$ LANGUAGE SQL;

-- Function to get total revenue
CREATE OR REPLACE FUNCTION public.get_total_revenue()
RETURNS DECIMAL AS $$
SELECT COALESCE(SUM(amount), 0) as total_revenue
FROM public.payments
WHERE status = 'succeeded';
$$ LANGUAGE SQL;

-- Function to get active subscriptions count
CREATE OR REPLACE FUNCTION public.get_active_subscriptions()
RETURNS INTEGER AS $$
SELECT COUNT(*) as active_subs
FROM public.subscriptions
WHERE status = 'active';
$$ LANGUAGE SQL;

-- ==========================================
-- 5. ANALYTICS VIEWS
-- ==========================================

-- View: Revenue by month
CREATE OR REPLACE VIEW public.revenue_by_month AS
SELECT 
  DATE_TRUNC('month', paid_at) as month,
  COUNT(*) as payment_count,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_payment
FROM public.payments
WHERE status = 'succeeded'
  AND paid_at IS NOT NULL
GROUP BY DATE_TRUNC('month', paid_at)
ORDER BY month DESC;

-- View: Subscription analytics
CREATE OR REPLACE VIEW public.subscription_analytics AS
SELECT 
  status,
  COUNT(*) as count,
  SUM(amount) as revenue,
  AVG(amount) as avg_amount
FROM public.subscriptions
GROUP BY status;

-- View: Customer lifetime value
CREATE OR REPLACE VIEW public.customer_ltv AS
SELECT 
  u.email,
  s.user_id,
  COUNT(p.id) as total_payments,
  SUM(p.amount) as lifetime_value,
  MIN(p.paid_at) as first_payment,
  MAX(p.paid_at) as last_payment
FROM auth.users u
JOIN public.subscriptions s ON u.id = s.user_id
LEFT JOIN public.payments p ON s.id = p.subscription_id
WHERE p.status = 'succeeded'
GROUP BY u.email, s.user_id
ORDER BY lifetime_value DESC;

-- ==========================================
-- DONE!
-- ==========================================

/*
  After running this, you can get analytics with simple queries:

  -- Get MRR
  SELECT public.get_mrr();

  -- Get total revenue
  SELECT public.get_total_revenue();

  -- Get active subscriptions
  SELECT public.get_active_subscriptions();

  -- Revenue by month
  SELECT * FROM public.revenue_by_month;

  -- Subscription breakdown
  SELECT * FROM public.subscription_analytics;

  -- Top customers
  SELECT * FROM public.customer_ltv LIMIT 10;
*/
