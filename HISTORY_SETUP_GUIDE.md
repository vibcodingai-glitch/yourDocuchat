# 📊 HISTORY TABLE SETUP GUIDE

## 🎯 Overview

This guide will help you set up the transcripts and documents history tables in Supabase so users can view their saved transcripts.

---

## ⚠️ IMPORTANT: You Need to Run This SQL in Supabase

The History page is currently showing "0 transcripts saved" because the `transcripts` table doesn't exist yet in your Supabase database.

---

## 🔧 Step-by-Step Setup

### **Step 1: Go to Supabase SQL Editor**

1. Open your Supabase project: https://supabase.com/dashboard
2. Click on your project: `lkwdjzxahgyowigdnktt`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**

---

### **Step 2: Run the History Table SQL**

Copy the entire contents of the file:
```
supabase_history_setup.sql
```

And paste it into the SQL Editor, then click **Run**.

This will create:
- ✅ `transcripts` table - Stores YouTube transcript history
- ✅ `documents` table - Stores document upload history (optional)
- ✅ RLS (Row Level Security) policies - Users can only see their own data
- ✅ Indexes - For fast queries
- ✅ Triggers - Auto-update timestamps

---

### **Step 3: Verify Tables Were Created**

After running the SQL:

1. Go to **Table Editor** (left sidebar)
2. You should see two new tables:
   - `transcripts`
   - `documents`

---

## 📋 What the Tables Contain

### **transcripts table:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User who created it (references auth.users) |
| `video_url` | TEXT | YouTube video URL |
| `video_title` | TEXT | Video title |
| `video_id` | TEXT | YouTube video ID |
| `thumbnail_url` | TEXT | Video thumbnail URL |
| `transcript_text` | TEXT | Full transcript content |
| `created_at` | TIMESTAMP | When it was created |
| `updated_at` | TIMESTAMP | Last update time |

### **documents table (optional):**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User who uploaded it |
| `file_name` | TEXT | Original filename |
| `file_type` | TEXT | File MIME type |
| `file_size` | INTEGER | Size in bytes |
| `file_url` | TEXT | Storage URL |
| `processing_status` | TEXT | pending/completed/failed |
| `created_at` | TIMESTAMP | When uploaded |
| `updated_at` | TIMESTAMP | Last update |

---

## ✅ How It Works

### **When a user extracts a YouTube transcript:**

1. User enters YouTube URL and clicks "Extract Transcript"
2. Transcript is fetched from n8n webhook
3. **NEW:** Transcript is automatically saved to `transcripts` table
4. User can view all their saved transcripts in the **History** page

### **Data is saved with:**
- ✅ Video URL
- ✅ Video thumbnail (auto-generated from video ID)
- ✅ Video title
- ✅ Full transcript text
- ✅ Timestamp

---

## 🔐 Security (RLS Policies)

The tables have Row Level Security enabled, which means:

- ✅ Users can **ONLY view their own transcripts**
- ✅ Users can **ONLY insert their own transcripts**
- ✅ Users can **ONLY update their own transcripts**
- ✅ Users can **ONLY delete their own transcripts**

This is handled automatically by checking `auth.uid() = user_id`.

---

## 🧪 Testing

### **After setting up the tables:**

1. **Go to YouTube page** in your app
2. **Enter a YouTube URL** (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
3. **Click "Extract Transcript"**
4. **Wait for transcript to load**
5. **Go to History page** - You should see the saved transcript!

---

## 🐛 Troubleshooting

### **Problem: Still showing "0 transcripts saved"**

**Solution:**
1. Verify tables exist in Supabase Table Editor
2. Check browser console for errors (F12)
3. Verify RLS policies are enabled:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'transcripts';
   ```

### **Problem: "permission denied for table transcripts"**

**Solution:**
Run this SQL to grant permissions:
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transcripts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
```

### **Problem: Transcripts not saving**

**Solution:**
1. Open browser console (F12)
2. Extract a transcript
3. Look for error messages
4. Check if you see: `✅ Transcript saved to history`

---

## 📊 View Data Directly in Supabase

To see all saved transcripts:

1. Go to **Table Editor**
2. Click on `transcripts` table
3. You'll see all saved transcripts for all users

To filter by user:
```sql
SELECT * FROM transcripts WHERE user_id = 'user-id-here';
```

---

## 🚀 Code Changes Made

### **Files Modified:**

1. **`src/pages/YouTube.tsx`**
   - Added `saveToHistory()` function
   - Extracts video ID from URL
   - Generates thumbnail URL
   - Saves transcript after successful extraction

2. **`src/pages/History.tsx`**
   - Already configured to fetch from `transcripts` table
   - Displays video thumbnails
   - Shows creation dates
   - Links to original videos

3. **`supabase_history_setup.sql`** (NEW)
   - Complete table setup SQL
   - RLS policies
   - Indexes
   - Triggers

---

## 📝 Summary

**Before Fix:**
- ❌ No `transcripts` table in database
- ❌ History page shows "0 transcripts saved"
- ❌ No way to save or view transcript history

**After Fix:**
- ✅ `transcripts` table created in Supabase
- ✅ Transcripts automatically saved when extracted
- ✅ Users can view all their saved transcripts
- ✅ Secure with RLS policies
- ✅ Fast queries with indexes

---

## ⚡ Quick Setup (Copy & Paste)

1. Open Supabase SQL Editor
2. Copy entire content of `supabase_history_setup.sql`
3. Paste and click **Run**
4. Done! ✅

---

**After running the SQL, the History page will work perfectly!** 🎉

Users will be able to:
- ✅ See all their saved transcripts
- ✅ View video thumbnails
- ✅ Click to watch original videos
- ✅ See when transcripts were created
