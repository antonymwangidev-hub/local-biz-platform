# Media Upload System - Quick Start Guide

## 🚀 Setup Instructions

### 1. Apply Database Migration

**Option A: Using Supabase CLI (Recommended)**

```bash
# Ensure Supabase CLI is installed
# If not: npm install -g supabase

# In your project root directory:
supabase migration up
```

**Option B: Manual SQL (Supabase Dashboard)**

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy the contents of `supabase/migrations/20260323000000_add_attachments_column.sql`
5. Paste into the editor
6. Click **Run**

### 2. Verify Storage Bucket

The "media" bucket should already exist. If not, run this in the SQL Editor:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Add public access policy (if needed)
CREATE POLICY "Public Access for GET" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "User Delete Own" ON storage.objects
FOR DELETE USING (bucket_id = 'media' AND auth.uid() = owner);
```

### 3. Verify Environment Variables

Check your `.env.local` file has:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_public_key_here
```

### 4. Install Dependencies (if needed)

```bash
npm install
```

### 5. Start Development Server

```bash
npm run dev
```

## 🎯 Testing the System

### Test 1: Create Event with Images

1. Go to **Events** page
2. Click **Create Event** button
3. Fill in event details:
   - Title: "Test Event"
   - Date: Pick a future date
   - Location: "Test Location"
4. Click the upload area
5. Select a JPG/PNG/WebP image file
6. Verify preview appears
7. Click **Create Event**
8. Check Success notification
9. Verify event appears in list
10. ✅ Check Supabase:
    - **Storage > media > users > {userId}**: File uploaded
    - **events table**: Row has `attachments` JSON array
    - **events table**: `image_url` set to first image

### Test 2: Create Post with Multiple Attachments

1. Go to **Feed** page
2. Click create post button
3. Type post content
4. Click upload area in modal
5. Select 2-3 image files
6. Verify all previews show
7. Click one remove button (X)
8. Verify it's removed
9. Click **Post**
10. Verify success message
11. ✅ Check Supabase:
    - **Storage > media > users > {userId}**: All files uploaded
    - **posts table**: `attachments` contains 2 items
    - **posts table**: `image_url` set to first image

### Test 3: Video Upload with Thumbnail

1. Create Event or Post
2. Select a video file (MP4)
3. Upload it
4. Wait for thumbnail generation
5. Verify thumbnail preview shows
6. Post/Create
7. ✅ Check Supabase:
   - **Storage > media > users > {userId}**:
     - Video file uploaded
     - Thumbnail file uploaded (thumb\_...)
   - **attachments table**:
     - `thumbnail_url` populated
     - `width` and `height` set

### Test 4: Error Handling

**Test 4a: File Too Large**

- Try uploading image > 10MB
- Should show: "Image too large. Maximum size: 10MB"
- ❌ Should NOT upload

**Test 4b: Unsupported Format**

- Try uploading .txt, .pdf, or other file
- Should show: "Invalid file type"
- ❌ Should NOT upload

**Test 4c: Video Too Large**

- Try uploading video > 150MB
- Should show: "Video too large. Maximum size: 150MB"
- ❌ Should NOT upload

## 📊 Verifying Database Changes

### Check Events Table

```sql
SELECT
  id,
  title,
  image_url,
  attachments,
  created_at
FROM public.events
ORDER BY created_at DESC
LIMIT 5;
```

Expected output:

```
id           | title      | image_url               | attachments
─────────────┼────────────┼─────────────────────────┼──────────────────
abc123      | Test Event | https://... (URL)       | [{"id": "att_...", "url": "...", ...}]
```

### Check Posts Table

```sql
SELECT
  id,
  content,
  image_url,
  attachments,
  created_at
FROM public.posts
ORDER BY created_at DESC
LIMIT 5;
```

### Check Attachment Structure

```sql
SELECT
  id,
  (attachments->0->>'filename') as first_filename,
  (attachments->0->>'mime_type') as first_mime_type,
  jsonb_array_length(attachments) as attachment_count
FROM public.events
WHERE attachments IS NOT NULL
  AND jsonb_array_length(attachments) > 0
LIMIT 5;
```

## 🐛 Troubleshooting

### Problem: "Cannot upload - bucket not found"

**Solution:**

```sql
-- Verify bucket exists
SELECT id, name, public FROM storage.buckets WHERE id = 'media';

-- If not found, create it:
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);
```

### Problem: "Upload succeeds but no file in storage"

**Solution:**

1. Check bucket permissions: Open bucket > Policies
2. Should have policies for SELECT and INSERT
3. Add them if missing:

```sql
-- Allow public reads
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Allow authenticated uploads
CREATE POLICY "Allow authenticated insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
```

### Problem: "Thumbnails not generating for videos"

**Solution:**

1. Ensure video file is valid MP4 or WebM
2. Check browser console for errors
3. Verify browser supports HTML5 video element
4. Try a different video file

### Problem: "attachments column not found in table"

**Solution:**

1. Check migration was run:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'events' AND column_name = 'attachments';
   ```
2. If empty, run migration again from supabase/migrations file

### Problem: "Type errors in TypeScript"

**Solution:**

1. Run `npm install` to get all dependencies
2. Restart VS Code
3. Files should show green checkmarks
4. If not, run: `npm run build` to check for real errors

## 📁 Files Modified/Created

**New Files:**

- ✅ `src/lib/mediaUpload.ts` - Core upload logic
- ✅ `supabase/migrations/20260323000000_add_attachments_column.sql` - DB schema
- ✅ `MEDIA_UPLOAD_IMPLEMENTATION.md` - Full documentation

**Modified Files:**

- ✅ `src/pages/Events.tsx` - Added media upload UI
- ✅ `src/components/CreatePostModal.tsx` - Added media upload UI
- ✅ `src/integrations/supabase/types.ts` - Added attachment types

## ✅ Success Checklist

After following these steps, you should have:

- [ ] Migration applied to database
- [ ] "media" storage bucket confirmed public
- [ ] Environment variables verified
- [ ] Development server running
- [ ] Can create event with image upload
- [ ] Can create post with multiple attachments
- [ ] Video thumbnails generating
- [ ] Files visible in Supabase Storage
- [ ] Attachments JSON saved in database
- [ ] Error messages showing for invalid files
- [ ] No console errors
- [ ] image_url populated automatically from first image

## 🎉 You're Done!

The media upload system is now fully operational.

For detailed information about implementation, see: `MEDIA_UPLOAD_IMPLEMENTATION.md`
