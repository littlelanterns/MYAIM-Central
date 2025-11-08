// src/pages/Archives.tsx - Archives with Command Center style cards
import React, { useState, useEffect, CSSProperties } from 'react';
import { Download } from 'lucide-react';
import { SubfolderGrid } from '../components/archives/SubfolderGrid';
import { CreateSubfolderModal } from '../components/archives/CreateSubfolderModal';
import { ContextExportModal } from '../components/archives/ContextExportModal';
import { archivesService } from '../lib/archivesService';
import type { ArchiveFolder } from '../types/archives';
import {
  GoldThumbtack,
  CrayonStar
} from '../components/decorations/ScrapbookDecorations';

export default function Archives() {
  const [masterFolders, setMasterFolders] = useState<ArchiveFolder[]>([]);
  const [expandedMaster, setExpandedMaster] = useState<string | null>(null);
  const [subfolders, setSubfolders] = useState<Record<string, ArchiveFolder[]>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [createParentType, setCreateParentType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load master folders from database on mount
  useEffect(() => {
    loadMasterFolders();
  }, []);

  // Load subfolders when a master folder is expanded
  useEffect(() => {
    if (expandedMaster && !subfolders[expandedMaster]) {
      loadSubfolders(expandedMaster);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedMaster]);

  async function loadMasterFolders() {
    console.log('[Archives] Starting to load master folders...');
    setInitialLoading(true);
    try {
      const masters = await archivesService.getMasterFolders();
      console.log('[Archives] Successfully loaded master folders:', masters.length, masters);
      setMasterFolders(masters);
    } catch (error) {
      console.error('[Archives] ERROR loading master folders:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error loading Archives: ${errorMessage}. Check console for details.`);
      // Fallback to empty array
      setMasterFolders([]);
    } finally {
      console.log('[Archives] Finishing load, setting initialLoading to false');
      setInitialLoading(false);
    }
  }

  async function loadSubfolders(masterId: string) {
    setLoading(true);
    try {
      const subs = await archivesService.getSubfolders(masterId);
      setSubfolders(prev => ({ ...prev, [masterId]: subs }));
    } catch (error) {
      console.log('Could not load subfolders:', error);
      setSubfolders(prev => ({ ...prev, [masterId]: [] }));
    } finally {
      setLoading(false);
    }
  }

  async function refreshAll() {
    if (expandedMaster) {
      await loadSubfolders(expandedMaster);
    }
  }

  function handleMasterClick(masterId: string) {
    if (expandedMaster === masterId) {
      setExpandedMaster(null);
    } else {
      setExpandedMaster(masterId);
    }
  }

  function handleCreateSubfolder(masterId: string, masterType: string) {
    setCreateParentId(masterId);
    setCreateParentType(masterType);
    setShowCreateModal(true);
  }

  // Command Center style
  const styles: Record<string, CSSProperties> = {
    container: {
      padding: '20px 40px',
      maxWidth: '1600px',
      margin: '0 auto'
    },
    pageTitle: {
      textAlign: 'center',
      color: 'var(--primary-color, #68a395)',
      margin: 0,
      fontFamily: "'The Seasons', 'Playfair Display', serif",
      fontSize: '2.5rem',
      fontWeight: '600',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    exportButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: 'var(--primary-color, #68a395)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '2rem',
      marginBottom: '2rem'
    },
    card: {
      background: 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))',
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      position: 'relative' as const
    },
    cardTitle: {
      color: 'var(--primary-color, #68a395)',
      fontSize: '0.8rem',
      letterSpacing: '1px',
      margin: '0 0 0.25rem 0',
      fontWeight: '600',
      textTransform: 'uppercase' as const
    },
    cardSubtitle: {
      fontSize: '1.5rem',
      margin: '0 0 1rem 0',
      color: 'var(--text-color, #333)',
      fontFamily: "'The Seasons', 'Playfair Display', serif",
      fontWeight: '600'
    },
    cardDescription: {
      fontSize: '0.9rem',
      lineHeight: '1.6',
      color: 'var(--text-color, #5a4033)',
      opacity: '0.8',
      margin: '0'
    },
    expandedContent: {
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid rgba(104, 163, 149, 0.2)'
    }
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>): void => {
    const target = e.currentTarget;
    target.style.transform = 'translateY(-8px) scale(1.02)';
    target.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
    target.style.background = 'var(--gradient-primary, linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461)))';
    const title = target.querySelector('h2') as HTMLElement;
    const subtitle = target.querySelector('h3') as HTMLElement;
    const description = target.querySelector('p') as HTMLElement;
    if (title) title.style.color = 'rgba(255,255,255,0.9)';
    if (subtitle) subtitle.style.color = 'white';
    if (description) description.style.color = 'rgba(255,255,255,0.9)';
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLDivElement>): void => {
    const target = e.currentTarget;
    target.style.transform = 'translateY(0) scale(1)';
    target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    target.style.background = 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))';
    const title = target.querySelector('h2') as HTMLElement;
    const subtitle = target.querySelector('h3') as HTMLElement;
    const description = target.querySelector('p') as HTMLElement;
    if (title) title.style.color = 'var(--primary-color, #68a395)';
    if (subtitle) subtitle.style.color = 'var(--text-color, #333)';
    if (description) description.style.color = 'var(--text-color, #5a4033)';
  };

  // Map folder types to card display info
  const getFolderDisplayInfo = (folderType: string) => {
    const mapping: Record<string, any> = {
      'master_family': { title: 'FAMILY', subtitle: 'Family' },
      'master_best_intentions': { title: 'BEST INTENTIONS', subtitle: 'Best Intentions' },
      'master_extended_family': { title: 'EXTENDED FAMILY', subtitle: 'Extended Family' },
      'master_personal': { title: 'PERSONAL', subtitle: 'Personal Projects' }
    };
    return mapping[folderType] || { title: folderType.toUpperCase(), subtitle: folderType };
  };

  if (initialLoading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Archives</h1>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #68a395',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#5a4033', fontSize: '1.1rem' }}>Loading your archives...</p>
        </div>
      </div>
    );
  }

  // Use gold thumbtack for all cards
  const getThumbtack = () => {
    return GoldThumbtack;
  };

  return (
    <div style={styles.container}>
      {/* Page title with Export button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={styles.pageTitle}>Archives</h1>
        <button
          onClick={() => setShowExportModal(true)}
          style={styles.exportButton}
          title="Export context for AI platforms"
        >
          <Download size={20} />
          Export Context
        </button>
      </div>

      <div style={styles.gridContainer}>
        {masterFolders.map((master, index) => {
          const displayInfo = getFolderDisplayInfo(master.folder_type);
          const isExpanded = expandedMaster === master.id;
          const folderSubfolders = subfolders[master.id] || [];
          const Thumbtack = getThumbtack();

          // Slight rotation for scrapbook feel
          const rotation = [-2, 1, -1, 2][index % 4];

          return (
            <React.Fragment key={master.id}>
              <div style={{ position: 'relative' }}>
                {/* Thumbtack pinning the card */}
                <Thumbtack
                  size={45}
                  rotation={rotation * 3}
                  style={{
                    position: 'absolute',
                    top: -15,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }}
                />

                {/* Add a star accent on some cards */}
                {index % 3 === 0 && (
                  <CrayonStar
                    size={40}
                    rotation={index * 20}
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      opacity: 0.6,
                      zIndex: 1
                    }}
                  />
                )}

                <div
                  style={{
                    ...styles.card,
                    transform: `rotate(${rotation}deg)`,
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => handleMasterClick(master.id)}
                  onMouseOver={(e) => {
                    handleMouseOver(e);
                    e.currentTarget.style.transform = `rotate(0deg) translateY(-8px) scale(1.02)`;
                  }}
                  onMouseOut={(e) => {
                    handleMouseOut(e);
                    e.currentTarget.style.transform = `rotate(${rotation}deg) translateY(0) scale(1)`;
                  }}
                >
                  <h2 style={styles.cardTitle}>{displayInfo.title}</h2>
                  <h3 style={styles.cardSubtitle}>{displayInfo.subtitle}</h3>
                  <p style={styles.cardDescription}>{master.description}</p>
                </div>
              </div>

              {isExpanded && (
                <div style={{
                  gridColumn: '1 / -1',
                  marginTop: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {loading ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          border: '4px solid #68a395',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          margin: '0 auto 1rem',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <p style={{ color: '#5a4033' }}>Loading folders...</p>
                      </div>
                    ) : (
                      <SubfolderGrid
                        masterFolder={master}
                        subfolders={folderSubfolders}
                        onRefresh={refreshAll}
                        onCreateNew={() => handleCreateSubfolder(master.id, master.folder_type)}
                      />
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Create Subfolder Modal */}
      {showCreateModal && createParentId && (
        <CreateSubfolderModal
          parentFolderId={createParentId}
          parentFolderType={createParentType}
          onClose={() => {
            setShowCreateModal(false);
            setCreateParentId(null);
            setCreateParentType('');
          }}
          onCreated={() => {
            setShowCreateModal(false);
            setCreateParentId(null);
            setCreateParentType('');
            refreshAll();
          }}
        />
      )}

      {/* Export Context Modal */}
      {showExportModal && (
        <ContextExportModal
          onClose={() => setShowExportModal(false)}
        />
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
