-- Migration: Fix archive folder type constraint
-- Description: Updates the folder_type check constraint to include all valid types
-- This fixes the "violates check constraint" error during family signup

-- Drop the old constraint
ALTER TABLE public.archive_folders
  DROP CONSTRAINT IF EXISTS archive_folders_folder_type_check;

-- Add the updated constraint with all valid folder types
ALTER TABLE public.archive_folders
  ADD CONSTRAINT archive_folders_folder_type_check
  CHECK (folder_type IN (
    -- Master folders (top-level)
    'master_family',          -- Master Family folder
    'master_best_intentions', -- Master Best Intentions folder
    'master_extended_family', -- Master Extended Family folder
    'master_personal',        -- Master Personal folder
    -- Subfolders
    'family_member',          -- Subfolder under master_family
    'custom_project',         -- Subfolder under master_personal
    'extended_family_member', -- Subfolder under master_extended_family
    'best_intention_item',    -- Subfolder under master_best_intentions
    -- Legacy types (for backwards compatibility)
    'family_root',
    'extended_family'
  ));
