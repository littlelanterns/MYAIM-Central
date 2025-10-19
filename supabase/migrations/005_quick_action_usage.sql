-- Quick Action Usage Tracking Migration
-- Adds table to track which quick actions users click most frequently
-- This enables auto-rearrangement of quick actions by usage
--
-- STATUS: PENDING - Not yet applied to database
-- WHEN APPLIED: Update MIGRATION_TRACKING.md with success date

-- Create quick_action_usage table
CREATE TABLE IF NOT EXISTS public.quick_action_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  action_name TEXT NOT NULL,
  click_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_member_id, action_name)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quick_action_usage_family_member_id ON quick_action_usage(family_member_id);
CREATE INDEX IF NOT EXISTS idx_quick_action_usage_click_count ON quick_action_usage(click_count DESC);
CREATE INDEX IF NOT EXISTS idx_quick_action_usage_last_used ON quick_action_usage(last_used_at DESC);

-- Enable Row Level Security
ALTER TABLE quick_action_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage their own quick action usage
DROP POLICY IF EXISTS "Users can manage own quick action usage" ON quick_action_usage;
CREATE POLICY "Users can manage own quick action usage"
ON quick_action_usage FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM family_members
    WHERE family_members.id = quick_action_usage.family_member_id
    AND family_members.auth_user_id = auth.uid()
  )
);

-- Trigger to auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_quick_action_usage_updated_at ON quick_action_usage;
CREATE TRIGGER update_quick_action_usage_updated_at
  BEFORE UPDATE ON quick_action_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment quick action usage (upsert pattern)
CREATE OR REPLACE FUNCTION increment_quick_action_usage(
  p_family_member_id UUID,
  p_action_name TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO quick_action_usage (family_member_id, action_name, click_count, last_used_at)
  VALUES (p_family_member_id, p_action_name, 1, NOW())
  ON CONFLICT (family_member_id, action_name)
  DO UPDATE SET
    click_count = quick_action_usage.click_count + 1,
    last_used_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_quick_action_usage(UUID, TEXT) TO authenticated;

COMMENT ON TABLE quick_action_usage IS 'Tracks quick action click frequency for auto-rearrangement by usage';
COMMENT ON FUNCTION increment_quick_action_usage IS 'Increments click count for a quick action, creates record if not exists';
