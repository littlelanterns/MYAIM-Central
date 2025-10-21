// src/components/BestIntentions/QuickAddForm.tsx
import React, { FC, useState } from 'react';
import { ArrowLeft, Plus, Save, AlertCircle } from 'lucide-react';
import CategorySelector from './CategorySelector';
import { createIntention } from '../../lib/intentions';
import { useAuthContext } from '../auth/shared/AuthContext';

interface QuickAddFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedPrivacy: 'private' | 'parents_only' | 'family';
  familyId: string;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  current_state: string;
  desired_state: string;
  why_it_matters: string;
  category_id: string | null;
  priority: 'high' | 'medium' | 'low';
}

const QuickAddForm: FC<QuickAddFormProps> = ({ 
  isOpen, 
  onClose, 
  onBack, 
  selectedPrivacy,
  familyId,
  onSuccess
}) => {
  const { state: authState } = useAuthContext();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    current_state: '',
    desired_state: '',
    why_it_matters: '',
    category_id: null,
    priority: 'medium'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  if (!isOpen) return null;

  const styles = {
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)',
    },
    modalContent: {
      background: 'var(--background-color, #fff4ec)',
      borderRadius: '16px',
      maxWidth: '600px',    // ✅ Narrower to leave space for Smart Notepad
      width: '90%',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
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
    headerTitle: {
      color: 'var(--primary-color, #68a395)',
      fontSize: '1.5rem',
      fontFamily: "'The Seasons', 'Playfair Display', serif",
      fontWeight: '600',
      margin: 0,
    },
    privacyBadge: {
      background: 'var(--primary-color, #68a395)',
      color: 'white',
      fontSize: '0.75rem',
      padding: '4px 8px',
      borderRadius: '12px',
      fontWeight: '500',
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
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '24px',
    },
    section: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    sectionTitle: {
      color: 'var(--primary-color, #68a395)',
      fontSize: '1.1rem',
      fontWeight: '600',
      margin: 0,
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },
    label: {
      color: 'var(--text-color, #5a4033)',
      fontSize: '0.9rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    required: {
      color: '#e74c3c',
      fontSize: '0.8rem',
    },
    input: {
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '0.95rem',
      color: 'var(--text-color, #5a4033)',
      background: 'white',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    textarea: {
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '0.95rem',
      color: 'var(--text-color, #5a4033)',
      background: 'white',
      outline: 'none',
      resize: 'vertical' as const,
      minHeight: '80px',
      fontFamily: 'inherit',
      lineHeight: '1.5',
      transition: 'border-color 0.2s',
    },
    select: {
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '0.95rem',
      color: 'var(--text-color, #5a4033)',
      background: 'white',
      outline: 'none',
      cursor: 'pointer',
      transition: 'border-color 0.2s',
    },
    radioGroup: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap' as const,
    },
    radioOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid var(--accent-color, #d4e3d9)',
      background: 'white',
      transition: 'all 0.2s',
    },
    radioOptionSelected: {
      background: 'var(--primary-color, #68a395)',
      color: 'white',
      borderColor: 'var(--primary-color, #68a395)',
    },
    error: {
      color: '#e74c3c',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginTop: '4px',
    },
    footer: {
      padding: '20px 32px',
      borderTop: '1px solid var(--accent-color, #d4e3d9)',
      background: 'rgba(255, 255, 255, 0.5)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    actionButton: {
      background: 'var(--primary-color, #68a395)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500',
    },
    secondaryButton: {
      background: 'none',
      color: 'var(--text-color, #5a4033)',
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    successMessage: {
      background: '#d4edda',
      border: '1px solid #c3e6cb',
      borderRadius: '8px',
      padding: '16px',
      color: '#155724',
      textAlign: 'center' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '12px',
    },
  };

  // Categories are now handled by CategorySelector component

  const priorities = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  const handleInputChange = (field: keyof FormData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryChange = (categoryId: string | null) => {
    handleInputChange('category_id', categoryId);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--primary-color, #68a395)';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--accent-color, #d4e3d9)';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    // Current state, desired state, and why it matters are now optional

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Validate required IDs exist
    if (!authState.user?.familyId) {
      setErrors({
        submit: 'No family associated with your account. Please complete family setup.'
      });
      return;
    }

    if (!authState.user?.familyMemberId) {
      setErrors({
        submit: 'Your family member profile is not set up. Please complete family setup.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const intentionData = {
        family_id: authState.user.familyId,
        created_by: authState.user.familyMemberId,  // ✅ Use family_members.id
        title: formData.title,
        current_state: formData.current_state,
        desired_state: formData.desired_state,
        why_it_matters: formData.why_it_matters,
        category_id: formData.category_id,
        priority: formData.priority,
        privacy_level: selectedPrivacy,
      };

      // Debug logging
      console.log('Creating intention with:', {
        family_id: authState.user.familyId,
        created_by: authState.user.familyMemberId,
        title: formData.title,
        category_id: formData.category_id
      });

      const result = await createIntention(intentionData);
      console.log('✅ Intention created successfully:', result);

      setShowSuccess(true);

      // Call success callback to refresh parent data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('❌ Error saving intention:', error);
      console.error('Full error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        sentData: {
          family_id: authState.user?.familyId,
          created_by: authState.user?.familyMemberId,
          title: formData.title
        }
      });

      setErrors({
        submit: `Failed to save intention: ${error?.message || 'Unknown error'}. Check browser console for details.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPrivacyDisplay = () => {
    switch (selectedPrivacy) {
      case 'family': return 'Family';
      case 'parents_only': return 'Parents Only';
      case 'private': return 'Private';
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      current_state: '',
      desired_state: '',
      why_it_matters: '',
      category_id: null,
      priority: 'medium'
    });
    setErrors({});
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <h2 style={styles.headerTitle}>Success!</h2>
            </div>
            <button 
              style={styles.closeButton}
              onClick={onClose}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
            >
              ×
            </button>
          </div>

          <div style={styles.body}>
            <div style={styles.successMessage}>
              <Plus size={48} style={{ color: 'var(--primary-color, #68a395)' }} />
              <h3 style={{ margin: 0, color: 'var(--primary-color, #68a395)' }}>
                Intention Created!
              </h3>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                "{formData.title}" has been added to your family's Best Intentions.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  style={styles.actionButton}
                  onClick={onClose}
                >
                  View All Intentions
                </button>
                
                <button 
                  style={styles.secondaryButton}
                  onClick={() => {
                    resetForm();
                    setShowSuccess(false);
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-color, #d4e3d9)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h2 style={styles.headerTitle}>Quick Add Intention</h2>
            <span style={styles.privacyBadge}>{getPrivacyDisplay()}</span>
          </div>
          <button 
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.body}>
          {/* Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Intention Title
              <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              style={styles.input}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="e.g., Improve Family Communication"
              maxLength={100}
            />
            {errors.title && (
              <div style={styles.error}>
                <AlertCircle size={14} />
                {errors.title}
              </div>
            )}
          </div>

          {/* Category & Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category</label>
              <CategorySelector
                selectedCategoryId={formData.category_id}
                onCategoryChange={handleCategoryChange}
                familyId={familyId}
                isRequired={false}
                showAddCustom={true}
                onAddCustom={() => setShowAddCategoryModal(true)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Priority</label>
              <div style={styles.radioGroup}>
                {priorities.map(priority => (
                  <label
                    key={priority.value}
                    style={{
                      ...styles.radioOption,
                      ...(formData.priority === priority.value ? styles.radioOptionSelected : {})
                    }}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      style={{ display: 'none' }}
                    />
                    {priority.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Current State */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Current State
              <span style={{ fontSize: '0.8rem', color: 'var(--text-color, #5a4033)', opacity: 0.6 }}> (optional)</span>
            </label>
            <textarea
              style={styles.textarea}
              value={formData.current_state}
              onChange={(e) => handleInputChange('current_state', e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Describe what's happening now. What's the current situation or challenge?"
              maxLength={500}
            />
            {errors.current_state && (
              <div style={styles.error}>
                <AlertCircle size={14} />
                {errors.current_state}
              </div>
            )}
          </div>

          {/* Desired State */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Desired State
              <span style={{ fontSize: '0.8rem', color: 'var(--text-color, #5a4033)', opacity: 0.6 }}> (optional)</span>
            </label>
            <textarea
              style={styles.textarea}
              value={formData.desired_state}
              onChange={(e) => handleInputChange('desired_state', e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Describe what success looks like. What do you want to achieve?"
              maxLength={500}
            />
            {errors.desired_state && (
              <div style={styles.error}>
                <AlertCircle size={14} />
                {errors.desired_state}
              </div>
            )}
          </div>

          {/* Why It Matters */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Why It Matters
              <span style={{ fontSize: '0.8rem', color: 'var(--text-color, #5a4033)', opacity: 0.6 }}> (optional)</span>
            </label>
            <textarea
              style={styles.textarea}
              value={formData.why_it_matters}
              onChange={(e) => handleInputChange('why_it_matters', e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Explain the deeper motivation. Why is this important to your family?"
              maxLength={500}
            />
            {errors.why_it_matters && (
              <div style={styles.error}>
                <AlertCircle size={14} />
                {errors.why_it_matters}
              </div>
            )}
          </div>
          
          {/* Submit Error */}
          {errors.submit && (
            <div style={styles.error}>
              <AlertCircle size={14} />
              {errors.submit}
            </div>
          )}
        </form>

        <div style={styles.footer}>
          <button 
            onClick={onBack}
            style={styles.secondaryButton}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-color, #d4e3d9)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <ArrowLeft size={16} style={{ marginRight: '4px' }} />
            Back
          </button>
          
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              ...styles.actionButton,
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) e.currentTarget.style.opacity = '1';
            }}
          >
            <Save size={18} />
            {isSubmitting ? 'Creating...' : 'Create Intention'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddForm;