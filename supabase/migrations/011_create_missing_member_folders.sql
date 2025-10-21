-- Migration: Create missing member folders for existing family members
-- Description: Manually creates folders for any existing family members that don't have them yet
-- Created: 2025-10-19

DO $$
DECLARE
  member_record RECORD;
  family_master_id UUID;
  new_folder_id UUID;
BEGIN
  -- Loop through all family members that don't have folders
  FOR member_record IN
    SELECT fm.*
    FROM family_members fm
    LEFT JOIN archive_folders af ON af.member_id = fm.id
    WHERE af.id IS NULL
  LOOP
    RAISE NOTICE 'Creating folder for member: %', member_record.name;

    -- Find the Family master folder for this family
    SELECT id INTO family_master_id
    FROM archive_folders
    WHERE family_id = member_record.family_id
      AND folder_type = 'master_family'
    LIMIT 1;

    IF family_master_id IS NULL THEN
      RAISE WARNING 'No master_family folder found for family_id: %', member_record.family_id;
      CONTINUE;
    END IF;

    -- Create member's folder
    INSERT INTO archive_folders (
      family_id,
      parent_folder_id,
      folder_name,
      folder_type,
      member_id,
      icon,
      is_master,
      required_tier,
      color_hex
    ) VALUES (
      member_record.family_id,
      family_master_id,
      member_record.name,
      'family_member',
      member_record.id,
      '',  -- No icon (just photo/color)
      FALSE,
      'essential',
      '#68a395'  -- Default color
    ) RETURNING id INTO new_folder_id;

    RAISE NOTICE 'Created folder % for member %', new_folder_id, member_record.name;

    -- Create inheritance rule
    INSERT INTO archive_inheritance_rules (
      child_folder_id,
      parent_folder_id,
      inherit_all,
      allow_override
    ) VALUES (
      new_folder_id,
      family_master_id,
      TRUE,
      TRUE
    );

    -- Add placeholder context items
    INSERT INTO archive_context_items (folder_id, context_field, context_value, use_for_context, added_by)
    VALUES
      (new_folder_id, 'personality', 'Complete LiLa interview to add', FALSE, 'interview'),
      (new_folder_id, 'interests', 'Complete LiLa interview to add', FALSE, 'interview'),
      (new_folder_id, 'learning_style', 'Complete LiLa interview to add', FALSE, 'interview'),
      (new_folder_id, 'challenges', 'Complete LiLa interview to add', FALSE, 'interview'),
      (new_folder_id, 'strengths', 'Complete LiLa interview to add', FALSE, 'interview');

    RAISE NOTICE 'Added context items for folder %', new_folder_id;
  END LOOP;

  RAISE NOTICE 'Folder creation complete!';
END $$;

-- Verify results
SELECT
  fm.name as member_name,
  af.folder_name,
  af.icon,
  af.color_hex,
  COUNT(aci.id) as context_items
FROM family_members fm
LEFT JOIN archive_folders af ON af.member_id = fm.id
LEFT JOIN archive_context_items aci ON aci.folder_id = af.id
GROUP BY fm.name, af.folder_name, af.icon, af.color_hex
ORDER BY fm.name;
