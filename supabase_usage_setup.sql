/*
  SQL setup for User Usage Limits
  Run this in your Supabase SQL Editor to create the necessary table and triggers.
*/

-- Create the user_usage table
CREATE TABLE IF NOT EXISTS public.user_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  document_count INTEGER DEFAULT 0,
  transcript_count INTEGER DEFAULT 0,
  is_pro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Create Policy: Users can view their own usage
CREATE POLICY "Users can view own usage" 
ON public.user_usage 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create Policy: Users can update their own usage (increment counts)
-- Ideally this should be more restricted or handled via functions, but for this app structure we enable update.
CREATE POLICY "Users can update own usage" 
ON public.user_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create Policy: Insert triggered by system or user on signup (if not using trigger)
CREATE POLICY "Users can insert own usage" 
ON public.user_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_usage() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_usage (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create usage record on signup
DROP TRIGGER IF EXISTS on_auth_user_created_usage ON auth.users;
CREATE TRIGGER on_auth_user_created_usage
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_usage();

-- Backfill for existing users who might not have a record
INSERT INTO public.user_usage (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_usage)
ON CONFLICT (user_id) DO NOTHING;
