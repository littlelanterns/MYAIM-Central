// src/components/archives/SubfolderGrid.tsx - Display subfolders in expandable sections
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { FolderCard } from './FolderCard';
import { FolderDetailView } from './FolderDetailView';
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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Existing Subfolders */}
        {localFolders.map((folder, index) => (
          <div
            key={folder.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`transition-opacity ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
          >
            <FolderCard
              folder={folder}
              onClick={() => setSelectedFolder(folder)}
              onRefresh={onRefresh}
            />
          </div>
        ))}

        {/* Add New Button (for custom folders) */}
        {canCreateCustom && (
          <div
            onClick={onCreateNew}
            className="bg-white rounded-xl p-6 border-2 border-dashed border-[#d4e3d9] hover:border-[#68a395] hover:bg-[#f0f8f6] cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px]"
          >
            <Plus size={48} className="text-[#68a395] mb-3" />
            <p className="text-lg font-semibold text-[#68a395] mb-1">
              Add New
            </p>
            <p className="text-sm text-gray-600 text-center">
              Create a custom folder
            </p>
          </div>
        )}

        {/* Empty State */}
        {subfolders.length === 0 && !canCreateCustom && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500 text-lg">
              No folders yet
            </p>
            {masterFolder.folder_type === 'master_family' && (
              <p className="text-sm text-gray-400 mt-2">
                Family member folders will appear here automatically
              </p>
            )}
            {masterFolder.folder_type === 'master_best_intentions' && (
              <p className="text-sm text-gray-400 mt-2">
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
    </>
  );
}
