import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { updatePassword } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we have the recovery token in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');

        if (type !== 'recovery') {
            setError('Invalid or expired reset link');
        }
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const { error } = await updatePassword(password);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess('Password updated successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper fade-in">
                <div className="auth-card card-glass">
                    <div className="auth-header">
                        <h1 className="auth-title">Set New Password</h1>
                        <p className="auth-subtitle text-muted">
                            Enter your new password below
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
                            <label htmlFor="password" className="form-label">
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    Updating password...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
