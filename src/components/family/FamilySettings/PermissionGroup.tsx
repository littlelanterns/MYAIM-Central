import React from 'react';

interface Permission {
  id: string;
  label: string;
  description: string;
  category: 'family_management' | 'task_assignment' | 'settings' | 'data_access' | 'child_safety';
  level: 'basic' | 'intermediate' | 'advanced';
  parentalControl: boolean;
}

interface PermissionGroupProps {
  title: string;
  category: Permission['category'];
  permissions: Permission[];
  userPermissions: Record<string, boolean>;
  onPermissionChange: (permissionId: string, enabled: boolean) => void;
  disabled?: boolean;
  userRole: 'primary_parent' | 'parent' | 'teen' | 'child';
  showAdvanced?: boolean;
}

const PERMISSION_DEFINITIONS: Record<string, Permission> = {
  // Family Management
  'family.add_members': {
    id: 'family.add_members',
    label: 'Add Family Members',
    description: 'Add new family members to the household',
    category: 'family_management',
    level: 'intermediate',
    parentalControl: true
  },
  'family.edit_members': {
    id: 'family.edit_members',
    label: 'Edit Member Profiles',
    description: 'Modify family member information and roles',
    category: 'family_management', 
    level: 'intermediate',
    parentalControl: true
  },
  'family.remove_members': {
    id: 'family.remove_members',
    label: 'Remove Family Members',
    description: 'Remove family members from the household',
    category: 'family_management',
    level: 'advanced',
    parentalControl: true
  },
  'family.view_all_data': {
    id: 'family.view_all_data',
    label: 'View All Family Data',
    description: 'Access all family member information and activities',
    category: 'data_access',
    level: 'intermediate',
    parentalControl: true
  },
  
  // Task Assignment & Management
  'tasks.create': {
    id: 'tasks.create',
    label: 'Create Tasks',
    description: 'Create new tasks for family members',
    category: 'task_assignment',
    level: 'basic',
    parentalControl: false
  },
  'tasks.assign_to_others': {
    id: 'tasks.assign_to_others',
    label: 'Assign Tasks to Others',
    description: 'Assign tasks to other family members',
    category: 'task_assignment',
    level: 'intermediate',
    parentalControl: true
  },
  'tasks.modify_others': {
    id: 'tasks.modify_others',
    label: 'Modify Others\' Tasks',
    description: 'Edit or delete tasks assigned to other family members',
    category: 'task_assignment',
    level: 'intermediate',
    parentalControl: true
  },
  'tasks.view_all': {
    id: 'tasks.view_all',
    label: 'View All Tasks',
    description: 'See tasks assigned to all family members',
    category: 'data_access',
    level: 'basic',
    parentalControl: false
  },
  
  // Settings & Configuration
  'settings.modify_family': {
    id: 'settings.modify_family',
    label: 'Modify Family Settings',
    description: 'Change family-wide settings and preferences',
    category: 'settings',
    level: 'advanced',
    parentalControl: true
  },
  'settings.manage_permissions': {
    id: 'settings.manage_permissions',
    label: 'Manage User Permissions',
    description: 'Control what other family members can access',
    category: 'settings',
    level: 'advanced',
    parentalControl: true
  },
  'settings.export_data': {
    id: 'settings.export_data',
    label: 'Export Family Data',
    description: 'Download family data and reports',
    category: 'data_access',
    level: 'intermediate',
    parentalControl: true
  },
  
  // Child Safety & Monitoring
  'safety.monitor_activity': {
    id: 'safety.monitor_activity',
    label: 'Monitor Child Activity',
    description: 'View detailed activity logs for children',
    category: 'child_safety',
    level: 'intermediate',
    parentalControl: true
  },
  'safety.set_restrictions': {
    id: 'safety.set_restrictions',
    label: 'Set Child Restrictions',
    description: 'Control what children can access and modify',
    category: 'child_safety',
    level: 'intermediate',
    parentalControl: true
  },
  'safety.emergency_override': {
    id: 'safety.emergency_override',
    label: 'Emergency Override',
    description: 'Override safety settings in emergency situations',
    category: 'child_safety',
    level: 'advanced',
    parentalControl: true
  }
};

const PermissionGroup: React.FC<PermissionGroupProps> = ({
  title,
  category,
  permissions,
  userPermissions,
  onPermissionChange,
  disabled = false,
  userRole,
  showAdvanced = false
}) => {
  const filteredPermissions = permissions.filter(permission => {
    // Filter by category
    if (permission.category !== category) return false;
    
    // Filter by user role - only primary parent can manage advanced permissions
    if (permission.level === 'advanced' && userRole !== 'primary_parent' && !showAdvanced) {
      return false;
    }
    
    // Hide parental controls from children and teens unless they're viewing their own limited permissions
    if (permission.parentalControl && ['teen', 'child'].includes(userRole)) {
      return false;
    }
    
    return true;
  });

  if (filteredPermissions.length === 0) return null;

  const getCategoryIcon = (category: Permission['category']) => {
    switch (category) {
      case 'family_management': return '👨‍👩‍👧‍👦';
      case 'task_assignment': return '📝';
      case 'settings': return '⚙️';
      case 'data_access': return '📊';
      case 'child_safety': return '🛡️';
      default: return '•';
    }
  };

  const getLevelColor = (level: Permission['level']) => {
    switch (level) {
      case 'basic': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'advanced': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="permission-group bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center mb-3">
        <span className="text-xl mr-2">{getCategoryIcon(category)}</span>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {filteredPermissions.map((permission) => {
          const isEnabled = userPermissions[permission.id] || false;
          const isDisabled = disabled || 
            (permission.parentalControl && userRole !== 'primary_parent' && userRole !== 'parent');
          
          return (
            <div key={permission.id} className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  id={permission.id}
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => onPermissionChange(permission.id, e.target.checked)}
                  disabled={isDisabled}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <label htmlFor={permission.id} className="block">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {permission.label}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(permission.level)} bg-gray-100`}>
                      {permission.level}
                    </span>
                    {permission.parentalControl && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-purple-600 bg-purple-100">
                        Parental
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {permission.description}
                  </p>
                </label>
              </div>
            </div>
          );
        })}
      </div>
      
      {userRole !== 'primary_parent' && category === 'settings' && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Some advanced permissions may only be modified by the primary parent.
          </p>
        </div>
      )}
    </div>
  );
};

export { PERMISSION_DEFINITIONS };
export default PermissionGroup;