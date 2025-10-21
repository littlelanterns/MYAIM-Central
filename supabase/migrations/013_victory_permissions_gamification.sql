-- ========================================
-- MILESTONE 2: Victory Recorder, Permissions, and Gamification
-- ========================================
-- Creates tables for:
-- - Victory Recorder system with AI celebrations
-- - Granular permission system
-- - Gamification (points, badges, rewards, streaks)
-- Date: 2025-01-XX
-- ========================================

-- ========================================
-- VICTORY RECORDER TABLES
-- ========================================

-- Victories table
-- Stores all recorded accomplishments
CREATE TABLE IF NOT EXISTS victories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category VARCHAR(50),
  celebration_message TEXT, -- AI-generated celebration text
  voice_url TEXT, -- URL to AI-generated voice celebration
  tags TEXT[], -- Array of tags for categorization
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Victory celebrations metadata
-- Tracks celebration generation and playback
CREATE TABLE IF NOT EXISTS victory_celebrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  victory_id UUID NOT NULL REFERENCES victories(id) ON DELETE CASCADE,
  celebration_text TEXT NOT NULL,
  voice_provider VARCHAR(50), -- 'elevenlabs', 'openai', etc.
  voice_id VARCHAR(100),
  playback_count INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- PERMISSIONS TABLES
-- ========================================

-- Permission rules
-- Defines granular permissions for family members
CREATE TABLE IF NOT EXISTS permission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  granted_by_id UUID NOT NULL REFERENCES family_members(id),
  category VARCHAR(50) NOT NULL CHECK (category IN ('calendar', 'tasks', 'victories', 'archives', 'best_intentions', 'widgets')),
  permission_level VARCHAR(20) NOT NULL CHECK (permission_level IN ('none', 'view', 'edit', 'full')),
  specific_items TEXT[], -- Optional: specific item IDs this applies to
  expires_at TIMESTAMPTZ, -- Optional: when this permission expires
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure no duplicate rules for same member/category
  UNIQUE(family_member_id, category)
);

-- ========================================
-- GAMIFICATION TABLES
-- ========================================

-- Points balance
-- Tracks current and historical point totals
CREATE TABLE IF NOT EXISTS points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
  weekly_points INTEGER DEFAULT 0 CHECK (weekly_points >= 0),
  monthly_points INTEGER DEFAULT 0 CHECK (monthly_points >= 0),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points transactions
-- Records all point earning and spending
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  points INTEGER NOT NULL, -- positive for earning, negative for spending
  reason TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('task_completion', 'victory_recorded', 'streak_bonus', 'helping_others', 'reward_redeemed', 'bonus', 'other')),
  related_victory_id UUID REFERENCES victories(id) ON DELETE SET NULL,
  related_task_id UUID, -- Would reference tasks table when created
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges
-- Defines all available badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL, -- emoji or icon identifier
  category VARCHAR(50) NOT NULL CHECK (category IN ('tasks', 'victories', 'streaks', 'helping', 'learning', 'special')),
  criteria TEXT NOT NULL, -- Description of how to earn
  points_value INTEGER DEFAULT 0,
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(name)
);

-- Earned badges
-- Tracks which badges each family member has earned
CREATE TABLE IF NOT EXISTS earned_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_new BOOLEAN DEFAULT true, -- For showing "NEW!" indicator

  -- Each badge can only be earned once per member
  UNIQUE(family_member_id, badge_id)
);

-- Rewards
-- Defines available rewards that can be redeemed
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL, -- emoji or icon identifier
  points_cost INTEGER NOT NULL CHECK (points_cost > 0),
  category VARCHAR(50) NOT NULL CHECK (category IN ('screen_time', 'treats', 'activities', 'privileges', 'purchases', 'custom')),
  requires_approval BOOLEAN DEFAULT true,
  created_by_id UUID NOT NULL REFERENCES family_members(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reward redemptions
-- Tracks reward redemption requests and status
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id),
  points_spent INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'fulfilled')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by_id UUID REFERENCES family_members(id),
  fulfilled_at TIMESTAMPTZ,
  denial_reason TEXT
);

-- Streaks
-- Tracks consecutive day streaks for various activities
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  streak_type VARCHAR(50) NOT NULL CHECK (streak_type IN ('daily_victories', 'task_completion', 'best_intentions', 'helping_others')),
  current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each member can only have one streak per type
  UNIQUE(family_member_id, streak_type)
);

-- ========================================
-- INDEXES for performance
-- ========================================

-- Victories indexes
CREATE INDEX IF NOT EXISTS idx_victories_family_member ON victories(family_member_id);
CREATE INDEX IF NOT EXISTS idx_victories_created_at ON victories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_victory_celebrations_victory ON victory_celebrations(victory_id);

-- Permissions indexes
CREATE INDEX IF NOT EXISTS idx_permission_rules_family_member ON permission_rules(family_member_id);
CREATE INDEX IF NOT EXISTS idx_permission_rules_category ON permission_rules(category);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_points_family_member ON points(family_member_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_family_member ON points_transactions(family_member_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_earned_badges_family_member ON earned_badges(family_member_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_family_member ON reward_redemptions(family_member_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON reward_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_streaks_family_member ON streaks(family_member_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE victories ENABLE ROW LEVEL SECURITY;
ALTER TABLE victory_celebrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE earned_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Victories policies
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

-- Victory celebrations follow victory permissions
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

-- Permission rules policies
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

-- Points policies - members can view own, parents can view all
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

-- Points transactions policies
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

-- Badges are publicly viewable within family
CREATE POLICY "Family can view badges"
  ON badges FOR SELECT
  USING (true);

-- Earned badges policies
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

-- Rewards policies
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

-- Reward redemptions policies
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

-- Streaks policies
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

-- ========================================
-- TRIGGERS for updated_at timestamps
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Victory triggers
DROP TRIGGER IF EXISTS victories_updated_at ON victories;
CREATE TRIGGER victories_updated_at
  BEFORE UPDATE ON victories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Permission rules triggers
DROP TRIGGER IF EXISTS permission_rules_updated_at ON permission_rules;
CREATE TRIGGER permission_rules_updated_at
  BEFORE UPDATE ON permission_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Rewards triggers
DROP TRIGGER IF EXISTS rewards_updated_at ON rewards;
CREATE TRIGGER rewards_updated_at
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Streaks triggers
DROP TRIGGER IF EXISTS streaks_updated_at ON streaks;
CREATE TRIGGER streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SEED DATA - Default Badges
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
-- COMMENTS for documentation
-- ========================================

COMMENT ON TABLE victories IS 'Stores all recorded accomplishments with AI-generated celebrations';
COMMENT ON TABLE victory_celebrations IS 'Tracks AI-generated celebration messages and voice playback';
COMMENT ON TABLE permission_rules IS 'Defines granular permissions for family members';
COMMENT ON TABLE points IS 'Tracks point balances for each family member';
COMMENT ON TABLE points_transactions IS 'Records all point earning and spending transactions';
COMMENT ON TABLE badges IS 'Defines all available badges that can be earned';
COMMENT ON TABLE earned_badges IS 'Tracks which badges each family member has earned';
COMMENT ON TABLE rewards IS 'Available rewards that can be redeemed with points';
COMMENT ON TABLE reward_redemptions IS 'Tracks reward redemption requests and their status';
COMMENT ON TABLE streaks IS 'Tracks consecutive day streaks for various activities';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Milestone 2 migration completed successfully';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - victories, victory_celebrations';
  RAISE NOTICE '  - permission_rules';
  RAISE NOTICE '  - points, points_transactions';
  RAISE NOTICE '  - badges, earned_badges';
  RAISE NOTICE '  - rewards, reward_redemptions';
  RAISE NOTICE '  - streaks';
  RAISE NOTICE 'RLS policies enabled for all tables';
  RAISE NOTICE 'Default badges seeded';
  RAISE NOTICE '========================================';
END $$;
