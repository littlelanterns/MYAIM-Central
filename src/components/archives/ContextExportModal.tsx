// src/components/archives/ContextExportModal.tsx
// Export all active context for use with AI platforms

import React, { useState, useEffect } from 'react';
import { X, Copy, Download, Check } from 'lucide-react';
import { archivesService } from '../../lib/archivesService';

interface ContextExportModalProps {
  onClose: () => void;
}

export function ContextExportModal({ onClose }: ContextExportModalProps) {
  const [loading, setLoading] = useState(true);
  const [exportText, setExportText] = useState('');
  const [format, setFormat] = useState<'markdown' | 'plain' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadAndFormatContext();
  }, [format]);

  async function loadAndFormatContext() {
    setLoading(true);
    try {
      const familyId = await archivesService.getCurrentFamilyId();
      const contextData = await archivesService.getFamilyContext(familyId);

      let formatted = '';

      if (format === 'markdown') {
        formatted = formatAsMarkdown(contextData);
      } else if (format === 'plain') {
        formatted = formatAsPlainText(contextData);
      } else if (format === 'json') {
        formatted = JSON.stringify(contextData, null, 2);
      }

      setExportText(formatted);
    } catch (error) {
      console.error('Error loading context:', error);
      setExportText('Error loading context. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function formatAsMarkdown(data: any[]) {
    if (!data || data.length === 0) {
      return '# Family Context\n\nNo active context items found. Make sure items are checked in your Archives.';
    }

    let output = '# Family Context\n\n';
    output += '*This context is for use with AI platforms (ChatGPT, Claude, etc.)*\n\n';
    output += '---\n\n';

    // Group by folder
    const byFolder: Record<string, any[]> = {};
    data.forEach(item => {
      if (!byFolder[item.folder_name]) {
        byFolder[item.folder_name] = [];
      }
      byFolder[item.folder_name].push(item);
    });

    Object.entries(byFolder).forEach(([folderName, items]) => {
      output += `## ${folderName}\n\n`;
      items.forEach(item => {
        output += `**${item.context_field}**: ${item.context_value}\n\n`;
      });
    });

    output += '---\n\n';
    output += `*Exported from MyAIM-Central on ${new Date().toLocaleDateString()}*`;

    return output;
  }

  function formatAsPlainText(data: any[]) {
    if (!data || data.length === 0) {
      return 'FAMILY CONTEXT\n\nNo active context items found. Make sure items are checked in your Archives.';
    }

    let output = 'FAMILY CONTEXT\n';
    output += 'This context is for use with AI platforms (ChatGPT, Claude, etc.)\n\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    // Group by folder
    const byFolder: Record<string, any[]> = {};
    data.forEach(item => {
      if (!byFolder[item.folder_name]) {
        byFolder[item.folder_name] = [];
      }
      byFolder[item.folder_name].push(item);
    });

    Object.entries(byFolder).forEach(([folderName, items]) => {
      output += `${folderName.toUpperCase()}\n\n`;
      items.forEach(item => {
        output += `${item.context_field}: ${item.context_value}\n\n`;
      });
    });

    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    output += `Exported from MyAIM-Central on ${new Date().toLocaleDateString()}`;

    return output;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying:', error);
      alert('Failed to copy to clipboard');
    }
  }

  function handleDownload() {
    const ext = format === 'json' ? 'json' : 'txt';
    const filename = `family-context-${new Date().toISOString().split('T')[0]}.${ext}`;

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Export Family Context</h2>
            <p style={styles.subtitle}>
              Copy or download your active context for AI platforms
            </p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Format Selector */}
        <div style={styles.formatSelector}>
          <label style={styles.formatLabel}>Export Format:</label>
          <div style={styles.formatButtons}>
            <button
              onClick={() => setFormat('markdown')}
              style={{
                ...styles.formatButton,
                ...(format === 'markdown' ? styles.formatButtonActive : {})
              }}
            >
              Markdown
            </button>
            <button
              onClick={() => setFormat('plain')}
              style={{
                ...styles.formatButton,
                ...(format === 'plain' ? styles.formatButtonActive : {})
              }}
            >
              Plain Text
            </button>
            <button
              onClick={() => setFormat('json')}
              style={{
                ...styles.formatButton,
                ...(format === 'json' ? styles.formatButtonActive : {})
              }}
            >
              JSON
            </button>
          </div>
        </div>

        {/* Preview */}
        <div style={styles.previewContainer}>
          <label style={styles.previewLabel}>Preview:</label>
          {loading ? (
            <div style={styles.loadingBox}>
              <div style={{ textAlign: 'center', color: 'var(--text-color)' }}>
                Loading context...
              </div>
            </div>
          ) : (
            <textarea
              value={exportText}
              readOnly
              style={styles.previewBox}
              rows={15}
            />
          )}
        </div>

        {/* Info Box */}
        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            💡 <strong>Tip:</strong> Only items with checkboxes enabled (✓) are included in this export.
            Go to Archives to toggle which context items AI should know about.
          </p>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button
            onClick={handleCopy}
            style={styles.copyButton}
            disabled={loading}
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy to Clipboard
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            style={styles.downloadButton}
            disabled={loading}
          >
            <Download size={16} />
            Download File
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem',
    borderBottom: '1px solid var(--accent-color, #d4e3d9)',
    background: 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'var(--primary-color, #68a395)',
    margin: '0 0 0.25rem 0'
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-color, #5a4033)',
    opacity: 0.7,
    margin: 0
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--primary-color, #68a395)',
    padding: '0.25rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  formatSelector: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid var(--accent-color, #d4e3d9)'
  },
  formatLabel: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-color, #5a4033)',
    marginBottom: '0.75rem'
  },
  formatButtons: {
    display: 'flex',
    gap: '0.5rem'
  },
  formatButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    border: '1px solid var(--accent-color, #d4e3d9)',
    borderRadius: '6px',
    background: 'white',
    color: 'var(--text-color, #5a4033)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  formatButtonActive: {
    background: 'var(--primary-color, #68a395)',
    color: 'white',
    borderColor: 'var(--primary-color, #68a395)'
  },
  previewContainer: {
    padding: '1.5rem'
  },
  previewLabel: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-color, #5a4033)',
    marginBottom: '0.75rem'
  },
  loadingBox: {
    border: '1px solid var(--accent-color, #d4e3d9)',
    borderRadius: '8px',
    padding: '2rem',
    background: 'var(--background-color, #fff4ec)'
  },
  previewBox: {
    width: '100%',
    padding: '1rem',
    fontSize: '0.8125rem',
    fontFamily: 'monospace',
    border: '1px solid var(--accent-color, #d4e3d9)',
    borderRadius: '8px',
    background: 'var(--background-color, #fff4ec)',
    color: 'var(--text-color, #5a4033)',
    resize: 'vertical',
    boxSizing: 'border-box',
    lineHeight: 1.5
  },
  infoBox: {
    margin: '0 1.5rem 1.5rem',
    padding: '1rem',
    background: 'var(--secondary-color, #d6a461)',
    borderRadius: '8px',
    opacity: 0.9
  },
  infoText: {
    fontSize: '0.8125rem',
    color: 'white',
    margin: 0,
    lineHeight: 1.6
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem',
    borderTop: '1px solid var(--accent-color, #d4e3d9)'
  },
  copyButton: {
    flex: 1,
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    background: 'var(--primary-color, #68a395)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  },
  downloadButton: {
    flex: 1,
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    border: '1px solid var(--primary-color, #68a395)',
    borderRadius: '8px',
    background: 'white',
    color: 'var(--primary-color, #68a395)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  }
};
