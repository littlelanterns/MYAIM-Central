-- ========================================
-- Add member_color and avatar_url Columns to family_members
-- ========================================
-- Adds member_color and avatar_url columns for visual identification
-- Date: 2025-01-26
-- ========================================

-- Add member_color column
ALTER TABLE family_members
ADD COLUMN IF NOT EXISTS member_color VARCHAR(50) DEFAULT 'AIMfM Sage Teal';

-- Add avatar_url column
ALTER TABLE family_members
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update existing members to have a default color
UPDATE family_members
SET member_color = 'AIMfM Sage Teal'
WHERE member_color IS NULL;

-- Add comments
COMMENT ON COLUMN family_members.member_color IS
  'Color identifier for this family member (for visual differentiation in UI)';

COMMENT ON COLUMN family_members.avatar_url IS
  'URL to avatar image stored in Supabase Storage or external source';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE 'Successfully added member_color and avatar_url columns to family_members table';
  RAISE NOTICE 'All existing members set to default color: AIMfM Sage Teal';
END $$;
