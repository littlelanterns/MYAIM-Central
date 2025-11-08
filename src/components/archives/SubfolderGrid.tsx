// src/components/archives/SubfolderGrid.tsx - Display subfolders in expandable sections
import React, { useState, useEffect } from 'react';
import { FolderCard } from './FolderCard';
import { FolderDetailView } from './FolderDetailView';
import { AddFamilyMemberModal } from './AddFamilyMemberModal';
import { LilaInterviewModal } from './LilaInterviewModal';
import { archivesService } from '../../lib/archivesService';
import type { ArchiveFolder } from '../../types/archives';

interface SubfolderGridProps {
  masterFolder: ArchiveFolder;
  subfolders: ArchiveFolder[];
  onRefresh: () => void;
  onCreateNew: () => void;
}

export function SubfolderGrid({
  masterFolder,
  subfolders,
  onRefresh,
  onCreateNew
}: SubfolderGridProps) {
  const [selectedFolder, setSelectedFolder] = useState<ArchiveFolder | null>(null);
  const [localFolders, setLocalFolders] = useState<ArchiveFolder[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberId, setNewMemberId] = useState<string | null>(null);
  const [showInterviewForNew, setShowInterviewForNew] = useState(false);

  // Sort folders by updated_at (most recent first) unless user has manually reordered
  useEffect(() => {
    const sortedFolders = [...subfolders].sort((a, b) => {
      // First priority: manual sort_order if set
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      // Second priority: most recently updated
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA; // Most recent first
    });
    setLocalFolders(sortedFolders);
  }, [subfolders]);

  // Determine if this master folder allows custom subfolders
  const canCreateCustom =
    masterFolder.folder_type === 'master_personal' ||
    masterFolder.folder_type === 'master_extended_family';

  // Determine if this is the Family master folder
  const isFamilyMaster = masterFolder.folder_type === 'master_family';

  async function handleMemberCreated(memberId: string, memberName: string, startInterview: boolean) {
    setShowAddMember(false);

    if (startInterview) {
      // Start interview after folder is created
      setNewMemberId(memberId);
      // Wait for folder to be created by trigger
      setTimeout(() => {
        setShowInterviewForNew(true);
      }, 1000);
    }

    // Refresh the folder list
    onRefresh();
  }

  // Drag and drop handlers
  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    // Reorder folders
    const newFolders = [...localFolders];
    const draggedFolder = newFolders[draggedIndex];
    newFolders.splice(draggedIndex, 1);
    newFolders.splice(index, 0, draggedFolder);

    setLocalFolders(newFolders);
    setDraggedIndex(index);
  }

  async function handleDragEnd() {
    if (draggedIndex === null) return;

    // Save new order to database
    const updates = localFolders.map((folder, index) => ({
      id: folder.id,
      sort_order: index
    }));

    try {
      await archivesService.updateFolderSortOrder(updates);
      onRefresh();
    } catch (error) {
      console.error('Error saving folder order:', error);
    }

    setDraggedIndex(null);
  }

  // Smart column calculation: find best fit for 1, 2, 3, or 4 columns
  // Prefer LARGEST remainder to avoid lonely single cards at the bottom
  function getOptimalColumns() {
    const count = localFolders.length;
    if (count === 0) return 3;
    if (count === 1) return 1;
    if (count === 2) return 2;

    // Calculate remainders for each option
    const options = [
      { cols: 4, remainder: count % 4 },
      { cols: 3, remainder: count % 3 },
      { cols: 2, remainder: count % 2 }
    ];

    // First check if any option divides evenly (remainder = 0)
    const perfectDivision = options.find(opt => opt.remainder === 0);
    if (perfectDivision) return perfectDivision.cols;

    // Otherwise, sort by remainder (descending - largest first), then by columns (descending)
    options.sort((a, b) => {
      if (a.remainder !== b.remainder) return b.remainder - a.remainder; // Largest remainder wins
      return b.cols - a.cols; // Prefer higher column count on tie
    });

    return options[0].cols;
  }

  const styles: Record<string, React.CSSProperties> = {
    grid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${getOptimalColumns()}, 1fr)`,
      gap: '1.5rem'
    },
    dragItem: {
      transition: 'opacity 0.2s'
    },
    addButton: {
      position: 'relative',
      borderRadius: '16px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: 'linear-gradient(135deg, rgba(104,163,149,0.1), rgba(104,163,149,0.05))',
      border: '2px dashed rgba(104,163,149,0.3)',
      paddingBottom: '100%', // aspect-square
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    addButtonContent: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center' as const,
      width: '100%',
      padding: '1rem'
    },
    addIcon: {
      fontSize: '4rem',
      color: 'var(--primary-color, #68a395)',
      marginBottom: '1rem'
    },
    addTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: 'var(--primary-color, #68a395)',
      marginBottom: '0.5rem'
    },
    addSubtitle: {
      fontSize: '0.875rem',
      color: 'var(--text-color, #5a4033)',
      opacity: 0.7
    },
    emptyState: {
      gridColumn: '1 / -1',
      textAlign: 'center' as const,
      padding: '3rem',
      background: 'white',
      borderRadius: '12px'
    },
    emptyText: {
      color: 'var(--text-color, #5a4033)',
      opacity: 0.6,
      fontSize: '1.125rem',
      margin: 0
    },
    emptySubtext: {
      color: 'var(--text-color, #5a4033)',
      opacity: 0.4,
      fontSize: '0.875rem',
      marginTop: '0.5rem'
    }
  };

  return (
    <>
      <div style={styles.grid}>
        {/* Existing Subfolders */}
        {localFolders.map((folder, index) => (
          <div
            key={folder.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            style={{
              ...styles.dragItem,
              opacity: draggedIndex === index ? 0.5 : 1
            }}
          >
            <FolderCard
              folder={folder}
              onClick={() => setSelectedFolder(folder)}
              onRefresh={onRefresh}
            />
          </div>
        ))}

        {/* Add Family Member Button (for Family master) */}
        {isFamilyMaster && (
          <div
            onClick={() => setShowAddMember(true)}
            style={styles.addButton}
          >
            <div style={styles.addButtonContent}>
              <div style={styles.addIcon}>⊕</div>
              <p style={styles.addTitle}>
                Add Family Member
              </p>
              <p style={styles.addSubtitle}>
                Add someone to your family
              </p>
            </div>
          </div>
        )}

        {/* Add New Button (for custom folders) */}
        {canCreateCustom && (
          <div
            onClick={onCreateNew}
            style={styles.addButton}
          >
            <div style={styles.addButtonContent}>
              <div style={styles.addIcon}>⊕</div>
              <p style={styles.addTitle}>
                Add New
              </p>
              <p style={styles.addSubtitle}>
                Create a custom folder
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {subfolders.length === 0 && !canCreateCustom && !isFamilyMaster && (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              No folders yet
            </p>
            {masterFolder.folder_type === 'master_family' && (
              <p style={styles.emptySubtext}>
                Family member folders will appear here automatically
              </p>
            )}
            {masterFolder.folder_type === 'master_best_intentions' && (
              <p style={styles.emptySubtext}>
                Best Intentions will appear here when you create them
              </p>
            )}
          </div>
        )}
      </div>

      {/* Folder Detail Modal */}
      {selectedFolder && (
        <FolderDetailView
          folder={selectedFolder}
          onClose={() => setSelectedFolder(null)}
          onUpdate={() => {
            setSelectedFolder(null);
            onRefresh();
          }}
        />
      )}

      {/* Add Family Member Modal */}
      {showAddMember && (
        <AddFamilyMemberModal
          familyId={masterFolder.family_id}
          onClose={() => setShowAddMember(false)}
          onCreated={(memberId, memberName) => {
            handleMemberCreated(memberId, memberName, true);
          }}
        />
      )}

      {/* Interview Modal for New Member */}
      {showInterviewForNew && newMemberId && (
        <LilaInterviewModal
          folder={localFolders.find(f => f.member_id === newMemberId)!}
          onClose={() => {
            setShowInterviewForNew(false);
            setNewMemberId(null);
          }}
          onComplete={() => {
            setShowInterviewForNew(false);
            setNewMemberId(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
