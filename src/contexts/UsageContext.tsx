import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface UsageContextType {
    documentCount: number;
    transcriptCount: number;
    isPro: boolean;
    loading: boolean;
    incrementDocument: () => Promise<boolean>;
    incrementTranscript: () => Promise<boolean>;
    canUpload: boolean;
    canTranscribe: boolean;
    refreshUsage: () => Promise<void>;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export function UsageProvider({ children }: { children: ReactNode }) {
    const [documentCount, setDocumentCount] = useState(0);
    const [transcriptCount, setTranscriptCount] = useState(0);
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const LIMIT = 3;

    const refreshUsage = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('user_usage')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setDocumentCount(data.document_count || 0);
                setTranscriptCount(data.transcript_count || 0);
                setIsPro(data.is_pro || false);
            } else if (error && error.code === 'PGRST116') {
                // Determine if record needs to be created, though trigger should handle it.
                // Fallback creation
                await supabase.from('user_usage').insert([{ user_id: user.id }]);
                setDocumentCount(0);
                setTranscriptCount(0);
            }
        } catch (error) {
            console.error('Error fetching usage:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUsage();
    }, [user]);

    const incrementDocument = async (): Promise<boolean> => {
        if (!user) return false;
        if (!isPro && documentCount >= LIMIT) return false;

        const newCount = documentCount + 1;
        const { error } = await supabase
            .from('user_usage')
            .update({ document_count: newCount })
            .eq('user_id', user.id);

        if (!error) {
            setDocumentCount(newCount);
            return true;
        }
        return false;
    };

    const incrementTranscript = async (): Promise<boolean> => {
        if (!user) return false;
        if (!isPro && transcriptCount >= LIMIT) return false;

        const newCount = transcriptCount + 1;
        const { error } = await supabase
            .from('user_usage')
            .update({ transcript_count: newCount })
            .eq('user_id', user.id);

        if (!error) {
            setTranscriptCount(newCount);
            return true;
        }
        return false;
    };

    const canUpload = isPro || documentCount < LIMIT;
    const canTranscribe = isPro || transcriptCount < LIMIT;

    return (
        <UsageContext.Provider
            value={{
                documentCount,
                transcriptCount,
                isPro,
                loading,
                incrementDocument,
                incrementTranscript,
                canUpload,
                canTranscribe,
                refreshUsage
            }}
        >
            {children}
        </UsageContext.Provider>
    );
}

export function useUsage() {
    const context = useContext(UsageContext);
    if (context === undefined) {
        throw new Error('useUsage must be used within a UsageProvider');
    }
    return context;
}
