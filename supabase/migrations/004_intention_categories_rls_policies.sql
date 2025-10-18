-- Intention Categories RLS Policies
-- Fixes RLS policy violations when creating/reading custom categories
--
-- DATE: 2025-10-17
-- ISSUE: intention_categories table has RLS enabled but no policies defined
-- RESULT: 403 errors when reading, "new row violates row-level security" when inserting

-- Enable Row Level Security (if not already enabled)
ALTER TABLE intention_categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- READ POLICIES
-- ============================================

-- Policy 1: Everyone can read system default categories (family_id IS NULL)
DROP POLICY IF EXISTS "Anyone can read system default categories" ON intention_categories;
CREATE POLICY "Anyone can read system default categories"
ON intention_categories FOR SELECT
TO authenticated
USING (family_id IS NULL);

-- Policy 2: Family members can read their own family's custom categories
DROP POLICY IF EXISTS "Family members can read own family categories" ON intention_categories;
CREATE POLICY "Family members can read own family categories"
ON intention_categories FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm
        WHERE fm.auth_user_id = auth.uid()
        AND fm.family_id = intention_categories.family_id
    )
);

-- Policy 3: Super admins can read all categories
DROP POLICY IF EXISTS "Super admin can read all categories" ON intention_categories;
CREATE POLICY "Super admin can read all categories"
ON intention_categories FOR SELECT
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

-- ============================================
-- INSERT POLICIES
-- ============================================

-- Policy 4: Family members can create custom categories for their own family
DROP POLICY IF EXISTS "Family members can create own family categories" ON intention_categories;
CREATE POLICY "Family members can create own family categories"
ON intention_categories FOR INSERT
TO authenticated
WITH CHECK (
    -- Must be creating a category for their own family
    EXISTS (
        SELECT 1 FROM family_members fm
        WHERE fm.auth_user_id = auth.uid()
        AND fm.family_id = intention_categories.family_id
    )
    -- Only allow custom categories (not system_default)
    AND category_type = 'custom'
);

-- Policy 5: Super admins can insert any category (including system defaults)
DROP POLICY IF EXISTS "Super admin can insert any category" ON intention_categories;
CREATE POLICY "Super admin can insert any category"
ON intention_categories FOR INSERT
TO authenticated
WITH CHECK (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

-- ============================================
-- UPDATE POLICIES
-- ============================================

-- Policy 6: Family members can update their own family's custom categories
DROP POLICY IF EXISTS "Family members can update own family categories" ON intention_categories;
CREATE POLICY "Family members can update own family categories"
ON intention_categories FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm
        WHERE fm.auth_user_id = auth.uid()
        AND fm.family_id = intention_categories.family_id
    )
    AND category_type = 'custom'
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM family_members fm
        WHERE fm.auth_user_id = auth.uid()
        AND fm.family_id = intention_categories.family_id
    )
    AND category_type = 'custom'
);

-- Policy 7: Super admins can update any category
DROP POLICY IF EXISTS "Super admin can update any category" ON intention_categories;
CREATE POLICY "Super admin can update any category"
ON intention_categories FOR UPDATE
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

-- ============================================
-- DELETE POLICIES
-- ============================================

-- Policy 8: Family members can delete (soft delete) their own custom categories
DROP POLICY IF EXISTS "Family members can delete own family categories" ON intention_categories;
CREATE POLICY "Family members can delete own family categories"
ON intention_categories FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm
        WHERE fm.auth_user_id = auth.uid()
        AND fm.family_id = intention_categories.family_id
    )
    AND category_type = 'custom'
);

-- Policy 9: Super admins can delete any category
DROP POLICY IF EXISTS "Super admin can delete any category" ON intention_categories;
CREATE POLICY "Super admin can delete any category"
ON intention_categories FOR DELETE
TO authenticated
USING (
    auth.jwt() ->> 'email' = ANY(ARRAY[
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com'
    ])
);

-- ============================================
-- VERIFICATION
-- ============================================

-- Test queries to verify policies work:
-- (Comment out before running migration)

/*
-- Test 1: Read system defaults (should work for any authenticated user)
SELECT * FROM intention_categories WHERE family_id IS NULL;

-- Test 2: Read own family categories (requires family_members record)
SELECT * FROM intention_categories WHERE family_id = (
    SELECT family_id FROM family_members WHERE auth_user_id = auth.uid()
);

-- Test 3: Create custom category (requires family_members record)
INSERT INTO intention_categories (
    family_id,
    category_name,
    display_name,
    category_type,
    color_hex
) VALUES (
    (SELECT family_id FROM family_members WHERE auth_user_id = auth.uid()),
    'test_category',
    'Test Category',
    'custom',
    '#68a395'
);
*/
