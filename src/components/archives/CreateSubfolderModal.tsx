// src/components/archives/CreateSubfolderModal.tsx - Create subfolder under master folder
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { archivesService } from '../../lib/archivesService';

interface CreateSubfolderModalProps {
  parentFolderId: string;
  parentFolderType: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateSubfolderModal({
  parentFolderId,
  parentFolderType,
  onClose,
  onCreated
}: CreateSubfolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📁');
  const [selectedColor, setSelectedColor] = useState('#68a395');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Determine folder type and icon options based on parent
  const isExtendedFamily = parentFolderType === 'master_extended_family';
  const isPersonal = parentFolderType === 'master_personal';

  const iconOptions = isExtendedFamily
    ? ['👨', '👩', '👴', '👵', '👦', '👧', '👶', '👨‍👩‍👧', '👨‍👨‍👧', '👩‍👩‍👦', '👨‍👩‍👧‍👦']
    : ['📁', '📂', '📚', '✏️', '💼', '🏠', '🎨', '🎯', '💡', '🔬', '🎭', '🌱', '📖', '🏫'];

  const colorOptions = [
    '#68a395', '#d4a661', '#e07a5f', '#81b29a', '#f2cc8f',
    '#9b5de5', '#00bbf9', '#00f5d4', '#fee440', '#f15bb5'
  ];

  async function handleCreate() {
    if (!folderName.trim()) {
      setError('Please enter a folder name');
      return;
    }

    setCreating(true);
    setError('');

    try {
      // Determine the correct folder type
      const folderType = isExtendedFamily ? 'extended_family_member' : 'custom_project';

      await archivesService.createSubfolder({
        parent_folder_id: parentFolderId,
        folder_name: folderName.trim(),
        folder_type: folderType,
        icon: selectedIcon,
        description: description.trim() || undefined,
        color_hex: selectedColor
      });

      onCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create folder');
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#5a4033]">
              {isExtendedFamily ? 'Add Extended Family Member' : 'Create New Folder'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Folder Name */}
          <div>
            <label className="block text-sm font-semibold text-[#5a4033] mb-2">
              {isExtendedFamily ? 'Name' : 'Folder Name'} *
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder={
                isExtendedFamily
                  ? 'e.g., Grandma Joan, Uncle Mike, Cousin Sarah'
                  : 'e.g., Homeschool Planning, Book Project, Business Ideas'
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#68a395] transition-colors"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#5a4033] mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isExtendedFamily
                  ? 'e.g., My mom, lives in Florida, retired teacher'
                  : 'What is this folder for?'
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#68a395] transition-colors resize-none"
              rows={3}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#5a4033] mb-2">
              Choose an Icon
            </label>
            <div className="grid grid-cols-7 gap-2">
              {iconOptions.map(icon => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`text-3xl p-2 rounded-lg transition-all ${
                    selectedIcon === icon
                      ? 'bg-[#68a395] ring-2 ring-[#68a395] ring-offset-2 scale-110'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          {!isExtendedFamily && (
            <div>
              <label className="block text-sm font-semibold text-[#5a4033] mb-2">
                Choose a Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      selectedColor === color
                        ? 'ring-4 ring-offset-2 ring-gray-400 scale-110'
                        : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={creating}
            className="flex-1 py-3 px-6 bg-gray-200 text-[#5a4033] rounded-xl font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !folderName.trim()}
            className="flex-1 py-3 px-6 bg-[#68a395] text-white rounded-xl font-medium hover:bg-[#5a9285] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : isExtendedFamily ? 'Add Person' : 'Create Folder'}
          </button>
        </div>
      </div>
    </div>
  );
}
