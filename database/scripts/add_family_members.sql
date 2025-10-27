-- Add Sample Family Members Script
-- Creates a complete sample family with one member for each dashboard type
-- Run this in Supabase SQL Editor
-- This script will create a family if none exists, or use the first existing family
--
-- Family Members to be Added:
-- 1. Mom - Personal Dashboard (Primary Organizer, appears in family overview)
-- 2. Dad - Additional Adult Dashboard
-- 3. Emma (14) - Independent Mode Dashboard (Teen)
-- 4. Noah (10) - Guided Mode Dashboard (Child)
-- 5. Ruby (6) - Play Mode Dashboard (Young Child)

-- ========================================
-- STEP 1: Create or Get Family
-- ========================================

-- Create a family if none exists
DO $$
DECLARE
  v_family_id UUID;
BEGIN
  -- Check if any family exists
  SELECT id INTO v_family_id FROM families LIMIT 1;

  IF v_family_id IS NULL THEN
    -- No family exists, create one
    INSERT INTO families (id, family_name, subscription_tier, created_at)
    VALUES (gen_random_uuid(), 'The Smith Family', 'enhanced', NOW())
    RETURNING id INTO v_family_id;

    RAISE NOTICE 'Created new family with ID: %', v_family_id;
  ELSE
    RAISE NOTICE 'Using existing family with ID: %', v_family_id;
  END IF;

  -- Store family_id in a temporary table for use in next step
  CREATE TEMP TABLE IF NOT EXISTS temp_family (id UUID);
  DELETE FROM temp_family;
  INSERT INTO temp_family VALUES (v_family_id);
END $$;

-- ========================================
-- STEP 2: Add Family Members
-- ========================================

-- Add Mom (Primary Organizer with Personal Dashboard)
INSERT INTO family_members (
  id,
  family_id,
  name,
  role,
  dashboard_mode,
  display_title,
  is_primary_parent,
  member_color,
  avatar_url,
  created_at
)
SELECT
  gen_random_uuid(),
  id,
  'Mom',
  'primary_organizer',
  'personal',
  'Mom',
  true,
  'AIMfM Sage Teal',
  null,
  NOW()
FROM temp_family;

-- Add Dad (Additional Adult Dashboard)
INSERT INTO family_members (
  id,
  family_id,
  name,
  role,
  dashboard_mode,
  display_title,
  is_primary_parent,
  member_color,
  avatar_url,
  created_at
)
SELECT
  gen_random_uuid(),
  id,
  'Dad',
  'additional_adult',
  'additional_adult',
  'Dad',
  false,
  'Deep Ocean',
  null,
  NOW()
FROM temp_family;

-- Add Emma (Teen with Independent Mode)
INSERT INTO family_members (
  id,
  family_id,
  name,
  role,
  dashboard_mode,
  display_title,
  is_primary_parent,
  member_color,
  avatar_url,
  age,
  created_at
)
SELECT
  gen_random_uuid(),
  id,
  'Emma',
  'teen',
  'independent',
  'Emma',
  false,
  'Lavender Mist',
  null,
  14,
  NOW()
FROM temp_family;

-- Add Noah (Child with Guided Mode)
INSERT INTO family_members (
  id,
  family_id,
  name,
  role,
  dashboard_mode,
  display_title,
  is_primary_parent,
  member_color,
  avatar_url,
  age,
  created_at
)
SELECT
  gen_random_uuid(),
  id,
  'Noah',
  'child',
  'guided',
  'Noah',
  false,
  'Golden Honey',
  null,
  10,
  NOW()
FROM temp_family;

-- Add Ruby (Child with Play Mode)
INSERT INTO family_members (
  id,
  family_id,
  name,
  role,
  dashboard_mode,
  display_title,
  is_primary_parent,
  member_color,
  avatar_url,
  age,
  created_at
)
SELECT
  gen_random_uuid(),
  id,
  'Ruby',
  'child',
  'play',
  'Ruby',
  false,
  'Bubble Gum',
  null,
  6,
  NOW()
FROM temp_family;

-- ========================================
-- STEP 3: Verify
-- ========================================

-- Show all family members that were added
DO $$
DECLARE
  v_family_id UUID;
  v_family_name TEXT;
  v_member_count INT;
BEGIN
  -- Get family info
  SELECT id INTO v_family_id FROM temp_family;
  SELECT family_name INTO v_family_name FROM families WHERE id = v_family_id;
  SELECT COUNT(*) INTO v_member_count FROM family_members WHERE family_id = v_family_id;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUCCESS! Family members added';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Family: % (ID: %)', v_family_name, v_family_id;
  RAISE NOTICE 'Total members: %', v_member_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Run this query to see all members:';
  RAISE NOTICE 'SELECT name, role, dashboard_mode, member_color FROM family_members WHERE family_id = ''%'';', v_family_id;
  RAISE NOTICE '========================================';
END $$;

-- Display the results
SELECT
  name,
  role,
  dashboard_mode,
  member_color,
  age,
  created_at
FROM family_members
WHERE family_id = (SELECT id FROM temp_family)
ORDER BY created_at DESC;

-- Clean up temp table
DROP TABLE IF EXISTS temp_family;
