// src/components/ui/Modal.tsx - UPGRADED with React Portal (keeps your TypeScript)
import React, { FC, ReactNode, CSSProperties, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen';
  customWidth?: string;
  customHeight?: string;
}

const Modal: FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'medium',
  customWidth,
  customHeight
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Size configurations
  const sizeClasses: Record<string, CSSProperties> = {
    small: { maxWidth: '400px', width: '90%' },
    medium: { maxWidth: '600px', width: '90%' },
    large: { maxWidth: '800px', width: '95%' },
    xlarge: { maxWidth: '1000px', width: '95%' },
    fullscreen: { maxWidth: '100vw', width: '100%', height: '100vh' }
  };

  const modalSize = customWidth && customHeight 
    ? { width: customWidth, height: customHeight }
    : sizeClasses[size] || sizeClasses.medium;

  const modalOverlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, // FIXED: Much higher z-index
    padding: '1rem',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)'
  };

  const modalContentStyle: CSSProperties = {
    background: 'var(--background-color, #fff4ec)',
    color: 'var(--text-color, #5a4033)',
    borderRadius: '16px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--accent-color, #d4e3d9)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    outline: 'none',
    transition: 'all 0.3s ease',
    ...modalSize
  };

  const modalHeaderStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid var(--accent-color, #d4e3d9)',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(244, 220, 183, 0.5))',
    borderRadius: '16px 16px 0 0',
    flexShrink: 0
  };

  const modalBodyStyle: CSSProperties = {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
  };

  const closeButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--text-color, #5a4033)',
    opacity: 0.7,
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s'
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-color, #5a4033)'
  };

  // Create portal element or use body as fallback
  const portalTarget = document.getElementById('modal-root') || document.body;

  return ReactDOM.createPortal(
    <>
      {/* Inject theme-compatible scrollbar styles */}
      <style>{`
        .portal-modal-content::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .portal-modal-content::-webkit-scrollbar-track {
          background: var(--accent-color, #d4e3d9);
          border-radius: 4px;
        }
        
        .portal-modal-content::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb, linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461)));
          border-radius: 4px;
          border: 1px solid var(--accent-color, #d4e3d9);
        }
        
        .portal-modal-content::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover, linear-gradient(135deg, var(--secondary-color, #d6a461), var(--primary-color, #68a395)));
        }

        /* Firefox scrollbar support */
        .portal-modal-content {
          scrollbar-width: thin;
          scrollbar-color: var(--primary-color, #68a395) var(--accent-color, #d4e3d9);
        }
      `}</style>

      <div style={modalOverlayStyle} onClick={onClose}>
        <div 
          ref={modalRef}
          className="portal-modal-content"
          style={modalContentStyle}
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
        >
          {title && (
            <div style={modalHeaderStyle}>
              <h2 id="modal-title" style={titleStyle}>{title}</h2>
              <button 
                style={closeButtonStyle} 
                onClick={onClose}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          )}
          <div style={modalBodyStyle}>
            {children}
          </div>
        </div>
      </div>
    </>,
    portalTarget
  );
};

export default Modal;