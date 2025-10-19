// src/components/archives/CreateCustomFolderModal.tsx - Create custom project folder
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { archivesService } from '../../lib/archivesService';

interface CreateCustomFolderModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const FOLDER_ICONS = ['📚', '💼', '🎨', '📖', '🏠', '🌱', '🎯', '💡', '🔬', '🎭'];
const FOLDER_COLORS = [
  '#68a395', '#d4a661', '#e07a5f', '#81b29a', '#f2cc8f',
  '#9b5de5', '#00bbf9', '#00f5d4', '#fee440', '#f15bb5'
];

export function CreateCustomFolderModal({ onClose, onCreated }: CreateCustomFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(FOLDER_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!folderName.trim()) {
      setError('Please enter a folder name');
      return;
    }

    setError('');
    setCreating(true);

    try {
      const familyId = await archivesService.getCurrentFamilyId();

      await archivesService.createFolder({
        family_id: familyId,
        parent_folder_id: null,
        folder_name: folderName.trim(),
        folder_type: 'custom_project',
        icon: selectedIcon,
        color_hex: selectedColor,
        description: description.trim() || null
      });

      onCreated();
    } catch (err) {
      setError('Failed to create folder. Please try again.');
      console.error('Create folder error:', err);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#5a4033]">
            Create Custom Folder
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Folder Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#5a4033] mb-2">
            Folder Name
          </label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="e.g., Homeschool Curriculum, Book Project, Business"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#68a395] transition-colors"
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#5a4033] mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this folder for?"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#68a395] resize-none transition-colors"
            rows={3}
          />
        </div>

        {/* Icon Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#5a4033] mb-2">
            Choose Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {FOLDER_ICONS.map(icon => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                className={`w-12 h-12 text-2xl rounded-lg transition-all ${
                  selectedIcon === icon
                    ? 'bg-[#68a395] scale-110'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#5a4033] mb-2">
            Choose Color
          </label>
          <div className="flex flex-wrap gap-2">
            {FOLDER_COLORS.map(color => (
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

        {error && (
          <p className="mb-4 text-sm text-red-500">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 text-[#5a4033] rounded-xl font-medium hover:bg-gray-300 transition-colors"
            disabled={creating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !folderName.trim()}
            className="flex-1 px-6 py-3 bg-[#68a395] text-white rounded-xl font-medium hover:bg-[#5a9285] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Folder'}
          </button>
        </div>
      </div>
    </div>
  );
}
