-- Enable Row Level Security (RLS) on the transcripts table
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to see only their own transcripts
CREATE POLICY "Users can view their own transcripts"
ON transcripts FOR SELECT
USING ( auth.uid() = user_id );

-- Create a policy that allows users to insert their own transcripts
CREATE POLICY "Users can insert their own transcripts"
ON transcripts FOR INSERT
WITH CHECK ( auth.uid() = user_id );
