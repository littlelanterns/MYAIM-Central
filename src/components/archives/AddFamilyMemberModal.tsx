import React, { useState } from 'react';
import { ColorPickerModal } from './ColorPickerModal';
import { supabase } from '../../lib/supabase';

interface AddFamilyMemberModalProps {
  familyId: string;
  onClose: () => void;
  onCreated: (memberId: string, memberName: string) => void;
}

export function AddFamilyMemberModal({ familyId, onClose, onCreated }: AddFamilyMemberModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#68a395');
  const [selectedColorName, setSelectedColorName] = useState('Sage Teal');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startInterview, setStartInterview] = useState(true);

  async function handleSave() {
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }

    setSaving(true);
    try {
      // Create the family member
      const { data: newMember, error: memberError } = await supabase
        .from('family_members')
        .insert([
          {
            family_id: familyId,
            name: name.trim(),
            relationship: 'family', // Default relationship
            is_active: true
          }
        ])
        .select()
        .single();

      if (memberError) throw memberError;

      // Wait a moment for the trigger to create the folder
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update the folder color
      const { error: folderError } = await supabase
        .from('archive_folders')
        .update({ color_hex: selectedColor })
        .eq('member_id', newMember.id);

      if (folderError) console.error('Error updating folder color:', folderError);

      // Success!
      onCreated(newMember.id, newMember.name);
    } catch (error) {
      console.error('Error creating family member:', error);
      alert('Error creating family member. Please try again.');
    } finally {
      setSaving(false);
    }
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
      maxWidth: '500px',
      width: '100%',
      overflow: 'hidden',
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
      justifyContent: 'center',
      fontSize: '1.5rem'
    },
    content: {
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem'
    },
    fieldLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: 'var(--text-color, #5a4033)',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '8px',
      background: 'white',
      color: 'var(--text-color, #5a4033)',
      outline: 'none',
      boxSizing: 'border-box' as const
    },
    colorButton: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '8px',
      background: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'border-color 0.2s'
    },
    colorLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    colorSwatch: {
      width: '40px',
      height: '40px',
      borderRadius: '8px'
    },
    colorInfo: {
      textAlign: 'left' as const
    },
    colorName: {
      fontWeight: '500',
      color: 'var(--text-color, #5a4033)',
      fontSize: '0.875rem',
      margin: 0
    },
    colorHex: {
      fontSize: '0.75rem',
      color: 'var(--text-color, #5a4033)',
      opacity: 0.6,
      margin: 0
    },
    interviewBox: {
      background: 'var(--accent-color, #d4e3d9)',
      borderRadius: '8px',
      padding: '1rem'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      cursor: 'pointer'
    },
    checkbox: {
      marginTop: '0.25rem',
      width: '20px',
      height: '20px',
      accentColor: 'var(--primary-color, #68a395)'
    },
    checkboxText: {
      fontWeight: '500',
      color: 'var(--text-color, #5a4033)',
      fontSize: '0.875rem',
      margin: 0
    },
    checkboxSubtext: {
      fontSize: '0.75rem',
      color: 'var(--text-color, #5a4033)',
      opacity: 0.7,
      marginTop: '0.25rem',
      margin: 0
    },
    footer: {
      padding: '1.5rem',
      borderTop: '1px solid var(--accent-color, #d4e3d9)',
      display: 'flex',
      gap: '1rem'
    },
    cancelButton: {
      flex: 1,
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
    saveButton: {
      flex: 1,
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      border: 'none',
      borderRadius: '8px',
      background: 'var(--primary-color, #68a395)',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }
  };

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>Add Family Member</h2>
              <p style={styles.subtitle}>
                Add someone to your family archives
              </p>
            </div>
            <button onClick={onClose} style={styles.closeButton}>
              ×
            </button>
          </div>

          {/* Content */}
          <div style={styles.content}>
            {/* Name Input */}
            <div>
              <label style={styles.fieldLabel}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name (or pet's name!)"
                style={styles.input}
                autoFocus
              />
            </div>

            {/* Color Picker */}
            <div>
              <label style={styles.fieldLabel}>Folder Color</label>
              <button
                onClick={() => setShowColorPicker(true)}
                style={styles.colorButton}
              >
                <div style={styles.colorLeft}>
                  <div
                    style={{
                      ...styles.colorSwatch,
                      backgroundColor: selectedColor
                    }}
                  />
                  <div style={styles.colorInfo}>
                    <p style={styles.colorName}>{selectedColorName}</p>
                    <p style={styles.colorHex}>{selectedColor}</p>
                  </div>
                </div>
                <span style={{ fontSize: '1.25rem' }}>🎨</span>
              </button>
            </div>

            {/* Start Interview Option */}
            <div style={styles.interviewBox}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={startInterview}
                  onChange={(e) => setStartInterview(e.target.checked)}
                  style={styles.checkbox}
                />
                <div>
                  <p style={styles.checkboxText}>Start LiLa Interview</p>
                  <p style={styles.checkboxSubtext}>
                    Get help from LiLa to fill in their context through a friendly conversation
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                ...styles.cancelButton,
                opacity: saving ? 0.5 : 1,
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              style={{
                ...styles.saveButton,
                opacity: saving || !name.trim() ? 0.5 : 1,
                cursor: saving || !name.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Creating...' : startInterview ? 'Create & Interview' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <ColorPickerModal
          currentColor={selectedColor}
          onSelectColor={(color, name) => {
            setSelectedColor(color);
            setSelectedColorName(name);
            setShowColorPicker(false);
          }}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </>
  );
}
