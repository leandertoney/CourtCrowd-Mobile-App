-- Create dedicated court-photos bucket for caching Google Places images
-- This bucket is used by the courtPhotoCache service

-- Create the court-photos storage bucket (public for reading, 10MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('court-photos', 'court-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "court_photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "court_photos_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "court_photos_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "court_photos_authenticated_delete" ON storage.objects;

-- Allow anyone to view court photos (public bucket)
CREATE POLICY "court_photos_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'court-photos');

-- Allow authenticated users to upload court photos
CREATE POLICY "court_photos_authenticated_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'court-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to update court photos (for upsert)
CREATE POLICY "court_photos_authenticated_update" ON storage.objects
FOR UPDATE USING (bucket_id = 'court-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete court photos
CREATE POLICY "court_photos_authenticated_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'court-photos' AND auth.role() = 'authenticated');
