/**
 * PermissionGate Component
 * Wrapper that enforces permission checking
 * Shows fallback UI when permission is denied
 */

import React from 'react';
import { Lock } from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { PermissionAction } from '../../../types/permissions';

interface PermissionGateProps {
  action: PermissionAction;
  targetMemberId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  familyMemberId?: string;
}

export const PermissionGate = (props: PermissionGateProps): React.ReactElement | null => {
  const { action, targetMemberId, fallback, children, familyMemberId } = props;
  const { checkPermission } = usePermissions(familyMemberId);
  const hasPermission = checkPermission(action, targetMemberId);

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div
        style={{
          padding: '2rem',
          background: 'var(--accent-color)',
          borderRadius: '8px',
          color: 'var(--text-color)',
          opacity: 0.7,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <Lock size={32} color="var(--text-color)" style={{ opacity: 0.5 }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>
            Permission Required
          </h4>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            You don't have permission to {action.replace(/_/g, ' ')}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>
            Contact the family organizer if you need access
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGate;
