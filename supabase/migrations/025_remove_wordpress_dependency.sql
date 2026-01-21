-- Migration: Remove WordPress Dependency
-- Description: Makes wordpress_user_id nullable (if exists) and adds beta/founding family columns
-- This completes the transition away from WordPress integration

-- Step 1: Make wordpress_user_id nullable on families table (only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'families'
    AND column_name = 'wordpress_user_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE families ALTER COLUMN wordpress_user_id DROP NOT NULL;
  END IF;
END $$;

-- Step 2: Make wordpress_user_id nullable on family_members table (if it exists and is NOT NULL)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'family_members'
    AND column_name = 'wordpress_user_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE family_members ALTER COLUMN wordpress_user_id DROP NOT NULL;
  END IF;
END $$;

-- Step 3: Add founding family columns to families table (for beta program)
ALTER TABLE families
  ADD COLUMN IF NOT EXISTS is_founding_family boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS founding_family_joined_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS membership_status text DEFAULT 'active';

-- Step 4: Add auth_user_id if it doesn't exist (links to Supabase auth)
ALTER TABLE families
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 5: Add family_login_name if it doesn't exist
ALTER TABLE families
  ADD COLUMN IF NOT EXISTS family_login_name text;

-- Step 6: Add unique constraint on family_login_name if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'families_family_login_name_key'
  ) THEN
    ALTER TABLE families ADD CONSTRAINT families_family_login_name_key UNIQUE (family_login_name);
  END IF;
END $$;

-- Step 7: Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_families_auth_user_id ON families(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_families_family_login_name ON families(family_login_name);
CREATE INDEX IF NOT EXISTS idx_families_is_founding_family ON families(is_founding_family);

-- Step 8: Add auth_user_id to family_members if it doesn't exist
ALTER TABLE family_members
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 9: Add is_primary_parent to family_members if it doesn't exist
ALTER TABLE family_members
  ADD COLUMN IF NOT EXISTS is_primary_parent boolean DEFAULT false;

-- Step 10: Add display_title to family_members if it doesn't exist
ALTER TABLE family_members
  ADD COLUMN IF NOT EXISTS display_title text;

-- Step 11: Add dashboard_mode to family_members if it doesn't exist
ALTER TABLE family_members
  ADD COLUMN IF NOT EXISTS dashboard_mode text DEFAULT 'independent';

CREATE INDEX IF NOT EXISTS idx_family_members_auth_user_id ON family_members(auth_user_id);

-- Add comments
COMMENT ON COLUMN families.auth_user_id IS 'Links family to Supabase auth.users for the primary organizer';
COMMENT ON COLUMN families.family_login_name IS 'Unique identifier for family member PIN-based login';
COMMENT ON COLUMN families.is_founding_family IS 'Beta founding family status for permanent discount';
COMMENT ON COLUMN families.founding_family_joined_at IS 'When the family joined as a founding family';
COMMENT ON COLUMN families.membership_status IS 'Current membership status (active, inactive, etc.)';
COMMENT ON COLUMN family_members.auth_user_id IS 'Links to Supabase auth.users - only set for primary parent';
COMMENT ON COLUMN family_members.is_primary_parent IS 'Whether this member is the primary account holder';
COMMENT ON COLUMN family_members.display_title IS 'Display title like Mom, Dad, etc.';

-- Verification query (run this to check the migration worked)
-- SELECT column_name, is_nullable, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'families'
-- ORDER BY ordinal_position;
