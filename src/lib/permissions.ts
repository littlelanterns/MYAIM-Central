/**
 * Permission Engine
 * Handles permission checking logic for Additional Adult Dashboard
 */

import { AdditionalAdultPermissions, PermissionAction } from '../types/permissions';

export class PermissionEngine {
  private permissions: AdditionalAdultPermissions;

  constructor(permissions: AdditionalAdultPermissions) {
    this.permissions = permissions;
  }

  /**
   * Check if user has permission for a specific action
   */
  can(action: PermissionAction, targetMemberId?: string): boolean {
    switch (action) {
      case 'view_family_data':
        return this.permissions.canViewFamilyData;

      case 'view_member':
        if (!targetMemberId) return false;
        return (
          this.permissions.canViewFamilyData ||
          this.permissions.canViewSpecificMembers.includes(targetMemberId)
        );

      case 'view_tasks':
        return this.permissions.canViewTasks;

      case 'create_tasks':
        return this.permissions.canCreateTasks;

      case 'edit_tasks':
        return this.permissions.canEditTasks;

      case 'delete_tasks':
        return this.permissions.canDeleteTasks;

      case 'assign_tasks':
        return this.permissions.canAssignTasks;

      case 'view_calendar':
        return this.permissions.canViewCalendar;

      case 'edit_calendar':
        return this.permissions.canEditCalendar;

      case 'create_events':
        return this.permissions.canCreateEvents;

      case 'manage_children':
        return this.permissions.canManageChildren;

      case 'view_progress':
        return this.permissions.canViewProgress;

      case 'approve_completions':
        return this.permissions.canApproveCompletions;

      case 'access_reports':
        return this.permissions.canAccessReports;

      case 'modify_rewards':
        return this.permissions.canModifyRewards;

      case 'view_best_intentions':
        return this.permissions.canViewBestIntentions;

      default:
        return false;
    }
  }

  /**
   * Get list of all granted permissions
   */
  getGrantedPermissions(): string[] {
    const granted: string[] = [];
    const permissionMap: Record<keyof AdditionalAdultPermissions, string> = {
      canViewFamilyData: 'View Family Data',
      canViewSpecificMembers: 'View Specific Members',
      canViewTasks: 'View Tasks',
      canCreateTasks: 'Create Tasks',
      canEditTasks: 'Edit Tasks',
      canDeleteTasks: 'Delete Tasks',
      canAssignTasks: 'Assign Tasks',
      canViewCalendar: 'View Calendar',
      canEditCalendar: 'Edit Calendar',
      canCreateEvents: 'Create Events',
      canManageChildren: 'Manage Children',
      canViewProgress: 'View Progress',
      canApproveCompletions: 'Approve Completions',
      canAccessReports: 'Access Reports',
      canModifyRewards: 'Modify Rewards',
      canViewBestIntentions: 'View Best Intentions',
    };

    Object.entries(this.permissions).forEach(([key, value]) => {
      if (key === 'canViewSpecificMembers') {
        if (Array.isArray(value) && value.length > 0) {
          granted.push(permissionMap[key as keyof AdditionalAdultPermissions]);
        }
      } else if (value === true) {
        granted.push(permissionMap[key as keyof AdditionalAdultPermissions]);
      }
    });

    return granted;
  }

  /**
   * Get permission level summary
   */
  getPermissionLevel(): 'none' | 'limited' | 'moderate' | 'extensive' {
    const grantedCount = this.getGrantedPermissions().length;

    if (grantedCount === 0) return 'none';
    if (grantedCount <= 3) return 'limited';
    if (grantedCount <= 7) return 'moderate';
    return 'extensive';
  }
}
