-- ========================================
-- BUJO TRACKER WIDGET SYSTEM MIGRATION
-- ========================================
-- Adds support for bullet journal-inspired tracker widgets
-- Includes templates, user instances, entries, coloring gallery, and milestone journal
-- Date: 2025-10-21
-- ========================================

-- ========================================
-- PART 1: TRACKER TEMPLATES TABLE
-- ========================================
-- Reusable tracker templates that mom can customize and assign

CREATE TABLE IF NOT EXISTS tracker_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Template metadata
  name VARCHAR(100) NOT NULL,
  description TEXT,
  tracker_type VARCHAR(50) NOT NULL,
  -- Options: 'grid', 'circle', 'progress', 'streak', 'chart', 'collection', 'gameboard', 'coloring'

  -- Visual styling
  visual_style VARCHAR(50) NOT NULL DEFAULT 'modern',
  -- Options: 'artistic', 'modern', 'kid-friendly', 'professional'

  -- Template configuration (JSON)
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Contains tracker-specific settings like grid_size, circle_segments, goal_value, etc.

  -- Metadata
  is_system_template BOOLEAN DEFAULT FALSE, -- System templates vs user-created
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_tracker_type CHECK (tracker_type IN (
    'grid', 'circle', 'progress', 'streak', 'chart', 'collection', 'gameboard', 'coloring'
  )),
  CONSTRAINT valid_visual_style CHECK (visual_style IN (
    'artistic', 'modern', 'kid-friendly', 'professional'
  ))
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_tracker_templates_type ON tracker_templates(tracker_type);
CREATE INDEX IF NOT EXISTS idx_tracker_templates_created_by ON tracker_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_tracker_templates_system ON tracker_templates(is_system_template);

-- ========================================
-- PART 2: USER TRACKERS TABLE
-- ========================================
-- Tracker instances assigned to specific family members

CREATE TABLE IF NOT EXISTS user_trackers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  template_id UUID REFERENCES tracker_templates(id) ON DELETE SET NULL,

  -- Tracker instance data
  name VARCHAR(100) NOT NULL,
  tracker_type VARCHAR(50) NOT NULL,
  visual_style VARCHAR(50) NOT NULL DEFAULT 'modern',

  -- Configuration (copied from template, can be customized)
  config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Position and visibility
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_pinned BOOLEAN DEFAULT FALSE,

  -- Tracking period
  start_date DATE,
  end_date DATE,

  -- Victory Recorder integration
  auto_log_victories BOOLEAN DEFAULT FALSE,
  victory_points INTEGER DEFAULT 1,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT valid_tracker_type CHECK (tracker_type IN (
    'grid', 'circle', 'progress', 'streak', 'chart', 'collection', 'gameboard', 'coloring'
  )),
  CONSTRAINT valid_visual_style CHECK (visual_style IN (
    'artistic', 'modern', 'kid-friendly', 'professional'
  ))
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_trackers_member ON user_trackers(family_member_id);
CREATE INDEX IF NOT EXISTS idx_user_trackers_template ON user_trackers(template_id);
CREATE INDEX IF NOT EXISTS idx_user_trackers_active ON user_trackers(is_active);
CREATE INDEX IF NOT EXISTS idx_user_trackers_archived ON user_trackers(archived_at);

-- ========================================
-- PART 3: TRACKER ENTRIES TABLE
-- ========================================
-- Individual data entries for tracker completion

CREATE TABLE IF NOT EXISTS tracker_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  user_tracker_id UUID NOT NULL REFERENCES user_trackers(id) ON DELETE CASCADE,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,

  -- Entry data
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Format varies by tracker type:
  --   Grid: { "row": 1, "col": 2, "completed": true }
  --   Circle: { "segment": 3, "completed": true }
  --   Progress: { "current_value": 75, "goal_value": 100 }
  --   Streak: { "day_number": 7, "completed": true }

  -- Optional note/reflection
  note TEXT,

  -- Victory linking (if auto-logged)
  victory_id UUID REFERENCES victories(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_tracker_date UNIQUE (user_tracker_id, entry_date)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_tracker_entries_tracker ON tracker_entries(user_tracker_id);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_member ON tracker_entries(family_member_id);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_date ON tracker_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_victory ON tracker_entries(victory_id);

-- ========================================
-- PART 4: COLORING GALLERY TABLE
-- ========================================
-- Templates and completed coloring pages for coloring book trackers

CREATE TABLE IF NOT EXISTS coloring_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Template info
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  -- Categories: 'animals', 'nature', 'mandalas', 'seasonal', 'religious', 'abstract'

  -- Image data
  template_svg TEXT, -- SVG path for the line art
  complexity_level VARCHAR(20) DEFAULT 'medium',
  -- Options: 'simple', 'medium', 'detailed'

  -- Associated tracker (if used as a tracker reward)
  tracker_template_id UUID REFERENCES tracker_templates(id) ON DELETE SET NULL,

  -- Metadata
  is_system_template BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_complexity CHECK (complexity_level IN ('simple', 'medium', 'detailed'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coloring_gallery_category ON coloring_gallery(category);
CREATE INDEX IF NOT EXISTS idx_coloring_gallery_complexity ON coloring_gallery(complexity_level);
CREATE INDEX IF NOT EXISTS idx_coloring_gallery_system ON coloring_gallery(is_system_template);

-- ========================================
-- PART 5: MILESTONE JOURNAL TABLE
-- ========================================
-- Quick memory capture tied to tracker completions

CREATE TABLE IF NOT EXISTS milestone_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  user_tracker_id UUID REFERENCES user_trackers(id) ON DELETE SET NULL,
  tracker_entry_id UUID REFERENCES tracker_entries(id) ON DELETE SET NULL,

  -- Milestone data
  milestone_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title VARCHAR(200) NOT NULL,
  description TEXT,

  -- Emotional context
  mood VARCHAR(50),
  tags TEXT[], -- Array of tag strings

  -- Media attachments
  photo_urls TEXT[], -- Array of URLs to photos

  -- Sharing and privacy
  is_private BOOLEAN DEFAULT FALSE,
  shared_with_family BOOLEAN DEFAULT TRUE,

  -- Victory linking
  victory_id UUID REFERENCES victories(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Full-text search
  search_vector TSVECTOR
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_milestone_journal_member ON milestone_journal(family_member_id);
CREATE INDEX IF NOT EXISTS idx_milestone_journal_tracker ON milestone_journal(user_tracker_id);
CREATE INDEX IF NOT EXISTS idx_milestone_journal_date ON milestone_journal(milestone_date);
CREATE INDEX IF NOT EXISTS idx_milestone_journal_tags ON milestone_journal USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_milestone_journal_search ON milestone_journal USING GIN(search_vector);

-- Update search vector on insert/update
CREATE OR REPLACE FUNCTION update_milestone_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER milestone_search_vector_update
BEFORE INSERT OR UPDATE ON milestone_journal
FOR EACH ROW EXECUTE FUNCTION update_milestone_search_vector();

-- ========================================
-- PART 6: RLS POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE tracker_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE coloring_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_journal ENABLE ROW LEVEL SECURITY;

-- Tracker Templates Policies
CREATE POLICY "Users can view all tracker templates"
ON tracker_templates FOR SELECT
USING (TRUE);

CREATE POLICY "Users can create custom templates"
ON tracker_templates FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates"
ON tracker_templates FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates"
ON tracker_templates FOR DELETE
USING (auth.uid() = created_by AND NOT is_system_template);

-- User Trackers Policies
CREATE POLICY "Users can view trackers for their family members"
ON user_trackers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM family_members fm
    JOIN users u ON fm.auth_user_id = u.id
    WHERE fm.id = user_trackers.family_member_id
    AND u.family_id IN (
      SELECT family_id FROM family_members fm2
      WHERE fm2.auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Organizers and parents can manage family trackers"
ON user_trackers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.auth_user_id = auth.uid()
    AND fm.role IN ('primary_organizer', 'parent')
    AND fm.family_id IN (
      SELECT fm2.family_id FROM family_members fm2
      WHERE fm2.id = user_trackers.family_member_id
    )
  )
);

-- Tracker Entries Policies
CREATE POLICY "Users can view entries for their family trackers"
ON tracker_entries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.auth_user_id = auth.uid()
    AND fm.family_id IN (
      SELECT fm2.family_id FROM family_members fm2
      WHERE fm2.id = tracker_entries.family_member_id
    )
  )
);

CREATE POLICY "Users can create entries for their trackers"
ON tracker_entries FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.auth_user_id = auth.uid()
    AND fm.id = tracker_entries.family_member_id
  )
);

CREATE POLICY "Users can update their own tracker entries"
ON tracker_entries FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.auth_user_id = auth.uid()
    AND fm.id = tracker_entries.family_member_id
  )
);

-- Coloring Gallery Policies
CREATE POLICY "Users can view all coloring templates"
ON coloring_gallery FOR SELECT
USING (TRUE);

CREATE POLICY "Users can create custom coloring templates"
ON coloring_gallery FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own coloring templates"
ON coloring_gallery FOR UPDATE
USING (auth.uid() = created_by);

-- Milestone Journal Policies
CREATE POLICY "Users can view family milestone entries"
ON milestone_journal FOR SELECT
USING (
  NOT is_private OR
  EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.auth_user_id = auth.uid()
    AND (
      fm.id = milestone_journal.family_member_id OR
      (milestone_journal.shared_with_family AND fm.family_id IN (
        SELECT fm2.family_id FROM family_members fm2
        WHERE fm2.id = milestone_journal.family_member_id
      ))
    )
  )
);

CREATE POLICY "Users can create their own milestones"
ON milestone_journal FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.auth_user_id = auth.uid()
    AND fm.id = milestone_journal.family_member_id
  )
);

CREATE POLICY "Users can update their own milestones"
ON milestone_journal FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.auth_user_id = auth.uid()
    AND fm.id = milestone_journal.family_member_id
  )
);

-- ========================================
-- PART 7: HELPER FUNCTIONS
-- ========================================

-- Function to calculate tracker completion percentage
CREATE OR REPLACE FUNCTION get_tracker_completion_percentage(
  p_user_tracker_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
  v_total_entries INTEGER;
  v_completed_entries INTEGER;
  v_percentage NUMERIC;
BEGIN
  -- Count total and completed entries
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE (entry_value->>'completed')::boolean = TRUE)
  INTO v_total_entries, v_completed_entries
  FROM tracker_entries
  WHERE user_tracker_id = p_user_tracker_id
  AND (p_start_date IS NULL OR entry_date >= p_start_date)
  AND (p_end_date IS NULL OR entry_date <= p_end_date);

  -- Calculate percentage
  IF v_total_entries = 0 THEN
    RETURN 0;
  ELSE
    v_percentage := (v_completed_entries::NUMERIC / v_total_entries::NUMERIC) * 100;
    RETURN ROUND(v_percentage, 2);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get current streak for a tracker
CREATE OR REPLACE FUNCTION get_tracker_current_streak(p_user_tracker_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
BEGIN
  -- Loop backwards from today counting consecutive completed days
  WHILE EXISTS (
    SELECT 1 FROM tracker_entries
    WHERE user_tracker_id = p_user_tracker_id
    AND entry_date = v_current_date
    AND (entry_value->>'completed')::boolean = TRUE
  ) LOOP
    v_streak := v_streak + 1;
    v_current_date := v_current_date - INTERVAL '1 day';
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
-- Tracker Widget System tables and policies created successfully
-- Next steps: Seed basic tracker templates
