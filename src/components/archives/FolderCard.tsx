// src/components/archives/FolderCard.tsx - Individual folder card in grid
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { archivesService } from '../../lib/archivesService';
import type { ArchiveFolder, ArchiveContextItem } from '../../types/archives';

interface FolderCardProps {
  folder: ArchiveFolder;
  onClick: () => void;
  onRefresh: () => void;
}

export function FolderCard({ folder, onClick, onRefresh }: FolderCardProps) {
  const [contextItems, setContextItems] = useState<ArchiveContextItem[]>([]);
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

  // Calculate completeness
  const totalFields = 5; // personality, interests, learning_style, challenges, strengths
  const filledFields = contextItems.filter(
    item => item.context_value !== 'Complete LiLa interview to add' && item.use_for_context
  ).length || 0;
  const completeness = Math.round((filledFields / totalFields) * 100);

  // Get active context count
  const activeCount = contextItems.filter(
    item => item.use_for_context
  ).length || 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-2 border-transparent hover:border-[#68a395]"
    >
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-br from-[#68a395] to-[#5a9285]">
        {folder.cover_photo_url ? (
          <img
            src={folder.cover_photo_url}
            alt={folder.folder_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {folder.icon}
          </div>
        )}

        {/* Completeness Badge */}
        {folder.folder_type === 'family_member' && !loading && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold">
            {completeness >= 80 ? '✨' : '📝'} {completeness}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-[#5a4033] mb-2">
          {folder.folder_name}
        </h3>

        {folder.description && (
          <p className="text-sm text-gray-600 mb-4">
            {folder.description}
          </p>
        )}

        {/* Context Preview */}
        {!loading && contextItems.length > 0 && (
          <div className="space-y-2 mb-4">
            {contextItems.slice(0, 3).map(item => (
              <div key={item.id} className="text-sm">
                <span className="font-medium text-[#68a395]">
                  {item.context_field}:
                </span>{' '}
                <span className="text-[#5a4033]">
                  {item.context_value.length > 40
                    ? item.context_value.substring(0, 40) + '...'
                    : item.context_value
                  }
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Context Status */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {activeCount > 0 ? (
              <CheckCircle2 size={18} className="text-[#68a395]" />
            ) : (
              <Circle size={18} className="text-gray-400" />
            )}
            <span className="text-sm font-medium text-[#5a4033]">
              {activeCount > 0 ? `${activeCount} items active` : 'Not configured'}
            </span>
          </div>
          <span className="text-xs text-gray-500">Click to edit</span>
        </div>
      </div>
    </div>
  );
}
