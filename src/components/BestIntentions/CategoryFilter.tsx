// src/components/BestIntentions/CategoryFilter.tsx
import React, { FC, useState, useEffect } from 'react';
import { Plus, Filter, Check } from 'lucide-react';
import { getFamilyCategories } from '../../lib/categories';
import { getIntentionStats } from '../../lib/intentions';

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

interface CategoryFilterProps {
  familyId: string;
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onAddCustom?: () => void;
  showCounts?: boolean;
}

const CategoryFilter: FC<CategoryFilterProps> = ({
  familyId,
  selectedCategoryId,
  onCategoryChange,
  onAddCustom,
  showCounts = true
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [familyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('CategoryFilter: Loading data for familyId:', familyId);
      
      if (!familyId) {
        setError('No family ID provided');
        return;
      }
      
      const [categoriesData, statsData] = await Promise.all([
        getFamilyCategories(familyId),
        showCounts ? getIntentionStats(familyId) : Promise.resolve({ byCategory: {} })
      ]);
      
      setCategories(categoriesData || []);
      setCategoryCounts(statsData.byCategory || {});
    } catch (err) {
      console.error('Error loading filter data:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      background: 'white',
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '12px',
      padding: '20px',
      height: 'fit-content',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '20px',
      color: 'var(--primary-color, #68a395)',
      fontSize: '1.1rem',
      fontWeight: '600',
    },
    section: {
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: 'var(--text-color, #5a4033)',
      marginBottom: '12px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    categoryList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
    },
    categoryItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: '1px solid transparent',
    },
    categoryItemSelected: {
      background: 'var(--primary-color, #68a395)',
      color: 'white',
      border: '1px solid var(--primary-color, #68a395)',
    },
    categoryItemHover: {
      background: 'rgba(104, 163, 149, 0.1)',
      border: '1px solid rgba(104, 163, 149, 0.2)',
    },
    categoryContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flex: 1,
      minWidth: 0,
    },
    categoryIcon: {
      fontSize: '1rem',
      flexShrink: 0,
    },
    categoryName: {
      fontSize: '0.9rem',
      fontWeight: '500',
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    categoryCount: {
      fontSize: '0.8rem',
      background: 'rgba(255, 255, 255, 0.2)',
      padding: '2px 6px',
      borderRadius: '10px',
      fontWeight: '500',
      flexShrink: 0,
    },
    categoryCountDefault: {
      background: 'rgba(107, 114, 128, 0.1)',
      color: '#6b7280',
    },
    allFilter: {
      fontWeight: '600',
      fontSize: '0.95rem',
    },
    addButton: {
      background: 'none',
      border: '1px dashed var(--accent-color, #d4e3d9)',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '0.85rem',
      color: 'var(--primary-color, #68a395)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'all 0.2s',
      width: '100%',
      marginTop: '12px',
    },
    loading: {
      color: 'var(--text-color, #5a4033)',
      opacity: 0.6,
      fontSize: '0.9rem',
      fontStyle: 'italic',
      textAlign: 'center' as const,
      padding: '20px',
    },
    error: {
      color: '#e74c3c',
      fontSize: '0.85rem',
      textAlign: 'center' as const,
      padding: '12px',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Filter size={18} />
          Filter by Category
        </div>
        <div style={styles.loading}>Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Filter size={18} />
          Filter by Category
        </div>
        <div style={styles.error}>{error}</div>
        <button 
          onClick={loadData}
          style={{
            ...styles.addButton,
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

  const renderCategoryItem = (category: Category | null, label: string, icon?: string) => {
    const isSelected = selectedCategoryId === category?.id;
    const count = category ? categoryCounts[category.id] || 0 : Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
    
    return (
      <div
        key={category?.id || 'all'}
        style={{
          ...styles.categoryItem,
          ...(isSelected ? styles.categoryItemSelected : {}),
        }}
        onClick={() => onCategoryChange(category?.id || null)}
        onMouseEnter={(e) => {
          if (!isSelected) {
            Object.assign(e.currentTarget.style, styles.categoryItemHover);
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.border = '1px solid transparent';
          }
        }}
      >
        <div style={styles.categoryContent}>
          {isSelected && <Check size={14} style={{ marginRight: '4px' }} />}
          <span style={styles.categoryIcon}>
            {icon || category?.icon || '📂'}
          </span>
          <span style={{
            ...styles.categoryName,
            ...(category?.id === null ? styles.allFilter : {})
          }}>
            {label}
          </span>
        </div>
        
        {showCounts && (
          <span style={{
            ...styles.categoryCount,
            ...(isSelected ? {} : styles.categoryCountDefault)
          }}>
            {count}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Filter size={18} />
        Filter by Category
      </div>

      <div style={styles.section}>
        <div style={styles.categoryList}>
          {renderCategoryItem(null, 'All Intentions', '📋')}
        </div>
      </div>

      {systemCategories.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>System Categories</div>
          <div style={styles.categoryList}>
            {systemCategories.map(category => 
              renderCategoryItem(category, category.display_name)
            )}
          </div>
        </div>
      )}

      {customCategories.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Custom Categories</div>
          <div style={styles.categoryList}>
            {customCategories.map(category => 
              renderCategoryItem(category, category.display_name)
            )}
          </div>
        </div>
      )}

      {guidingValueCategories.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Guiding Values</div>
          <div style={styles.categoryList}>
            {guidingValueCategories.map(category => 
              renderCategoryItem(category, category.display_name)
            )}
          </div>
        </div>
      )}

      {onAddCustom && (
        <button 
          style={styles.addButton}
          onClick={onAddCustom}
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
          Add Custom Category
        </button>
      )}
    </div>
  );
};

export default CategoryFilter;