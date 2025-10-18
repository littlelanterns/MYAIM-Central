// src/components/BestIntentions/BestIntentionsModal.tsx
import React, { FC, useState, useEffect, useCallback } from 'react';
import { Heart, Plus, Eye, FileText, Users, Sparkles, Lock, UserCheck, ArrowLeft } from 'lucide-react';
import BrainDumpCoach from './BrainDumpCoach';
import QuickAddForm from './QuickAddForm';
import CategoryFilter from './CategoryFilter';
import IntentionCard from './IntentionCard';
import AddCategoryModal from './AddCategoryModal';
import { useAuthContext } from '../auth/shared/AuthContext';
import { getFamilyIntentions, getIntentionsByCategory, updateIntentionStatus, deleteIntention } from '../../lib/intentions';

interface BestIntentionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = 'landing' | 'view' | 'create';
type IntentionCategory = 'family_relationships' | 'personal_growth' | 'household_culture' | 'spiritual_development';
type PrivacyLevel = 'private' | 'parents_only' | 'family';

// Intention interface for future use when we implement data loading
// interface Intention {
//   id: string;
//   category: IntentionCategory;
//   title: string;
//   current_state: string;
//   desired_state: string;
//   why_it_matters: string;
//   priority: 'high' | 'medium' | 'low';
//   privacy_level: PrivacyLevel;
//   created_by: string;
//   created_at: string;
// }

const BestIntentionsModal: FC<BestIntentionsModalProps> = ({ isOpen, onClose }) => {
  const { state: authState, login } = useAuthContext();
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [selectedPrivacy, setSelectedPrivacy] = useState<PrivacyLevel>('family');
  const [showBrainDump, setShowBrainDump] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  // View mode state
  const [intentions, setIntentions] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  // Auto-login a mock user for testing if not authenticated
  useEffect(() => {
    if (isOpen && !authState.user && !authState.loading) {
      console.log('Auto-logging in mock user for testing...');
      login('test@family.com', 'password');
    }
  }, [isOpen, authState.user, authState.loading, login]);

  const loadIntentions = useCallback(async () => {
    if (!authState.user?.familyId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = selectedCategoryId 
        ? await getIntentionsByCategory(authState.user.familyId, selectedCategoryId)
        : await getFamilyIntentions(authState.user.familyId);
      
      setIntentions(data || []);
    } catch (err) {
      console.error('Error loading intentions:', err);
      setError('Failed to load intentions');
    } finally {
      setLoading(false);
    }
  }, [authState.user?.familyId, selectedCategoryId]);

  const handleStatusChange = async (intentionId: string, status: string) => {
    try {
      await updateIntentionStatus(intentionId, status);
      // Reload intentions to reflect changes
      loadIntentions();
    } catch (err) {
      console.error('Error updating intention status:', err);
    }
  };

  const handleDeleteIntention = async (intentionId: string) => {
    if (!window.confirm('Are you sure you want to delete this intention?')) {
      return;
    }
    
    try {
      await deleteIntention(intentionId);
      // Reload intentions to reflect changes
      loadIntentions();
    } catch (err) {
      console.error('Error deleting intention:', err);
    }
  };

  const handleEditIntention = (intention: any) => {
    // TODO: Implement edit functionality
    console.log('Edit intention:', intention);
  };

  // Load intentions when entering view mode or when category filter changes
  useEffect(() => {
    if (viewMode === 'view' && authState.user?.familyId) {
      loadIntentions();
    }
  }, [viewMode, selectedCategoryId, authState.user?.familyId, loadIntentions]);

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
      justifyContent: 'flex-start',  // ✅ Align left instead of center
      paddingLeft: '2rem',            // ✅ Space from left edge
      zIndex: 2000,                   // ✅ Consistent z-index (not 99999)
      backdropFilter: 'blur(4px)',
    },
    modalContent: {
      background: 'var(--background-color, #fff4ec)',
      borderRadius: '16px',
      maxWidth: '800px',    // ✅ Narrower to leave space for Smart Notepad
      width: '90%',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
      border: '1px solid var(--accent-color, #d4e3d9)',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      padding: '24px',
      borderBottom: '1px solid var(--accent-color, #d4e3d9)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(244, 220, 183, 0.5))',
      textAlign: 'center' as const,
    },
    headerTitle: {
      color: 'var(--primary-color, #68a395)',
      fontSize: '2rem',
      fontFamily: "'The Seasons', 'Playfair Display', serif",
      fontWeight: '600',
      margin: '0 0 8px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
    },
    headerSubtitle: {
      color: 'var(--text-color, #5a4033)',
      fontSize: '1rem',
      opacity: 0.8,
      margin: 0,
      lineHeight: '1.5',
    },
    body: {
      flex: 1,
      padding: '32px',
      overflow: 'auto',
    },
    landingGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      marginBottom: '32px',
    },
    actionCard: {
      background: 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))',
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '12px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'center' as const,
    },
    actionIcon: {
      color: 'var(--primary-color, #68a395)',
      marginBottom: '16px',
    },
    actionTitle: {
      color: 'var(--primary-color, #68a395)',
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: '0 0 8px 0',
    },
    actionDescription: {
      color: 'var(--text-color, #5a4033)',
      fontSize: '0.9rem',
      lineHeight: '1.6',
      opacity: 0.8,
      margin: 0,
    },
    closeButton: {
      position: 'absolute' as const,
      top: '16px',
      right: '16px',
      background: 'none',
      border: 'none',
      color: 'var(--text-color, #5a4033)',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '4px',
      opacity: 0.7,
      transition: 'opacity 0.2s',
    },
    intentionInfo: {
      background: 'rgba(104, 163, 149, 0.1)',
      border: '1px solid rgba(104, 163, 149, 0.2)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
    },
    intentionTitle: {
      color: 'var(--primary-color, #68a395)',
      fontSize: '1.5rem',
      fontWeight: '600',
      margin: '0 0 16px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    intentionText: {
      color: 'var(--text-color, #5a4033)',
      fontSize: '1rem',
      lineHeight: '1.6',
      margin: '0 0 16px 0',
    },
    categoryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginTop: '24px',
    },
    categoryCard: {
      background: 'rgba(255, 255, 255, 0.6)',
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center' as const,
      fontSize: '0.9rem',
      color: 'var(--text-color, #5a4033)',
    },
  };

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.transform = 'translateY(-4px)';
    target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
    target.style.background = 'var(--gradient-primary, linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461)))';
    
    const title = target.querySelector('[data-title]') as HTMLElement;
    const description = target.querySelector('[data-description]') as HTMLElement;
    if (title) title.style.color = 'white';
    if (description) description.style.color = 'rgba(255,255,255,0.9)';
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.transform = 'translateY(0)';
    target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    target.style.background = 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))';
    
    const title = target.querySelector('[data-title]') as HTMLElement;
    const description = target.querySelector('[data-description]') as HTMLElement;
    if (title) title.style.color = 'var(--primary-color, #68a395)';
    if (description) description.style.color = 'var(--text-color, #5a4033)';
  };

  const renderLandingView = () => (
    <>
      <div style={styles.intentionInfo}>
        <h3 style={styles.intentionTitle}>
          What are Best Intentions?
        </h3>
        <p style={styles.intentionText}>
          Best Intentions are the priorities and goals you want to keep front of mind. 
          They help LiLa™ understand what you're working toward – whether it's personal 
          growth, relationships, household harmony, or the life you're building – so 
          every interaction supports your journey.
        </p>
        <p style={styles.intentionText}>
          Whether it's strengthening relationships, developing new habits, supporting 
          your kids' growth, or creating the culture you envision, your Best Intentions 
          help LiLa™ recognize opportunities and offer timely guidance when you need it most.
        </p>
      </div>

      <div style={styles.landingGrid}>
        <div 
          style={styles.actionCard}
          onClick={() => setViewMode('view')}
          onMouseEnter={handleCardHover}
          onMouseLeave={handleCardLeave}
        >
          <Eye size={48} style={styles.actionIcon} />
          <h3 style={styles.actionTitle} data-title>View & Manage</h3>
          <p style={styles.actionDescription} data-description>
            See all your family's intentions, track progress, and update existing goals
          </p>
        </div>

        <div 
          style={styles.actionCard}
          onClick={() => setViewMode('create')}
          onMouseEnter={handleCardHover}
          onMouseLeave={handleCardLeave}
        >
          <Plus size={48} style={styles.actionIcon} />
          <h3 style={styles.actionTitle} data-title>Create New</h3>
          <p style={styles.actionDescription} data-description>
            Add a new Best Intention through guided reflection or quick entry
          </p>
        </div>
      </div>

      <div style={styles.categoryGrid}>
        <div style={styles.categoryCard}>
          <Users size={24} style={{ color: 'var(--primary-color, #68a395)', marginBottom: '8px' }} />
          <div><strong>Family Relationships</strong></div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Connection, communication, bonding</div>
        </div>
        <div style={styles.categoryCard}>
          <Sparkles size={24} style={{ color: 'var(--secondary-color, #d6a461)', marginBottom: '8px' }} />
          <div><strong>Personal Growth</strong></div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Skills, habits, self-improvement</div>
        </div>
        <div style={styles.categoryCard}>
          <FileText size={24} style={{ color: 'var(--primary-color, #68a395)', marginBottom: '8px' }} />
          <div><strong>Household Culture</strong></div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Traditions, values, environment</div>
        </div>
        <div style={styles.categoryCard}>
          <Heart size={24} style={{ color: 'var(--secondary-color, #d6a461)', marginBottom: '8px' }} />
          <div><strong>Spiritual Development</strong></div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Faith, meaning, inner growth</div>
        </div>
      </div>
    </>
  );

  const renderViewMode = () => {
    const viewStyles = {
      container: {
        display: 'flex',
        gap: '24px',
        height: '60vh',
      },
      sidebar: {
        width: '280px',
        flexShrink: 0,
      },
      mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        minWidth: 0,
      },
      header: {
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--accent-color, #d4e3d9)',
      },
      title: {
        color: 'var(--primary-color, #68a395)',
        fontSize: '1.5rem',
        margin: '0 0 8px 0',
        fontWeight: '600',
      },
      subtitle: {
        color: 'var(--text-color, #5a4033)',
        opacity: 0.8,
        margin: 0,
        fontSize: '0.95rem',
      },
      intentionsArea: {
        flex: 1,
        overflow: 'auto',
        padding: '4px', // Small padding for scroll shadow
      },
      loadingState: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: 'var(--text-color, #5a4033)',
        opacity: 0.6,
      },
      errorState: {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: '#e74c3c',
        textAlign: 'center' as const,
      },
      emptyState: {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
        color: 'var(--text-color, #5a4033)',
        opacity: 0.6,
        textAlign: 'center' as const,
      },
      createButton: {
        background: 'var(--primary-color, #68a395)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '0.9rem',
        cursor: 'pointer',
        marginTop: '16px',
        transition: 'opacity 0.2s',
      },
      retryButton: {
        background: 'none',
        border: '1px solid #e74c3c',
        borderRadius: '8px',
        padding: '8px 16px',
        fontSize: '0.85rem',
        color: '#e74c3c',
        cursor: 'pointer',
        marginTop: '12px',
        transition: 'all 0.2s',
      },
    };

    return (
      <div style={viewStyles.container}>
        {/* Sidebar with category filter */}
        <div style={viewStyles.sidebar}>
          <CategoryFilter
            familyId={authState.user?.familyId || ''}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={setSelectedCategoryId}
            onAddCustom={() => setShowAddCategoryModal(true)}
            showCounts={true}
          />
        </div>

        {/* Main content area */}
        <div style={viewStyles.mainContent}>
          <div style={viewStyles.header}>
            <h3 style={viewStyles.title}>
              {selectedCategoryId ? 'Filtered Intentions' : 'All Family Intentions'}
            </h3>
            <p style={viewStyles.subtitle}>
              {selectedCategoryId 
                ? 'Showing intentions for the selected category'
                : 'View and manage your family\'s intentions'}
            </p>
          </div>

          <div style={viewStyles.intentionsArea}>
            {loading && (
              <div style={viewStyles.loadingState}>
                Loading intentions...
              </div>
            )}

            {error && (
              <div style={viewStyles.errorState}>
                <p>{error}</p>
                <button 
                  style={viewStyles.retryButton}
                  onClick={loadIntentions}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && intentions.length === 0 && (
              <div style={viewStyles.emptyState}>
                <Eye size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
                <p style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '500' }}>
                  {selectedCategoryId ? 'No intentions in this category' : 'No intentions found'}
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  {selectedCategoryId 
                    ? 'Try selecting a different category or create a new intention.'
                    : 'Create your first Best Intention to get started!'}
                </p>
                <button 
                  style={viewStyles.createButton}
                  onClick={() => setViewMode('create')}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <Plus size={16} style={{ marginRight: '6px' }} />
                  Create Intention
                </button>
              </div>
            )}

            {!loading && !error && intentions.length > 0 && (
              <div>
                {intentions.map(intention => (
                  <IntentionCard
                    key={intention.id}
                    intention={intention}
                    onEdit={handleEditIntention}
                    onDelete={handleDeleteIntention}
                    onStatusChange={handleStatusChange}
                    currentUserId={authState.user?.id?.toString()}
                    isCompact={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCreateMode = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h3 style={{ color: 'var(--primary-color, #68a395)', fontSize: '1.5rem', margin: '0 0 8px 0' }}>
          Create New Best Intention
        </h3>
        <p style={{ color: 'var(--text-color, #5a4033)', opacity: 0.8, margin: 0 }}>
          First, choose who can see this intention
        </p>
      </div>

      {/* Privacy Level Selector */}
      <div style={{ 
        background: 'rgba(104, 163, 149, 0.1)', 
        border: '1px solid rgba(104, 163, 149, 0.2)', 
        borderRadius: '12px', 
        padding: '24px', 
        marginBottom: '32px',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '16px',
          color: 'var(--primary-color, #68a395)',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          <Lock size={20} />
          Who can see this intention?
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '12px' 
        }}>
          <div 
            onClick={() => setSelectedPrivacy('family')}
            style={{
              background: selectedPrivacy === 'family' ? 'var(--primary-color, #68a395)' : 'white',
              color: selectedPrivacy === 'family' ? 'white' : 'var(--text-color, #5a4033)',
              border: `2px solid ${selectedPrivacy === 'family' ? 'var(--primary-color, #68a395)' : 'var(--accent-color, #d4e3d9)'}`,
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center' as const,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <UserCheck size={24} style={{ 
              marginBottom: '8px', 
              color: selectedPrivacy === 'family' ? 'white' : 'var(--primary-color, #68a395)' 
            }} />
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Family</div>
            <div style={{ fontSize: '0.8rem', opacity: selectedPrivacy === 'family' ? 0.9 : 0.7 }}>Everyone can see</div>
          </div>
          
          <div 
            onClick={() => setSelectedPrivacy('parents_only')}
            style={{
              background: selectedPrivacy === 'parents_only' ? 'var(--primary-color, #68a395)' : 'white',
              color: selectedPrivacy === 'parents_only' ? 'white' : 'var(--text-color, #5a4033)',
              border: `2px solid ${selectedPrivacy === 'parents_only' ? 'var(--primary-color, #68a395)' : 'var(--accent-color, #d4e3d9)'}`,
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center' as const,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Users size={24} style={{ 
              marginBottom: '8px', 
              color: selectedPrivacy === 'parents_only' ? 'white' : 'var(--primary-color, #68a395)' 
            }} />
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Parents Only</div>
            <div style={{ fontSize: '0.8rem', opacity: selectedPrivacy === 'parents_only' ? 0.9 : 0.7 }}>Mom, Dad, Guardians</div>
          </div>
          
          <div 
            onClick={() => setSelectedPrivacy('private')}
            style={{
              background: selectedPrivacy === 'private' ? 'var(--primary-color, #68a395)' : 'white',
              color: selectedPrivacy === 'private' ? 'white' : 'var(--text-color, #5a4033)',
              border: `2px solid ${selectedPrivacy === 'private' ? 'var(--primary-color, #68a395)' : 'var(--accent-color, #d4e3d9)'}`,
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center' as const,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Lock size={24} style={{ 
              marginBottom: '8px', 
              color: selectedPrivacy === 'private' ? 'white' : 'var(--primary-color, #68a395)' 
            }} />
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Private</div>
            <div style={{ fontSize: '0.8rem', opacity: selectedPrivacy === 'private' ? 0.9 : 0.7 }}>Only you (+ Mom)</div>
          </div>
        </div>
      </div>

      {/* Creation Method Selector */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ 
          color: 'var(--primary-color, #68a395)', 
          fontSize: '1.1rem', 
          fontWeight: '600',
          margin: '0 0 16px 0',
          textAlign: 'center' as const
        }}>
          How would you like to create it?
        </h4>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          <div 
            style={styles.actionCard} 
            onClick={() => setShowQuickAdd(true)}
            onMouseEnter={handleCardHover} 
            onMouseLeave={handleCardLeave}
          >
            <Plus size={48} style={styles.actionIcon} />
            <h3 style={styles.actionTitle} data-title>Quick Add</h3>
            <p style={styles.actionDescription} data-description>
              Already know what you want? Add your intention directly with a simple form
            </p>
          </div>

          <div 
            style={styles.actionCard} 
            onClick={() => setShowBrainDump(true)}
            onMouseEnter={handleCardHover} 
            onMouseLeave={handleCardLeave}
          >
            <FileText size={48} style={styles.actionIcon} />
            <h3 style={styles.actionTitle} data-title>Brain Dump</h3>
            <p style={styles.actionDescription} data-description>
              Dump your thoughts and I'll help you organize them into focused intentions
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button 
          style={styles.closeButton}
          onClick={onClose}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
        >
          ×
        </button>

        <div style={styles.header}>
          <h2 style={styles.headerTitle}>
            Best Intentions
          </h2>
          <p style={styles.headerSubtitle}>
            {viewMode === 'landing' && "Your compass for what matters most"}
            {viewMode === 'view' && "Your family's intentions and goals"}
            {viewMode === 'create' && "Create a new intention for your family"}
          </p>
        </div>

        <div style={{
          ...styles.body,
          ...(viewMode === 'view' ? { padding: '24px' } : {})
        }}>
          {viewMode === 'landing' && renderLandingView()}
          {viewMode === 'view' && renderViewMode()}
          {viewMode === 'create' && renderCreateMode()}
          
          {viewMode !== 'landing' && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button 
                onClick={() => {
                  setViewMode('landing');
                  setSelectedCategoryId(null);
                  setIntentions([]);
                }}
                style={{
                  background: 'none',
                  border: '1px solid var(--accent-color, #d4e3d9)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  color: 'var(--text-color, #5a4033)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  margin: '0 auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-color, #d4e3d9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                <ArrowLeft size={16} />
                Back to Overview
              </button>
            </div>
          )}
        </div>
      </div>

      <BrainDumpCoach 
        isOpen={showBrainDump}
        onClose={() => {
          setShowBrainDump(false);
          // When Brain Dump closes, go back to main modal
        }}
        onBack={() => setShowBrainDump(false)}
        selectedPrivacy={selectedPrivacy}
      />

      <QuickAddForm 
        isOpen={showQuickAdd}
        onClose={() => {
          setShowQuickAdd(false);
          // When Quick Add closes, go back to main modal
        }}
        onBack={() => setShowQuickAdd(false)}
        selectedPrivacy={selectedPrivacy}
        familyId={authState.user?.familyId || ''}
        onSuccess={() => {
          // Refresh intentions data if we're in view mode
          if (viewMode === 'view') {
            loadIntentions();
          }
        }}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onCategoryAdded={(newCategory) => {
          console.log('New category added:', newCategory);
          setShowAddCategoryModal(false);
          // Refresh the view if we're in view mode to show updated category list
          if (viewMode === 'view') {
            // Force a re-render of the CategoryFilter by triggering a slight delay
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        }}
      />
    </div>
  );
};

export default BestIntentionsModal;