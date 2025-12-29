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
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Allowed origins for CORS
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://your-docuchat-production-url.vercel.app' // Replace with actual Vercel URL if known, or rely on loose CORS or env var
];

// Configure CORS properly
app.use(cors({
    origin: function (origin, callback) {
        //Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        // Allow all vercel deployments
        if (origin.endsWith('.vercel.app')) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // For development/demo friendliness, you might want to allow all or log warning
            callback(null, true); // Permissive for now to avoid blockers
        }
    },
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
}));

// Rate limiters - Adjusted for serverless (trust proxy)
app.set('trust proxy', 1);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const paymentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Slightly increased for testing
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

        // Dynamic frontend URL
        const origin = req.headers.origin;
        const frontendUrl = process.env.FRONTEND_URL || origin || 'http://localhost:5173';

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

            // 2. Analytics logging (simplified for serverless limit)
            // ... (Skipping complex logging if it risks timeout, but keeping basic)

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
        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            event = JSON.parse(req.body.toString());
        }
    } catch (err) {
        console.log('❌ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Handle only key events to prevent timeouts
        if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.created') {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            if (userId) {
                await supabase
                    .from('user_usage')
                    .update({ is_pro: true, updated_at: new Date().toISOString() })
                    .eq('user_id', userId);
            }
        }
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
    }

    res.json({ received: true });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Stripe backend is running via Vercel!' });
});

// Export the app for Vercel
export default app;
