import { useState, useEffect } from 'react';
import { useAuthContext } from '../../components/auth/shared/AuthContext';
import { PERMISSION_DEFINITIONS } from '../../components/family/FamilySettings/PermissionGroup';

// Custom hook for granular permission management
export const usePermissions = () => {
  const { state, hasPermission, updatePermissions, isPrimaryParent, isParent } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper functions for specific permissions
  const canManageFamily = () => {
    return hasPermission('family.add_members') || 
           hasPermission('family.edit_members') || 
           hasPermission('family.remove_members');
  };

  const canAssignTasks = () => {
    return hasPermission('tasks.assign_to_others') || hasPermission('tasks.create');
  };

  const canModifySettings = () => {
    return hasPermission('settings.modify_family') || 
           hasPermission('settings.manage_permissions');
  };

  const canMonitorChildren = () => {
    return hasPermission('safety.monitor_activity') || 
           hasPermission('safety.set_restrictions');
  };

  const canViewAllData = () => {
    return hasPermission('family.view_all_data') || hasPermission('tasks.view_all');
  };

  // Get permissions by category
  const getPermissionsByCategory = (category: string) => {
    return Object.values(PERMISSION_DEFINITIONS).filter(
      permission => permission.category === category
    );
  };

  // Get default permissions for role
  const getDefaultPermissionsForRole = (role: 'primary_parent' | 'parent' | 'teen' | 'child') => {
    const defaultPermissions: Record<string, boolean> = {};

    Object.values(PERMISSION_DEFINITIONS).forEach(permission => {
      switch (role) {
        case 'primary_parent':
          // Primary parent gets all permissions
          defaultPermissions[permission.id] = true;
          break;
        
        case 'parent':
          // Regular parent gets most permissions except advanced settings
          if (permission.level !== 'advanced' || !permission.parentalControl) {
            defaultPermissions[permission.id] = true;
          } else {
            defaultPermissions[permission.id] = false;
          }
          break;
        
        case 'teen':
          // Teens get basic permissions, no parental controls
          if (permission.level === 'basic' && !permission.parentalControl) {
            defaultPermissions[permission.id] = true;
          } else {
            defaultPermissions[permission.id] = false;
          }
          break;
        
        case 'child':
          // Children get very limited permissions
          if (permission.id === 'tasks.create' || permission.id === 'tasks.view_all') {
            defaultPermissions[permission.id] = true;
          } else {
            defaultPermissions[permission.id] = false;
          }
          break;
        
        default:
          defaultPermissions[permission.id] = false;
      }
    });

    return defaultPermissions;
  };

  // Update specific permission
  const updateSinglePermission = async (permissionId: string, enabled: boolean) => {
    if (!state.user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newPermissions = {
        ...state.user.permissions,
        [permissionId]: enabled
      };
      
      await updatePermissions(newPermissions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Bulk update permissions for a user
  const updateUserPermissions = async (userId: string, permissions: Record<string, boolean>) => {
    // Only primary parent or parent can modify others' permissions
    if (!isPrimaryParent() && !isParent()) {
      setError('Insufficient permissions to modify user permissions');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // If modifying another user's permissions, use the API directly
      // This would need to be implemented in the auth context for other users
      await updatePermissions(permissions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user can modify another user's permissions
  const canModifyUserPermissions = (targetUserRole: string) => {
    const userRole = state.user?.role;
    
    // Primary parent can modify everyone
    if (userRole === 'primary_parent') return true;
    
    // Regular parent can modify teens and children, but not other parents
    if (userRole === 'parent') {
      return ['teen', 'child'].includes(targetUserRole);
    }
    
    // Teens and children cannot modify anyone's permissions
    return false;
  };

  // Get filtered permissions based on user role and target
  const getAvailablePermissions = (targetRole?: string) => {
    const userRole = state.user?.role;
    
    return Object.values(PERMISSION_DEFINITIONS).filter(permission => {
      // If viewing for another user, filter based on what current user can control
      if (targetRole && targetRole !== userRole) {
        if (!canModifyUserPermissions(targetRole)) return false;
      }
      
      // Filter based on current user's role
      switch (userRole) {
        case 'primary_parent':
          return true; // Can see all permissions
        
        case 'parent':
          // Can see most permissions except advanced ones they can't control
          return permission.level !== 'advanced' || 
                 !permission.parentalControl ||
                 targetRole === 'teen' || 
                 targetRole === 'child';
        
        case 'teen':
        case 'child':
          // Can only see their own basic permissions
          return permission.level === 'basic' && !permission.parentalControl;
        
        default:
          return false;
      }
    });
  };

  return {
    // State
    permissions: state.user?.permissions || {},
    loading,
    error,
    userRole: state.user?.role,
    
    // Permission checks
    hasPermission,
    canManageFamily,
    canAssignTasks,
    canModifySettings,
    canMonitorChildren,
    canViewAllData,
    canModifyUserPermissions,
    
    // Permission management
    updateSinglePermission,
    updateUserPermissions,
    getDefaultPermissionsForRole,
    getPermissionsByCategory,
    getAvailablePermissions,
    
    // Definitions
    permissionDefinitions: PERMISSION_DEFINITIONS
  };
};
