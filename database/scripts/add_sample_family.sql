-- ========================================
-- Add Sample Family with All Dashboard Types
-- ========================================
-- Run this entire script in Supabase SQL Editor
-- Creates family if needed, then adds 5 members
-- ========================================

-- Create family if none exists, store ID in variable
DO $$
DECLARE
  v_family_id UUID;
BEGIN
  SELECT id INTO v_family_id FROM families LIMIT 1;

  IF v_family_id IS NULL THEN
    INSERT INTO families (id, family_name, subscription_tier, created_at)
    VALUES (gen_random_uuid(), 'The Smith Family', 'enhanced', NOW())
    RETURNING id INTO v_family_id;
    RAISE NOTICE 'Created new family: %', v_family_id;
  ELSE
    RAISE NOTICE 'Using existing family: %', v_family_id;
  END IF;

  CREATE TEMP TABLE IF NOT EXISTS temp_family (id UUID);
  DELETE FROM temp_family;
  INSERT INTO temp_family VALUES (v_family_id);
END $$;

-- Mom - Personal Dashboard
INSERT INTO family_members (id, family_id, name, role, dashboard_mode, display_title, is_primary_parent, member_color, created_at)
SELECT gen_random_uuid(), id, 'Mom', 'mom', 'personal', 'Mom', true, 'AIMfM Sage Teal', NOW()
FROM temp_family;

-- Dad - Additional Adult Dashboard
INSERT INTO family_members (id, family_id, name, role, dashboard_mode, display_title, is_primary_parent, member_color, created_at)
SELECT gen_random_uuid(), id, 'Dad', 'dad', 'additional_adult', 'Dad', false, 'Deep Ocean', NOW()
FROM temp_family;

-- Emma (14) - Independent Mode
INSERT INTO family_members (id, family_id, name, role, dashboard_mode, display_title, is_primary_parent, member_color, age, created_at)
SELECT gen_random_uuid(), id, 'Emma', 'teen', 'independent', 'Emma', false, 'Lavender Mist', 14, NOW()
FROM temp_family;

-- Noah (10) - Guided Mode
INSERT INTO family_members (id, family_id, name, role, dashboard_mode, display_title, is_primary_parent, member_color, age, created_at)
SELECT gen_random_uuid(), id, 'Noah', 'child', 'guided', 'Noah', false, 'Golden Honey', 10, NOW()
FROM temp_family;

-- Ruby (6) - Play Mode
INSERT INTO family_members (id, family_id, name, role, dashboard_mode, display_title, is_primary_parent, member_color, age, created_at)
SELECT gen_random_uuid(), id, 'Ruby', 'child', 'play', 'Ruby', false, 'Bubble Gum', 6, NOW()
FROM temp_family;

-- Show results
SELECT name, role, dashboard_mode, member_color, age FROM family_members WHERE family_id = (SELECT id FROM temp_family) ORDER BY created_at DESC;

-- Clean up
DROP TABLE IF EXISTS temp_family;
