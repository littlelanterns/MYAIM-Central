-- ========================================
-- MASTER CONSOLIDATED MIGRATION
-- ========================================
-- Combines all pending migrations into one file
-- Includes: Storage, Dashboard System, Gamification, Theme Management
-- Date: 2025-10-21
-- Safe to run: Uses IF NOT EXISTS and ON CONFLICT for idempotency
-- ========================================

-- ========================================
-- PART 1: ARCHIVE COVERS STORAGE
-- ========================================

-- Create the archive-covers bucket for folder cover photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('archive-covers', 'archive-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload cover photos for their family folders" ON storage.objects;
DROP POLICY IF EXISTS "Users can view cover photos for their family folders" ON storage.objects;
DROP POLICY IF EXISTS "Users can update cover photos for their family folders" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete cover photos for their family folders" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view archive cover photos" ON storage.objects;

-- Create storage policies for archive covers
CREATE POLICY "Users can upload cover photos for their family folders"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'archive-covers'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view archive cover photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'archive-covers');

CREATE POLICY "Users can update cover photos for their family folders"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'archive-covers'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete cover photos for their family folders"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'archive-covers'
  AND auth.uid() IS NOT NULL
);

-- ========================================
-- PART 2: FAMILY MEMBERS ENHANCEMENTS
-- ========================================

-- Add theme_preference column for global theme selection
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'family_members' AND column_name = 'theme_preference'
  ) THEN
    ALTER TABLE family_members ADD COLUMN theme_preference VARCHAR(50) DEFAULT 'classic';
  END IF;
END $$;

-- Add dashboard_mode column for dashboard type assignment
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'family_members' AND column_name = 'dashboard_mode'
  ) THEN
    ALTER TABLE family_members ADD COLUMN dashboard_mode VARCHAR(20) DEFAULT 'independent';
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_family_members_theme_preference
  ON family_members(theme_preference);

CREATE INDEX IF NOT EXISTS idx_family_members_dashboard_mode
  ON family_members(dashboard_mode);

-- Add comments
COMMENT ON COLUMN family_members.theme_preference IS
  'User selected theme: classic, forest, ocean, sunset, lavender, etc. Persisted across sessions.';

COMMENT ON COLUMN family_members.dashboard_mode IS
  'Dashboard type assigned to this family member: play (gamified for young kids), guided (structured for teens), or independent (full control for adults). Defaults to independent.';

-- ========================================
-- PART 3: DASHBOARD SYSTEM
-- ========================================

-- Dashboard configurations table
CREATE TABLE IF NOT EXISTS dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  dashboard_type VARCHAR(20) NOT NULL,
  dashboard_mode VARCHAR(20),
  widgets JSONB DEFAULT '[]'::jsonb,
  layout JSONB DEFAULT '{
    "columns": 12,
    "rows": 12,
    "gap": 16,
    "responsive": true
  }'::jsonb,
  is_personal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_member_id, dashboard_type)
);

-- Widget permissions table
CREATE TABLE IF NOT EXISTS widget_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_config_id UUID NOT NULL REFERENCES dashboard_configs(id) ON DELETE CASCADE,
  widget_id VARCHAR(50) NOT NULL,
  visible_to VARCHAR(20) NOT NULL DEFAULT 'owner',
  editable_by VARCHAR(20) NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dashboard_config_id, widget_id)
);

-- Dashboard indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_family_member ON dashboard_configs(family_member_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_type ON dashboard_configs(dashboard_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_personal ON dashboard_configs(is_personal) WHERE is_personal = true;
CREATE INDEX IF NOT EXISTS idx_widget_permissions_dashboard ON widget_permissions(dashboard_config_id);

-- Enable RLS on dashboard tables
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing dashboard policies
DROP POLICY IF EXISTS "Users can view own dashboards" ON dashboard_configs;
DROP POLICY IF EXISTS "Users can create own dashboards" ON dashboard_configs;
DROP POLICY IF EXISTS "Users can update allowed dashboards" ON dashboard_configs;
DROP POLICY IF EXISTS "Users can delete own dashboards" ON dashboard_configs;
DROP POLICY IF EXISTS "Widget permissions follow dashboard access" ON widget_permissions;

-- Dashboard RLS policies
CREATE POLICY "Users can view own dashboards"
  ON dashboard_configs FOR SELECT
  USING (
    family_member_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_members fm1, family_members fm2
      WHERE fm1.id = auth.uid()
        AND fm2.id = dashboard_configs.family_member_id
        AND fm1.family_id = fm2.family_id
        AND fm1.role IN ('primary_organizer', 'parent')
    )
  );

CREATE POLICY "Users can create own dashboards"
  ON dashboard_configs FOR INSERT
  WITH CHECK (family_member_id = auth.uid());

CREATE POLICY "Users can update allowed dashboards"
  ON dashboard_configs FOR UPDATE
  USING (
    family_member_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_members fm1, family_members fm2
      WHERE fm1.id = auth.uid()
        AND fm2.id = dashboard_configs.family_member_id
        AND fm1.family_id = fm2.family_id
        AND fm1.role IN ('primary_organizer', 'parent')
        AND fm2.role IN ('child', 'teen')
    )
  );

CREATE POLICY "Users can delete own dashboards"
  ON dashboard_configs FOR DELETE
  USING (family_member_id = auth.uid());

CREATE POLICY "Widget permissions follow dashboard access"
  ON widget_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM dashboard_configs dc
      WHERE dc.id = widget_permissions.dashboard_config_id
        AND (
          dc.family_member_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM family_members fm1, family_members fm2
            WHERE fm1.id = auth.uid()
              AND fm2.id = dc.family_member_id
              AND fm1.family_id = fm2.family_id
              AND fm1.role IN ('primary_organizer', 'parent')
          )
        )
    )
  );

-- Dashboard updated_at trigger
CREATE OR REPLACE FUNCTION update_dashboard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dashboard_configs_updated_at ON dashboard_configs;
CREATE TRIGGER dashboard_configs_updated_at
  BEFORE UPDATE ON dashboard_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_updated_at();

-- ========================================
-- PART 4: VICTORY RECORDER SYSTEM
-- ========================================

-- Victories table
CREATE TABLE IF NOT EXISTS victories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category VARCHAR(50),
  celebration_message TEXT,
  voice_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Victory celebrations metadata
CREATE TABLE IF NOT EXISTS victory_celebrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  victory_id UUID NOT NULL REFERENCES victories(id) ON DELETE CASCADE,
  celebration_text TEXT NOT NULL,
  voice_provider VARCHAR(50),
  voice_id VARCHAR(100),
  playback_count INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Victory indexes
CREATE INDEX IF NOT EXISTS idx_victories_family_member ON victories(family_member_id);
CREATE INDEX IF NOT EXISTS idx_victories_created_at ON victories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_victory_celebrations_victory ON victory_celebrations(victory_id);

-- Enable RLS
ALTER TABLE victories ENABLE ROW LEVEL SECURITY;
ALTER TABLE victory_celebrations ENABLE ROW LEVEL SECURITY;

-- Drop existing victory policies
DROP POLICY IF EXISTS "Members can view own and family victories" ON victories;
DROP POLICY IF EXISTS "Members can create own victories" ON victories;
DROP POLICY IF EXISTS "Members can update own victories" ON victories;
DROP POLICY IF EXISTS "Members can delete own victories" ON victories;
DROP POLICY IF EXISTS "Celebrations follow victory access" ON victory_celebrations;

-- Victory RLS policies
CREATE POLICY "Members can view own and family victories"
  ON victories FOR SELECT
  USING (
    family_member_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_members fm1, family_members fm2
      WHERE fm1.id = auth.uid()
        AND fm2.id = victories.family_member_id
        AND fm1.family_id = fm2.family_id
    )
  );

CREATE POLICY "Members can create own victories"
  ON victories FOR INSERT
  WITH CHECK (family_member_id = auth.uid());

CREATE POLICY "Members can update own victories"
  ON victories FOR UPDATE
  USING (family_member_id = auth.uid());

CREATE POLICY "Members can delete own victories"
  ON victories FOR DELETE
  USING (family_member_id = auth.uid());

CREATE POLICY "Celebrations follow victory access"
  ON victory_celebrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM victories v
      WHERE v.id = victory_celebrations.victory_id
        AND (
          v.family_member_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM family_members fm1, family_members fm2
            WHERE fm1.id = auth.uid()
              AND fm2.id = v.family_member_id
              AND fm1.family_id = fm2.family_id
          )
        )
    )
  );

-- Victory updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS victories_updated_at ON victories;
CREATE TRIGGER victories_updated_at
  BEFORE UPDATE ON victories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PART 5: PERMISSIONS SYSTEM
-- ========================================

-- Permission rules table
CREATE TABLE IF NOT EXISTS permission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  granted_by_id UUID NOT NULL REFERENCES family_members(id),
  category VARCHAR(50) NOT NULL,
  permission_level VARCHAR(20) NOT NULL,
  specific_items TEXT[],
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_member_id, category)
);

-- Permission indexes
CREATE INDEX IF NOT EXISTS idx_permission_rules_family_member ON permission_rules(family_member_id);
CREATE INDEX IF NOT EXISTS idx_permission_rules_category ON permission_rules(category);

-- Enable RLS
ALTER TABLE permission_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing permission policies
DROP POLICY IF EXISTS "Members can view own permissions" ON permission_rules;
DROP POLICY IF EXISTS "Organizers can manage permissions" ON permission_rules;

-- Permission RLS policies
CREATE POLICY "Members can view own permissions"
  ON permission_rules FOR SELECT
  USING (family_member_id = auth.uid());

CREATE POLICY "Organizers can manage permissions"
  ON permission_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = auth.uid()
        AND fm.role IN ('primary_organizer', 'parent')
        AND fm.family_id = (
          SELECT family_id FROM family_members WHERE id = permission_rules.family_member_id
        )
    )
  );

-- Permission updated_at trigger
DROP TRIGGER IF EXISTS permission_rules_updated_at ON permission_rules;
CREATE TRIGGER permission_rules_updated_at
  BEFORE UPDATE ON permission_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PART 6: GAMIFICATION SYSTEM
-- ========================================

-- Points balance table
CREATE TABLE IF NOT EXISTS points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL UNIQUE REFERENCES family_members(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  related_victory_id UUID REFERENCES victories(id) ON DELETE SET NULL,
  related_task_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  category VARCHAR(50) NOT NULL,
  criteria TEXT NOT NULL,
  points_value INTEGER DEFAULT 0,
  rarity VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Earned badges table
CREATE TABLE IF NOT EXISTS earned_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_new BOOLEAN DEFAULT true,
  UNIQUE(family_member_id, badge_id)
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  points_cost INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  requires_approval BOOLEAN DEFAULT true,
  created_by_id UUID NOT NULL REFERENCES family_members(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reward redemptions table
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id),
  points_spent INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by_id UUID REFERENCES family_members(id),
  fulfilled_at TIMESTAMPTZ,
  denial_reason TEXT
);

-- Streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  streak_type VARCHAR(50) NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_member_id, streak_type)
);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_points_family_member ON points(family_member_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_family_member ON points_transactions(family_member_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_earned_badges_family_member ON earned_badges(family_member_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_family_member ON reward_redemptions(family_member_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON reward_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_streaks_family_member ON streaks(family_member_id);

-- Enable RLS
ALTER TABLE points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE earned_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Drop existing gamification policies
DROP POLICY IF EXISTS "Members can view own points" ON points;
DROP POLICY IF EXISTS "Members can view own transactions" ON points_transactions;
DROP POLICY IF EXISTS "Family can view badges" ON badges;
DROP POLICY IF EXISTS "Members can view family earned badges" ON earned_badges;
DROP POLICY IF EXISTS "Family can view active rewards" ON rewards;
DROP POLICY IF EXISTS "Organizers can manage rewards" ON rewards;
DROP POLICY IF EXISTS "Members can view own redemptions" ON reward_redemptions;
DROP POLICY IF EXISTS "Members can create own redemptions" ON reward_redemptions;
DROP POLICY IF EXISTS "Members can view own and family streaks" ON streaks;

-- Gamification RLS policies
CREATE POLICY "Members can view own points"
  ON points FOR SELECT
  USING (
    family_member_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_members fm1, family_members fm2
      WHERE fm1.id = auth.uid()
        AND fm2.id = points.family_member_id
        AND fm1.family_id = fm2.family_id
        AND fm1.role IN ('primary_organizer', 'parent')
    )
  );

CREATE POLICY "Members can view own transactions"
  ON points_transactions FOR SELECT
  USING (
    family_member_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_members fm1, family_members fm2
      WHERE fm1.id = auth.uid()
        AND fm2.id = points_transactions.family_member_id
        AND fm1.family_id = fm2.family_id
        AND fm1.role IN ('primary_organizer', 'parent')
    )
  );

CREATE POLICY "Family can view badges"
  ON badges FOR SELECT
  USING (true);

CREATE POLICY "Members can view family earned badges"
  ON earned_badges FOR SELECT
  USING (
    family_member_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_members fm1, family_members fm2
      WHERE fm1.id = auth.uid()
        AND fm2.id = earned_badges.family_member_id
        AND fm1.family_id = fm2.family_id
    )
  );

CREATE POLICY "Family can view active rewards"
  ON rewards FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM family_members fm1, family_members fm2
      WHERE fm1.id = auth.uid()
        AND fm2.id = rewards.created_by_id
        AND fm1.family_id = fm2.family_id
    )
  );

CREATE POLICY "Organizers can manage rewards"
  ON rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = auth.uid()
        AND fm.role IN ('primary_organizer', 'parent')
    )
  );

CREATE POLICY "Members can view own redemptions"
  ON reward_redemptions FOR SELECT
  USING (
    family_member_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = auth.uid()
        AND fm.role IN ('primary_organizer', 'parent')
        AND fm.family_id = (
          SELECT family_id FROM family_members WHERE id = reward_redemptions.family_member_id
        )
    )
  );

CREATE POLICY "Members can create own redemptions"
  ON reward_redemptions FOR INSERT
  WITH CHECK (family_member_id = auth.uid());

CREATE POLICY "Members can view own and family streaks"
  ON streaks FOR SELECT
  USING (
    family_member_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM family_members fm1, family_members fm2
      WHERE fm1.id = auth.uid()
        AND fm2.id = streaks.family_member_id
        AND fm1.family_id = fm2.family_id
    )
  );

-- Gamification updated_at triggers
DROP TRIGGER IF EXISTS rewards_updated_at ON rewards;
CREATE TRIGGER rewards_updated_at
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS streaks_updated_at ON streaks;
CREATE TRIGGER streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PART 7: SEED DEFAULT BADGES
-- ========================================

INSERT INTO badges (name, description, icon, category, criteria, points_value, rarity)
VALUES
  ('First Victory', 'Record your first victory', '🏆', 'victories', 'Record 1 victory', 10, 'common'),
  ('Week Warrior', 'Record victories for 7 days straight', '🔥', 'streaks', '7 day victory streak', 50, 'rare'),
  ('Task Master', 'Complete 100 tasks', '✅', 'tasks', 'Complete 100 tasks', 100, 'epic'),
  ('Family Helper', 'Help other family members 10 times', '🤝', 'helping', 'Help others 10 times', 75, 'rare'),
  ('Consistency King', 'Maintain a 30 day streak', '👑', 'streaks', '30 day streak', 200, 'legendary'),
  ('Victory Collector', 'Record 50 victories', '🌟', 'victories', 'Record 50 victories', 100, 'epic')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MASTER CONSOLIDATED MIGRATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Part 1: Archive Covers Storage ✓';
  RAISE NOTICE '  - Storage bucket created';
  RAISE NOTICE '  - RLS policies configured';
  RAISE NOTICE '';
  RAISE NOTICE 'Part 2: Family Members Enhancements ✓';
  RAISE NOTICE '  - theme_preference column added';
  RAISE NOTICE '  - dashboard_mode column added';
  RAISE NOTICE '';
  RAISE NOTICE 'Part 3: Dashboard System ✓';
  RAISE NOTICE '  - dashboard_configs table created';
  RAISE NOTICE '  - widget_permissions table created';
  RAISE NOTICE '  - RLS policies enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'Part 4: Victory Recorder ✓';
  RAISE NOTICE '  - victories table created';
  RAISE NOTICE '  - victory_celebrations table created';
  RAISE NOTICE '';
  RAISE NOTICE 'Part 5: Permissions System ✓';
  RAISE NOTICE '  - permission_rules table created';
  RAISE NOTICE '';
  RAISE NOTICE 'Part 6: Gamification System ✓';
  RAISE NOTICE '  - points tables created';
  RAISE NOTICE '  - badges system created';
  RAISE NOTICE '  - rewards system created';
  RAISE NOTICE '  - streaks tracking created';
  RAISE NOTICE '';
  RAISE NOTICE 'Part 7: Default Badges Seeded ✓';
  RAISE NOTICE '  - 6 default badges added';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All systems ready to go! 🚀';
  RAISE NOTICE '========================================';
END $$;
