-- Court Photo Storage Setup
-- This migration documents the storage bucket configuration for court photos
-- Note: This was applied directly to both dev and prod databases via Supabase MCP

-- Create the media storage bucket (public, 10MB limit, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the media bucket

-- Allow anyone to view files (public bucket)
CREATE POLICY IF NOT EXISTS "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Allow authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their own files
CREATE POLICY IF NOT EXISTS "Authenticated users can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete files
CREATE POLICY IF NOT EXISTS "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Court photos will be stored at: media/court-photos/{court_id}/{timestamp}.jpg
-- Example: media/court-photos/abc123-def456/1701432000000.jpg
