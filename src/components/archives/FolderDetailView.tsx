// src/components/archives/FolderDetailView.tsx - Full folder view/edit modal
import React, { useState, useEffect } from 'react';
import { X, Upload, Edit2, Plus } from 'lucide-react';
import { ContextItemRow } from './ContextItemRow';
import { LilaInterviewModal } from './LilaInterviewModal';
import { CoverPhotoUpload } from './CoverPhotoUpload';
import { archivesService } from '../../lib/archivesService';
import type { ArchiveFolder, ArchiveContextItem } from '../../types/archives';

interface FolderDetailViewProps {
  folder: ArchiveFolder;
  onClose: () => void;
  onUpdate: () => void;
}

export function FolderDetailView({ folder, onClose, onUpdate }: FolderDetailViewProps) {
  const [contextItems, setContextItems] = useState<ArchiveContextItem[]>([]);
  const [showInterview, setShowInterview] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [folderName, setFolderName] = useState(folder.folder_name);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContextItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder.id]);

  async function loadContextItems() {
    try {
      const items = await archivesService.getContextItems(folder.id);
      setContextItems(items);
    } catch (error) {
      console.error('Error loading context items:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleContext(itemId: string, currentValue: boolean) {
    try {
      await archivesService.toggleContextUsage(itemId, currentValue);
      loadContextItems();
    } catch (error) {
      console.error('Error toggling context:', error);
    }
  }

  async function handleUpdateContextValue(itemId: string, newValue: string) {
    try {
      await archivesService.updateContextItem(itemId, { context_value: newValue });
      loadContextItems();
    } catch (error) {
      console.error('Error updating context:', error);
    }
  }

  async function handleDeleteContextItem(itemId: string) {
    if (window.confirm('Remove this context item?')) {
      try {
        await archivesService.deleteContextItem(itemId);
        loadContextItems();
      } catch (error) {
        console.error('Error deleting context item:', error);
      }
    }
  }

  async function handleSaveName() {
    try {
      await archivesService.updateFolder(folder.id, { folder_name: folderName });
      setEditingName(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating folder name:', error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative">
          {/* Cover Photo */}
          <div
            className="h-64 bg-gradient-to-br from-[#68a395] to-[#5a9285] relative group cursor-pointer"
            onClick={() => setShowPhotoUpload(true)}
          >
            {folder.cover_photo_url ? (
              <img
                src={folder.cover_photo_url}
                alt={folder.folder_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                {folder.icon}
              </div>
            )}

            {/* Upload Overlay on Hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-center">
                <Upload size={32} className="mx-auto mb-2" />
                <p className="text-sm font-medium">Upload Cover Photo</p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
          >
            <X size={24} className="text-[#5a4033]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Folder Name */}
          <div className="mb-6">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="text-3xl font-bold text-[#5a4033] border-b-2 border-[#68a395] outline-none flex-1"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-4 py-2 bg-[#68a395] text-white rounded-lg hover:bg-[#5a9285] transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setFolderName(folder.folder_name);
                    setEditingName(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-[#5a4033] rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-[#5a4033]">
                  {folder.folder_name}
                </h2>
                <button
                  onClick={() => setEditingName(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 size={20} className="text-[#68a395]" />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {folder.folder_type === 'family_member' && (
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setShowInterview(true)}
                className="flex-1 py-3 px-4 bg-[#68a395] text-white rounded-xl font-medium hover:bg-[#5a9285] transition-colors flex items-center justify-center gap-2"
              >
                ✨ Complete LiLa Interview
              </button>
              <button
                onClick={() => {/* Add manual context - could implement later */}}
                className="py-3 px-4 bg-white border-2 border-[#68a395] text-[#68a395] rounded-xl font-medium hover:bg-[#f0f8f6] transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          )}

          {/* Context Items */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-[#5a4033] mb-4">
              Context Information
            </h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin text-3xl mb-2">✨</div>
                <p className="text-gray-600">Loading context...</p>
              </div>
            ) : contextItems.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-600 mb-4">
                  No context yet. Complete the LiLa interview to get started!
                </p>
                {folder.folder_type === 'family_member' && (
                  <button
                    onClick={() => setShowInterview(true)}
                    className="px-6 py-3 bg-[#68a395] text-white rounded-xl font-medium hover:bg-[#5a9285] transition-colors"
                  >
                    Start Interview
                  </button>
                )}
              </div>
            ) : (
              contextItems.map(item => (
                <ContextItemRow
                  key={item.id}
                  item={item}
                  onToggle={(checked) => handleToggleContext(item.id, item.use_for_context)}
                  onUpdate={(value) => handleUpdateContextValue(item.id, value)}
                  onDelete={() => handleDeleteContextItem(item.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInterview && (
        <LilaInterviewModal
          folder={folder}
          onClose={() => setShowInterview(false)}
          onComplete={() => {
            setShowInterview(false);
            loadContextItems();
            onUpdate();
          }}
        />
      )}

      {showPhotoUpload && (
        <CoverPhotoUpload
          folderId={folder.id}
          currentPhotoUrl={folder.cover_photo_url}
          onClose={() => setShowPhotoUpload(false)}
          onUploaded={() => {
            setShowPhotoUpload(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}
