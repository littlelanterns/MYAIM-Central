/**
 * PermissionEditor Component
 * Interface for editing individual family member permissions
 */

import React, { useState } from 'react';
import './PermissionEditor.css';
import {
  FamilyMemberPermissions,
  PermissionCategory,
  PermissionLevel,
  PERMISSION_DESCRIPTIONS
} from './PermissionTypes';

interface PermissionEditorProps {
  memberPermissions: FamilyMemberPermissions;
  onSave: (updated: FamilyMemberPermissions) => void;
  onCancel: () => void;
}

const PermissionEditor: React.FC<PermissionEditorProps> = ({
  memberPermissions,
  onSave,
  onCancel
}) => {
  const [editedPermissions, setEditedPermissions] =
    useState<FamilyMemberPermissions>(memberPermissions);

  const categories: PermissionCategory[] = [
    'calendar',
    'tasks',
    'victories',
    'archives',
    'best_intentions',
    'widgets'
  ];

  const levels: PermissionLevel[] = ['none', 'view', 'edit', 'full'];

  const handlePermissionChange = (category: PermissionCategory, level: PermissionLevel) => {
    setEditedPermissions({
      ...editedPermissions,
      permissions: {
        ...editedPermissions.permissions,
        [category]: level
      }
    });
  };

  return (
    <div className="permission-editor-form">
      <h3>Edit Permissions</h3>

      <div className="permission-categories">
        {categories.map((category) => (
          <div key={category} className="permission-category">
            <label className="category-label">
              {category.replace('_', ' ').toUpperCase()}
            </label>

            <div className="permission-levels">
              {levels.map((level) => (
                <button
                  key={level}
                  className={`level-btn ${
                    editedPermissions.permissions[category] === level ? 'active' : ''
                  }`}
                  onClick={() => handlePermissionChange(category, level)}
                  title={PERMISSION_DESCRIPTIONS[category][level]}
                >
                  {level}
                </button>
              ))}
            </div>

            <p className="permission-description">
              {PERMISSION_DESCRIPTIONS[category][editedPermissions.permissions[category]]}
            </p>
          </div>
        ))}
      </div>

      <div className="editor-actions">
        <button className="save-btn" onClick={() => onSave(editedPermissions)}>
          💾 Save Changes
        </button>
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PermissionEditor;
