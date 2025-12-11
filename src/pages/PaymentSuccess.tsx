import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUsage } from '../contexts/UsageContext';
import Header from '../components/Header';
import './PaymentSuccess.css';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { refreshUsage } = useUsage();
    const [loading, setLoading] = useState(true);
    const [_error, setError] = useState('');

    useEffect(() => {
        const activateProStatus = async () => {
            if (!user) {
                setError('Please log in to continue');
                setLoading(false);
                return;
            }

            const payment = searchParams.get('payment');
            const sessionId = searchParams.get('session_id');

            if (payment === 'success' && sessionId) {
                try {
                    // Step 1: Verify the payment with Stripe backend
                    const verifyResponse = await fetch('http://localhost:3001/api/verify-payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sessionId,
                            userId: user.id,
                        }),
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyData.success && verifyData.isPaid) {
                        // Backend already updated Pro status, just refresh
                        console.log('✅ Payment verified! Pro status activated');
                        await refreshUsage();
                    } else {
                        setError('Payment verification failed. Please contact support.');
                    }
                } catch (error) {
                    console.error('Error activating Pro:', error);
                    setError('An error occurred. Please contact support.');
                }
            }

            setLoading(false);
        };

        activateProStatus();
    }, [searchParams, user, refreshUsage]);

    if (loading) {
        return (
            <div className="payment-page">
                <Header />
                <main className="payment-main">
                    <div className="payment-container">
                        <div className="spinner"></div>
                        <p>Processing your subscription...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <Header />

            <main className="payment-main">
                <div className="payment-container">
                    <div className="payment-card">
                        {/* Success Icon */}
                        <div className="success-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>

                        {/* Content */}
                        <h1>Welcome to DocuChat Pro!</h1>
                        <p className="success-message">
                            Your subscription is now active. Enjoy unlimited uploads and transcripts!
                        </p>

                        {/* Features Unlocked */}
                        <div className="unlocked-features">
                            <h3>You now have access to:</h3>
                            <ul>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Unlimited document uploads
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Unlimited transcript extractions
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Priority support
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Advanced AI features
                                </li>
                            </ul>
                        </div>

                        {/* Action Button */}
                        <button className="btn-get-started" onClick={() => navigate('/dashboard')}>
                            Get Started
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
