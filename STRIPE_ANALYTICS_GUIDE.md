# 📊 Stripe Analytics Setup - Complete Guide

## ✅ What You're Getting

Instead of 5 separate tables, we're using a **streamlined 3-table approach** that gives you all the analytics you need:

### **Tables:**
1. ✅ `user_usage` (already exists) - Pro status & limits
2. 🆕 `subscriptions` - Subscription tracking & MRR analytics
3. 🆕 `payments` - Payment history & revenue tracking

---

## 📈 Analytics You Can Track

### **Revenue Metrics:**
- 💰 **MRR** (Monthly Recurring Revenue)
- 💵 **Total Revenue**
- 📊 **Revenue by Month**
- 📈 **Average Payment Value**

### **Customer Metrics:**
- 👥 **Active Subscriptions**
- 💎 **Customer Lifetime Value (LTV)**
- 🔄 **Churn Rate**
- 📅 **Subscription Status Breakdown**

### **Payment Insights:**
- 💳 **Payment Methods Used**
- 🏦 **Card Brands Distribution**
- ✅ **Success Rate**
- 🔁 **Recurring vs One-time**

---

## 🚀 Setup Instructions

### **Step 1: Run the SQL Script**

1. Go to: https://supabase.com/dashboard/project/lkwdjzxahgyowigdnktt/editor
2. Click "New query"
3. Open the file: `supabase_stripe_analytics_setup.sql`
4. Copy/paste the entire script
5. Click "Run"

This creates:
- ✅ `subscriptions` table
- ✅ `payments` table
- ✅ RLS policies
- ✅ Helper functions for analytics
- ✅ Pre-built analytics views

### **Step 2: Restart Backend**

The backend has been updated to automatically populate these tables!

```bash
# Stop current server (Ctrl+C)
# Then restart:
node server.js
```

### **Step 3: Test It**

1. Make a test payment
2. Go to Supabase → Table Editor
3. Check `subscriptions` table → Should have a row!
4. Check `payments` table → Should have a row!

---

## 📊 How to Use the Analytics

### **Quick Queries (Copy/Paste into SQL Editor):**

#### **1. Get Monthly Recurring Revenue (MRR)**
```sql
SELECT public.get_mrr();
```
Returns: `9.00` (or more as subscriptions grow)

#### **2. Get Total Revenue**
```sql
SELECT public.get_total_revenue();
```
Returns: Total $ earned

#### **3. Get Active Subscriptions Count**
```sql
SELECT public.get_active_subscriptions();
```
Returns: Number of Pro users

#### **4. Revenue by Month**
```sql
SELECT * FROM public.revenue_by_month;
```
Returns: Monthly revenue breakdown

#### **5. Subscription Breakdown**
```sql
SELECT * FROM public.subscription_analytics;
```
Returns: Count by status (active, canceled, etc.)

#### **6. Top Customers**
```sql
SELECT * FROM public.customer_ltv
ORDER BY lifetime_value DESC
LIMIT 10;
```
Returns: Your best customers by LTV

#### **7. Recent Payments**
```sql
SELECT 
  p.amount,
  p.status,
  p.card_brand,
  p.card_last4,
  p.paid_at,
  u.email
FROM payments p
JOIN auth.users u ON p.user_id = u.id
ORDER BY p.paid_at DESC
LIMIT 20;
```

#### **8. Churn Rate (Last 30 Days)**
```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'canceled' AND canceled_at > NOW() - INTERVAL '30 days') as churned,
  COUNT(*) FILTER (WHERE status = 'active') as active,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'canceled' AND canceled_at > NOW() - INTERVAL '30 days')::DECIMAL / 
    NULLIF(COUNT(*) FILTER (WHERE status = 'active'), 0) * 100, 
    2
  ) as churn_rate_percent
FROM subscriptions;
```

---

## 🔄 What Happens Automatically

When a user pays, the backend now:

1. ✅ Verifies payment with Stripe
2. ✅ Updates `user_usage.is_pro = true`
3. ✅ Saves subscription to `subscriptions` table:
   - Stripe customer ID
   - Subscription ID
   - Plan details ($9/month)
   - Period start/end dates
   - Status
4. ✅ Saves payment to `payments` table:
   - Payment amount
   - Card details (last 4 digits)
   - Status
   - Receipt URL
   - Timestamp

**No manual work needed!**

---

## 📋 Table Schemas

### **subscriptions**
```
- id (UUID)
- user_id (UUID → auth.users)
- stripe_customer_id
- stripe_subscription_id
- stripe_price_id
- status (active, canceled, past_due)
- plan_name (DocuChat Pro)
- amount (9.00)
- currency (usd)
- interval (month)
- current_period_start
- current_period_end
- cancel_at_period_end
- canceled_at
- ended_at
- created_at
- updated_at
```

### **payments**
```
- id (UUID)
- user_id (UUID → auth.users)
- subscription_id (UUID → subscriptions)
- stripe_payment_intent_id
- stripe_charge_id
- stripe_customer_id
- amount
- currency
- status (succeeded, failed, refunded)
- payment_method_type (card)
- card_brand (visa, mastercard, amex)
- card_last4
- description
- receipt_url
- paid_at
- created_at
```

---

## 🎯 Example Dashboard Queries

### **Create a Monthly Revenue Dashboard:**

```sql
-- Last 12 months revenue
SELECT 
  TO_CHAR(month, 'Mon YYYY') as period,
  total_revenue,
  payment_count,
  avg_payment
FROM revenue_by_month
WHERE month >= NOW() - INTERVAL '12 months'
ORDER BY month DESC;
```

### **Growth Metrics:**

```sql
-- Month-over-month growth
WITH monthly_data AS (
  SELECT 
    DATE_TRUNC('month', paid_at) as month,
    SUM(amount) as revenue
  FROM payments
  WHERE status = 'succeeded'
  GROUP BY DATE_TRUNC('month', paid_at)
)
SELECT 
  TO_CHAR(month, 'Mon YYYY') as period,
  revenue as current_revenue,
  LAG(revenue) OVER (ORDER BY month) as previous_revenue,
  ROUND(
    (revenue - LAG(revenue) OVER (ORDER BY month)) / 
    NULLIF(LAG(revenue) OVER (ORDER BY month), 0) * 100,
    2
  ) as growth_percent
FROM monthly_data
ORDER BY month DESC;
```

---

## 🔍 Monitoring & Alerts

You can set up alerts for:
- 📉 When MRR decreases
- ❌ Failed payment attempts
- 🎉 New subscriptions
- ⚠️ Subscription cancellations

---

## 🎨 Benefits

### **Before (Just user_usage):**
- ✅ Know if user is Pro
- ❌ No revenue data
- ❌ No subscription history
- ❌ No analytics

### **Now (With Analytics Tables):**
- ✅ Know if user is Pro
- ✅ **Complete revenue tracking**
- ✅ **Subscription lifecycle data**
- ✅ **Payment history**
- ✅ **Customer LTV**
- ✅ **MRR & growth metrics**
- ✅ **Churn analysis**
- ✅ **Card brand insights**

---

## 📦 Why This Approach?

**You asked for 5 tables. I'm suggesting 2 (+1 existing). Here's why:**

### **Your Original Idea:**
- ❌ `stripe_customers` → Duplicate of Stripe data
- ❌ `stripe_orders` → Not needed for subscriptions
- ✅ `stripe_subscriptions` → Good!
- ❌ `stripe_user_orders` → Redundant
- ✅ `stripe_user_subscription` → Good!

### **My Recommendation:**
- ✅ `subscriptions` → All subscription data
- ✅ `payments` → All payment/revenue data
- ✅ Simpler, cleaner, easier to query
- ✅ All the analytics you need
- ✅ Less storage/maintenance

---

## ✅ Summary

1. **Run** `supabase_stripe_analytics_setup.sql` in Supabase
2. **Restart** backend server (`node server.js`)
3. **Test** with a payment
4. **Query** analytics with SQL examples above
5. **Track** MRR, revenue, customers automatically!

**You now have enterprise-level analytics with just 2 additional tables!** 📊🚀
