/**
 * Permission System Types
 * For Additional Adult Dashboard and Permission Management
 */

export interface AdditionalAdultPermissions {
  // View permissions
  canViewFamilyData: boolean;
  canViewSpecificMembers: string[]; // Array of member IDs

  // Task permissions
  canViewTasks: boolean;
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canAssignTasks: boolean;

  // Schedule permissions
  canViewCalendar: boolean;
  canEditCalendar: boolean;
  canCreateEvents: boolean;

  // Children management
  canManageChildren: boolean;
  canViewProgress: boolean;
  canApproveCompletions: boolean;

  // Advanced
  canAccessReports: boolean;
  canModifyRewards: boolean;
  canViewBestIntentions: boolean;
}

export type PermissionAction =
  | 'view_family_data'
  | 'view_member'
  | 'view_tasks'
  | 'create_tasks'
  | 'edit_tasks'
  | 'delete_tasks'
  | 'assign_tasks'
  | 'view_calendar'
  | 'edit_calendar'
  | 'create_events'
  | 'manage_children'
  | 'view_progress'
  | 'approve_completions'
  | 'access_reports'
  | 'modify_rewards'
  | 'view_best_intentions';

export interface PermissionCheck {
  action: PermissionAction;
  targetMemberId?: string;
}

export const DEFAULT_PERMISSIONS: AdditionalAdultPermissions = {
  canViewFamilyData: false,
  canViewSpecificMembers: [],
  canViewTasks: false,
  canCreateTasks: false,
  canEditTasks: false,
  canDeleteTasks: false,
  canAssignTasks: false,
  canViewCalendar: false,
  canEditCalendar: false,
  canCreateEvents: false,
  canManageChildren: false,
  canViewProgress: false,
  canApproveCompletions: false,
  canAccessReports: false,
  canModifyRewards: false,
  canViewBestIntentions: false,
};
