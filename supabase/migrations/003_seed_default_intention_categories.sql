-- Seed Default Intention Categories
-- Run this in Supabase SQL Editor to populate system default categories

-- Insert system default categories (family_id NULL = available to all families)
-- Using idempotent approach that checks for existing records

DO $$
BEGIN
  -- Only insert if no system_default categories exist yet
  IF NOT EXISTS (SELECT 1 FROM intention_categories WHERE category_type = 'system_default' LIMIT 1) THEN
    INSERT INTO intention_categories (
      family_id,
      category_name,
      display_name,
      description,
      icon,
      color_hex,
      category_type,
      sort_order
    )
    VALUES
      (NULL, 'family_relationships', 'Family Relationships', 'Strengthen family bonds and connections', '👨‍👩‍👧‍👦', '#68a395', 'system_default', 1),
      (NULL, 'personal_growth', 'Personal Growth', 'Self-improvement and personal development', '🌱', '#8BC34A', 'system_default', 2),
      (NULL, 'household', 'Household Management', 'Organization and home maintenance', '🏠', '#FF9800', 'system_default', 3),
      (NULL, 'health_wellness', 'Health & Wellness', 'Physical and mental health goals', '💚', '#4CAF50', 'system_default', 4),
      (NULL, 'education', 'Education & Learning', 'Academic goals and lifelong learning', '📚', '#2196F3', 'system_default', 5),
      (NULL, 'communication', 'Communication', 'How the family talks and listens to each other', '💬', '#9C27B0', 'system_default', 6),
      (NULL, 'routines', 'Daily Routines', 'Morning, evening, and daily structure', '⏰', '#FF5722', 'system_default', 7),
      (NULL, 'emotional_support', 'Emotional Support', 'Creating a safe, supportive environment', '🤗', '#E91E63', 'system_default', 8),
      (NULL, 'spiritual_development', 'Spiritual Development', 'Faith, meaning, and inner growth', '🙏', '#795548', 'system_default', 9),
      (NULL, 'financial', 'Financial Goals', 'Budgeting, saving, and financial planning', '💰', '#607D8B', 'system_default', 10);
  END IF;
END $$;
