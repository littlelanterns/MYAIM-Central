-- ============================================================
-- PUBLIC READ ACCESS FOR DEVELOPMENT
-- Temporarily allows public read access to archive system
-- NOTE: Remove or restrict this before production launch!
-- ============================================================

-- Add public read policy for archive_folders (development only)
DROP POLICY IF EXISTS "Public can view archive folders (DEV ONLY)" ON public.archive_folders;
CREATE POLICY "Public can view archive folders (DEV ONLY)"
  ON public.archive_folders FOR SELECT
  USING (true);

-- Add public read policy for archive_context_items (development only)
DROP POLICY IF EXISTS "Public can view archive context items (DEV ONLY)" ON public.archive_context_items;
CREATE POLICY "Public can view archive context items (DEV ONLY)"
  ON public.archive_context_items FOR SELECT
  USING (true);

-- Note: This allows anyone to read archive data during development
-- Before going to production, replace these policies with proper auth checks
