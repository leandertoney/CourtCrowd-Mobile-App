-- Migration: Fix RLS policy for Mapbox-discovered courts
-- The previous policy only allowed inserting 'pending' courts with submitted_by set
-- This migration allows authenticated users to insert Mapbox-discovered courts

-- Drop all old insert policies to avoid conflicts
DROP POLICY IF EXISTS "Users can submit pending courts" ON courts;
DROP POLICY IF EXISTS "Authenticated can insert courts" ON courts;

-- Create a more flexible insert policy for authenticated users
-- Allows both:
-- 1. Mapbox-discovered courts (source='mapbox', status='approved', no submitted_by)
-- 2. User-submitted courts (source='user_submitted', status='pending', submitted_by required)
CREATE POLICY "Authenticated users can insert courts" ON courts
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Mapbox-discovered courts: source must be 'mapbox' and status can be 'approved'
    (source = 'mapbox' AND status = 'approved')
    OR
    -- User-submitted courts: must be pending and have submitted_by
    (source = 'user_submitted' AND status = 'pending' AND submitted_by = auth.uid())
  );

-- Allow anon role to also insert mapbox-discovered courts
-- This handles cases where court discovery happens before user is fully authenticated
CREATE POLICY "Anon users can insert mapbox courts" ON courts
  FOR INSERT TO anon
  WITH CHECK (source = 'mapbox' AND status = 'approved');

-- Also need to allow updates for courts (for upsert operations)
DROP POLICY IF EXISTS "Authenticated can update courts" ON courts;
CREATE POLICY "Authenticated users can update mapbox courts" ON courts
  FOR UPDATE TO authenticated
  USING (source = 'mapbox')
  WITH CHECK (source = 'mapbox');

-- Allow anon to update mapbox courts too (for upserts)
CREATE POLICY "Anon users can update mapbox courts" ON courts
  FOR UPDATE TO anon
  USING (source = 'mapbox')
  WITH CHECK (source = 'mapbox');
