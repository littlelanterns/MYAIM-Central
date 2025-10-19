-- ============================================================
-- FAMILY ARCHIVES SYSTEM - NEW TABLES FOR SUPABASE
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. ARCHIVE FOLDERS (Hierarchical context organization)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.archive_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES public.archive_folders(id) ON DELETE CASCADE,

  -- Folder identification
  folder_name TEXT NOT NULL,
  folder_type TEXT NOT NULL CHECK (folder_type IN (
    'family_root',        -- The main "Family" folder
    'family_member',      -- Individual family member folders
    'custom_project',     -- Mom's custom projects
    'extended_family'     -- Premium: Extended family members
  )),

  -- If it's a family member folder
  member_id UUID REFERENCES public.family_members(id) ON DELETE CASCADE,

  -- Visual customization
  icon TEXT DEFAULT '📁',
  cover_photo_url TEXT,  -- NEW: Upload custom photos for each folder!
  color_hex TEXT DEFAULT '#68a395',
  description TEXT,      -- Optional description of the folder

  -- Access control
  is_active BOOLEAN DEFAULT TRUE,
  required_tier TEXT DEFAULT 'essential' CHECK (required_tier IN ('essential', 'enhanced', 'magic')),

  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_archive_folders_family ON public.archive_folders(family_id);
CREATE INDEX IF NOT EXISTS idx_archive_folders_parent ON public.archive_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_archive_folders_member ON public.archive_folders(member_id);
CREATE INDEX IF NOT EXISTS idx_archive_folders_type ON public.archive_folders(folder_type);

-- Enable Row Level Security
ALTER TABLE public.archive_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their family's archive folders" ON public.archive_folders;
CREATE POLICY "Users can view their family's archive folders"
  ON public.archive_folders FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM public.family_members
      WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create archive folders for their family" ON public.archive_folders;
CREATE POLICY "Users can create archive folders for their family"
  ON public.archive_folders FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM public.family_members
      WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their family's archive folders" ON public.archive_folders;
CREATE POLICY "Users can update their family's archive folders"
  ON public.archive_folders FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM public.family_members
      WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their family's archive folders" ON public.archive_folders;
CREATE POLICY "Users can delete their family's archive folders"
  ON public.archive_folders FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM public.family_members
      WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- 2. ARCHIVE CONTEXT ITEMS (The actual data in folders)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.archive_context_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES public.archive_folders(id) ON DELETE CASCADE,

  -- Context data
  context_field TEXT NOT NULL, -- 'personality', 'interests', 'dietary_restrictions', etc.
  context_value TEXT NOT NULL,
  context_type TEXT DEFAULT 'text' CHECK (context_type IN ('text', 'list', 'date', 'number', 'boolean')),

  -- THE CRITICAL CHECKBOX - does LiLa use this for optimization?
  use_for_context BOOLEAN DEFAULT TRUE,

  -- Source tracking
  added_by TEXT DEFAULT 'manual' CHECK (added_by IN ('manual', 'interview', 'conversation', 'import')),
  conversation_reference UUID, -- Link to a specific LiLa conversation

  -- AI suggestions (when LiLa asks "should I save this?")
  suggested_by_lila BOOLEAN DEFAULT FALSE,
  suggestion_accepted BOOLEAN, -- null = pending, true = accepted, false = rejected
  suggestion_reasoning TEXT,   -- Why LiLa thinks this should be saved

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_archive_context_folder ON public.archive_context_items(folder_id);
CREATE INDEX IF NOT EXISTS idx_archive_context_active ON public.archive_context_items(use_for_context) WHERE use_for_context = TRUE;
CREATE INDEX IF NOT EXISTS idx_archive_context_field ON public.archive_context_items(context_field);
CREATE INDEX IF NOT EXISTS idx_archive_context_suggested ON public.archive_context_items(suggested_by_lila) WHERE suggestion_accepted IS NULL;

-- Enable RLS
ALTER TABLE public.archive_context_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view context items in their family's folders" ON public.archive_context_items;
CREATE POLICY "Users can view context items in their family's folders"
  ON public.archive_context_items FOR SELECT
  USING (
    folder_id IN (
      SELECT id FROM public.archive_folders af
      WHERE af.family_id IN (
        SELECT family_id FROM public.family_members
        WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can create context items in their family's folders" ON public.archive_context_items;
CREATE POLICY "Users can create context items in their family's folders"
  ON public.archive_context_items FOR INSERT
  WITH CHECK (
    folder_id IN (
      SELECT id FROM public.archive_folders af
      WHERE af.family_id IN (
        SELECT family_id FROM public.family_members
        WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update context items in their family's folders" ON public.archive_context_items;
CREATE POLICY "Users can update context items in their family's folders"
  ON public.archive_context_items FOR UPDATE
  USING (
    folder_id IN (
      SELECT id FROM public.archive_folders af
      WHERE af.family_id IN (
        SELECT family_id FROM public.family_members
        WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete context items in their family's folders" ON public.archive_context_items;
CREATE POLICY "Users can delete context items in their family's folders"
  ON public.archive_context_items FOR DELETE
  USING (
    folder_id IN (
      SELECT id FROM public.archive_folders af
      WHERE af.family_id IN (
        SELECT family_id FROM public.family_members
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- 3. ARCHIVE INHERITANCE RULES (How child folders inherit from parents)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.archive_inheritance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_folder_id UUID NOT NULL REFERENCES public.archive_folders(id) ON DELETE CASCADE,
  parent_folder_id UUID NOT NULL REFERENCES public.archive_folders(id) ON DELETE CASCADE,

  -- Inheritance settings
  inherit_all BOOLEAN DEFAULT TRUE,
  inherit_fields TEXT[], -- specific fields to inherit if not all
  allow_override BOOLEAN DEFAULT TRUE, -- Can child override parent context?

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent circular inheritance
  CONSTRAINT no_self_inheritance CHECK (child_folder_id != parent_folder_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inheritance_child ON public.archive_inheritance_rules(child_folder_id);
CREATE INDEX IF NOT EXISTS idx_inheritance_parent ON public.archive_inheritance_rules(parent_folder_id);

-- Enable RLS
ALTER TABLE public.archive_inheritance_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view inheritance rules for their family's folders" ON public.archive_inheritance_rules;
CREATE POLICY "Users can view inheritance rules for their family's folders"
  ON public.archive_inheritance_rules FOR SELECT
  USING (
    child_folder_id IN (
      SELECT id FROM public.archive_folders af
      WHERE af.family_id IN (
        SELECT family_id FROM public.family_members
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- 4. PERSONAL PROMPT LIBRARY (Save & reuse optimized prompts)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.personal_prompt_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.family_members(id) ON DELETE SET NULL,

  -- Prompt data
  prompt_title TEXT NOT NULL,
  prompt_description TEXT,
  original_request TEXT,      -- What mom typed
  optimized_prompt TEXT NOT NULL, -- What LiLa created

  -- Categorization
  category TEXT CHECK (category IN (
    'homework', 'meals', 'behavior', 'creative', 'schedule',
    'communication', 'parenting', 'learning', 'custom', 'other'
  )),
  tags TEXT[],

  -- Context used (for recreation/reference)
  context_snapshot JSONB, -- Which folders/items were used
  folders_used TEXT[],    -- Simple list of folder names for quick reference

  -- Target platform
  target_platform TEXT DEFAULT 'generic' CHECK (target_platform IN (
    'chatgpt', 'claude', 'gemini', 'copilot', 'perplexity', 'generic'
  )),

  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_favorite BOOLEAN DEFAULT FALSE,

  -- Archive functionality (soft delete)
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP WITH TIME ZONE,

  -- Sharing (future feature)
  is_public BOOLEAN DEFAULT FALSE,
  share_code TEXT UNIQUE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prompt_library_family ON public.personal_prompt_library(family_id);
CREATE INDEX IF NOT EXISTS idx_prompt_library_category ON public.personal_prompt_library(category);
CREATE INDEX IF NOT EXISTS idx_prompt_library_favorite ON public.personal_prompt_library(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_prompt_library_tags ON public.personal_prompt_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompt_library_created_by ON public.personal_prompt_library(created_by);

-- Enable RLS
ALTER TABLE public.personal_prompt_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their family's prompt library" ON public.personal_prompt_library;
CREATE POLICY "Users can view their family's prompt library"
  ON public.personal_prompt_library FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM public.family_members
      WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create prompts in their family's library" ON public.personal_prompt_library;
CREATE POLICY "Users can create prompts in their family's library"
  ON public.personal_prompt_library FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM public.family_members
      WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their family's prompt library" ON public.personal_prompt_library;
CREATE POLICY "Users can update their family's prompt library"
  ON public.personal_prompt_library FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM public.family_members
      WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their family's prompt library" ON public.personal_prompt_library;
CREATE POLICY "Users can delete their family's prompt library"
  ON public.personal_prompt_library FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM public.family_members
      WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. LILA CONTEXT SUGGESTIONS (When LiLa notices new info)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lila_context_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  conversation_reference UUID, -- Link to conversation where this was detected

  -- What LiLa noticed
  suggested_context_field TEXT NOT NULL,
  suggested_context_value TEXT NOT NULL,
  suggested_folder_id UUID REFERENCES public.archive_folders(id) ON DELETE CASCADE,
  suggestion_type TEXT CHECK (suggestion_type IN (
    'context_item',      -- Add context to existing folder
    'best_intention',    -- Create new Best Intention
    'custom_folder',     -- Create custom project folder
    'schedule_item'      -- Add to schedule/calendar
  )),

  -- LiLa's reasoning
  reasoning TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  detected_pattern TEXT, -- If this came from pattern recognition

  -- Mom's decision
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'modified')),
  mom_modified_value TEXT, -- If she changed it before accepting
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES public.family_members(id),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lila_suggestions_family ON public.lila_context_suggestions(family_id);
CREATE INDEX IF NOT EXISTS idx_lila_suggestions_status ON public.lila_context_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_lila_suggestions_pending ON public.lila_context_suggestions(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_lila_suggestions_folder ON public.lila_context_suggestions(suggested_folder_id);

-- Enable RLS
ALTER TABLE public.lila_context_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view suggestions for their family" ON public.lila_context_suggestions;
CREATE POLICY "Users can view suggestions for their family"
  ON public.lila_context_suggestions FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM public.family_members
      WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can create suggestions for families" ON public.lila_context_suggestions;
CREATE POLICY "System can create suggestions for families"
  ON public.lila_context_suggestions FOR INSERT
  WITH CHECK (TRUE); -- System creates these, not users directly

DROP POLICY IF EXISTS "Users can update suggestions for their family" ON public.lila_context_suggestions;
CREATE POLICY "Users can update suggestions for their family"
  ON public.lila_context_suggestions FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM public.family_members
      WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- 6. UPDATE BEST INTENTIONS TABLE (Add quick access links)
-- ============================================================

-- Add columns to existing best_intentions table for better integration
ALTER TABLE public.best_intentions
  ADD COLUMN IF NOT EXISTS show_in_quick_actions BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS show_in_command_center BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_in_archives BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS linked_archive_folder_id UUID REFERENCES public.archive_folders(id);

-- Index for quick retrieval
CREATE INDEX IF NOT EXISTS idx_best_intentions_quick_actions
  ON public.best_intentions(show_in_quick_actions)
  WHERE show_in_quick_actions = TRUE;

-- ============================================================
-- 7. HELPER FUNCTIONS FOR AUTO-CREATION
-- ============================================================

-- Function: Auto-create family archive structure when new family is created
CREATE OR REPLACE FUNCTION create_family_archive_structure()
RETURNS TRIGGER AS $func$
DECLARE
  new_family_folder_id UUID;
BEGIN
  -- Create root Family folder
  INSERT INTO public.archive_folders (
    family_id,
    parent_folder_id,
    folder_name,
    folder_type,
    icon,
    required_tier,
    description
  ) VALUES (
    NEW.id,
    NULL,
    'Family',
    'family_root',
    '👨‍👩‍👧‍👦',
    'essential',
    'Family-wide context that applies to everyone'
  ) RETURNING id INTO new_family_folder_id;

  -- Add some default context items for family folder
  INSERT INTO public.archive_context_items (folder_id, context_field, context_value, use_for_context)
  VALUES
    (new_family_folder_id, 'family_values', 'Click to add your family values', FALSE),
    (new_family_folder_id, 'parenting_philosophy', 'Click to add your parenting approach', FALSE),
    (new_family_folder_id, 'dietary_preferences', 'Click to add family dietary info', FALSE);

  RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create archives when family is created
DROP TRIGGER IF EXISTS auto_create_family_archives ON public.families;
CREATE TRIGGER auto_create_family_archives
  AFTER INSERT ON public.families
  FOR EACH ROW
  EXECUTE FUNCTION create_family_archive_structure();

-- Function: Auto-create member folder when new family member is added
CREATE OR REPLACE FUNCTION create_member_archive_folder()
RETURNS TRIGGER AS $func$
DECLARE
  family_root_folder_id UUID;
  new_member_folder_id UUID;
BEGIN
  -- Find the family root folder
  SELECT id INTO family_root_folder_id
  FROM public.archive_folders
  WHERE family_id = NEW.family_id
    AND folder_type = 'family_root'
  LIMIT 1;

  -- Create member's folder under family root
  INSERT INTO public.archive_folders (
    family_id,
    parent_folder_id,
    folder_name,
    folder_type,
    member_id,
    icon,
    required_tier,
    description
  ) VALUES (
    NEW.family_id,
    family_root_folder_id,
    NEW.name,
    'family_member',
    NEW.id,
    CASE
      WHEN NEW.role = 'child' THEN '👦'
      WHEN NEW.role = 'teen' THEN '👨'
      WHEN NEW.role = 'mom' THEN '👩'
      WHEN NEW.role = 'dad' THEN '👨'
      ELSE '👤'
    END,
    'essential',
    NEW.name || '''s personal context and information'
  ) RETURNING id INTO new_member_folder_id;

  -- Create inheritance rule (inherit from family root)
  INSERT INTO public.archive_inheritance_rules (
    child_folder_id,
    parent_folder_id,
    inherit_all,
    allow_override
  ) VALUES (
    new_member_folder_id,
    family_root_folder_id,
    TRUE,
    TRUE
  );

  -- Add placeholder context items (to be filled by LiLa interview)
  INSERT INTO public.archive_context_items (folder_id, context_field, context_value, use_for_context, added_by)
  VALUES
    (new_member_folder_id, 'personality', 'Complete LiLa interview to add', FALSE, 'interview'),
    (new_member_folder_id, 'interests', 'Complete LiLa interview to add', FALSE, 'interview'),
    (new_member_folder_id, 'learning_style', 'Complete LiLa interview to add', FALSE, 'interview'),
    (new_member_folder_id, 'challenges', 'Complete LiLa interview to add', FALSE, 'interview'),
    (new_member_folder_id, 'strengths', 'Complete LiLa interview to add', FALSE, 'interview');

  RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create member archives
DROP TRIGGER IF EXISTS auto_create_member_archives ON public.family_members;
CREATE TRIGGER auto_create_member_archives
  AFTER INSERT ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION create_member_archive_folder();

-- ============================================================
-- 8. UTILITY FUNCTIONS FOR CONTEXT RETRIEVAL
-- ============================================================

-- Function: Get all active context for a member (with inheritance)
CREATE OR REPLACE FUNCTION get_member_context_with_inheritance(member_uuid UUID)
RETURNS TABLE (
  context_field TEXT,
  context_value TEXT,
  source_folder TEXT,
  is_inherited BOOLEAN,
  folder_id UUID
) AS $func$
BEGIN
  RETURN QUERY
  -- Get member's own context
  SELECT
    aci.context_field,
    aci.context_value,
    af.folder_name as source_folder,
    FALSE as is_inherited,
    af.id as folder_id
  FROM public.archive_context_items aci
  JOIN public.archive_folders af ON aci.folder_id = af.id
  WHERE af.member_id = member_uuid
    AND aci.use_for_context = TRUE

  UNION ALL

  -- Get inherited context from family root
  SELECT
    aci.context_field,
    aci.context_value,
    'Family' as source_folder,
    TRUE as is_inherited,
    af.id as folder_id
  FROM public.archive_context_items aci
  JOIN public.archive_folders af ON aci.folder_id = af.id
  JOIN public.archive_folders member_folder ON member_folder.parent_folder_id = af.id
  WHERE member_folder.member_id = member_uuid
    AND af.folder_type = 'family_root'
    AND aci.use_for_context = TRUE;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get all active context for a family
CREATE OR REPLACE FUNCTION get_family_context(p_family_id UUID)
RETURNS TABLE (
  folder_name TEXT,
  context_field TEXT,
  context_value TEXT,
  folder_type TEXT
) AS $func$
BEGIN
  RETURN QUERY
  SELECT
    af.folder_name,
    aci.context_field,
    aci.context_value,
    af.folder_type
  FROM public.archive_context_items aci
  JOIN public.archive_folders af ON aci.folder_id = af.id
  WHERE af.family_id = p_family_id
    AND aci.use_for_context = TRUE
    AND af.is_active = TRUE
  ORDER BY af.sort_order, af.folder_name, aci.context_field;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- COMPLETED!
-- Run this SQL in your Supabase SQL Editor
-- All tables, indexes, RLS policies, and helper functions are now created
-- ============================================================
