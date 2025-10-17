// src/components/BestIntentions/IntentionCard.tsx
import React, { FC, useState } from 'react';
import { Edit, Trash2, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';

interface Intention {
  id: string;
  title: string;
  current_state: string;
  desired_state: string;
  why_it_matters: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'in_progress' | 'completed' | 'paused';
  privacy_level: 'private' | 'parents_only' | 'family';
  created_at: string;
  created_by: string;
  intention_categories: {
    id: string;
    display_name: string;
    icon: string;
    color_hex: string;
    category_type: string;
  } | null;
}

interface IntentionCardProps {
  intention: Intention;
  onEdit?: (intention: Intention) => void;
  onDelete?: (intentionId: string) => void;
  onStatusChange?: (intentionId: string, status: string) => void;
  currentUserId?: string;
  isCompact?: boolean;
}

const IntentionCard: FC<IntentionCardProps> = ({
  intention,
  onEdit,
  onDelete,
  onStatusChange,
  currentUserId,
  isCompact = false
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const styles = {
    card: {
      background: 'white',
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '12px',
      padding: isCompact ? '16px' : '20px',
      marginBottom: '16px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    cardHover: {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px',
    },
    titleSection: {
      flex: 1,
      minWidth: 0, // Allow text truncation
    },
    title: {
      color: 'var(--primary-color, #68a395)',
      fontSize: isCompact ? '1.1rem' : '1.25rem',
      fontWeight: '600',
      margin: '0 0 8px 0',
      lineHeight: '1.3',
    },
    metaRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap' as const,
      marginBottom: '8px',
    },
    badge: {
      fontSize: '0.75rem',
      fontWeight: '500',
      padding: '4px 8px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    categoryBadge: {
      background: 'rgba(104, 163, 149, 0.1)',
      color: 'var(--primary-color, #68a395)',
      border: '1px solid rgba(104, 163, 149, 0.2)',
    },
    priorityBadge: (priority: string) => ({
      background: priority === 'high' ? '#fee2e2' : priority === 'medium' ? '#fef3c7' : '#f0fdf4',
      color: priority === 'high' ? '#dc2626' : priority === 'medium' ? '#d97706' : '#16a34a',
      border: `1px solid ${priority === 'high' ? '#fecaca' : priority === 'medium' ? '#fde68a' : '#bbf7d0'}`,
    }),
    statusBadge: (status: string) => ({
      background: status === 'completed' ? '#f0fdf4' : status === 'in_progress' ? '#eff6ff' : status === 'paused' ? '#fef3c7' : '#f9fafb',
      color: status === 'completed' ? '#16a34a' : status === 'in_progress' ? '#2563eb' : status === 'paused' ? '#d97706' : '#6b7280',
      border: `1px solid ${status === 'completed' ? '#bbf7d0' : status === 'in_progress' ? '#dbeafe' : status === 'paused' ? '#fde68a' : '#e5e7eb'}`,
    }),
    privacyBadge: {
      background: 'rgba(107, 114, 128, 0.1)',
      color: '#6b7280',
      border: '1px solid rgba(107, 114, 128, 0.2)',
    },
    content: {
      marginBottom: isCompact ? '12px' : '16px',
    },
    section: {
      marginBottom: '12px',
    },
    sectionTitle: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: 'var(--primary-color, #68a395)',
      marginBottom: '4px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    sectionText: {
      fontSize: '0.9rem',
      color: 'var(--text-color, #5a4033)',
      lineHeight: '1.5',
      margin: 0,
    },
    actions: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
    },
    actionButton: {
      background: 'none',
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '6px',
      padding: '6px 12px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: 'var(--text-color, #5a4033)',
    },
    primaryButton: {
      background: 'var(--primary-color, #68a395)',
      color: 'white',
      border: '1px solid var(--primary-color, #68a395)',
    },
    dangerButton: {
      color: '#dc2626',
      borderColor: '#fecaca',
    },
    toggleButton: {
      background: 'none',
      border: 'none',
      color: 'var(--primary-color, #68a395)',
      cursor: 'pointer',
      fontSize: '0.85rem',
      padding: '4px 0',
      textDecoration: 'underline',
    },
    footer: {
      fontSize: '0.75rem',
      color: '#6b7280',
      borderTop: '1px solid #f3f4f6',
      paddingTop: '12px',
      marginTop: '16px',
    },
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle size={12} />;
      case 'medium': return <Clock size={12} />;
      case 'low': return <CheckCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={12} />;
      case 'in_progress': return <Clock size={12} />;
      case 'paused': return <AlertCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const getPrivacyLabel = (privacy: string) => {
    switch (privacy) {
      case 'family': return 'Family';
      case 'parents_only': return 'Parents Only';
      case 'private': return 'Private';
      default: return privacy;
    }
  };

  const canUserEdit = () => {
    return currentUserId && (currentUserId === intention.created_by || intention.privacy_level !== 'private');
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div 
      style={styles.card}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, styles.cardHover);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h3 style={styles.title}>{intention.title}</h3>
          
          <div style={styles.metaRow}>
            {intention.intention_categories && (
              <span style={{ ...styles.badge, ...styles.categoryBadge }}>
                <span>{intention.intention_categories.icon}</span>
                {intention.intention_categories.display_name}
              </span>
            )}
            
            <span style={{ ...styles.badge, ...styles.priorityBadge(intention.priority) }}>
              {getPriorityIcon(intention.priority)}
              {intention.priority.charAt(0).toUpperCase() + intention.priority.slice(1)}
            </span>
            
            <span style={{ ...styles.badge, ...styles.statusBadge(intention.status) }}>
              {getStatusIcon(intention.status)}
              {intention.status.replace('_', ' ').charAt(0).toUpperCase() + intention.status.replace('_', ' ').slice(1)}
            </span>
            
            <span style={{ ...styles.badge, ...styles.privacyBadge }}>
              <User size={12} />
              {getPrivacyLabel(intention.privacy_level)}
            </span>
          </div>
        </div>
      </div>

      {!isCompact && (
        <div style={styles.content}>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Current State</div>
            <p style={styles.sectionText}>
              {showFullDescription 
                ? intention.current_state 
                : truncateText(intention.current_state, 150)}
            </p>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Desired State</div>
            <p style={styles.sectionText}>
              {showFullDescription 
                ? intention.desired_state 
                : truncateText(intention.desired_state, 150)}
            </p>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Why It Matters</div>
            <p style={styles.sectionText}>
              {showFullDescription 
                ? intention.why_it_matters 
                : truncateText(intention.why_it_matters, 150)}
            </p>
          </div>

          {(intention.current_state.length > 150 || 
            intention.desired_state.length > 150 || 
            intention.why_it_matters.length > 150) && (
            <button 
              style={styles.toggleButton}
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      <div style={styles.actions}>
        {onStatusChange && (
          <>
            {intention.status !== 'completed' && (
              <button 
                style={{ ...styles.actionButton, ...styles.primaryButton }}
                onClick={() => onStatusChange(intention.id, 'completed')}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <CheckCircle size={14} />
                Mark Complete
              </button>
            )}
            
            {intention.status === 'active' && (
              <button 
                style={styles.actionButton}
                onClick={() => onStatusChange(intention.id, 'in_progress')}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-color, #d4e3d9)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <Clock size={14} />
                Start Progress
              </button>
            )}
          </>
        )}

        {onEdit && canUserEdit() && (
          <button 
            style={styles.actionButton}
            onClick={() => onEdit(intention)}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-color, #d4e3d9)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <Edit size={14} />
            Edit
          </button>
        )}

        {onDelete && canUserEdit() && (
          <button 
            style={{ ...styles.actionButton, ...styles.dangerButton }}
            onClick={() => onDelete(intention.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}
      </div>

      <div style={styles.footer}>
        Created {formatDate(intention.created_at)}
      </div>
    </div>
  );
};

export default IntentionCard;