// src/components/archives/AddContextItemModal.tsx
// Modal for adding new context items to a folder

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { archivesService } from '../../lib/archivesService';
import type { ArchiveFolder } from '../../types/archives';

interface AddContextItemModalProps {
  folder: ArchiveFolder;
  onClose: () => void;
  onCreated: () => void;
}

export function AddContextItemModal({ folder, onClose, onCreated }: AddContextItemModalProps) {
  const [contextField, setContextField] = useState('');
  const [contextValue, setContextValue] = useState('');
  const [contextType, setContextType] = useState<'text' | 'list' | 'date' | 'number' | 'boolean'>('text');
  const [useForContext, setUseForContext] = useState(true);
  const [saving, setSaving] = useState(false);

  // Common field suggestions based on folder type
  const fieldSuggestions = folder.folder_type === 'family_member' ? [
    'personality',
    'interests',
    'learning_style',
    'strengths',
    'challenges',
    'dietary_restrictions',
    'allergies',
    'medical_info',
    'schedule',
    'hobbies',
    'favorite_things',
    'fears_worries',
    'social_preferences',
    'communication_style'
  ] : [
    'family_values',
    'parenting_philosophy',
    'dietary_preferences',
    'family_traditions',
    'household_rules',
    'priorities',
    'goals',
    'challenges',
    'communication_style'
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!contextField.trim() || !contextValue.trim()) {
      alert('Please fill in both field name and value');
      return;
    }

    setSaving(true);
    try {
      await archivesService.addContextItem({
        folder_id: folder.id,
        context_field: contextField.trim(),
        context_value: contextValue.trim(),
        context_type: contextType,
        use_for_context: useForContext,
        added_by: 'manual'
      });

      onCreated();
      onClose();
    } catch (error) {
      console.error('Error adding context item:', error);
      alert('Failed to add context item. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Add Context Item</h2>
            <p style={styles.subtitle}>
              {folder.icon} {folder.folder_name}
            </p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Field Name */}
          <div style={styles.field}>
            <label style={styles.label}>
              Field Name
              <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <input
              type="text"
              value={contextField}
              onChange={(e) => setContextField(e.target.value)}
              placeholder="e.g., personality, interests, learning_style"
              style={styles.input}
              list="field-suggestions"
              required
            />
            <datalist id="field-suggestions">
              {fieldSuggestions.map(suggestion => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
            <p style={styles.hint}>
              Use lowercase with underscores (e.g., learning_style)
            </p>
          </div>

          {/* Context Type */}
          <div style={styles.field}>
            <label style={styles.label}>Context Type</label>
            <select
              value={contextType}
              onChange={(e) => setContextType(e.target.value as any)}
              style={styles.select}
            >
              <option value="text">Text</option>
              <option value="list">List (comma-separated)</option>
              <option value="date">Date</option>
              <option value="number">Number</option>
              <option value="boolean">Yes/No</option>
            </select>
          </div>

          {/* Context Value */}
          <div style={styles.field}>
            <label style={styles.label}>
              Value
              <span style={{ color: '#d32f2f' }}>*</span>
            </label>
            <textarea
              value={contextValue}
              onChange={(e) => setContextValue(e.target.value)}
              placeholder={
                contextType === 'list'
                  ? 'Enter items separated by commas'
                  : 'Enter the context information...'
              }
              style={styles.textarea}
              rows={5}
              required
            />
            {contextType === 'list' && (
              <p style={styles.hint}>
                Separate items with commas (e.g., "soccer, piano, reading")
              </p>
            )}
          </div>

          {/* Use for Context Checkbox */}
          <div style={styles.checkboxField}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={useForContext}
                onChange={(e) => setUseForContext(e.target.checked)}
                style={styles.checkbox}
              />
              <span>Use this for AI context</span>
            </label>
            <p style={styles.hint}>
              If checked, LiLa will include this when optimizing prompts
            </p>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={saving}
            >
              {saving ? (
                'Adding...'
              ) : (
                <>
                  <Plus size={16} />
                  Add Context Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem',
    borderBottom: '1px solid var(--accent-color, #d4e3d9)',
    background: 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'var(--primary-color, #68a395)',
    margin: '0 0 0.25rem 0'
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-color, #5a4033)',
    opacity: 0.7,
    margin: 0
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--primary-color, #68a395)',
    padding: '0.25rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  form: {
    padding: '1.5rem'
  },
  field: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-color, #5a4033)',
    marginBottom: '0.5rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.875rem',
    border: '1px solid var(--accent-color, #d4e3d9)',
    borderRadius: '8px',
    background: 'white',
    color: 'var(--text-color, #5a4033)',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.875rem',
    border: '1px solid var(--accent-color, #d4e3d9)',
    borderRadius: '8px',
    background: 'white',
    color: 'var(--text-color, #5a4033)',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.875rem',
    border: '1px solid var(--accent-color, #d4e3d9)',
    borderRadius: '8px',
    background: 'white',
    color: 'var(--text-color, #5a4033)',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  hint: {
    fontSize: '0.75rem',
    color: 'var(--text-color, #5a4033)',
    opacity: 0.6,
    margin: '0.5rem 0 0 0'
  },
  checkboxField: {
    marginBottom: '1.5rem'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: 'var(--text-color, #5a4033)',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--accent-color, #d4e3d9)'
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    border: '1px solid var(--accent-color, #d4e3d9)',
    borderRadius: '8px',
    background: 'white',
    color: 'var(--text-color, #5a4033)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    background: 'var(--primary-color, #68a395)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  }
};
