// src/components/family/FamilyMemberForm.tsx - Using shared types

import React from 'react';
import { FamilyMember, RelationshipType, AccessLevel } from '../../types';

// Props interface - now properly typed
interface FamilyMemberFormProps {
  member: FamilyMember;
  onUpdate: (id: string | number, field: keyof FamilyMember, value: any) => void;
  onTogglePermission: (id: string | number, permission: string) => void;
  onShowPermissionsToggle: () => void;
  isPermissionsSectionVisible: boolean;
  relationshipTypes: Record<string, RelationshipType>;
  accessLevels: Record<string, AccessLevel>;
  permissions: Record<string, string>;
  permissionTemplates: Record<string, any>;
  isSaving?: boolean;
}

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({
  member,
  onUpdate,
  onTogglePermission,
  onShowPermissionsToggle,
  isPermissionsSectionVisible,
  relationshipTypes,
  accessLevels,
  permissions,
  permissionTemplates,
  isSaving = false,
}) => {
  return (
    <div>
      {/* Name Field */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
          Name
        </label>
        <input
          type="text"
          value={member.name}
          onChange={(e) => onUpdate(member.id, 'name', e.target.value)}
          placeholder="Full name"
          style={{ width: '100%', padding: '0.75rem' }}
          disabled={isSaving}
        />
      </div>

      {/* Relationship Field */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
          Relationship
        </label>
        <select
          value={member.relationship}
          onChange={(e) => onUpdate(member.id, 'relationship', e.target.value)}
          style={{ width: '100%', padding: '0.75rem' }}
          disabled={isSaving}
        >
          {Object.entries(relationshipTypes).map(([key, type]) => (
            <option key={key} value={key}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Role for Special Relationship */}
      {member.relationship === 'special' && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
            Specify Role
          </label>
          <input
            type="text"
            value={member.customRole}
            onChange={(e) => onUpdate(member.id, 'customRole', e.target.value)}
            placeholder="e.g., Grandparent, Babysitter, Tutor, Family Friend"
            style={{ width: '100%', padding: '0.75rem' }}
            disabled={isSaving}
          />
          {relationshipTypes.special?.examples && (
            <div className="info-box" style={{ marginTop: '0.5rem' }}>
              Common roles: {relationshipTypes.special.examples.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Household Status */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
          Household Status
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name={`household-${member.id}`}
              checked={member.inHousehold === true}
              onChange={() => {
                onUpdate(member.id, 'inHousehold', true);
                // Apply smart defaults when switching to household
                if (member.relationship === 'child' && member.accessLevel === 'none') {
                  onUpdate(member.id, 'accessLevel', 'guided');
                } else if (member.relationship === 'partner' && member.accessLevel === 'none') {
                  onUpdate(member.id, 'accessLevel', 'full');
                }
              }}
              style={{ marginRight: '0.5rem' }}
              disabled={isSaving}
            />
            <span>
              <strong>Lives in household</strong> - Gets dashboard access, can receive tasks
            </span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name={`household-${member.id}`}
              checked={member.inHousehold === false}
              onChange={() => {
                onUpdate(member.id, 'inHousehold', false);
                onUpdate(member.id, 'accessLevel', 'none');
              }}
              style={{ marginRight: '0.5rem' }}
              disabled={isSaving}
            />
            <span>
              <strong>Context only</strong> - No dashboard, just for AI context & birthdays
            </span>
          </label>
        </div>
      </div>

      {/* Access Level (only for household members) */}
      {member.inHousehold && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
            Access Level
          </label>
          <select
            value={member.accessLevel}
            onChange={(e) => onUpdate(member.id, 'accessLevel', e.target.value)}
            style={{ width: '100%', padding: '0.75rem' }}
            disabled={isSaving}
          >
            {Object.entries(accessLevels)
              .filter(([key]) => key !== 'none')
              .map(([key, level]) => (
                <option key={key} value={key}>
                  {level.label} - {level.description}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Dashboard Type Selection (only for household members with guided/independent/full access) */}
      {member.inHousehold &&
       (member.accessLevel === 'guided' || member.accessLevel === 'independent' || member.accessLevel === 'full') && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            Dashboard Type
            <div
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title="Preview different dashboard styles"
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'var(--primary-color, #68a395)',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'help'
              }}>
                ?
              </span>
            </div>
          </label>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              value={member.dashboard_type || 'guided'}
              onChange={(e) => onUpdate(member.id, 'dashboard_type', e.target.value)}
              style={{ flex: 1, padding: '0.75rem' }}
              disabled={isSaving}
            >
              <option value="play">Play Mode (Ages 5-9) - Fun & Gamified</option>
              <option value="guided">Guided Mode (Ages 10-12) - Balanced Structure</option>
              <option value="independent">Independent Mode (Ages 13-18) - Full Features</option>
            </select>

            <a
              href="/dashboard-preview"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--secondary-color, #d6a461)',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              👀 Preview
            </a>
          </div>

          <div style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            background: 'rgba(104, 163, 149, 0.1)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            lineHeight: '1.4'
          }}>
            {member.dashboard_type === 'play' && (
              <span>
                <strong>Play Mode:</strong> Bright colors, animations, and gamification. Perfect for young children who love fun visuals and star rewards.
              </span>
            )}
            {(member.dashboard_type === 'guided' || !member.dashboard_type) && (
              <span>
                <strong>Guided Mode:</strong> Balanced approach with some gamification but more structure. Great for pre-teens learning responsibility.
              </span>
            )}
            {member.dashboard_type === 'independent' && (
              <span>
                <strong>Independent Mode:</strong> Sophisticated, professional dashboard with advanced tools. For teens who want full productivity features.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Birthday */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
          Birthday{' '}
          {!member.inHousehold && (
            <span style={{ opacity: 0.7 }}>(for AI context & reminders)</span>
          )}
        </label>
        <input
          type="date"
          value={member.birthday}
          onChange={(e) => onUpdate(member.id, 'birthday', e.target.value)}
          style={{ width: '100%', padding: '0.75rem' }}
          disabled={isSaving}
        />
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
          Notes{' '}
          {!member.inHousehold && (
            <span style={{ opacity: 0.7 }}>(helps AI understand context)</span>
          )}
        </label>
        <textarea
          value={member.notes}
          onChange={(e) => onUpdate(member.id, 'notes', e.target.value)}
          placeholder={
            member.inHousehold 
              ? "Any special notes..." 
              : "e.g., Lives in Chicago, visits monthly..."
          }
          rows={3}
          style={{ width: '100%', padding: '0.75rem', resize: 'vertical' }}
          disabled={isSaving}
        />
      </div>

      {/* Permissions Section (only for independent/full access household members) */}
      {member.inHousehold && 
       (member.accessLevel === 'independent' || member.accessLevel === 'full') && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '0.5rem' 
          }}>
            <label style={{ fontWeight: '600' }}>Specific Permissions</label>
            <button
              type="button"
              onClick={onShowPermissionsToggle}
              style={{
                background: 'var(--secondary-color, #d6a461)',
                color: 'white',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
              disabled={isSaving}
            >
              {isPermissionsSectionVisible ? 'Hide Details' : 'Customize Permissions'}
            </button>
          </div>
          
          {/* Permission Templates */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '0.5rem' 
            }}>
              Quick Setup Templates:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {Object.entries(permissionTemplates).map(([key, template]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    const newPermissions: Record<string, boolean> = {};
                    template.permissions.forEach((perm: string) => {
                      newPermissions[perm] = true;
                    });
                    onUpdate(member.id, 'permissions', newPermissions);
                  }}
                  className="template-btn"
                  title={template.description}
                  disabled={isSaving}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Permissions (when expanded) */}
          {isPermissionsSectionVisible && (
            <div 
              className="permission-section thin-scrollbar" 
              style={{ maxHeight: '300px', overflowY: 'auto' }}
            >
              <div className="info-box" style={{ marginBottom: '0.5rem' }}>
                Uncheck permissions you don't want this person to have.
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(permissions).map(([permissionKey, permissionLabel]) => (
                  <label 
                    key={permissionKey} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      fontSize: '0.875rem', 
                      cursor: 'pointer' 
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={member.permissions[permissionKey] || false}
                      onChange={() => onTogglePermission(member.id, permissionKey)}
                      disabled={isSaving}
                      style={{ marginRight: '0.5rem' }}
                    />
                    {permissionLabel}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FamilyMemberForm;