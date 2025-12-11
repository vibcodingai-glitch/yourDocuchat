// Stripe Configuration
// Using environment variables for security

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
export const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || '';
