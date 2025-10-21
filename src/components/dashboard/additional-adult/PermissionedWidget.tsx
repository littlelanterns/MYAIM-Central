/**
 * PermissionedWidget Component
 * Wrapper for widgets that enforces permission checking
 * Shows "access denied" message if user doesn't have permission
 */

import React from 'react';
import './PermissionedWidget.css';

interface PermissionedWidgetProps {
  widgetType: string;
  hasPermission: boolean;
  canEdit?: boolean;
  children: React.ReactNode;
}

const PermissionedWidget: React.FC<PermissionedWidgetProps> = ({
  widgetType,
  hasPermission,
  canEdit = false,
  children
}) => {
  if (!hasPermission) {
    return (
      <div className="permissioned-widget denied">
        <div className="access-denied-message">
          <h3>Access Restricted</h3>
          <p>You don't have permission to view this {widgetType}</p>
          <small>Contact the family organizer if you need access</small>
        </div>
      </div>
    );
  }

  return (
    <div className={`permissioned-widget ${canEdit ? 'can-edit' : 'read-only'}`}>
      {!canEdit && (
        <div className="read-only-badge">
          <span>View Only</span>
        </div>
      )}
      {children}
    </div>
  );
};

export default PermissionedWidget;
