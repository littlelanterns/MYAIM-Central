-- Migration: Fix staff_permissions infinite recursion
-- Problem: RLS policies on beta_users and feedback_submissions have subqueries
--          to staff_permissions, which triggers RLS on staff_permissions,
--          causing infinite recursion.
-- Solution: Disable RLS on staff_permissions (small admin table, low risk)
--           and update other policies to use direct email checks instead.

-- ============================================================================
-- STEP 1: Disable RLS on staff_permissions entirely
-- ============================================================================
-- This breaks the recursion chain. staff_permissions is an admin-only table
-- with minimal security risk when RLS is disabled.

ALTER TABLE staff_permissions DISABLE ROW LEVEL SECURITY;

-- Drop existing policies on staff_permissions (they won't work with RLS disabled anyway)
DROP POLICY IF EXISTS "Users can read own permissions" ON staff_permissions;
DROP POLICY IF EXISTS "Super admin can manage staff permissions" ON staff_permissions;

-- ============================================================================
-- STEP 2: Fix beta_users policies - remove staff_permissions subquery
-- ============================================================================
-- Replace the recursive policy with a direct email check

DROP POLICY IF EXISTS "Staff can read beta users" ON beta_users;

-- Users can read their own beta record
DROP POLICY IF EXISTS "Users can read own beta status" ON beta_users;
CREATE POLICY "Users can read own beta status"
ON beta_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Super admins can read all beta users (using direct email check, no recursion)
DROP POLICY IF EXISTS "Super admin can read all beta users" ON beta_users;
CREATE POLICY "Super admin can read all beta users"
ON beta_users FOR SELECT
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

-- Super admins can manage beta users
DROP POLICY IF EXISTS "Super admin can manage beta users" ON beta_users;
CREATE POLICY "Super admin can manage beta users"
ON beta_users FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

-- ============================================================================
-- STEP 3: Fix feedback_submissions policies - remove staff_permissions subquery
-- ============================================================================

DROP POLICY IF EXISTS "Staff can read feedback" ON feedback_submissions;

-- The existing "Super admin can read all feedback" policy already uses direct email check
-- Just ensure it exists (it was created in 001_beta_system_enhancements.sql)

-- ============================================================================
-- STEP 4: Add comment explaining the change
-- ============================================================================

COMMENT ON TABLE staff_permissions IS
'Admin permissions table. RLS DISABLED to prevent infinite recursion.
Access control is handled at application level via direct email checks.
See migration 029_fix_staff_permissions_recursion.sql for details.';

-- ============================================================================
-- Verification: After running this migration, these queries should work:
-- ============================================================================
-- SELECT * FROM beta_users WHERE user_id = auth.uid();
-- SELECT * FROM staff_permissions WHERE user_id = auth.uid();
-- SELECT * FROM feedback_submissions WHERE user_id = auth.uid();
