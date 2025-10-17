// src/components/BestIntentions/AddCategoryModal.tsx
import React, { FC, useState } from 'react';
import { createCustomCategory } from '../../lib/categories';
import { useAuthContext } from '../auth/shared/AuthContext';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded?: (category: any) => void;
}

const AddCategoryModal: FC<AddCategoryModalProps> = ({ isOpen, onClose, onCategoryAdded }) => {
  const { state: authState } = useAuthContext();
  const [formData, setFormData] = useState({
    display_name: '',
    description: '',
    color_hex: '#68a395'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Color palette for quick selection
  const colorPalette = [
    '#68a395', // Primary sage
    '#d6a461', // Secondary honey
    '#b99c34', // Accent gold
    '#4b7c66', // Forest green
    '#805a82', // Lavender purple
    '#b86432', // Autumn orange
    '#2c5d60', // Deep teal
    '#6f4f3a', // Earthy brown
    '#b25a58', // Warm red
    '#5d3e60'  // Deep purple
  ];


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.user?.familyId) {
      setError('No family ID found. Please log in again.');
      return;
    }

    if (!formData.display_name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newCategory = await createCustomCategory(authState.user.familyId, formData);
      
      // Reset form
      setFormData({
        display_name: '',
        description: '',
        color_hex: '#68a395'
      });

      // Notify parent component
      if (onCategoryAdded) {
        onCategoryAdded(newCategory);
      }

      onClose();
    } catch (err: any) {
      console.error('Error creating category:', err);
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    },
    modal: {
      background: 'var(--background-color, #fff4ec)',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      border: '1px solid var(--accent-color, #d4e3d9)',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      padding: '20px 24px',
      borderBottom: '1px solid var(--accent-color, #d4e3d9)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(244, 220, 183, 0.5))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    title: {
      color: 'var(--primary-color, #68a395)',
      fontSize: '1.5rem',
      fontFamily: "'The Seasons', 'Playfair Display', serif",
      fontWeight: '600',
      margin: 0,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: 'var(--text-color, #5a4033)',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '4px',
      opacity: 0.7,
      fontSize: '24px',
      transition: 'opacity 0.2s',
    },
    body: {
      flex: 1,
      padding: '32px',
      overflow: 'auto',
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '24px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: 'var(--text-color, #5a4033)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    input: {
      padding: '12px 16px',
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '8px',
      fontSize: '1rem',
      background: 'white',
      color: 'var(--text-color, #5a4033)',
      transition: 'border-color 0.2s',
      outline: 'none',
    },
    textarea: {
      padding: '12px 16px',
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '8px',
      fontSize: '1rem',
      background: 'white',
      color: 'var(--text-color, #5a4033)',
      transition: 'border-color 0.2s',
      outline: 'none',
      resize: 'vertical' as const,
      minHeight: '80px',
      fontFamily: 'inherit',
    },
    selectionGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
    },
    selectionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(40px, 1fr))',
      gap: '8px',
    },
    colorOption: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      border: '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedOption: {
      border: '2px solid var(--primary-color, #68a395)',
      transform: 'scale(1.1)',
    },
    error: {
      color: '#e74c3c',
      fontSize: '0.85rem',
      padding: '8px 12px',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    footer: {
      padding: '20px 24px',
      borderTop: '1px solid var(--accent-color, #d4e3d9)',
      background: 'rgba(255, 255, 255, 0.5)',
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
    },
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    cancelButton: {
      background: 'none',
      color: 'var(--text-color, #5a4033)',
      border: '1px solid var(--accent-color, #d4e3d9)',
    },
    createButton: {
      background: 'var(--primary-color, #68a395)',
      color: 'white',
    },
    createButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h2 style={styles.title}>⊕ Add Custom Category</h2>
          </div>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          <form style={styles.form} onSubmit={handleSubmit}>
            {/* Category Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Category Name
                <span style={{ color: '#e74c3c', marginLeft: '4px' }}>*</span>
              </label>
              <input
                type="text"
                style={styles.input}
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="e.g., Health & Wellness, Learning Together"
                maxLength={50}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color, #68a395)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--accent-color, #d4e3d9)'}
              />
            </div>

            {/* Description */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Description (optional)
              </label>
              <textarea
                style={styles.textarea}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of what this category represents..."
                maxLength={200}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color, #68a395)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--accent-color, #d4e3d9)'}
              />
            </div>


            {/* Color Selection */}
            <div style={styles.selectionGroup}>
              <label style={styles.label}>
                Choose Color
              </label>
              <div style={styles.selectionGrid}>
                {colorPalette.map(color => (
                  <div
                    key={color}
                    style={{
                      ...styles.colorOption,
                      backgroundColor: color,
                      ...(formData.color_hex === color ? styles.selectedOption : {})
                    }}
                    onClick={() => handleInputChange('color_hex', color)}
                    onMouseEnter={(e) => {
                      if (formData.color_hex !== color) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.color_hex !== color) {
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            type="button"
            style={{ ...styles.button, ...styles.cancelButton }}
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(104, 163, 149, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              ...styles.button,
              ...styles.createButton,
              ...(loading || !formData.display_name.trim() ? styles.createButtonDisabled : {})
            }}
            disabled={loading || !formData.display_name.trim()}
            onClick={handleSubmit}
            onMouseEnter={(e) => {
              if (!loading && formData.display_name.trim()) {
                e.currentTarget.style.background = 'var(--secondary-color, #d6a461)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && formData.display_name.trim()) {
                e.currentTarget.style.background = 'var(--primary-color, #68a395)';
              }
            }}
          >
            {loading ? 'Creating...' : '+ Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;