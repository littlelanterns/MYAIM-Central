-- ============================================================
-- MASTER FOLDER SYSTEM - Archive Folders Redesign
-- Adds hierarchical master folder structure with tier-based access
-- ============================================================

-- Add is_master flag to archive_folders
ALTER TABLE public.archive_folders
  ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT FALSE;

-- Update folder_type constraint to include new master types
ALTER TABLE public.archive_folders
  DROP CONSTRAINT IF EXISTS archive_folders_folder_type_check;

ALTER TABLE public.archive_folders
  ADD CONSTRAINT archive_folders_folder_type_check
  CHECK (folder_type IN (
    'master_family',          -- Master Family folder
    'master_best_intentions', -- Master Best Intentions folder
    'master_extended_family', -- Master Extended Family folder
    'master_personal',        -- Master Personal folder
    'family_member',          -- Subfolder under master_family
    'custom_project',         -- Subfolder under master_personal
    'extended_family_member', -- Subfolder under master_extended_family
    'best_intention_item'     -- Subfolder under master_best_intentions
  ));

-- Add index for master folders
CREATE INDEX IF NOT EXISTS idx_archive_folders_is_master
  ON public.archive_folders(is_master)
  WHERE is_master = TRUE;

-- ============================================================
-- Update auto-creation function to create master folders
-- ============================================================

CREATE OR REPLACE FUNCTION create_family_archive_structure()
RETURNS TRIGGER AS $$
DECLARE
  family_master_id UUID;
  best_intentions_master_id UUID;
  extended_family_master_id UUID;
  personal_master_id UUID;
BEGIN
  -- Create FAMILY master folder
  INSERT INTO public.archive_folders (
    family_id,
    parent_folder_id,
    folder_name,
    folder_type,
    icon,
    is_master,
    required_tier,
    description,
    sort_order
  ) VALUES (
    NEW.id,
    NULL,
    'Family',
    'master_family',
    '',
    TRUE,
    'essential',
    'Your immediate family members',
    1
  ) RETURNING id INTO family_master_id;

  -- Create BEST INTENTIONS master folder
  INSERT INTO public.archive_folders (
    family_id,
    parent_folder_id,
    folder_name,
    folder_type,
    icon,
    is_master,
    required_tier,
    description,
    sort_order
  ) VALUES (
    NEW.id,
    NULL,
    'Best Intentions',
    'master_best_intentions',
    '',
    TRUE,
    'enhanced',
    'Your family goals and values',
    2
  ) RETURNING id INTO best_intentions_master_id;

  -- Create EXTENDED FAMILY master folder
  INSERT INTO public.archive_folders (
    family_id,
    parent_folder_id,
    folder_name,
    folder_type,
    icon,
    is_master,
    required_tier,
    description,
    sort_order
  ) VALUES (
    NEW.id,
    NULL,
    'Extended Family',
    'master_extended_family',
    '',
    TRUE,
    'full_magic',
    'Grandparents, aunts, uncles, and cousins',
    3
  ) RETURNING id INTO extended_family_master_id;

  -- Create PERSONAL master folder
  INSERT INTO public.archive_folders (
    family_id,
    parent_folder_id,
    folder_name,
    folder_type,
    icon,
    is_master,
    required_tier,
    description,
    sort_order
  ) VALUES (
    NEW.id,
    NULL,
    'Personal Projects',
    'master_personal',
    '',
    TRUE,
    'full_magic',
    'Your custom project folders',
    4
  ) RETURNING id INTO personal_master_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Update member folder creation to nest under Family master
-- ============================================================

CREATE OR REPLACE FUNCTION create_member_archive_folder()
RETURNS TRIGGER AS $$
DECLARE
  family_master_folder_id UUID;
  new_member_folder_id UUID;
BEGIN
  -- Find the Family master folder
  SELECT id INTO family_master_folder_id
  FROM public.archive_folders
  WHERE family_id = NEW.family_id
    AND folder_type = 'master_family'
  LIMIT 1;

  -- Create member's folder under Family master
  INSERT INTO public.archive_folders (
    family_id,
    parent_folder_id,
    folder_name,
    folder_type,
    member_id,
    icon,
    is_master,
    required_tier
  ) VALUES (
    NEW.family_id,
    family_master_folder_id,
    NEW.name,
    'family_member',
    NEW.id,
    '',
    FALSE,
    'essential'
  ) RETURNING id INTO new_member_folder_id;

  -- Create inheritance rule (inherit from family master)
  INSERT INTO public.archive_inheritance_rules (
    child_folder_id,
    parent_folder_id,
    inherit_all,
    allow_override
  ) VALUES (
    new_member_folder_id,
    family_master_folder_id,
    TRUE,
    TRUE
  );

  -- Add placeholder context items
  INSERT INTO public.archive_context_items (folder_id, context_field, context_value, use_for_context, added_by)
  VALUES
    (new_member_folder_id, 'personality', 'Complete LiLa interview to add', FALSE, 'interview'),
    (new_member_folder_id, 'interests', 'Complete LiLa interview to add', FALSE, 'interview'),
    (new_member_folder_id, 'learning_style', 'Complete LiLa interview to add', FALSE, 'interview'),
    (new_member_folder_id, 'challenges', 'Complete LiLa interview to add', FALSE, 'interview'),
    (new_member_folder_id, 'strengths', 'Complete LiLa interview to add', FALSE, 'interview');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Recreate triggers
-- ============================================================

DROP TRIGGER IF EXISTS auto_create_family_archives ON public.families;
CREATE TRIGGER auto_create_family_archives
  AFTER INSERT ON public.families
  FOR EACH ROW
  EXECUTE FUNCTION create_family_archive_structure();

DROP TRIGGER IF EXISTS auto_create_member_archives ON public.family_members;
CREATE TRIGGER auto_create_member_archives
  AFTER INSERT ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION create_member_archive_folder();

-- ============================================================
-- Create master folders for existing families
-- ============================================================

DO $$
DECLARE
  family_record RECORD;
  family_master_id UUID;
  best_intentions_master_id UUID;
  extended_family_master_id UUID;
  personal_master_id UUID;
BEGIN
  -- Loop through existing families that don't have master folders
  FOR family_record IN
    SELECT DISTINCT f.id, f.family_name
    FROM public.families f
    WHERE NOT EXISTS (
      SELECT 1 FROM public.archive_folders af
      WHERE af.family_id = f.id AND af.is_master = TRUE
    )
  LOOP
    -- Create FAMILY master folder
    INSERT INTO public.archive_folders (
      family_id,
      parent_folder_id,
      folder_name,
      folder_type,
      icon,
      is_master,
      required_tier,
      description,
      sort_order
    ) VALUES (
      family_record.id,
      NULL,
      'Family',
      'master_family',
      '',
      TRUE,
      'essential',
      'Your immediate family members',
      1
    ) RETURNING id INTO family_master_id;

    -- Create BEST INTENTIONS master folder
    INSERT INTO public.archive_folders (
      family_id,
      parent_folder_id,
      folder_name,
      folder_type,
      icon,
      is_master,
      required_tier,
      description,
      sort_order
    ) VALUES (
      family_record.id,
      NULL,
      'Best Intentions',
      'master_best_intentions',
      '',
      TRUE,
      'enhanced',
      'Your family goals and values',
      2
    ) RETURNING id INTO best_intentions_master_id;

    -- Create EXTENDED FAMILY master folder
    INSERT INTO public.archive_folders (
      family_id,
      parent_folder_id,
      folder_name,
      folder_type,
      icon,
      is_master,
      required_tier,
      description,
      sort_order
    ) VALUES (
      family_record.id,
      NULL,
      'Extended Family',
      'master_extended_family',
      '',
      TRUE,
      'full_magic',
      'Grandparents, aunts, uncles, and cousins',
      3
    ) RETURNING id INTO extended_family_master_id;

    -- Create PERSONAL master folder
    INSERT INTO public.archive_folders (
      family_id,
      parent_folder_id,
      folder_name,
      folder_type,
      icon,
      is_master,
      required_tier,
      description,
      sort_order
    ) VALUES (
      family_record.id,
      NULL,
      'Personal Projects',
      'master_personal',
      '',
      TRUE,
      'full_magic',
      'Your custom project folders',
      4
    ) RETURNING id INTO personal_master_id;

    -- Update existing family member folders to be under Family master
    UPDATE public.archive_folders
    SET parent_folder_id = family_master_id,
        folder_type = 'family_member'
    WHERE family_id = family_record.id
      AND member_id IS NOT NULL
      AND parent_folder_id IS NULL;

  END LOOP;
END $$;

-- ============================================================
-- COMPLETED!
-- Master folder structure is now in place
-- ============================================================

COMMENT ON COLUMN archive_folders.is_master IS 'Indicates if this is a top-level master folder that cannot be deleted';
