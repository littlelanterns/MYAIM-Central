// src/components/BestIntentions/CategorySelector.tsx
import React, { FC, useState, useEffect } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { getFamilyCategories } from '../../lib/categories';

interface Category {
  id: string;
  category_name: string;
  display_name: string;
  description: string;
  icon: string;
  color_hex: string;
  category_type: string;
  is_custom: boolean;
  sort_order: number;
}

interface CategorySelectorProps {
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  familyId: string;
  isRequired?: boolean;
  showAddCustom?: boolean;
  onAddCustom?: () => void;
  disabled?: boolean;
}

const CategorySelector: FC<CategorySelectorProps> = ({
  selectedCategoryId,
  onCategoryChange,
  familyId,
  isRequired = false,
  showAddCustom = true,
  onAddCustom,
  disabled = false
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, [familyId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFamilyCategories(familyId);
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },
    selectContainer: {
      position: 'relative' as const,
    },
    select: {
      width: '100%',
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '8px',
      padding: '12px 40px 12px 16px',
      fontSize: '0.95rem',
      color: 'var(--text-color, #5a4033)',
      background: 'white',
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      appearance: 'none' as const,
      transition: 'border-color 0.2s',
    },
    chevron: {
      position: 'absolute' as const,
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none' as const,
      color: 'var(--text-color, #5a4033)',
      opacity: 0.6,
    },
    optgroup: {
      fontWeight: '600',
      color: 'var(--primary-color, #68a395)',
      fontSize: '0.9rem',
    },
    option: {
      padding: '8px 16px',
      fontSize: '0.95rem',
    },
    addCustomButton: {
      background: 'none',
      border: '1px dashed var(--accent-color, #d4e3d9)',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '0.85rem',
      color: 'var(--primary-color, #68a395)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s',
      alignSelf: 'flex-start',
    },
    error: {
      color: '#e74c3c',
      fontSize: '0.8rem',
      marginTop: '4px',
    },
    loading: {
      color: 'var(--text-color, #5a4033)',
      opacity: 0.6,
      fontSize: '0.9rem',
      fontStyle: 'italic',
    },
  };

  const handleSelectFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--primary-color, #68a395)';
  };

  const handleSelectBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--accent-color, #d4e3d9)';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button 
          onClick={loadCategories}
          style={{
            ...styles.addCustomButton,
            borderStyle: 'solid',
            borderColor: '#e74c3c',
            color: '#e74c3c',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Group categories
  const systemCategories = categories.filter(c => c.category_type === 'system_default');
  const customCategories = categories.filter(c => c.category_type === 'custom');
  const guidingValueCategories = categories.filter(c => c.category_type === 'guiding_value');

  return (
    <div style={styles.container}>
      <div style={styles.selectContainer}>
        <select
          style={styles.select}
          value={selectedCategoryId || ''}
          onChange={(e) => onCategoryChange(e.target.value || null)}
          onFocus={handleSelectFocus}
          onBlur={handleSelectBlur}
          disabled={disabled}
          required={isRequired}
        >
          <option value="">
            {isRequired ? 'Select a category...' : 'No category (optional)'}
          </option>
          
          {systemCategories.length > 0 && (
            <optgroup label="System Categories" style={styles.optgroup}>
              {systemCategories.map(category => (
                <option key={category.id} value={category.id} style={styles.option}>
                  {category.icon} {category.display_name}
                </option>
              ))}
            </optgroup>
          )}
          
          {customCategories.length > 0 && (
            <optgroup label="Custom Categories" style={styles.optgroup}>
              {customCategories.map(category => (
                <option key={category.id} value={category.id} style={styles.option}>
                  {category.icon} {category.display_name}
                </option>
              ))}
            </optgroup>
          )}
          
          {guidingValueCategories.length > 0 && (
            <optgroup label="Guiding Values" style={styles.optgroup}>
              {guidingValueCategories.map(category => (
                <option key={category.id} value={category.id} style={styles.option}>
                  {category.icon} {category.display_name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        
        <ChevronDown size={16} style={styles.chevron} />
      </div>
      
      {showAddCustom && onAddCustom && (
        <button 
          type="button"
          onClick={onAddCustom}
          style={styles.addCustomButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(104, 163, 149, 0.1)';
            e.currentTarget.style.borderColor = 'var(--primary-color, #68a395)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.borderColor = 'var(--accent-color, #d4e3d9)';
          }}
        >
          <Plus size={14} />
          Add custom category
        </button>
      )}
    </div>
  );
};

export default CategorySelector;