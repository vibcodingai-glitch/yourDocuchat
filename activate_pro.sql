-- Run this in Supabase SQL Editor to activate Pro status for your account
-- Go to: https://supabase.com/dashboard/project/lkwdjzxahgyowigdnktt/editor

UPDATE user_usage 
SET is_pro = true, 
    updated_at = NOW() 
WHERE user_id = 'f68aa829-9265-4bf5-a06a-a8248e4d5315';

-- After running this, refresh your browser and you should see:
-- Documents Usage: 3 / ∞
-- Transcripts Usage: 1 / ∞
-- Pro badge will appear next to your name
