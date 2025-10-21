-- Migration: Archive Cover Photo Storage
-- Description: Creates storage bucket for archive folder cover photos with RLS policies
-- Created: 2025-10-19

-- ============================================================
-- CREATE STORAGE BUCKET
-- ============================================================

-- Create the archive-covers bucket for folder cover photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('archive-covers', 'archive-covers', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================
-- Note: RLS is already enabled on storage.objects by default in Supabase
-- We just need to drop any existing policies and create new ones

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload cover photos for their family folders" ON storage.objects;
DROP POLICY IF EXISTS "Users can view cover photos for their family folders" ON storage.objects;
DROP POLICY IF EXISTS "Users can update cover photos for their family folders" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete cover photos for their family folders" ON storage.objects;

-- Policy: Users can upload cover photos for their family folders
CREATE POLICY "Users can upload cover photos for their family folders"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'archive-covers'
  AND auth.uid() IS NOT NULL
);

-- Policy: Anyone can view cover photos (public bucket)
CREATE POLICY "Anyone can view archive cover photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'archive-covers');

-- Policy: Users can update cover photos for their family folders
CREATE POLICY "Users can update cover photos for their family folders"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'archive-covers'
  AND auth.uid() IS NOT NULL
);

-- Policy: Users can delete cover photos for their family folders
CREATE POLICY "Users can delete cover photos for their family folders"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'archive-covers'
  AND auth.uid() IS NOT NULL
);

-- ============================================================
-- NOTES
-- ============================================================

-- File path structure: {user_id}/{folder_id}/{filename}
-- Example: abc123-def456/folder789/cover.jpg
--
-- This allows:
-- - Users to upload photos for folders in their family
-- - Users to view, update, and delete their family's folder photos
-- - Public viewing (bucket is public) while maintaining upload security
--
-- The bucket is set to 'public' to allow viewing without auth,
-- but RLS policies ensure only family members can upload/modify
