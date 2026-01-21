-- Migration: Fix family_members role constraint
-- Description: Adds 'primary_organizer' and other needed roles to the allowed list
-- This fixes the signup flow where we create the primary parent

-- Drop the old constraint
ALTER TABLE public.family_members
  DROP CONSTRAINT IF EXISTS family_members_role_check;

-- Add updated constraint with all needed roles
ALTER TABLE public.family_members
  ADD CONSTRAINT family_members_role_check
  CHECK (role = ANY (ARRAY[
    -- Original roles
    'mom'::text,
    'dad'::text,
    'child'::text,
    'teen'::text,
    'guardian'::text,
    -- New roles for account management
    'primary_organizer'::text,
    'parent'::text,
    'co_parent'::text,
    'caregiver'::text,
    -- Extended family
    'grandparent'::text,
    'aunt_uncle'::text,
    'sibling'::text,
    'other'::text
  ]));
