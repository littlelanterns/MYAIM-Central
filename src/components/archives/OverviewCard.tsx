// src/components/archives/OverviewCard.tsx
// Auto-generated overview card showing all context items with checkboxes

import React, { useState, useEffect } from 'react';
import { Check, X, Edit2, Trash2, Plus, MessageCircle, Download } from 'lucide-react';
import { archivesService } from '../../lib/archivesService';
import type { ArchiveFolder, ArchiveContextItem } from '../../types/archives';

interface OverviewCardProps {
  folder: ArchiveFolder;
  onRefresh?: () => void;
  onAddContext?: () => void;
  onEditContext?: (item: ArchiveContextItem) => void;
  onDeleteContext?: (itemId: string) => void;
  onStartInterview?: () => void;
  onExportContext?: () => void;
}

export function OverviewCard({
  folder,
  onRefresh,
  onAddContext,
  onEditContext,
  onDeleteContext,
  onStartInterview,
  onExportContext
}: OverviewCardProps) {
  const [items, setItems] = useState<ArchiveContextItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  useEffect(() => {
    loadContextItems();
  }, [folder.id]);

  async function loadContextItems() {
    try {
      const data = await archivesService.getContextItems(folder.id);
      setItems(data);
    } catch (error) {
      console.error('Error loading context items:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleCheckbox(item: ArchiveContextItem) {
    try {
      await archivesService.toggleContextUsage(item.id, item.use_for_context);
      // Optimistic update
      setItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, use_for_context: !i.use_for_context } : i
      ));
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error toggling context usage:', error);
      alert('Failed to update checkbox');
    }
  }

  const activeCount = items.filter(i => i.use_for_context).length;
  const totalCount = items.length;

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-color)' }}>
          Loading context...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>
            {folder.icon} {folder.folder_name}
          </h3>
          <p style={styles.subtitle}>
            {activeCount} of {totalCount} items active for AI context
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            onClick={onStartInterview}
            style={styles.iconButton}
            title="Tell me about..."
          >
            <MessageCircle size={18} />
          </button>
          <button
            onClick={onExportContext}
            style={styles.iconButton}
            title="Export context"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Context Items List */}
      <div style={styles.itemsList}>
        {items.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', opacity: 0.7 }}>
              No context items yet
            </p>
            <button onClick={onAddContext} style={styles.addButton}>
              <Plus size={16} />
              Add Context Item
            </button>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              style={{
                ...styles.item,
                background: hoveredItemId === item.id
                  ? 'var(--accent-color, #d4e3d9)'
                  : 'transparent'
              }}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggleCheckbox(item)}
                style={{
                  ...styles.checkbox,
                  background: item.use_for_context
                    ? 'var(--primary-color, #68a395)'
                    : 'white',
                  border: `2px solid ${item.use_for_context ? 'var(--primary-color, #68a395)' : '#ccc'}`
                }}
              >
                {item.use_for_context && <Check size={14} color="white" />}
              </button>

              {/* Content */}
              <div style={styles.itemContent}>
                <div style={styles.itemField}>{item.context_field}</div>
                <div style={styles.itemValue}>{item.context_value}</div>
                {item.added_by === 'interview' && (
                  <div style={styles.badge}>From Interview</div>
                )}
                {item.suggested_by_lila && (
                  <div style={{ ...styles.badge, background: 'var(--secondary-color, #d6a461)' }}>
                    Suggested by LiLa
                  </div>
                )}
              </div>

              {/* Actions (show on hover) */}
              {hoveredItemId === item.id && (
                <div style={styles.itemActions}>
                  <button
                    onClick={() => onEditContext && onEditContext(item)}
                    style={styles.actionButton}
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this context item?')) {
                        onDeleteContext && onDeleteContext(item.id);
                      }
                    }}
                    style={{ ...styles.actionButton, color: '#d32f2f' }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      {items.length > 0 && (
        <div style={styles.footer}>
          <button onClick={onAddContext} style={styles.addButton}>
            <Plus size={16} />
            Add Context Item
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid var(--accent-color, #d4e3d9)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem',
    borderBottom: '1px solid var(--accent-color, #d4e3d9)',
    background: 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))'
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  title: {
    fontSize: '1.25rem',
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
  iconButton: {
    background: 'white',
    border: '1px solid var(--primary-color, #68a395)',
    borderRadius: '6px',
    padding: '0.5rem',
    cursor: 'pointer',
    color: 'var(--primary-color, #68a395)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  itemsList: {
    padding: '1rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem'
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    transition: 'background 0.2s'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    marginTop: '2px',
    transition: 'all 0.2s'
  },
  itemContent: {
    flex: 1,
    minWidth: 0
  },
  itemField: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--primary-color, #68a395)',
    marginBottom: '0.25rem',
    textTransform: 'capitalize'
  },
  itemValue: {
    fontSize: '0.875rem',
    color: 'var(--text-color, #5a4033)',
    lineHeight: 1.5,
    wordWrap: 'break-word'
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    background: 'var(--primary-color, #68a395)',
    color: 'white',
    marginTop: '0.5rem'
  },
  itemActions: {
    display: 'flex',
    gap: '0.25rem',
    flexShrink: 0
  },
  actionButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--primary-color, #68a395)',
    padding: '0.25rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s'
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--accent-color, #d4e3d9)',
    background: 'var(--background-color, #fff4ec)'
  },
  addButton: {
    background: 'var(--primary-color, #68a395)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  }
};
