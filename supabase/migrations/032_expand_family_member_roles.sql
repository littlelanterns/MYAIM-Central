-- Migration: Expand family_members role constraint to include UI relationship types
-- These values have specific meanings in the AIMfM system:
--   self: The mom/primary organizer setting up the system
--   partner: Spouse, husband, wife - co-manages family
--   child: Kids living at home - get dashboards (play/guided/independent)
--   out-of-nest: Adult children, grandchildren, in-laws - context only, no dashboard
--   special: Grandparents, caregivers, babysitters, tutors - may get dashboard access if permitted

ALTER TABLE family_members DROP CONSTRAINT IF EXISTS family_members_role_check;

ALTER TABLE family_members ADD CONSTRAINT family_members_role_check
CHECK (role = ANY (ARRAY[
  -- Original/legacy roles (keeping for backwards compatibility)
  'mom'::text,
  'dad'::text,
  'child'::text,
  'teen'::text,
  'guardian'::text,
  'primary_organizer'::text,
  'parent'::text,
  'co_parent'::text,
  'caregiver'::text,
  'grandparent'::text,
  'aunt_uncle'::text,
  'sibling'::text,
  'other'::text,
  -- UI relationship types (primary values going forward)
  'self'::text,
  'partner'::text,
  'out-of-nest'::text,
  'special'::text
]));

COMMENT ON COLUMN family_members.role IS
'Relationship type. Primary values: self (mom/organizer), partner (spouse), child (at home),
out-of-nest (adult children/grandchildren - context only), special (caregivers/helpers with optional dashboard access).
Legacy values kept for backwards compatibility.';
