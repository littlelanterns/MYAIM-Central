-- ========================================
-- Add dashboard_mode to family_members
-- ========================================
-- This column stores the assigned dashboard type for each family member
-- Used by parent dashboard switcher to route to correct child dashboard
-- Date: 2025-01-20
-- ========================================

-- Add dashboard_mode column to family_members table
ALTER TABLE family_members
ADD COLUMN IF NOT EXISTS dashboard_mode VARCHAR(20)
CHECK (dashboard_mode IN ('play', 'guided', 'independent'))
DEFAULT 'independent';

-- Add index for dashboard mode queries
CREATE INDEX IF NOT EXISTS idx_family_members_dashboard_mode
  ON family_members(dashboard_mode);

-- Add comment for documentation
COMMENT ON COLUMN family_members.dashboard_mode IS
  'Dashboard type assigned to this family member: play (gamified for young kids), guided (structured for teens), or independent (full control for adults). Defaults to independent.';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE 'Successfully added dashboard_mode column to family_members table';
  RAISE NOTICE 'Default value: independent';
  RAISE NOTICE 'Allowed values: play, guided, independent';
END $$;
