-- ========================================
-- SEED TRACKER TEMPLATES MIGRATION
-- ========================================
-- Seeds basic system tracker templates for Grid, Circle, and Streak trackers
-- These serve as starting points that mom can customize
-- Date: 2025-10-21
-- ========================================

-- ========================================
-- GRID TRACKER TEMPLATES
-- ========================================

-- Scripture Study Grid (7x4 for monthly tracking)
INSERT INTO tracker_templates (
  name,
  description,
  tracker_type,
  visual_style,
  config,
  is_system_template
) VALUES (
  'Scripture Study Tracker',
  '28-day grid for daily scripture study tracking',
  'grid',
  'modern',
  '{
    "grid_rows": 4,
    "grid_cols": 7,
    "show_labels": true,
    "day_labels": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    "completion_icon": "check",
    "colors": {
      "completed": "var(--primary-color)",
      "pending": "var(--background-color)",
      "border": "var(--accent-color)"
    }
  }'::jsonb,
  TRUE
) ON CONFLICT DO NOTHING;

-- Homework Grid (5x7 for weekly subject tracking)
INSERT INTO tracker_templates (
  name,
  description,
  tracker_type,
  visual_style,
  config,
  is_system_template
) VALUES (
  'Weekly Homework Tracker',
  '5-subject weekly homework completion grid',
  'grid',
  'kid-friendly',
  '{
    "grid_rows": 5,
    "grid_cols": 7,
    "show_labels": true,
    "row_labels": ["Math", "Reading", "Science", "History", "Writing"],
    "day_labels": ["S", "M", "T", "W", "T", "F", "S"],
    "completion_icon": "star",
    "colors": {
      "completed": "var(--secondary-color)",
      "pending": "var(--background-color)",
      "border": "var(--accent-color)"
    }
  }'::jsonb,
  TRUE
) ON CONFLICT DO NOTHING;

-- Chore Chart Grid (Simple 7x1 weekly tracker)
INSERT INTO tracker_templates (
  name,
  description,
  tracker_type,
  visual_style,
  config,
  is_system_template
) VALUES (
  'Weekly Chore Tracker',
  'Simple weekly chore completion tracker',
  'grid',
  'modern',
  '{
    "grid_rows": 1,
    "grid_cols": 7,
    "show_labels": true,
    "day_labels": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    "completion_icon": "check",
    "colors": {
      "completed": "var(--primary-color)",
      "pending": "var(--background-color)",
      "border": "var(--accent-color)"
    }
  }'::jsonb,
  TRUE
) ON CONFLICT DO NOTHING;

-- Practice Grid (30 days for instrument/skill practice)
INSERT INTO tracker_templates (
  name,
  description,
  tracker_type,
  visual_style,
  config,
  is_system_template
) VALUES (
  '30-Day Practice Tracker',
  'Monthly practice tracker for instruments, sports, or skills',
  'grid',
  'modern',
  '{
    "grid_rows": 5,
    "grid_cols": 6,
    "show_labels": false,
    "numbered_cells": true,
    "completion_icon": "check",
    "colors": {
      "completed": "var(--primary-color)",
      "pending": "var(--background-color)",
      "border": "var(--accent-color)"
    }
  }'::jsonb,
  TRUE
) ON CONFLICT DO NOTHING;

-- ========================================
-- CIRCLE TRACKER TEMPLATES
-- ========================================

-- Habit Circle (12 segments for monthly overview)
INSERT INTO tracker_templates (
  name,
  description,
  tracker_type,
  visual_style,
  config,
  is_system_template
) VALUES (
  'Monthly Habit Circle',
  '12-segment circle for tracking monthly habits',
  'circle',
  'artistic',
  '{
    "segments": 12,
    "segment_labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "center_text": "Habits",
    "show_percentage": true,
    "colors": {
      "completed": "var(--primary-color)",
      "pending": "var(--background-color)",
      "border": "var(--accent-color)",
      "text": "var(--text-color)"
    }
  }'::jsonb,
  TRUE
) ON CONFLICT DO NOTHING;

-- Weekly Goal Circle (7 segments)
INSERT INTO tracker_templates (
  name,
  description,
  tracker_type,
  visual_style,
  config,
  is_system_template
) VALUES (
  'Weekly Goal Circle',
  '7-segment circle for daily goal tracking',
  'circle',
  'modern',
  '{
    "segments": 7,
    "segment_labels": ["S", "M", "T", "W", "T", "F", "S"],
    "center_text": "Weekly Goals",
    "show_percentage": true,
    "colors": {
      "completed": "var(--secondary-color)",
      "pending": "var(--background-color)",
      "border": "var(--accent-color)",
      "text": "var(--text-color)"
    }
  }'::jsonb,
  TRUE
) ON CONFLICT DO NOTHING;

-- Virtues Circle (8 segments for character development)
INSERT INTO tracker_templates (
  name,
  description,
  tracker_type,
  visual_style,
  config,
  is_system_template
) VALUES (
  'Virtues Circle Tracker',
  'Track practice of 8 key virtues',
  'circle',
  'professional',
  '{
    "segments": 8,
    "segment_labels": ["Kindness", "Honesty", "Patience", "Courage", "Service", "Gratitude", "Respect", "Faith"],
    "center_text": "Virtues",
    "show_percentage": true,
    "colors": {
      "completed": "var(--primary-color)",
      "pending": "var(--background-color)",
      "border": "var(--accent-color)",
      "text": "var(--text-color)"
    }
  }'::jsonb,
  TRUE
) ON CONFLICT DO NOTHING;

-- ========================================
-- STREAK TRACKER TEMPLATES
-- ========================================

-- Daily Streak (Simple consecutive day tracker)
INSERT INTO tracker_templates (
  name,
  description,
  tracker_type,
  visual_style,
  config,
  is_system_template
) VALUES (
  'Daily Streak Tracker',
  'Track consecutive days of habit completion',
  'streak',
  'modern',
  '{
    "goal_days": 30,
    "show_flame_icon": true,
    "show_best_streak": true,
    "celebration_milestones": [7, 14, 21, 30, 50, 100],
    "colors": {
      "active_streak": "var(--secondary-color)",
      "milestone": "var(--primary-color)",
      "background": "var(--background-color)",
      "text": "var(--text-color)"
    }
  }'::jsonb,
  TRUE
) ON CONFLICT DO NOTHING;

-- Reading Streak
INSERT INTO tracker_templates (
  name,
  description,
  tracker_type,
  visual_style,
  config,
  is_system_template
) VALUES (
  'Reading Streak Tracker',
  'Track consecutive days of reading',
  'streak',
  'kid-friendly',
  '{
    "goal_days": 100,
    "show_flame_icon": true,
    "show_best_streak": true,
    "celebration_milestones": [7, 14, 30, 60, 100],
    "milestone_rewards": {
      "7": "Bronze Reader",
      "14": "Silver Reader",
      "30": "Gold Reader",
      "60": "Platinum Reader",
      "100": "Reading Champion"
    },
    "colors": {
      "active_streak": "var(--secondary-color)",
      "milestone": "var(--primary-color)",
      "background": "var(--background-color)",
      "text": "var(--text-color)"
    }
  }'::jsonb,
  TRUE
) ON CONFLICT DO NOTHING;

-- Prayer Streak
INSERT INTO tracker_templates (
  name,
  description,
  tracker_type,
  visual_style,
  config,
  is_system_template
) VALUES (
  'Daily Prayer Streak',
  'Track consecutive days of personal or family prayer',
  'streak',
  'professional',
  '{
    "goal_days": 365,
    "show_flame_icon": true,
    "show_best_streak": true,
    "celebration_milestones": [7, 14, 30, 60, 90, 180, 365],
    "colors": {
      "active_streak": "var(--primary-color)",
      "milestone": "var(--secondary-color)",
      "background": "var(--background-color)",
      "text": "var(--text-color)"
    }
  }'::jsonb,
  TRUE
) ON CONFLICT DO NOTHING;

-- Exercise Streak
INSERT INTO tracker_templates (
  name,
  description,
  tracker_type,
  visual_style,
  config,
  is_system_template
) VALUES (
  'Exercise Streak Tracker',
  'Track consecutive days of physical activity',
  'streak',
  'modern',
  '{
    "goal_days": 50,
    "show_flame_icon": true,
    "show_best_streak": true,
    "celebration_milestones": [7, 14, 21, 30, 50],
    "milestone_rewards": {
      "7": "Getting Started",
      "14": "Building Momentum",
      "21": "Habit Formed",
      "30": "Strong & Steady",
      "50": "Fitness Champion"
    },
    "colors": {
      "active_streak": "var(--secondary-color)",
      "milestone": "var(--primary-color)",
      "background": "var(--background-color)",
      "text": "var(--text-color)"
    }
  }'::jsonb,
  TRUE
) ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICATION
-- ========================================
-- Verify templates were created

DO $$
DECLARE
  v_template_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_template_count FROM tracker_templates WHERE is_system_template = TRUE;
  RAISE NOTICE 'Successfully seeded % system tracker templates', v_template_count;
END $$;

-- ========================================
-- SEED COMPLETE
-- ========================================
-- Basic tracker templates seeded successfully
-- Templates include: Grid (4), Circle (3), Streak (4)
-- Total: 11 system templates ready for customization
