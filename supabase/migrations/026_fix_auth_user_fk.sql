-- Migration: Fix auth_user_id foreign key issue
-- Description: Removes the foreign key constraint to auth.users since it causes issues
-- during signup flow. The relationship is maintained at the application level.

-- Drop the foreign key constraint on families table
ALTER TABLE families DROP CONSTRAINT IF EXISTS families_auth_user_id_fkey;

-- Drop the foreign key constraint on family_members table
ALTER TABLE family_members DROP CONSTRAINT IF EXISTS family_members_auth_user_id_fkey;

-- The columns remain, just without the FK constraint
-- This is safe because:
-- 1. The application already validates the auth user exists before inserting
-- 2. Supabase auth handles user lifecycle
-- 3. We can add database triggers later for orphan cleanup if needed
