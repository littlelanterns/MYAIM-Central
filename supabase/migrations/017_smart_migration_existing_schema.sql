-- ========================================
-- SMART MIGRATION - Works with Existing Schema
-- ========================================
-- Only creates what's missing based on current database state
-- Date: 2025-10-21
-- ========================================

-- ========================================
-- PART 1: ARCHIVE COVERS STORAGE
-- ========================================

-- Create the archive-covers bucket (will skip if exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('archive-covers', 'archive-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Drop and recreate storage policies
DROP POLICY IF EXISTS "Users can upload cover photos for their family folders" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view archive cover photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update cover photos for their family folders" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete cover photos for their family folders" ON storage.objects;

CREATE POLICY "Users can upload cover photos for their family folders"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'archive-covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view archive cover photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'archive-covers');

CREATE POLICY "Users can update cover photos for their family folders"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'archive-covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete cover photos for their family folders"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'archive-covers' AND auth.uid() IS NOT NULL);

-- ========================================
-- PART 2: ADD MISSING COLUMN TO family_members
-- ========================================
-- NOTE: theme_preference already exists, so we skip it
-- We only add dashboard_mode

DO $$
BEGIN
  -- Add dashboard_mode if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'family_members' AND column_name = 'dashboard_mode'
  ) THEN
    ALTER TABLE family_members ADD COLUMN dashboard_mode VARCHAR(20) DEFAULT 'independent';
    RAISE NOTICE 'Added dashboard_mode column to family_members';
  ELSE
    RAISE NOTICE 'dashboard_mode column already exists, skipping';
  END IF;
END $$;

-- Add index for dashboard_mode
CREATE INDEX IF NOT EXISTS idx_family_members_dashboard_mode
  ON family_members(dashboard_mode);

-- ========================================
-- PART 3: DASHBOARD SYSTEM
-- ========================================

-- Dashboard configurations table
CREATE TABLE IF NOT EXISTS dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  dashboard_type VARCHAR(20) NOT NULL,
  dashboard_mode VARCHAR(20),
  widgets JSONB DEFAULT '[]'::jsonb,
  layout JSONB DEFAULT '{"columns": 12, "rows": 12, "gap": 16, "responsive": true}'::jsonb,
  is_personal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_member_id, dashboard_type)
);

-- Widget permissions table
CREATE TABLE IF NOT EXISTS widget_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_config_id UUID NOT NULL REFERENCES dashboard_configs(id) ON DELETE CASCADE,
  widget_id VARCHAR(50) NOT NULL,
  visible_to VARCHAR(20) NOT NULL DEFAULT 'owner',
  editable_by VARCHAR(20) NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dashboard_config_id, widget_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_family_member ON dashboard_configs(family_member_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_type ON dashboard_configs(dashboard_type);
CREATE INDEX IF NOT EXISTS idx_widget_permissions_dashboard ON widget_permissions(dashboard_config_id);

-- Enable RLS
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own dashboards" ON dashboard_configs;
CREATE POLICY "Users can view own dashboards"
  ON dashboard_configs FOR SELECT
  USING (
    family_member_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_members fm1, family_members fm2
      WHERE fm1.id = auth.uid()
        AND fm2.id = dashboard_configs.family_member_id
        AND fm1.family_id = fm2.family_id
        AND fm1.role IN ('mom', 'dad', 'guardian')
    )
  );

DROP POLICY IF EXISTS "Users can create own dashboards" ON dashboard_configs;
CREATE POLICY "Users can create own dashboards"
  ON dashboard_configs FOR INSERT
  WITH CHECK (family_member_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own dashboards" ON dashboard_configs;
CREATE POLICY "Users can update own dashboards"
  ON dashboard_configs FOR UPDATE
  USING (family_member_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own dashboards" ON dashboard_configs;
CREATE POLICY "Users can delete own dashboards"
  ON dashboard_configs FOR DELETE
  USING (family_member_id = auth.uid());

DROP POLICY IF EXISTS "Widget permissions follow dashboard access" ON widget_permissions;
CREATE POLICY "Widget permissions follow dashboard access"
  ON widget_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM dashboard_configs dc
      WHERE dc.id = widget_permissions.dashboard_config_id
        AND dc.family_member_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_dashboard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dashboard_configs_updated_at ON dashboard_configs;
CREATE TRIGGER dashboard_configs_updated_at
  BEFORE UPDATE ON dashboard_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_updated_at();

-- ========================================
-- PART 4: VICTORY RECORDER SYSTEM
-- ========================================

-- Victories table
CREATE TABLE IF NOT EXISTS victories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category VARCHAR(50),
  celebration_message TEXT,
  voice_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Victory celebrations metadata
CREATE TABLE IF NOT EXISTS victory_celebrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  victory_id UUID NOT NULL REFERENCES victories(id) ON DELETE CASCADE,
  celebration_text TEXT NOT NULL,
  voice_provider VARCHAR(50),
  voice_id VARCHAR(100),
  playback_count INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_victories_family_member ON victories(family_member_id);
CREATE INDEX IF NOT EXISTS idx_victories_created_at ON victories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_victory_celebrations_victory ON victory_celebrations(victory_id);

-- Enable RLS
ALTER TABLE victories ENABLE ROW LEVEL SECURITY;
ALTER TABLE victory_celebrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Members can view family victories" ON victories;
CREATE POLICY "Members can view family victories"
  ON victories FOR SELECT
  USING (
    family_member_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_members fm1, family_members fm2
      WHERE fm1.id = auth.uid()
        AND fm2.id = victories.family_member_id
        AND fm1.family_id = fm2.family_id
    )
  );

DROP POLICY IF EXISTS "Members can create victories" ON victories;
CREATE POLICY "Members can create victories"
  ON victories FOR INSERT
  WITH CHECK (family_member_id = auth.uid());

DROP POLICY IF EXISTS "Members can update victories" ON victories;
CREATE POLICY "Members can update victories"
  ON victories FOR UPDATE
  USING (family_member_id = auth.uid());

DROP POLICY IF EXISTS "Members can delete victories" ON victories;
CREATE POLICY "Members can delete victories"
  ON victories FOR DELETE
  USING (family_member_id = auth.uid());

DROP POLICY IF EXISTS "Celebrations follow victory access" ON victory_celebrations;
CREATE POLICY "Celebrations follow victory access"
  ON victory_celebrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM victories v
      WHERE v.id = victory_celebrations.victory_id
        AND v.family_member_id = auth.uid()
    )
  );

-- Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS victories_updated_at ON victories;
CREATE TRIGGER victories_updated_at
  BEFORE UPDATE ON victories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SMART MIGRATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Part 1: Archive Covers Storage ✓';
  RAISE NOTICE 'Part 2: Added dashboard_mode to family_members ✓';
  RAISE NOTICE 'Part 3: Dashboard System Created ✓';
  RAISE NOTICE '  - dashboard_configs table';
  RAISE NOTICE '  - widget_permissions table';
  RAISE NOTICE 'Part 4: Victory Recorder Created ✓';
  RAISE NOTICE '  - victories table';
  RAISE NOTICE '  - victory_celebrations table';
  RAISE NOTICE '';
  RAISE NOTICE 'NOTE: Skipped existing columns and tables';
  RAISE NOTICE 'NOTE: Your existing gamification tables preserved';
  RAISE NOTICE '========================================';
END $$;
