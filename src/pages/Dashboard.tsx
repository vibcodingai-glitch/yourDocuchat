import { Link } from 'react-router-dom';
import Header from '../components/Header';
import './Dashboard.css';

export default function Dashboard() {
    const features = [
        {
            title: 'File Upload',
            description: 'Upload and process your files (txt, pdf, csv)',
            icon: '📁',
            path: '/upload',
            color: 'var(--color-primary)',
        },
        {
            title: 'AI Chat',
            description: 'Chat with our intelligent AI assistant',
            icon: '💬',
            path: '/chat',
            color: 'var(--color-secondary)',
        },
        {
            title: 'YouTube Transcripts',
            description: 'Extract transcripts from YouTube videos',
            icon: '🎥',
            path: '/youtube',
            color: 'var(--color-accent)',
        },
    ];

    return (
        <div className="dashboard-page">
            <Header />

            <main className="dashboard-main">
                <div className="dashboard-container">
                    <div className="dashboard-hero fade-in">
                        <h1 className="dashboard-title">Welcome to DocuChat AI</h1>
                        <p className="dashboard-subtitle text-muted">
                            Choose a feature to get started
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <Link
                                key={feature.path}
                                to={feature.path}
                                className="feature-card card-glass slide-up"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                }}
                            >
                                <div className="feature-icon" style={{ color: feature.color }}>
                                    {feature.icon}
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description text-muted">
                                    {feature.description}
                                </p>
                                <div className="feature-arrow">→</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
