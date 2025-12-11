import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lkwdjzxahgyowigdnktt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrd2RqenhhaGd5b3dpZ2Rua3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzc0MjgsImV4cCI6MjA3NjkxMzQyOH0.yQOKIJRfPQPqbWrr3paBHX4_0EChxb5Wi4jsS19MW0c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
