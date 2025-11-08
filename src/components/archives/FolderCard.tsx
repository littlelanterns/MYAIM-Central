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
  const [isHovered, setIsHovered] = useState(false);

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

  const styles: Record<string, React.CSSProperties> = {
    card: {
      position: 'relative',
      borderRadius: '16px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      boxShadow: isHovered
        ? '0 20px 40px rgba(0,0,0,0.2)'
        : '0 4px 12px rgba(0,0,0,0.1)'
    },
    background: {
      position: 'relative',
      paddingBottom: '100%', // aspect-square
      width: '100%',
      background: folder.cover_photo_url
        ? 'none'
        : `linear-gradient(135deg, ${folder.color_hex || '#68a395'} 0%, ${adjustColor(folder.color_hex || '#68a395', -20)} 100%)`
    },
    image: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const
    },
    hoverOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isHovered ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0)',
      transition: 'background 0.3s ease'
    },
    nameOverlay: {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
      padding: '1rem'
    },
    name: {
      color: 'white',
      fontWeight: '600',
      fontSize: '1.125rem',
      margin: 0
    },
    completion: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
      margin: 0
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={styles.card}
    >
      {/* Photo or Gradient Background */}
      <div style={styles.background}>
        {folder.cover_photo_url && (
          <img
            src={folder.cover_photo_url}
            alt={folder.folder_name}
            style={styles.image}
          />
        )}

        {/* Hover Overlay */}
        <div style={styles.hoverOverlay} />

        {/* Name Overlay */}
        <div style={styles.nameOverlay}>
          <h3 style={styles.name}>
            {folder.folder_name}
          </h3>
          {folder.folder_type === 'family_member' && !loading && (
            <p style={styles.completion}>
              {completeness >= 80 ? '✨ Complete' : `${completeness}% complete`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
