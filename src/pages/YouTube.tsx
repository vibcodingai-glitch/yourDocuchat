import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUsage } from '../contexts/UsageContext';
import { supabase } from '../lib/supabase';
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

        setIsLoading(true);
        setError('');
        setTranscript('');

        try {
            await fetch(import.meta.env.VITE_N8N_YOUTUBE_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    videoUrl: videoUrl,
                }),
            });

            // We don't rely on the response from the webhook as it might be unstable
            // Instead, we wait a moment and then fetch the latest transcript from our database
            // which the webhook should have populated.

            // Wait 2 seconds for DB propagation
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Fetch the latest transcript for this video and user
            const { data: dbData, error: dbError } = await supabase
                .from('transcripts')
                .select('transcript')
                .eq('user_id', user.id)
                .eq('video_url', videoUrl)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (dbError) {
                console.error('Error fetching from DB:', dbError);
                throw new Error('Could not retrieve transcript from database');
            }

            if (dbData && dbData.transcript) {
                setTranscript(dbData.transcript);
                await incrementTranscript();
                // We do NOT save to history here because the N8N webhook already did it
            } else {
                setError('No transcript found for this video. Please try again.');
            }
        } catch (err) {
            setError('Failed to fetch transcript. Please try again.');
        } finally {
            setIsLoading(false);
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
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
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
