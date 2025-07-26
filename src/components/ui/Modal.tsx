// src/components/ui/Modal.tsx - Fixed TypeScript imports and exports
import React, { FC, ReactNode, CSSProperties } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  const modalOverlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalContentStyle: CSSProperties = {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
  };

  const modalHeaderStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #eee'
  };

  const modalBodyStyle: CSSProperties = {
    padding: '16px'
  };

  const closeButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer'
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
        {title && (
          <div style={modalHeaderStyle}>
            <h2 style={{ margin: 0 }}>{title}</h2>
            <button style={closeButtonStyle} onClick={onClose}>×</button>
          </div>
        )}
        <div style={modalBodyStyle}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;