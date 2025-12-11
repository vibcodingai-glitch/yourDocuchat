import { memo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useUsage } from '../contexts/UsageContext';
import './Header.css';

const Header = memo(function Header() {
    const { getDisplayName, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { documentCount, transcriptCount, isPro } = useUsage();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Chat', icon: '💬' },
        { path: '/youtube', label: 'Transcripts', icon: '📝' },
        { path: '/upload', label: 'Upload', icon: '📤' },
        { path: '/history', label: 'History', icon: '🕒' },
    ];

    return (
        <header className="header">
            {/* Top Navigation Bar */}
            <div className="header-top">
                <div className="header-container">
                    {/* Logo */}
                    <div className="header-logo">
                        <div className="logo-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <span className="logo-text">DocuChat AI</span>
                    </div>

                    {/* Usage Stats - Center */}
                    <div className="header-stats">
                        <div className="stat-item">
                            <span className="stat-label">Documents Usage</span>
                            <span className="stat-value">{documentCount} / {isPro ? '∞' : '3'}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Transcripts Usage</span>
                            <span className="stat-value">{transcriptCount} / {isPro ? '∞' : '3'}</span>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="header-actions">
                        {/* User Info */}
                        <div className="user-info">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="user-icon">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span className="user-name">{getDisplayName()}</span>
                        </div>

                        {/* Pro Badge */}
                        {isPro && <div className="pro-badge">Pro</div>}

                        {/* Theme Toggle */}
                        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                            {theme === 'dark' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5" />
                                    <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            )}
                        </button>

                        {/* Logout Button */}
                        <button onClick={handleSignOut} className="logout-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="header-tabs">
                <div className="header-container">
                    <nav className="tab-nav">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`tab-item ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <span className="tab-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
});

export default Header;
