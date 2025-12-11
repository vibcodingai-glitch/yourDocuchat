import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const { error } = await resetPassword(email);

        if (error) {
            setError(error.message);
        } else {
            setSuccess('Check your email for a password reset link');
        }

        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper fade-in">
                <div className="auth-card card-glass">
                    <div className="auth-header">
                        <h1 className="auth-title">Reset Password</h1>
                        <p className="auth-subtitle text-muted">
                            Enter your email to receive a reset link
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="alert alert-error slide-up">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success slide-up">
                                {success}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Sending...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p className="text-muted">
                            Remember your password?{' '}
                            <Link to="/login">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
