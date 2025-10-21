/**
 * Permission Type Definitions
 * Defines all permission types and structures for the dashboard system
 */

export type PermissionLevel = 'none' | 'view' | 'edit' | 'full';

export type PermissionCategory =
  | 'calendar'
  | 'tasks'
  | 'victories'
  | 'archives'
  | 'best_intentions'
  | 'widgets';

export interface PermissionRule {
  id: string;
  family_member_id: string;
  granted_by_id: string; // ID of family member who granted this permission
  category: PermissionCategory;
  level: PermissionLevel;
  specific_items?: string[]; // Optional: specific item IDs this applies to
  expires_at?: string; // Optional: when this permission expires
  created_at: string;
  updated_at: string;
}

export interface FamilyMemberPermissions {
  family_member_id: string;
  role: 'primary_organizer' | 'parent' | 'additional_adult' | 'teen' | 'child';
  permissions: {
    calendar: PermissionLevel;
    tasks: PermissionLevel;
    victories: PermissionLevel;
    archives: PermissionLevel;
    best_intentions: PermissionLevel;
    widgets: PermissionLevel;
  };
  custom_rules?: PermissionRule[];
}

export const DEFAULT_PERMISSIONS: Record<string, FamilyMemberPermissions['permissions']> = {
  primary_organizer: {
    calendar: 'full',
    tasks: 'full',
    victories: 'full',
    archives: 'full',
    best_intentions: 'full',
    widgets: 'full'
  },
  parent: {
    calendar: 'full',
    tasks: 'full',
    victories: 'full',
    archives: 'edit',
    best_intentions: 'view',
    widgets: 'edit'
  },
  additional_adult: {
    calendar: 'view',
    tasks: 'view',
    victories: 'view',
    archives: 'none',
    best_intentions: 'none',
    widgets: 'none'
  },
  teen: {
    calendar: 'edit',
    tasks: 'edit',
    victories: 'edit',
    archives: 'edit',
    best_intentions: 'edit',
    widgets: 'edit'
  },
  child: {
    calendar: 'view',
    tasks: 'edit',
    victories: 'edit',
    archives: 'view',
    best_intentions: 'edit',
    widgets: 'view'
  }
};

export const PERMISSION_DESCRIPTIONS: Record<PermissionCategory, Record<PermissionLevel, string>> = {
  calendar: {
    none: 'Cannot see calendar',
    view: 'Can view family events',
    edit: 'Can add and edit own events',
    full: 'Can manage all family events'
  },
  tasks: {
    none: 'Cannot see tasks',
    view: 'Can view assigned tasks',
    edit: 'Can manage own tasks',
    full: 'Can assign and manage all tasks'
  },
  victories: {
    none: 'Cannot see victories',
    view: 'Can view victory history',
    edit: 'Can record own victories',
    full: 'Can manage all victories'
  },
  archives: {
    none: 'Cannot access archives',
    view: 'Can view shared archives',
    edit: 'Can add to archives',
    full: 'Can manage all archives'
  },
  best_intentions: {
    none: 'Cannot see intentions',
    view: 'Can view own intentions',
    edit: 'Can manage own intentions',
    full: 'Can view all family intentions'
  },
  widgets: {
    none: 'Cannot customize dashboard',
    view: 'Can view dashboard',
    edit: 'Can customize own dashboard',
    full: 'Can manage all dashboards'
  }
};
