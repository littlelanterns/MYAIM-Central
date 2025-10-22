-- ========================================
-- PLAY MODE DASHBOARD MIGRATION
-- ========================================
-- Adds support for Play Mode dashboard configurations
-- and gamification systems for young children
-- Date: 2025-10-21
-- ========================================

-- ========================================
-- PART 1: GAMIFICATION PROGRESS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS gamification_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,

  -- Gamification theme
  theme VARCHAR(50) NOT NULL DEFAULT 'flower-garden',
  -- Options: 'flower-garden', 'pet-collection', 'ocean-aquarium', 'dragon-academy'

  -- Progress tracking
  level INTEGER NOT NULL DEFAULT 1,
  points INTEGER NOT NULL DEFAULT 0,
  points_to_next_level INTEGER NOT NULL DEFAULT 100,

  -- Collected items (JSON array of item IDs)
  items JSONB DEFAULT '[]'::jsonb,

  -- Earned achievements (JSON array of achievement names)
  achievements JSONB DEFAULT '[]'::jsonb,

  -- Current streak
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_theme CHECK (theme IN ('flower-garden', 'pet-collection', 'ocean-aquarium', 'dragon-academy')),
  CONSTRAINT valid_level CHECK (level >= 1),
  CONSTRAINT valid_points CHECK (points >= 0),
  CONSTRAINT unique_member_gamification UNIQUE (family_member_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gamification_member ON gamification_progress(family_member_id);
CREATE INDEX IF NOT EXISTS idx_gamification_theme ON gamification_progress(theme);

-- ========================================
-- PART 2: PLAY MODE ACTIVITIES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS play_mode_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,

  -- Activity details
  title VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) DEFAULT '✨',
  image_url TEXT,

  -- Time of day
  time_of_day VARCHAR(20) NOT NULL,
  -- Options: 'morning', 'afternoon', 'evening', 'bedtime'

  -- Recurrence
  is_recurring BOOLEAN DEFAULT true,
  recurrence_pattern VARCHAR(50) DEFAULT 'daily',
  -- Options: 'daily', 'weekdays', 'weekends', 'custom'

  -- Points
  points INTEGER DEFAULT 5,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_time_of_day CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'bedtime')),
  CONSTRAINT valid_points CHECK (points >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activities_member ON play_mode_activities(family_member_id);
CREATE INDEX IF NOT EXISTS idx_activities_time ON play_mode_activities(time_of_day);
CREATE INDEX IF NOT EXISTS idx_activities_active ON play_mode_activities(is_active);

-- ========================================
-- PART 3: DAILY ACTIVITY COMPLETIONS
-- ========================================

CREATE TABLE IF NOT EXISTS daily_activity_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES play_mode_activities(id) ON DELETE CASCADE,

  -- Completion details
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Points earned
  points_earned INTEGER DEFAULT 0,

  -- Celebration triggered
  celebration_triggered BOOLEAN DEFAULT false,

  -- Unique constraint: one completion per activity per day
  CONSTRAINT unique_daily_completion UNIQUE (family_member_id, activity_id, completion_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_completions_member_date ON daily_activity_completions(family_member_id, completion_date);
CREATE INDEX IF NOT EXISTS idx_completions_activity ON daily_activity_completions(activity_id);

-- ========================================
-- PART 4: PLAY MODE DASHBOARD CONFIGS
-- ========================================

-- Add Play Mode specific columns to existing dashboard_configs table
DO $$
BEGIN
  -- Check if columns don't exist before adding
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dashboard_configs' AND column_name = 'gamification_system') THEN
    ALTER TABLE dashboard_configs ADD COLUMN gamification_system VARCHAR(50) DEFAULT 'flower-garden';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dashboard_configs' AND column_name = 'selected_theme') THEN
    ALTER TABLE dashboard_configs ADD COLUMN selected_theme VARCHAR(50) DEFAULT 'brightSunshine';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dashboard_configs' AND column_name = 'widget_layout') THEN
    ALTER TABLE dashboard_configs ADD COLUMN widget_layout VARCHAR(20) DEFAULT 'full';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dashboard_configs' AND column_name = 'victory_settings') THEN
    ALTER TABLE dashboard_configs ADD COLUMN victory_settings JSONB DEFAULT '{"voicePreference": "fun-friend", "autoPlayCelebration": true, "celebrationTime": "bedtime"}'::jsonb;
  END IF;
END $$;

-- ========================================
-- PART 5: ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE gamification_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_mode_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity_completions ENABLE ROW LEVEL SECURITY;

-- Gamification Progress Policies
DROP POLICY IF EXISTS "Users can view their family gamification progress" ON gamification_progress;
CREATE POLICY "Users can view their family gamification progress"
ON gamification_progress FOR SELECT
TO authenticated
USING (
  family_member_id IN (
    SELECT id FROM family_members WHERE family_id IN (
      SELECT family_id FROM family_members WHERE auth_user_id::text = auth.uid()::text
    )
  )
);

DROP POLICY IF EXISTS "Users can update their family gamification progress" ON gamification_progress;
CREATE POLICY "Users can update their family gamification progress"
ON gamification_progress FOR UPDATE
TO authenticated
USING (
  family_member_id IN (
    SELECT id FROM family_members WHERE family_id IN (
      SELECT family_id FROM family_members WHERE auth_user_id::text = auth.uid()::text
    )
  )
);

DROP POLICY IF EXISTS "Users can insert gamification progress for family members" ON gamification_progress;
CREATE POLICY "Users can insert gamification progress for family members"
ON gamification_progress FOR INSERT
TO authenticated
WITH CHECK (
  family_member_id IN (
    SELECT id FROM family_members WHERE family_id IN (
      SELECT family_id FROM family_members WHERE auth_user_id::text = auth.uid()::text
    )
  )
);

-- Play Mode Activities Policies
DROP POLICY IF EXISTS "Users can view their family play mode activities" ON play_mode_activities;
CREATE POLICY "Users can view their family play mode activities"
ON play_mode_activities FOR SELECT
TO authenticated
USING (
  family_member_id IN (
    SELECT id FROM family_members WHERE family_id IN (
      SELECT family_id FROM family_members WHERE auth_user_id::text = auth.uid()::text
    )
  )
);

DROP POLICY IF EXISTS "Users can manage play mode activities" ON play_mode_activities;
CREATE POLICY "Users can manage play mode activities"
ON play_mode_activities FOR ALL
TO authenticated
USING (
  family_member_id IN (
    SELECT id FROM family_members WHERE family_id IN (
      SELECT family_id FROM family_members WHERE auth_user_id::text = auth.uid()::text
    )
  )
);

-- Daily Completions Policies
DROP POLICY IF EXISTS "Users can view family activity completions" ON daily_activity_completions;
CREATE POLICY "Users can view family activity completions"
ON daily_activity_completions FOR SELECT
TO authenticated
USING (
  family_member_id IN (
    SELECT id FROM family_members WHERE family_id IN (
      SELECT family_id FROM family_members WHERE auth_user_id::text = auth.uid()::text
    )
  )
);

DROP POLICY IF EXISTS "Users can manage activity completions" ON daily_activity_completions;
CREATE POLICY "Users can manage activity completions"
ON daily_activity_completions FOR ALL
TO authenticated
USING (
  family_member_id IN (
    SELECT id FROM family_members WHERE family_id IN (
      SELECT family_id FROM family_members WHERE auth_user_id::text = auth.uid()::text
    )
  )
);

-- ========================================
-- PART 6: HELPER FUNCTIONS
-- ========================================

-- Function to update gamification progress
CREATE OR REPLACE FUNCTION update_gamification_progress(
  p_family_member_id UUID,
  p_points_earned INTEGER
)
RETURNS void AS $$
DECLARE
  v_current_points INTEGER;
  v_current_level INTEGER;
  v_points_to_next INTEGER;
  v_new_points INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get current progress
  SELECT points, level, points_to_next_level
  INTO v_current_points, v_current_level, v_points_to_next
  FROM gamification_progress
  WHERE family_member_id = p_family_member_id;

  -- Calculate new points
  v_new_points := v_current_points + p_points_earned;
  v_new_level := v_current_level;

  -- Check for level up
  WHILE v_new_points >= v_points_to_next LOOP
    v_new_points := v_new_points - v_points_to_next;
    v_new_level := v_new_level + 1;
    v_points_to_next := v_points_to_next + 50; -- Increase requirement by 50 each level
  END LOOP;

  -- Update progress
  UPDATE gamification_progress
  SET
    points = v_new_points,
    level = v_new_level,
    points_to_next_level = v_points_to_next,
    updated_at = NOW()
  WHERE family_member_id = p_family_member_id;
END;
$$ LANGUAGE plpgsql;

-- Function to complete an activity
CREATE OR REPLACE FUNCTION complete_play_mode_activity(
  p_family_member_id UUID,
  p_activity_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_points INTEGER;
BEGIN
  -- Get activity points
  SELECT points INTO v_points
  FROM play_mode_activities
  WHERE id = p_activity_id;

  -- Record completion
  INSERT INTO daily_activity_completions (
    family_member_id,
    activity_id,
    points_earned
  )
  VALUES (
    p_family_member_id,
    p_activity_id,
    v_points
  )
  ON CONFLICT (family_member_id, activity_id, completion_date)
  DO NOTHING;

  -- Update gamification progress
  PERFORM update_gamification_progress(p_family_member_id, v_points);

  RETURN v_points;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PART 7: INITIAL DATA SETUP
-- ========================================

-- This function initializes Play Mode for a family member
CREATE OR REPLACE FUNCTION initialize_play_mode(
  p_family_member_id UUID,
  p_theme VARCHAR(50) DEFAULT 'flower-garden',
  p_selected_theme VARCHAR(50) DEFAULT 'brightSunshine'
)
RETURNS void AS $$
BEGIN
  -- Create gamification progress entry
  INSERT INTO gamification_progress (
    family_member_id,
    theme,
    level,
    points,
    points_to_next_level
  )
  VALUES (
    p_family_member_id,
    p_theme,
    1,
    0,
    100
  )
  ON CONFLICT (family_member_id) DO NOTHING;

  -- Create or update dashboard config
  INSERT INTO dashboard_configs (
    family_member_id,
    dashboard_mode,
    gamification_system,
    selected_theme,
    widget_layout
  )
  VALUES (
    p_family_member_id,
    'play',
    p_theme,
    p_selected_theme,
    'full'
  )
  ON CONFLICT (family_member_id, dashboard_mode)
  DO UPDATE SET
    gamification_system = p_theme,
    selected_theme = p_selected_theme,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PART 8: TRIGGERS
-- ========================================

-- Update timestamp trigger for gamification_progress
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_gamification_progress_timestamp ON gamification_progress;
CREATE TRIGGER update_gamification_progress_timestamp
BEFORE UPDATE ON gamification_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_play_activities_timestamp ON play_mode_activities;
CREATE TRIGGER update_play_activities_timestamp
BEFORE UPDATE ON play_mode_activities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE 'Play Mode Dashboard migration completed successfully!';
  RAISE NOTICE 'Tables created: gamification_progress, play_mode_activities, daily_activity_completions';
  RAISE NOTICE 'Functions created: update_gamification_progress, complete_play_mode_activity, initialize_play_mode';
END $$;
