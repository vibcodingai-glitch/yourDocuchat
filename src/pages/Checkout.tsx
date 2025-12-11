import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import './Checkout.css';

export default function Checkout() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = async () => {
        if (!user) {
            setError('Please log in to continue');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Create a checkout session via local backend
            const response = await fetch('http://localhost:3001/api/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    userEmail: user.email,
                    priceId: 'price_1Sc6VjGu1VPlInb3MFdTuqzM',
                }),
            });

            const data = await response.json();

            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                throw new Error('Failed to create checkout session');
            }
        } catch (err) {
            setError('Failed to start checkout. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <Header />

            <main className="checkout-main">
                <div className="checkout-container">
                    <div className="checkout-card">
                        {/* Header */}
                        <div className="checkout-header">
                            <div className="pro-badge-large">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                            </div>
                            <h1>Upgrade to DocuChat Pro</h1>
                            <p className="checkout-subtitle">Unlock unlimited AI-powered document processing</p>
                        </div>

                        {/* Pricing */}
                        <div className="pricing-section">
                            <div className="price">
                                <span className="price-amount">$9</span>
                                <span className="price-period">/month</span>
                            </div>
                            <p className="price-description">Billed monthly • Cancel anytime</p>
                        </div>

                        {/* Features */}
                        <div className="features-section">
                            <h3>What's included:</h3>
                            <ul className="feature-list">
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <span><strong>Unlimited</strong> document uploads</span>
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <span><strong>Unlimited</strong> transcript extractions</span>
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <span>Priority support</span>
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <span>Advanced AI features</span>
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <span>No ads</span>
                                </li>
                            </ul>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="checkout-actions">
                            <button
                                className="btn-subscribe"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                            <line x1="1" y1="10" x2="23" y2="10"></line>
                                        </svg>
                                        Subscribe Now
                                    </>
                                )}
                            </button>
                            <button className="btn-back" onClick={() => navigate(-1)}>
                                Go Back
                            </button>
                        </div>

                        {/* Security Badge */}
                        <div className="security-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                            <span>Secured by Stripe</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
