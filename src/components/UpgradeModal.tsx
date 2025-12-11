import { useNavigate } from 'react-router-dom';
import './UpgradeModal.css';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    limitType: 'upload' | 'transcript';
}

export default function UpgradeModal({ isOpen, onClose, limitType }: UpgradeModalProps) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const title = limitType === 'upload' ? 'Upload Limit Reached' : 'Transcript Limit Reached';
    const description = limitType === 'upload'
        ? "You've used all 3 of your free document uploads."
        : "You've used all 3 of your free transcript extractions.";

    const handleUpgrade = () => {
        onClose();
        navigate('/checkout');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Animated Background Gradient */}
                <div className="modal-bg-gradient"></div>

                <button className="modal-close" onClick={onClose} aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Icon with animated pulse */}
                <div className="modal-icon-wrapper">
                    <div className="modal-icon-pulse"></div>
                    <div className="modal-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                </div>

                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <p className="modal-description">{description}</p>
                </div>

                <div className="modal-features">
                    <div className="features-header">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span>Upgrade to Pro for</span>
                    </div>
                    <ul className="features-list">
                        <li>
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span>Unlimited document uploads</span>
                        </li>
                        <li>
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span>Unlimited transcript extractions</span>
                        </li>
                        <li>
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span>Priority support</span>
                        </li>
                        <li>
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span>Advanced AI features</span>
                        </li>
                    </ul>
                </div>

                <div className="modal-actions">
                    <button className="btn-upgrade" onClick={handleUpgrade}>
                        <span className="btn-shine"></span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        Upgrade to Pro
                    </button>
                    <button className="btn-cancel" onClick={onClose}>
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
}
