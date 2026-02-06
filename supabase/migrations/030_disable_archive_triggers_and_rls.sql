-- Migration: Disable archive triggers and RLS to fix save hang
-- Problem: The auto_create_member_archives trigger on family_members causes hangs
--          due to RLS recursion. Application code (api.js) now handles archive folder
--          creation, making the trigger redundant.
-- Solution: Disable the trigger and disable RLS on archive tables.
--          Proper RLS will be configured in a dedicated future session.

-- ============================================================================
-- STEP 1: Disable the problematic trigger on family_members
-- ============================================================================

DROP TRIGGER IF EXISTS auto_create_member_archives ON public.family_members;

-- Also drop the family archives trigger to be safe
DROP TRIGGER IF EXISTS auto_create_family_archives ON public.families;

-- ============================================================================
-- STEP 2: Disable RLS on archive tables
-- ============================================================================

-- archive_folders
ALTER TABLE public.archive_folders DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their family's archive folders" ON public.archive_folders;
DROP POLICY IF EXISTS "Users can create archive folders for their family" ON public.archive_folders;
DROP POLICY IF EXISTS "Users can update their family's archive folders" ON public.archive_folders;
DROP POLICY IF EXISTS "Users can delete their family's archive folders" ON public.archive_folders;

-- archive_context_items
ALTER TABLE public.archive_context_items DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view context items in their family's folders" ON public.archive_context_items;
DROP POLICY IF EXISTS "Users can create context items in their family's folders" ON public.archive_context_items;
DROP POLICY IF EXISTS "Users can update context items in their family's folders" ON public.archive_context_items;
DROP POLICY IF EXISTS "Users can delete context items in their family's folders" ON public.archive_context_items;

-- archive_inheritance_rules
ALTER TABLE public.archive_inheritance_rules DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view inheritance rules for their family's folders" ON public.archive_inheritance_rules;
DROP POLICY IF EXISTS "Users can create inheritance rules for their family's folders" ON public.archive_inheritance_rules;
DROP POLICY IF EXISTS "Users can update inheritance rules for their family's folders" ON public.archive_inheritance_rules;
DROP POLICY IF EXISTS "Users can delete inheritance rules for their family's folders" ON public.archive_inheritance_rules;

-- ============================================================================
-- STEP 3: Add comments explaining the change
-- ============================================================================

COMMENT ON TABLE public.archive_folders IS
'Family archive folders. RLS DISABLED - will be configured in dedicated session.
Trigger auto_create_member_archives DISABLED - api.js handles folder creation.
See migration 030_disable_archive_triggers_and_rls.sql';

COMMENT ON TABLE public.archive_context_items IS
'Context items within archive folders. RLS DISABLED - will be configured in dedicated session.
See migration 030_disable_archive_triggers_and_rls.sql';

COMMENT ON TABLE public.archive_inheritance_rules IS
'Inheritance rules between folders. RLS DISABLED - will be configured in dedicated session.
See migration 030_disable_archive_triggers_and_rls.sql';
