import { useState, type FormEvent, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import './Chat.css';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

// Generate random alphanumeric session ID
const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
};

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId] = useState(() => generateSessionId());
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!input.trim() || !user) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('https://n8ninstance.afrochainn8n.cfd/webhook/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatInput: input,
                    sessionId: sessionId,
                    userId: user.id,
                }),
            });

            const data = await response.json();

            // Extract the output from the response
            let aiText = 'Sorry, I could not process your request.';

            if (Array.isArray(data) && data.length > 0 && data[0].output) {
                aiText = data[0].output;
            } else if (data && typeof data === 'object' && 'output' in data) {
                aiText = data.output;
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: aiText,
                sender: 'ai',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Failed to get response. Please try again.',
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const formatText = (text: string) => {
        // Split by newlines and handle bullet points
        const lines = text.split('\n');

        return lines.map((line, index) => {
            // Handle bullet points (lines starting with - or *)
            if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                return (
                    <li key={index} className="chat-list-item">
                        {line.trim().substring(1).trim()}
                    </li>
                );
            }

            // Handle numbered lists
            if (/^\d+\./.test(line.trim())) {
                return (
                    <li key={index} className="chat-list-item">
                        {line.trim().replace(/^\d+\.\s*/, '')}
                    </li>
                );
            }

            // Regular line
            return line.trim() ? (
                <p key={index} className="chat-paragraph">
                    {line}
                </p>
            ) : null;
        });
    };

    return (
        <div className="chat-page">
            <Header />

            <main className="chat-main">
                <div className="chat-container">
                    <div className="chat-header fade-in">
                        <div className="chat-icon">💬</div>
                        <h1 className="chat-title">AI Assistant</h1>
                        <p className="chat-subtitle text-muted">
                            Ask me anything
                        </p>
                    </div>

                    <div className="chat-wrapper card-glass">
                        <div className="chat-messages">
                            {messages.length === 0 ? (
                                <div className="chat-empty">
                                    <div className="empty-icon">🤖</div>
                                    <p className="text-muted">Start a conversation...</p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`message message-${message.sender} slide-up`}
                                    >
                                        <div className="message-avatar">
                                            {message.sender === 'user' ? '👤' : '🤖'}
                                        </div>
                                        <div className="message-content">
                                            <div className="message-text">
                                                {formatText(message.text)}
                                            </div>
                                            <div className="message-time text-muted">
                                                {message.timestamp.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {loading && (
                                <div className="message message-ai slide-up">
                                    <div className="message-avatar">🤖</div>
                                    <div className="message-content">
                                        <div className="message-loading">
                                            <span className="dot"></span>
                                            <span className="dot"></span>
                                            <span className="dot"></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSubmit} className="chat-input-form">
                            <input
                                type="text"
                                className="input chat-input"
                                placeholder="Type your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary chat-send-btn"
                                disabled={!input.trim() || loading}
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
