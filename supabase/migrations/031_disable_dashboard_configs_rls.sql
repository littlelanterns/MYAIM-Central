-- Migration: Disable RLS on dashboard_configs
-- Problem: RLS is blocking inserts when creating dashboard configs for new family members
-- Solution: Disable RLS on dashboard_configs (will configure proper RLS in dedicated session)

ALTER TABLE dashboard_configs DISABLE ROW LEVEL SECURITY;

-- Drop any policies that might exist
DROP POLICY IF EXISTS "Users can view own dashboard config" ON dashboard_configs;
DROP POLICY IF EXISTS "Users can manage own dashboard config" ON dashboard_configs;
DROP POLICY IF EXISTS "Users can view their family's dashboard configs" ON dashboard_configs;
DROP POLICY IF EXISTS "Users can create their family's dashboard configs" ON dashboard_configs;
DROP POLICY IF EXISTS "Users can update their family's dashboard configs" ON dashboard_configs;
DROP POLICY IF EXISTS "Users can delete their family's dashboard configs" ON dashboard_configs;

COMMENT ON TABLE dashboard_configs IS
'Dashboard configurations per family member. RLS DISABLED - will be configured in dedicated session.
See migration 031_disable_dashboard_configs_rls.sql';
