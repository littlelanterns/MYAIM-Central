/**
 * PermissionIndicator Component
 * Shows current permissions clearly
 * NO EMOJIS - uses Lucide icons only
 */

import React from 'react';
import { CheckCircle, XCircle, Shield, AlertCircle } from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { AdditionalAdultPermissions } from '../../../types/permissions';

interface PermissionIndicatorProps {
  familyMemberId: string;
  showRequestButton?: boolean;
}

interface PermissionDisplayItem {
  key: keyof AdditionalAdultPermissions;
  label: string;
  category: 'tasks' | 'calendar' | 'family' | 'advanced';
}

const PERMISSION_ITEMS: PermissionDisplayItem[] = [
  // Task permissions
  { key: 'canViewTasks', label: 'View Tasks', category: 'tasks' },
  { key: 'canCreateTasks', label: 'Create Tasks', category: 'tasks' },
  { key: 'canEditTasks', label: 'Edit Tasks', category: 'tasks' },
  { key: 'canDeleteTasks', label: 'Delete Tasks', category: 'tasks' },
  { key: 'canAssignTasks', label: 'Assign Tasks', category: 'tasks' },

  // Calendar permissions
  { key: 'canViewCalendar', label: 'View Calendar', category: 'calendar' },
  { key: 'canEditCalendar', label: 'Edit Calendar', category: 'calendar' },
  { key: 'canCreateEvents', label: 'Create Events', category: 'calendar' },

  // Family permissions
  { key: 'canViewFamilyData', label: 'View Family Data', category: 'family' },
  { key: 'canManageChildren', label: 'Manage Children', category: 'family' },
  { key: 'canViewProgress', label: 'View Progress', category: 'family' },
  { key: 'canApproveCompletions', label: 'Approve Completions', category: 'family' },

  // Advanced permissions
  { key: 'canAccessReports', label: 'Access Reports', category: 'advanced' },
  { key: 'canModifyRewards', label: 'Modify Rewards', category: 'advanced' },
  { key: 'canViewBestIntentions', label: 'View Best Intentions', category: 'advanced' },
];

export const PermissionIndicator: React.FC<PermissionIndicatorProps> = ({
  familyMemberId,
  showRequestButton = true,
}) => {
  const { permissions, loading, getPermissionLevel } = usePermissions(familyMemberId);

  if (loading) {
    return (
      <div className="additional-adult-card">
        <p style={{ color: 'var(--text-color)', opacity: 0.7 }}>Loading permissions...</p>
      </div>
    );
  }

  const permissionLevel = getPermissionLevel();

  const getLevelColor = () => {
    switch (permissionLevel) {
      case 'extensive': return 'var(--primary-color)';
      case 'moderate': return 'var(--secondary-color)';
      case 'limited': return 'var(--accent-color)';
      default: return 'var(--text-color)';
    }
  };

  const getLevelText = () => {
    switch (permissionLevel) {
      case 'extensive': return 'Extensive Access';
      case 'moderate': return 'Moderate Access';
      case 'limited': return 'Limited Access';
      default: return 'No Access';
    }
  };

  const groupedPermissions = PERMISSION_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PermissionDisplayItem[]>);

  return (
    <div className="additional-adult-card">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        borderBottom: `1px solid var(--accent-color)`,
        paddingBottom: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={24} color="var(--primary-color)" />
          <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Your Permissions</h3>
        </div>
        <div style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          background: getLevelColor(),
          color: 'var(--background-color)',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}>
          {getLevelText()}
        </div>
      </div>

      {Object.entries(groupedPermissions).map(([category, items]) => {
        const categoryHasAnyPermission = items.some(item => {
          const value = permissions[item.key];
          return Array.isArray(value) ? value.length > 0 : value === true;
        });

        if (!categoryHasAnyPermission && category !== 'tasks') {
          return null; // Don't show empty categories except tasks
        }

        return (
          <div key={category} style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              margin: '0 0 0.75rem 0',
              color: 'var(--secondary-color)',
              fontSize: '0.875rem',
              textTransform: 'capitalize',
              fontWeight: 600,
            }}>
              {category}
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.5rem',
            }}>
              {items.map(item => {
                const value = permissions[item.key];
                const isGranted = Array.isArray(value) ? value.length > 0 : value === true;

                return (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      background: isGranted ? 'var(--gradient-background)' : 'var(--background-color)',
                      border: `1px solid ${isGranted ? 'var(--primary-color)' : 'var(--accent-color)'}`,
                      opacity: isGranted ? 1 : 0.5,
                      fontSize: '0.875rem',
                    }}
                  >
                    {isGranted ? (
                      <CheckCircle size={16} color="var(--primary-color)" />
                    ) : (
                      <XCircle size={16} color="var(--text-color)" style={{ opacity: 0.5 }} />
                    )}
                    <span style={{ color: 'var(--text-color)' }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {permissionLevel === 'none' && (
        <div style={{
          padding: '1rem',
          background: 'var(--accent-color)',
          borderRadius: '8px',
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'start',
          gap: '0.75rem',
        }}>
          <AlertCircle size={20} color="var(--text-color)" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <div>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)', fontWeight: 500, fontSize: '0.875rem' }}>
              No Permissions Granted
            </p>
            <p style={{ margin: 0, color: 'var(--text-color)', opacity: 0.7, fontSize: '0.75rem' }}>
              Contact the family organizer to request access to family management features.
            </p>
          </div>
        </div>
      )}

      {showRequestButton && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid var(--accent-color)` }}>
          <button
            className="additional-adult-button secondary"
            style={{ width: '100%' }}
            onClick={() => {
              // TODO: Implement permission request flow
              alert('Permission request feature coming soon!');
            }}
          >
            Request Additional Access
          </button>
        </div>
      )}
    </div>
  );
};

export default PermissionIndicator;
