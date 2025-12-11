import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './History.css';

interface Transcript {
    id: string;
    user_id: string;
    videos_url: string;  // Note: plural "videos_url" in your table
    transcript: string;
    created_at: string;
}

export default function History() {
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchTranscripts();
    }, [user]);

    const fetchTranscripts = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('transcripts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('✅ Fetched transcripts:', data?.length || 0);
            setTranscripts(data || []);
        } catch (error) {
            console.error('Error fetching transcripts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getYouTubeThumbnail = (url: string) => {
        if (!url) return '';

        // Extract video ID from various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
            }
        }

        return '';
    };

    const getVideoTitle = (url: string) => {
        // Extract video ID for title
        const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? `YouTube Video ${match[1]}` : 'YouTube Video';
    };

    return (
        <div className="history-page">
            <Header />

            <main className="history-main">
                <div className="history-container">
                    <div className="history-header">
                        <h1 className="history-title">Your Saved Transcripts</h1>
                        <p className="history-count">{transcripts.length} transcripts saved</p>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                        </div>
                    ) : transcripts.length === 0 ? (
                        <div className="empty-state">
                            <p>No transcripts saved yet.</p>
                        </div>
                    ) : (
                        <div className="transcripts-grid">
                            {transcripts.map((item) => (
                                <div key={item.id} className="transcript-card">
                                    <div className="card-thumbnail">
                                        <img src={getYouTubeThumbnail(item.videos_url)} alt={getVideoTitle(item.videos_url)} />
                                        <div className="thumbnail-overlay">
                                            <a href={item.videos_url} target="_blank" rel="noopener noreferrer" className="watch-btn">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                    <polyline points="15 3 21 3 21 9"></polyline>
                                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                                </svg>
                                                Watch Video
                                            </a>
                                        </div>
                                    </div>
                                    <div className="card-content">
                                        <h3 className="card-title">{getVideoTitle(item.videos_url)}</h3>
                                        <div className="card-meta">
                                            <span>Video</span>
                                            <span>•</span>
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
