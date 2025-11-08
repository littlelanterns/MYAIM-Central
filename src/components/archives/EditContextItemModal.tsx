// src/components/archives/EditContextItemModal.tsx
// Modal for editing existing context items

import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { archivesService } from '../../lib/archivesService';
import type { ArchiveContextItem } from '../../types/archives';

interface EditContextItemModalProps {
  item: ArchiveContextItem;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditContextItemModal({ item, onClose, onUpdated }: EditContextItemModalProps) {
  const [contextField, setContextField] = useState(item.context_field);
  const [contextValue, setContextValue] = useState(item.context_value);
  const [useForContext, setUseForContext] = useState(item.use_for_context);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!contextField.trim() || !contextValue.trim()) {
      alert('Please fill in both field name and value');
      return;
    }

    setSaving(true);
    try {
      await archivesService.updateContextItem(item.id, {
        context_field: contextField.trim(),
        context_value: contextValue.trim(),
        use_for_context: useForContext
      });

      onUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating context item:', error);
      alert('Failed to update context item. Please try again.');
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
            <h2 style={styles.title}>Edit Context Item</h2>
            <p style={styles.subtitle}>
              Update this context information
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
              required
            />
            <p style={styles.hint}>
              Use lowercase with underscores (e.g., learning_style)
            </p>
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
              placeholder="Enter the context information..."
              style={styles.textarea}
              rows={8}
              required
            />
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

          {/* Metadata */}
          {item.added_by && (
            <div style={styles.metadata}>
              <p style={styles.metadataItem}>
                <strong>Added by:</strong> {item.added_by}
              </p>
              {item.suggested_by_lila && (
                <p style={styles.metadataItem}>
                  <strong>Suggested by LiLa:</strong> Yes
                  {item.suggestion_reasoning && (
                    <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
                      Reason: {item.suggestion_reasoning}
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

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
                'Saving...'
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
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
  metadata: {
    background: 'var(--background-color, #fff4ec)',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem'
  },
  metadataItem: {
    fontSize: '0.75rem',
    color: 'var(--text-color, #5a4033)',
    margin: '0.25rem 0'
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
