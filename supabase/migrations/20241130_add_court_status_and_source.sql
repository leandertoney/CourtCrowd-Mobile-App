-- Migration: Add status and source columns to courts table
-- Run this in the Supabase SQL Editor

-- Add status column for admin approval workflow
ALTER TABLE courts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';
-- Values: 'pending', 'approved', 'rejected'

-- Add source column to track where court data came from
ALTER TABLE courts ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'mapbox';
-- Values: 'mapbox', 'user_submitted', 'seeded'

-- Add columns for user-submitted courts
ALTER TABLE courts ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES users(id);
ALTER TABLE courts ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Add categories array for Mapbox POI categories
ALTER TABLE courts ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Create index for status filtering (only show approved courts)
CREATE INDEX IF NOT EXISTS idx_courts_status ON courts(status);

-- Update RLS policy to only show approved courts to regular users
DROP POLICY IF EXISTS "Courts are viewable by everyone" ON courts;
CREATE POLICY "Approved courts are viewable by everyone" ON courts
  FOR SELECT USING (status = 'approved');

-- Allow authenticated users to insert pending courts (for user submissions)
DROP POLICY IF EXISTS "Users can submit courts" ON courts;
CREATE POLICY "Users can submit pending courts" ON courts
  FOR INSERT TO authenticated
  WITH CHECK (status = 'pending' AND submitted_by = auth.uid());

-- Service role can insert approved courts (for Mapbox discovery)
-- Note: Service role bypasses RLS, so Mapbox-discovered courts
-- can be inserted directly with status='approved'
