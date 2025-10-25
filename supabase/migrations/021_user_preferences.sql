-- ========================================
-- USER PREFERENCES MIGRATION
-- ========================================
-- Adds user preference columns for theme and calendar settings
-- Date: 2025-10-24
-- Safe to run multiple times (idempotent)
-- ========================================

-- ========================================
-- PART 1: ADD PREFERENCE COLUMNS TO family_members
-- ========================================

DO $$
BEGIN
  -- Add theme_preference column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'family_members' AND column_name = 'theme_preference'
  ) THEN
    ALTER TABLE family_members ADD COLUMN theme_preference VARCHAR(50);
    RAISE NOTICE 'Added theme_preference column to family_members';
  ELSE
    RAISE NOTICE 'theme_preference column already exists, skipping';
  END IF;

  -- Add week_start_preference column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'family_members' AND column_name = 'week_start_preference'
  ) THEN
    ALTER TABLE family_members ADD COLUMN week_start_preference VARCHAR(10);
    RAISE NOTICE 'Added week_start_preference column to family_members';
  ELSE
    RAISE NOTICE 'week_start_preference column already exists, skipping';
  END IF;
END $$;

-- ========================================
-- PART 2: ADD INDEXES FOR PERFORMANCE
-- ========================================

-- Index for theme lookups (helps with dashboard loading)
CREATE INDEX IF NOT EXISTS idx_family_members_theme_preference
  ON family_members(theme_preference);

-- Index for calendar week start preference
CREATE INDEX IF NOT EXISTS idx_family_members_week_start_preference
  ON family_members(week_start_preference);

-- ========================================
-- PART 3: ADD COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON COLUMN family_members.theme_preference IS
  'User''s preferred theme (e.g., classic, rosegold, ocean, etc.). Maps to personalThemes in colors.ts';

COMMENT ON COLUMN family_members.week_start_preference IS
  'User''s preferred calendar week start day. Values: ''sunday'' or ''monday''. NULL defaults to Sunday.';

-- ========================================
-- PART 4: QUICK ACTION USAGE TRACKING (OPTIONAL)
-- ========================================
-- This table tracks which quick actions users click most often
-- for auto-ordering based on usage

CREATE TABLE IF NOT EXISTS quick_action_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  action_name VARCHAR(100) NOT NULL,
  click_count INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_member_id, action_name)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_quick_action_usage_family_member
  ON quick_action_usage(family_member_id);

-- Index for sorting by usage
CREATE INDEX IF NOT EXISTS idx_quick_action_usage_click_count
  ON quick_action_usage(family_member_id, click_count DESC);

COMMENT ON TABLE quick_action_usage IS
  'Tracks how often each user clicks quick action buttons for auto-sorting';

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 021_user_preferences.sql completed successfully!';
  RAISE NOTICE 'Added columns:';
  RAISE NOTICE '  - family_members.theme_preference (VARCHAR 50)';
  RAISE NOTICE '  - family_members.week_start_preference (VARCHAR 10)';
  RAISE NOTICE 'Created table:';
  RAISE NOTICE '  - quick_action_usage (for auto-sorting quick actions)';
  RAISE NOTICE '========================================';
END $$;
