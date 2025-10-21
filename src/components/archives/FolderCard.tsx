// src/components/archives/FolderCard.tsx - Individual folder card in grid
import React, { useEffect, useState } from 'react';
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

  // Helper to darken/lighten color for gradients
  function adjustColor(color: string, amount: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  // Calculate completeness
  const totalFields = 5; // personality, interests, learning_style, challenges, strengths
  const filledFields = contextItems.filter(
    item => item.context_value !== 'Complete LiLa interview to add' && item.use_for_context
  ).length || 0;
  const completeness = Math.round((filledFields / totalFields) * 100);

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:scale-105"
    >
      {/* Photo or Gradient Background */}
      <div
        className="relative aspect-square w-full"
        style={{
          background: folder.cover_photo_url
            ? 'none'
            : `linear-gradient(135deg, ${folder.color_hex || '#68a395'} 0%, ${adjustColor(folder.color_hex || '#68a395', -20)} 100%)`
        }}
      >
        {folder.cover_photo_url ? (
          <img
            src={folder.cover_photo_url}
            alt={folder.folder_name}
            className="w-full h-full object-cover"
          />
        ) : null}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

        {/* Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg">
            {folder.folder_name}
          </h3>
          {folder.folder_type === 'family_member' && !loading && (
            <p className="text-white/80 text-sm mt-1">
              {completeness >= 80 ? '✨ Complete' : `${completeness}% complete`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
