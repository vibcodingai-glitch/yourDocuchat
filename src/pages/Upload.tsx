import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUsage } from '../contexts/UsageContext';
import Header from '../components/Header';
import './Upload.css';

export default function Upload() {
    const { user } = useAuth();
    const { canUpload, incrementDocument } = useUsage();
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileInputClick = (e: React.MouseEvent<HTMLLabelElement>) => {
        if (!canUpload) {
            e.preventDefault();
            navigate('/checkout'); // Go directly to checkout
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'text/plain', 'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

            if (!allowedTypes.includes(selectedFile.type)) {
                setMessage('Please upload a PDF, TXT, DOC, or DOCX file');
                setMessageType('error');
                setFile(null);
                return;
            }

            setFile(selectedFile);
            setMessage('');
            setMessageType('');
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!canUpload) {
            navigate('/checkout'); // Go directly to checkout
            return;
        }

        if (!file || !user) {
            setMessage('Please select a file');
            setMessageType('error');
            return;
        }

        setIsUploading(true);
        setProgress(0);
        setMessage('');

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('filename', file.name);
            formData.append('contentType', file.type);
            formData.append('userId', user.id);

            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await fetch('https://n8ninstance.afrochainn8n.cfd/webhook/upload', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setProgress(100);

            if (response.ok) {
                await incrementDocument();
                setMessage('File uploaded successfully!');
                setMessageType('success');
                setFile(null);
                // Reset file input
                const fileInput = document.getElementById('file-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            setMessage('Failed to upload file. Please try again.');
            setMessageType('error');
            setProgress(0);
        } finally {
            setIsUploading(false);
            setTimeout(() => {
                setProgress(0);
            }, 2000);
        }
    };

    return (
        <div className="upload-page">
            <Header />

            <main className="upload-main">
                <div className="upload-container">
                    <div className="upload-card card-glass fade-in">
                        <div className="upload-header">
                            <div className="upload-icon">📁</div>
                            <h1 className="upload-title">File Upload</h1>
                            <p className="upload-subtitle text-muted">
                                Upload your .txt, .pdf, or .csv files
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="upload-form">
                            {message && (
                                <div className={`alert alert-${messageType} slide-up`}>
                                    {message}
                                </div>
                            )}

                            <div className="file-input-wrapper">
                                <input
                                    id="file-input"
                                    type="file"
                                    accept=".txt,.pdf,.csv"
                                    onChange={handleFileChange}
                                    className="file-input-hidden"
                                    disabled={isUploading}
                                    aria-label="Upload document file"
                                    aria-describedby="file-hint"
                                />
                                <label
                                    htmlFor="file-input"
                                    className="file-input-label"
                                    onClick={handleFileInputClick}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === 'Enter' && handleFileInputClick(e as any)}
                                >
                                    <div className="file-input-content">
                                        <div className="upload-icon-large" aria-hidden="true">📄</div>
                                        <p className="file-input-text">
                                            {file ? file.name : 'Click to select a file'}
                                        </p>
                                        <p id="file-hint" className="file-input-hint text-muted">
                                            Supported formats: .txt, .pdf, .csv
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {file && (
                                <div className="file-info slide-up">
                                    <div className="file-details">
                                        <p><strong>File:</strong> {file.name}</p>
                                        <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
                                        <p><strong>Type:</strong> {file.type}</p>
                                    </div>
                                </div>
                            )}

                            {isUploading && (
                                <div className="progress-section slide-up">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="progress-text text-muted">{progress}%</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={!file || isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Uploading...
                                    </>
                                ) : (
                                    'Upload File'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
