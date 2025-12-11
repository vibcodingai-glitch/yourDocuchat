import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Initialize Stripe with environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Initialize Supabase with environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Allowed origins for CORS
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'http://localhost:5173'
];

// Configure CORS properly
app.use(cors({
    origin: function (origin, callback) {
        //Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
}));

// Rate limiters
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const paymentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: 'Too many payment attempts, please try again in a minute.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply general rate limiter to all API routes
app.use('/api', apiLimiter);

// Parse JSON for most routes
app.use(express.json());

// Validation middleware
const validateCheckout = [
    body('userId').isUUID().withMessage('Invalid user ID'),
    body('userEmail').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('priceId').matches(/^price_[a-zA-Z0-9_]+$/).withMessage('Invalid price ID'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validatePayment = [
    body('sessionId').matches(/^cs_test_[a-zA-Z0-9]+$|^cs_live_[a-zA-Z0-9]+$/).withMessage('Invalid session ID'),
    body('userId').isUUID().withMessage('Invalid user ID'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Helper function for error responses
const handleError = (res, error, statusCode = 500) => {
    console.error('❌ Error:', error);
    const isDev = process.env.NODE_ENV === 'development';
    res.status(statusCode).json({
        error: isDev ? error.message : 'An error occurred. Please try again.'
    });
};

// Create checkout session
app.post('/api/create-checkout', paymentLimiter, validateCheckout, async (req, res) => {
    try {
        const { userId, userEmail, priceId } = req.body;

        console.log('📝 Creating checkout for:', { userId, userEmail, priceId });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            customer_email: userEmail,
            metadata: {
                userId: userId
            },
            success_url: `${frontendUrl}/payment-success?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/checkout?payment=cancelled`,
        });

        console.log('✅ Checkout session created:', session.id);
        res.json({ url: session.url });
    } catch (error) {
        handleError(res, error);
    }
});

// Verify payment and return status
app.post('/api/verify-payment', paymentLimiter, validatePayment, async (req, res) => {
    try {
        const { sessionId, userId } = req.body;

        console.log('🔍 Verifying payment for session:', sessionId);

        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        console.log('📋 Session status:', session.payment_status);
        console.log('👤 Session user:', session.metadata?.userId);

        // Verify the session belongs to this user and payment was successful
        const isPaid = session.payment_status === 'paid';
        const isCorrectUser = session.metadata?.userId === userId;

        if (isPaid && isCorrectUser) {
            console.log('✅ Payment verified for user:', userId);

            // 1. Update Pro status in user_usage
            const { error: updateError } = await supabase
                .from('user_usage')
                .update({
                    is_pro: true,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (updateError) {
                console.error('❌ Error updating Supabase:', updateError);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to activate Pro status'
                });
            }

            console.log('✅ Pro status activated in Supabase for user:', userId);

            // 2. Save subscription to analytics table (if subscription exists)
            if (session.subscription) {
                try {
                    const subscription = await stripe.subscriptions.retrieve(session.subscription);
                    console.log('📊 Retrieved subscription:', subscription.id);

                    const { error: subError } = await supabase
                        .from('subscriptions')
                        .insert({
                            user_id: userId,
                            stripe_customer_id: session.customer,
                            stripe_subscription_id: session.subscription,
                            stripe_price_id: subscription.items.data[0].price.id,
                            status: subscription.status,
                            plan_name: 'DocuChat Pro',
                            amount: subscription.items.data[0].price.unit_amount / 100,
                            currency: subscription.currency,
                            interval: subscription.items.data[0].price.recurring.interval,
                            current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
                            current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
                            cancel_at_period_end: subscription.cancel_at_period_end || false
                        });

                    if (subError) {
                        console.error('⚠️  Error saving subscription:', subError);
                    } else {
                        console.log('✅ Subscription saved to analytics');
                    }
                } catch (subErr) {
                    console.error('⚠️  Error fetching/saving subscription:', subErr);
                }
            }

            // 3. Save payment to analytics table (if payment_intent exists)
            if (session.payment_intent) {
                try {
                    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
                    const charge = paymentIntent.charges.data[0];

                    const { error: payError } = await supabase
                        .from('payments')
                        .insert({
                            user_id: userId,
                            stripe_payment_intent_id: session.payment_intent,
                            stripe_charge_id: charge?.id,
                            stripe_customer_id: session.customer,
                            amount: session.amount_total / 100,
                            currency: session.currency,
                            status: paymentIntent.status,
                            payment_method_type: charge?.payment_method_details?.type,
                            card_brand: charge?.payment_method_details?.card?.brand,
                            card_last4: charge?.payment_method_details?.card?.last4,
                            description: `DocuChat Pro Subscription - ${new Date().toLocaleDateString()}`,
                            receipt_url: charge?.receipt_url,
                            paid_at: charge?.created ? new Date(charge.created * 1000).toISOString() : new Date().toISOString()
                        });

                    if (payError) {
                        console.error('⚠️  Error saving payment:', payError);
                    } else {
                        console.log('✅ Payment saved to analytics');
                    }
                } catch (payErr) {
                    console.error('⚠️  Error fetching/saving payment:', payErr);
                }
            }

            res.json({
                success: true,
                isPaid: true,
                message: 'Payment verified and Pro status activated'
            });
        } else {
            console.log('⚠️  Payment verification failed');
            res.status(403).json({
                success: false,
                isPaid: false,
                message: 'Payment not verified'
            });
        }
    } catch (error) {
        handleError(res, error);
    }
});

// Stripe webhook handler
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
        // Verify webhook signature (PRODUCTION READY)
        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            // Development fallback (NOT FOR PRODUCTION)
            console.warn('⚠️  Webhook signature verification disabled - NOT FOR PRODUCTION');
            event = JSON.parse(req.body.toString());
        }
    } catch (err) {
        console.log('❌ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('📨 Received webhook event:', event.type);

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
            case 'customer.subscription.created':
                const session = event.data.object;
                const userId = session.metadata?.userId;

                if (!userId) {
                    console.log('⚠️  No userId in session metadata');
                    break;
                }

                console.log('💳 Payment successful for user:', userId);

                // Update user to Pro status in Supabase
                const { data, error } = await supabase
                    .from('user_usage')
                    .update({
                        is_pro: true,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId);

                if (error) {
                    console.error('❌ Error updating Supabase:', error);
                } else {
                    console.log('✅ User upgraded to Pro in Supabase!');
                }

                break;

            case 'customer.subscription.updated':
                const updatedSub = event.data.object;
                console.log('🔄 Subscription updated:', updatedSub.id);

                if (updatedSub.cancel_at_period_end) {
                    console.log('⚠️  Subscription will cancel at period end');
                }
                break;

            case 'customer.subscription.deleted':
                const deletedSub = event.data.object;
                const customerId = deletedSub.customer;

                console.log('❌ Subscription cancelled for customer:', customerId);

                // Get customer details to find userId
                const customer = await stripe.customers.retrieve(customerId);
                const userIdToDowngrade = customer.metadata?.userId;

                if (userIdToDowngrade) {
                    // Downgrade user from Pro
                    const { error: downgradeError } = await supabase
                        .from('user_usage')
                        .update({
                            is_pro: false,
                            updated_at: new Date().toISOString()
                        })
                        .eq('user_id', userIdToDowngrade);

                    if (downgradeError) {
                        console.error('❌ Error downgrading user:', downgradeError);
                    } else {
                        console.log('✅ User downgraded from Pro');
                    }
                }

                break;

            default:
                console.log(`ℹ️  Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
    }

    res.json({ received: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Stripe backend is running!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log('\n🚀 ========================================');
    console.log(`✅ Stripe backend server running on http://localhost:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('📋 Available endpoints:');
    console.log('   - POST /api/create-checkout');
    console.log('   - POST /api/verify-payment');
    console.log('   - POST /api/stripe-webhook');
    console.log('   - GET  /health');
    console.log('========================================\n');
});
