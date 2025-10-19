-- ============================================
-- MyAIM Central - Login System Migration (FIXED)
-- Version: 1.0.1
-- Date: 2025-10-18
-- Purpose: Add all required tables and columns for 4-login-page system
-- ============================================

-- ============================================
-- PART 1: ALTER EXISTING TABLES
-- ============================================

-- Add auth_user_id to families table (links to Supabase auth.users)
ALTER TABLE families
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique family login name for dashboard access
ALTER TABLE families
  ADD COLUMN IF NOT EXISTS family_login_name TEXT;

-- Make family_login_name unique (only if column doesn't already have constraint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'families_family_login_name_key'
  ) THEN
    ALTER TABLE families ADD CONSTRAINT families_family_login_name_key UNIQUE (family_login_name);
  END IF;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_families_auth_user_id ON families(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_families_family_login_name ON families(family_login_name);

-- Add comments
COMMENT ON COLUMN families.auth_user_id IS 'Links family to Supabase auth.users - only primary parent has auth_user_id';
COMMENT ON COLUMN families.family_login_name IS 'Unique family login name for PIN-based family member dashboard access';

-- ============================================

-- Add auth_user_id to family_members table (only for primary parent)
ALTER TABLE family_members
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add PIN column for dashboard access (hashed with bcrypt)
ALTER TABLE family_members
  ADD COLUMN IF NOT EXISTS pin TEXT;

-- Add flag to identify primary parent (account owner)
ALTER TABLE family_members
  ADD COLUMN IF NOT EXISTS is_primary_parent BOOLEAN DEFAULT false;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_family_members_auth_user_id ON family_members(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_pin ON family_members(family_id, name) WHERE pin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_family_members_is_primary_parent ON family_members(family_id, is_primary_parent) WHERE is_primary_parent = true;

-- Add comments
COMMENT ON COLUMN family_members.auth_user_id IS 'Links to Supabase auth.users - only set for primary parent';
COMMENT ON COLUMN family_members.pin IS 'Hashed PIN (bcrypt) for dashboard access - used by children/teens';
COMMENT ON COLUMN family_members.is_primary_parent IS 'True for the account owner (Mom) - only one per family';

-- ============================================
-- PART 2: CREATE NEW TABLES
-- ============================================

-- Beta Users Table
CREATE TABLE IF NOT EXISTS beta_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'completed')),
  beta_tier TEXT NOT NULL DEFAULT 'beta' CHECK (beta_tier IN ('alpha', 'beta', 'gamma')),
  setup_completed BOOLEAN DEFAULT false,
  last_active TIMESTAMP WITH TIME ZONE,
  total_sessions INTEGER DEFAULT 0,
  total_feedback_submissions INTEGER DEFAULT 0,
  beta_code TEXT,
  invited_by UUID REFERENCES beta_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  features_enabled JSONB DEFAULT '{}'::jsonb
);

-- Indexes for beta_users (CREATE AFTER table exists)
CREATE INDEX IF NOT EXISTS idx_beta_users_user_id ON beta_users(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_users_status ON beta_users(status);
CREATE INDEX IF NOT EXISTS idx_beta_users_beta_code ON beta_users(beta_code) WHERE beta_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_beta_users_last_active ON beta_users(last_active);

-- Comments
COMMENT ON TABLE beta_users IS 'Beta testers with special access and feedback capabilities';
COMMENT ON COLUMN beta_users.setup_completed IS 'Has user completed family setup? Used for redirect logic';
COMMENT ON COLUMN beta_users.beta_tier IS 'Alpha (early), Beta (active), Gamma (late) testing phases';

-- ============================================

-- Staff Permissions Table
CREATE TABLE IF NOT EXISTS staff_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL CHECK (permission_type IN (
    'super_admin',
    'library_admin',
    'beta_admin',
    'content_moderator',
    'analytics_viewer'
  )),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'staff_permissions_user_id_permission_type_key'
  ) THEN
    ALTER TABLE staff_permissions ADD CONSTRAINT staff_permissions_user_id_permission_type_key UNIQUE(user_id, permission_type);
  END IF;
END $$;

-- Indexes for staff_permissions
CREATE INDEX IF NOT EXISTS idx_staff_permissions_user_id ON staff_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_permissions_permission_type ON staff_permissions(permission_type);
CREATE INDEX IF NOT EXISTS idx_staff_permissions_active ON staff_permissions(is_active, expires_at);

-- Comments
COMMENT ON TABLE staff_permissions IS 'Admin permissions for accessing different parts of AIM-Admin dashboard';
COMMENT ON COLUMN staff_permissions.permission_type IS 'Type of admin access: super_admin, library_admin, beta_admin, etc.';
COMMENT ON COLUMN staff_permissions.expires_at IS 'Optional expiration - NULL means permanent access';

-- ============================================

-- PIN Attempt Log Table
CREATE TABLE IF NOT EXISTS pin_attempt_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  was_successful BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for pin_attempt_log
CREATE INDEX IF NOT EXISTS idx_pin_attempt_log_family_member_id ON pin_attempt_log(family_member_id);
CREATE INDEX IF NOT EXISTS idx_pin_attempt_log_attempted_at ON pin_attempt_log(attempted_at);
CREATE INDEX IF NOT EXISTS idx_pin_attempt_log_failed_recent
  ON pin_attempt_log(family_member_id, attempted_at)
  WHERE was_successful = false;

-- Comments
COMMENT ON TABLE pin_attempt_log IS 'Tracks PIN login attempts for rate limiting and security';
COMMENT ON INDEX idx_pin_attempt_log_failed_recent IS 'Optimized for checking recent failed attempts (last 15 minutes)';

-- ============================================
-- PART 3: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE beta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_attempt_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Beta users can read own record" ON beta_users;
DROP POLICY IF EXISTS "Super admins can read all beta users" ON beta_users;
DROP POLICY IF EXISTS "Beta admins can read all beta users" ON beta_users;
DROP POLICY IF EXISTS "Super admins can modify beta users" ON beta_users;

DROP POLICY IF EXISTS "Users can read own permissions" ON staff_permissions;
DROP POLICY IF EXISTS "Super admins can read all permissions" ON staff_permissions;
DROP POLICY IF EXISTS "Only super admins can modify permissions" ON staff_permissions;

DROP POLICY IF EXISTS "No direct user access to PIN logs" ON pin_attempt_log;
DROP POLICY IF EXISTS "Super admins can view PIN logs" ON pin_attempt_log;

-- Beta Users RLS Policies
CREATE POLICY "Beta users can read own record"
  ON beta_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can read all beta users"
  ON beta_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_permissions sp
      WHERE sp.user_id = auth.uid()
        AND sp.permission_type = 'super_admin'
        AND sp.is_active = true
        AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
    )
  );

CREATE POLICY "Beta admins can read all beta users"
  ON beta_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_permissions sp
      WHERE sp.user_id = auth.uid()
        AND sp.permission_type = 'beta_admin'
        AND sp.is_active = true
        AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
    )
  );

CREATE POLICY "Super admins can modify beta users"
  ON beta_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_permissions sp
      WHERE sp.user_id = auth.uid()
        AND sp.permission_type = 'super_admin'
        AND sp.is_active = true
        AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
    )
  );

-- Staff Permissions RLS Policies
CREATE POLICY "Users can read own permissions"
  ON staff_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can read all permissions"
  ON staff_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_permissions sp
      WHERE sp.user_id = auth.uid()
        AND sp.permission_type = 'super_admin'
        AND sp.is_active = true
        AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
    )
  );

CREATE POLICY "Only super admins can modify permissions"
  ON staff_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_permissions sp
      WHERE sp.user_id = auth.uid()
        AND sp.permission_type = 'super_admin'
        AND sp.is_active = true
        AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
    )
  );

-- PIN Attempt Log RLS Policies
CREATE POLICY "No direct user access to PIN logs"
  ON pin_attempt_log FOR ALL
  TO authenticated
  USING (false);

CREATE POLICY "Super admins can view PIN logs"
  ON pin_attempt_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_permissions sp
      WHERE sp.user_id = auth.uid()
        AND sp.permission_type = 'super_admin'
        AND sp.is_active = true
        AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
    )
  );

-- ============================================
-- PART 4: DATABASE FUNCTIONS
-- ============================================

-- Function: Check if account is locked due to too many failed PIN attempts
CREATE OR REPLACE FUNCTION is_pin_locked(member_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  failed_attempts INTEGER;
BEGIN
  SELECT COUNT(*) INTO failed_attempts
  FROM pin_attempt_log
  WHERE family_member_id = member_id
    AND attempted_at > NOW() - INTERVAL '15 minutes'
    AND was_successful = false;

  RETURN failed_attempts >= 5;
END;
$$;

-- Function: Log PIN attempt
CREATE OR REPLACE FUNCTION log_pin_attempt(
  member_id UUID,
  success BOOLEAN,
  ip TEXT DEFAULT NULL,
  agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO pin_attempt_log (
    family_member_id,
    was_successful,
    ip_address,
    user_agent
  ) VALUES (
    member_id,
    success,
    CASE WHEN ip IS NOT NULL THEN ip::INET ELSE NULL END,
    agent
  );
END;
$$;

-- Function: Unlock PIN account (called by parent)
CREATE OR REPLACE FUNCTION unlock_pin_account(member_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM pin_attempt_log
  WHERE family_member_id = member_id
    AND attempted_at > NOW() - INTERVAL '15 minutes'
    AND was_successful = false;
END;
$$;

-- ============================================
-- PART 5: UPDATE TRIGGERS
-- ============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS beta_users_updated_at ON beta_users;
DROP TRIGGER IF EXISTS staff_permissions_updated_at ON staff_permissions;

-- Update updated_at timestamp on beta_users
CREATE OR REPLACE FUNCTION update_beta_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER beta_users_updated_at
  BEFORE UPDATE ON beta_users
  FOR EACH ROW
  EXECUTE FUNCTION update_beta_users_updated_at();

-- Update updated_at timestamp on staff_permissions
CREATE OR REPLACE FUNCTION update_staff_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER staff_permissions_updated_at
  BEFORE UPDATE ON staff_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_permissions_updated_at();

-- ============================================
-- PART 6: CONSTRAINTS & VALIDATIONS
-- ============================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS enforce_single_primary_parent_trigger ON family_members;

-- Ensure only one primary parent per family
CREATE OR REPLACE FUNCTION enforce_single_primary_parent()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary_parent = true THEN
    IF EXISTS (
      SELECT 1 FROM family_members
      WHERE family_id = NEW.family_id
        AND is_primary_parent = true
        AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Only one primary parent allowed per family';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_primary_parent_trigger
  BEFORE INSERT OR UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_primary_parent();

-- ============================================
-- PART 7: INITIAL DATA
-- ============================================

-- Grant super admin permissions to hardcoded admin emails
DO $$
DECLARE
  admin_email TEXT;
  admin_user_id UUID;
BEGIN
  FOR admin_email IN
    SELECT unnest(ARRAY[
      'tenisewertman@gmail.com',
      'aimagicformoms@gmail.com',
      '3littlelanterns@gmail.com'
    ])
  LOOP
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = admin_email;

    IF admin_user_id IS NOT NULL THEN
      INSERT INTO staff_permissions (user_id, permission_type, is_active)
      VALUES (admin_user_id, 'super_admin', true)
      ON CONFLICT (user_id, permission_type)
      DO UPDATE SET is_active = true, updated_at = NOW();

      RAISE NOTICE 'Granted super_admin to: %', admin_email;
    ELSE
      RAISE NOTICE 'User not found (will be granted on first login): %', admin_email;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- PART 8: HELPFUL VIEWS
-- ============================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS active_admins;
DROP VIEW IF EXISTS active_beta_testers;

-- View: Active admins with their permissions
CREATE VIEW active_admins AS
SELECT
  u.email,
  u.id as user_id,
  ARRAY_AGG(sp.permission_type) as permissions,
  MAX(sp.expires_at) as latest_expiration
FROM auth.users u
INNER JOIN staff_permissions sp ON u.id = sp.user_id
WHERE sp.is_active = true
  AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
GROUP BY u.email, u.id;

-- View: Active beta testers with basic info
CREATE VIEW active_beta_testers AS
SELECT
  u.email,
  bu.beta_tier,
  bu.setup_completed,
  bu.last_active,
  bu.total_sessions,
  f.family_name,
  fm.name as member_name
FROM beta_users bu
INNER JOIN auth.users u ON bu.user_id = u.id
LEFT JOIN families f ON f.auth_user_id = bu.user_id
LEFT JOIN family_members fm ON fm.auth_user_id = bu.user_id AND fm.is_primary_parent = true
WHERE bu.status = 'active';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Login System Migration Complete!';
  RAISE NOTICE 'Version: 1.0.1 (FIXED)';
  RAISE NOTICE 'Date: %', NOW();
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'New Tables Created:';
  RAISE NOTICE '  - beta_users';
  RAISE NOTICE '  - staff_permissions';
  RAISE NOTICE '  - pin_attempt_log';
  RAISE NOTICE '';
  RAISE NOTICE 'New Columns Added:';
  RAISE NOTICE '  - families.auth_user_id';
  RAISE NOTICE '  - families.family_login_name';
  RAISE NOTICE '  - family_members.auth_user_id';
  RAISE NOTICE '  - family_members.pin';
  RAISE NOTICE '  - family_members.is_primary_parent';
  RAISE NOTICE '';
  RAISE NOTICE 'Security Functions Created:';
  RAISE NOTICE '  - is_pin_locked()';
  RAISE NOTICE '  - log_pin_attempt()';
  RAISE NOTICE '  - unlock_pin_account()';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Set family_login_name for existing families';
  RAISE NOTICE '  2. Hash existing PINs (if any)';
  RAISE NOTICE '  3. Test authentication flows';
  RAISE NOTICE '==============================================';
END $$;
