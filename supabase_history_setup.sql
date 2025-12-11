-- =========================================
-- TRANSCRIPTS HISTORY TABLE
-- =========================================
-- This table stores YouTube transcript extraction history

-- Create transcripts table
CREATE TABLE IF NOT EXISTS public.transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    video_title TEXT,
    video_id TEXT,
    thumbnail_url TEXT,
    transcript_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_transcripts_user_id ON public.transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_created_at ON public.transcripts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own transcripts" ON public.transcripts;
DROP POLICY IF EXISTS "Users can insert their own transcripts" ON public.transcripts;
DROP POLICY IF EXISTS "Users can update their own transcripts" ON public.transcripts;
DROP POLICY IF EXISTS "Users can delete their own transcripts" ON public.transcripts;

-- Create RLS policies
CREATE POLICY "Users can view their own transcripts"
    ON public.transcripts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transcripts"
    ON public.transcripts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transcripts"
    ON public.transcripts
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transcripts"
    ON public.transcripts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_transcripts_updated_at ON public.transcripts;
CREATE TRIGGER update_transcripts_updated_at
    BEFORE UPDATE ON public.transcripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- DOCUMENTS HISTORY TABLE (OPTIONAL)
-- =========================================
-- This table stores document upload history

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    file_url TEXT,
    processing_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

-- Create RLS policies
CREATE POLICY "Users can view their own documents"
    ON public.documents
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
    ON public.documents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
    ON public.documents
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
    ON public.documents
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger for documents
DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- GRANT PERMISSIONS
-- =========================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transcripts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;

-- =========================================
-- TEST THE SETUP
-- =========================================

-- You can run this to test insert (replace with actual auth user ID)
-- INSERT INTO public.transcripts (user_id, video_url, video_title, video_id, thumbnail_url, transcript_text)
-- VALUES 
-- ('your-auth-user-id-here', 'https://youtube.com/watch?v=test', 'Test Video', 'test', 'https://img.youtube.com/vi/test/maxresdefault.jpg', 'This is a test transcript');
