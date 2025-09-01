// src/components/ui/DraggableModal.tsx
import React, { CSSProperties } from 'react';
import Draggable from 'react-draggable';
import { X, Minus, Square } from 'lucide-react';
import { ModalData } from '../../contexts/ModalContext';
import { useModal } from '../../hooks/useModal';

interface DraggableModalProps {
  modal: ModalData;
}

const DraggableModal: React.FC<DraggableModalProps> = ({ modal }) => {
  const { close, minimize, maximize, bringToFront } = useModal();

  // Size configurations to match your existing modal system
  const sizeConfig = {
    small: { width: '400px', height: 'auto', maxHeight: '500px' },
    medium: { width: '500px', height: 'auto', maxHeight: '600px' },
    large: { width: '800px', height: 'auto', maxHeight: '80vh' },
    xlarge: { width: '900px', height: 'auto', maxHeight: '90vh' }
  };

  const size = modal.size || 'medium';
  const isMinimized = modal.isMinimized;

  // Modal styles
  const modalStyle: CSSProperties = {
    position: 'fixed',
    zIndex: modal.zIndex,
    background: 'var(--background-color, #fff4ec)',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    border: '1px solid var(--accent-color, #d4e3d9)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    ...sizeConfig[size],
    ...(isMinimized && {
      width: '250px',
      height: '50px',
      maxHeight: '50px'
    })
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderBottom: '1px solid #dee2e6',
    cursor: 'move',
    userSelect: 'none'
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--primary-color, #68a395)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  const controlsStyle: CSSProperties = {
    display: 'flex',
    gap: '4px'
  };

  const buttonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    padding: '4px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    color: '#666'
  };

  const contentStyle: CSSProperties = {
    padding: isMinimized ? '0' : '16px',
    height: isMinimized ? '0' : 'auto',
    overflow: isMinimized ? 'hidden' : 'auto',
    maxHeight: isMinimized ? '0' : 'calc(90vh - 60px)'
  };

  const handleMouseDown = () => {
    bringToFront(modal.id);
  };

  const handleMinimize = () => {
    if (isMinimized) {
      maximize(modal.id);
    } else {
      minimize(modal.id);
    }
  };

  return (
    <Draggable
      handle=".modal-header"
      defaultPosition={modal.position}
      bounds="parent"
      onStart={handleMouseDown}
    >
      <div style={modalStyle}>
        <div 
          className="modal-header" 
          style={headerStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
          }}
        >
          <h3 style={titleStyle}>{modal.title}</h3>
          <div style={controlsStyle}>
            <button
              style={buttonStyle}
              onClick={handleMinimize}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Square size={14} /> : <Minus size={14} />}
            </button>
            <button
              style={buttonStyle}
              onClick={() => close(modal.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffebee';
                e.currentTarget.style.color = '#c62828';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#666';
              }}
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <div style={contentStyle}>
          {!isMinimized && modal.content}
        </div>
      </div>
    </Draggable>
  );
};

export default DraggableModal;