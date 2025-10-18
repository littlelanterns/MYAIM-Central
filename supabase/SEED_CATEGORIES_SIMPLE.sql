-- Simple Seed SQL for Default Intention Categories
-- Run this in Supabase SQL Editor
-- This version works without unique constraints

-- First, let's check if categories already exist and delete them if needed
-- (This prevents duplicates on re-run)
DELETE FROM intention_categories
WHERE family_id IS NULL
  AND category_type = 'system_default';

-- Insert system default categories (family_id NULL = available to all families)
INSERT INTO intention_categories (
  family_id,
  category_name,
  display_name,
  description,
  icon,
  color_hex,
  category_type,
  sort_order,
  is_active
)
VALUES
  (NULL, 'family_relationships', 'Family Relationships', 'Strengthen family bonds and connections', NULL, '#68a395', 'system_default', 1, true),
  (NULL, 'personal_growth', 'Personal Growth', 'Self-improvement and personal development', NULL, '#8BC34A', 'system_default', 2, true),
  (NULL, 'household', 'Household Management', 'Organization and home maintenance', NULL, '#FF9800', 'system_default', 3, true),
  (NULL, 'health_wellness', 'Health & Wellness', 'Physical and mental health goals', NULL, '#4CAF50', 'system_default', 4, true),
  (NULL, 'education', 'Education & Learning', 'Academic goals and lifelong learning', NULL, '#2196F3', 'system_default', 5, true),
  (NULL, 'communication', 'Communication', 'How the family talks and listens to each other', NULL, '#9C27B0', 'system_default', 6, true),
  (NULL, 'routines', 'Daily Routines', 'Morning, evening, and daily structure', NULL, '#FF5722', 'system_default', 7, true),
  (NULL, 'emotional_support', 'Emotional Support', 'Creating a safe, supportive environment', NULL, '#E91E63', 'system_default', 8, true),
  (NULL, 'spiritual_development', 'Spiritual Development', 'Faith, meaning, and inner growth', NULL, '#795548', 'system_default', 9, true),
  (NULL, 'financial', 'Financial Goals', 'Budgeting, saving, and financial planning', NULL, '#607D8B', 'system_default', 10, true);

-- Verify the insert
SELECT COUNT(*) as total_inserted FROM intention_categories WHERE family_id IS NULL AND category_type = 'system_default';
