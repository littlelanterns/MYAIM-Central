-- ========================================
-- MILESTONE 1: Dashboard System Migration
-- ========================================
-- Creates tables for multi-level dashboard architecture
-- Includes: dashboard configs, widget permissions
-- Date: 2025-01-XX
-- ========================================

-- Dashboard configurations table
-- Stores the layout and widget configuration for each family member's dashboard
CREATE TABLE IF NOT EXISTS dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  dashboard_type VARCHAR(20) NOT NULL CHECK (dashboard_type IN ('family', 'personal', 'play', 'guided', 'independent', 'additional_adult')),
  dashboard_mode VARCHAR(20) CHECK (dashboard_mode IN ('play', 'guided', 'independent')),
  widgets JSONB DEFAULT '[]'::jsonb,
  layout JSONB DEFAULT '{
    "columns": 12,
    "rows": 12,
    "gap": 16,
    "responsive": true
  }'::jsonb,
  is_personal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure each family member has only one of each dashboard type
  UNIQUE(family_member_id, dashboard_type)
);

-- Widget permissions table
-- Controls visibility and edit permissions for individual widgets
CREATE TABLE IF NOT EXISTS widget_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_config_id UUID NOT NULL REFERENCES dashboard_configs(id) ON DELETE CASCADE,
  widget_id VARCHAR(50) NOT NULL,
  visible_to VARCHAR(20) NOT NULL DEFAULT 'owner' CHECK (visible_to IN ('owner', 'parents', 'family', 'all')),
  editable_by VARCHAR(20) NOT NULL DEFAULT 'owner' CHECK (editable_by IN ('owner', 'parents', 'none')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure each widget has only one permission set per dashboard
  UNIQUE(dashboard_config_id, widget_id)
);

-- ========================================
-- INDEXES for performance
-- ========================================

-- Index for quickly finding dashboards by family member
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_family_member
  ON dashboard_configs(family_member_id);

-- Index for dashboard type queries
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_type
  ON dashboard_configs(dashboard_type);

-- Index for personal dashboard queries
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_personal
  ON dashboard_configs(is_personal) WHERE is_personal = true;

-- Index for widget permissions lookups
CREATE INDEX IF NOT EXISTS idx_widget_permissions_dashboard
  ON widget_permissions(dashboard_config_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on both tables
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_permissions ENABLE ROW LEVEL SECURITY;

-- Dashboard configs policies
-- Users can view their own dashboards
CREATE POLICY "Users can view own dashboards"
  ON dashboard_configs FOR SELECT
  USING (
    family_member_id = auth.uid()
    OR
    -- Parents can view children's dashboards
    EXISTS (
      SELECT 1 FROM family_members fm1, family_members fm2
      WHERE fm1.id = auth.uid()
        AND fm2.id = dashboard_configs.family_member_id
        AND fm1.family_id = fm2.family_id
        AND fm1.role IN ('primary_organizer', 'parent')
    )
  );

-- Users can insert their own dashboards
CREATE POLICY "Users can create own dashboards"
  ON dashboard_configs FOR INSERT
  WITH CHECK (
    family_member_id = auth.uid()
  );

-- Users can update their own dashboards or children's dashboards (if parent)
CREATE POLICY "Users can update allowed dashboards"
  ON dashboard_configs FOR UPDATE
  USING (
    family_member_id = auth.uid()
    OR
    -- Parents can update children's dashboards
    EXISTS (
      SELECT 1 FROM family_members fm1, family_members fm2
      WHERE fm1.id = auth.uid()
        AND fm2.id = dashboard_configs.family_member_id
        AND fm1.family_id = fm2.family_id
        AND fm1.role IN ('primary_organizer', 'parent')
        AND fm2.role IN ('child', 'teen')
    )
  );

-- Users can delete their own dashboards
CREATE POLICY "Users can delete own dashboards"
  ON dashboard_configs FOR DELETE
  USING (
    family_member_id = auth.uid()
  );

-- Widget permissions policies
-- Inherit permissions from dashboard configs
CREATE POLICY "Widget permissions follow dashboard access"
  ON widget_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM dashboard_configs dc
      WHERE dc.id = widget_permissions.dashboard_config_id
        AND (
          dc.family_member_id = auth.uid()
          OR
          EXISTS (
            SELECT 1 FROM family_members fm1, family_members fm2
            WHERE fm1.id = auth.uid()
              AND fm2.id = dc.family_member_id
              AND fm1.family_id = fm2.family_id
              AND fm1.role IN ('primary_organizer', 'parent')
          )
        )
    )
  );

-- ========================================
-- TRIGGERS for updated_at timestamp
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dashboard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for dashboard_configs
DROP TRIGGER IF EXISTS dashboard_configs_updated_at ON dashboard_configs;
CREATE TRIGGER dashboard_configs_updated_at
  BEFORE UPDATE ON dashboard_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_updated_at();

-- ========================================
-- COMMENTS for documentation
-- ========================================

COMMENT ON TABLE dashboard_configs IS
  'Stores dashboard configurations for family members. Each member can have family, member, and private dashboard views.';

COMMENT ON COLUMN dashboard_configs.dashboard_type IS
  'Type of dashboard: family (overview), member (personal), or private (mom only)';

COMMENT ON COLUMN dashboard_configs.widgets IS
  'Array of widget configurations stored as JSONB';

COMMENT ON COLUMN dashboard_configs.layout IS
  'Grid layout configuration for the dashboard';

COMMENT ON COLUMN dashboard_configs.is_private IS
  'Whether this dashboard is private (hidden from other family members)';

COMMENT ON TABLE widget_permissions IS
  'Controls visibility and edit permissions for individual widgets within dashboards';

COMMENT ON COLUMN widget_permissions.visible_to IS
  'Who can see this widget: owner, parents, family, or all';

COMMENT ON COLUMN widget_permissions.editable_by IS
  'Who can edit this widget: owner, parents, or none';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE 'Dashboard system migration completed successfully';
  RAISE NOTICE 'Tables created: dashboard_configs, widget_permissions';
  RAISE NOTICE 'RLS policies enabled for security';
  RAISE NOTICE 'Indexes created for performance';
END $$;
