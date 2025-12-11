import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUsage } from '../contexts/UsageContext';
import Header from '../components/Header';
import './YouTube.css';

export default function YouTube() {
    const { user } = useAuth();
    const { canTranscribe, incrementTranscript } = useUsage();
    const navigate = useNavigate();
    const [videoUrl, setVideoUrl] = useState('');
    const [transcript, setTranscript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!canTranscribe) {
            navigate('/checkout'); // Go directly to checkout
            return;
        }

        if (!videoUrl.trim() || !user) {
            setError('Please enter a YouTube URL');
            return;
        }

        // Basic YouTube URL validation
        if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
            setError('Please enter a valid YouTube URL');
            return;
        }

        setLoading(true);
        setError('');
        setTranscript('');

        try {
            const response = await fetch('https://n8ninstance.afrochainn8n.cfd/webhook/Fetch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    videoUrl: videoUrl,
                }),
            });

            const data = await response.json();

            if (Array.isArray(data)) {
                // Filter out the first few items that contain IDs/URLs
                // and extract actual transcript content
                const transcriptParts = data
                    .filter((item) => {
                        const content = item.pageContent || '';
                        // Skip items that look like UUIDs, user IDs, or URLs
                        return (
                            content.trim().length > 0 && // Not empty
                            !content.match(/^[a-f0-9-]{36}$/i) && // Not a UUID
                            !content.startsWith('http') && // Not a URL
                            !content.match(/^[a-zA-Z0-9-]+$/) // Not just alphanumeric (IDs)
                        );
                    })
                    .map((item) => item.pageContent)
                    .join('\n\n');

                if (transcriptParts) {
                    setTranscript(transcriptParts);
                    await incrementTranscript();
                } else {
                    setError('No transcript found for this video');
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            setError('Failed to fetch transcript. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(transcript);
        // Could add a toast notification here
    };

    return (
        <div className="youtube-page">
            <Header />

            <main className="youtube-main">
                <div className="youtube-container">
                    <div className="youtube-header fade-in">
                        <div className="youtube-icon">🎥</div>
                        <h1 className="youtube-title">YouTube Transcript Extractor</h1>
                        <p className="youtube-subtitle text-muted">
                            Extract transcripts from YouTube videos
                        </p>
                    </div>

                    <div className="youtube-card card-glass">
                        <form onSubmit={handleSubmit} className="youtube-form">
                            {error && (
                                <div className="alert alert-error slide-up">
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="videoUrl" className="form-label">
                                    YouTube URL
                                </label>
                                <input
                                    id="videoUrl"
                                    type="text"
                                    className="input"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    disabled={loading}
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
                                        Extracting transcript...
                                    </>
                                ) : (
                                    'Extract Transcript'
                                )}
                            </button>
                        </form>

                        {transcript && (
                            <div className="transcript-section slide-up">
                                <div className="transcript-header">
                                    <h3>Transcript</h3>
                                    <button
                                        onClick={handleCopy}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <div className="transcript-content">
                                    {transcript.split('\n\n').map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
